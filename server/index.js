require("dotenv").config();

const express = require("express");
const admin = require("firebase-admin");

// =====================================================
// TruSphere notification server
//
// Security fix: pehle `/sendNotification` bina login ke koi bhi kisi bhi
// FCM token par, apni marzi ka title/body bhej sakta tha (spam / phishing
// notifications) aur CORS poora open tha. `/testNotification` ka secret
// check bhi `TEST_KEY` set na hone par bypass ho jata tha.
//
// Ab:
//   - sirf `POST /notifyMessage { chatId, messageId }`
//   - Firebase login token (Authorization: Bearer <idToken>) zaroori
//   - server DB me check karta hai ki message sach me isi user ne bheja hai
//   - receiver ka FCM token + notification text server khud banata hai
//   - per-user rate limit, chhota body limit, koi CORS nahi (mobile app ko
//     CORS ki zaroorat hi nahi)
// =====================================================

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT env variable missing");
    process.exit(1);
  }

  try {
    const account = JSON.parse(raw);

    account.private_key = String(account.private_key || "").replace(
      /\\n/g,
      "\n"
    );

    return account;
  } catch (e) {
    console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
    process.exit(1);
  }
}

if (!process.env.FIREBASE_DATABASE_URL) {
  console.error("FIREBASE_DATABASE_URL env variable missing");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "2kb" }));

// -----------------------------------------------------
// Simple in-memory rate limit (per user): 60 requests / minute
// -----------------------------------------------------
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;
const hits = new Map();

function rateLimited(uid) {
  const now = Date.now();
  const entry = hits.get(uid);

  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(uid, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;

  return entry.count > RATE_LIMIT;
}

// Memory leak roko: purani entries saaf
setInterval(() => {
  const now = Date.now();

  for (const [uid, entry] of hits) {
    if (now - entry.start > RATE_WINDOW_MS) {
      hits.delete(uid);
    }
  }
}, RATE_WINDOW_MS).unref();

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
const ID_REGEX = /^[A-Za-z0-9_-]{1,200}$/;

async function authenticate(req) {
  const header = String(req.headers.authorization || "");

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  try {
    const decoded = await admin
      .auth()
      .verifyIdToken(header.slice(7));

    return decoded.uid;
  } catch (e) {
    return null;
  }
}

function buildBody(message) {
  switch (message.type) {
    case "image":
      return "📷 Photo";

    case "voice":
      return "🎤 Voice Message";

    case "call":
      return message.callType === "video"
        ? "📹 Missed video call"
        : "📞 Missed voice call";

    case "text":
    default:
      return String(message.text || "New Message").slice(0, 200);
  }
}

// -----------------------------------------------------
// Routes
// -----------------------------------------------------
app.get("/", (req, res) => {
  res.send("TruSphere Notification Server Running");
});

app.post("/notifyMessage", async (req, res) => {
  try {
    const uid = await authenticate(req);

    if (!uid) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    if (rateLimited(uid)) {
      return res
        .status(429)
        .json({ success: false, message: "Too many requests" });
    }

    const { chatId, messageId } = req.body || {};

    if (
      !ID_REGEX.test(String(chatId)) ||
      !ID_REGEX.test(String(messageId)) ||
      !String(chatId).includes(uid)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const messageRef = db.ref(
      `chatRooms/${chatId}/messages/${messageId}`
    );

    const [messageSnap, participantsSnap] = await Promise.all([
      messageRef.get(),
      db.ref(`chatRooms/${chatId}/participants`).get(),
    ]);

    if (!messageSnap.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const message = messageSnap.val();
    const participants = participantsSnap.val() || {};

    // Sirf message ka asli sender hi push trigger kar sakta hai
    if (
      message.sender !== uid ||
      !message.receiver ||
      participants[uid] !== true ||
      participants[message.receiver] !== true
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden" });
    }

    const skip = (reason) =>
      res.json({ success: true, skipped: reason });

    if (message.deleted || message.deletedForEveryone) {
      return skip("deleted");
    }

    // Call log: sirf missed call par notification (ended / declined par nahi)
    if (message.type === "call" && message.callStatus !== "missed") {
      return skip("call-log");
    }

    // Image / voice ka push upload poora hone ke baad hi
    if (
      (message.type === "image" || message.type === "voice") &&
      message.uploadCompleted !== true
    ) {
      return skip("upload-pending");
    }

    const receiverId = message.receiver;

    const [blockSnap, presenceSnap, tokenSnap, nameSnap, muteSnap] =
      await Promise.all([
        db.ref(`blocks/${receiverId}/${uid}`).get(),
        db.ref(`presence/${receiverId}`).get(),
        db.ref(`userPrivate/${receiverId}/fcmToken`).get(),
        db.ref(`users/${uid}/name`).get(),
        db.ref(`mutedChats/${receiverId}/${chatId}`).get(),
      ]);

    if (blockSnap.exists()) {
      return skip("blocked");
    }

    // Receiver ne ye chat mute ki hai (mute abhi tak valid ho to push nahi)
    if (muteSnap.exists() && Number(muteSnap.val()) > Date.now()) {
      return skip("muted");
    }

    const presence = presenceSnap.val() || {};

    if (presence.online === true && presence.currentChat === chatId) {
      return skip("receiver-in-chat");
    }

    const token = tokenSnap.val();

    if (!token) {
      return skip("no-token");
    }

    // Duplicate push roko (retry / double call)
    const claim = await messageRef
      .child("pushed")
      .transaction((current) => (current ? undefined : true));

    if (!claim.committed) {
      return skip("duplicate");
    }

    try {
      const title = String(nameSnap.val() || "TruSphere").slice(0, 60);
      const body = buildBody(message);

      // Android: data-only. App ka background handler isse ek per-chat
      // grouped notification (Reply / Mark as read buttons ke saath) banata hai.
      // iOS: normal alert.
      await admin.messaging().send({
        token,

        data: {
          type: "message",
          chatId: String(chatId),
          messageId: String(messageId),
          senderId: String(uid),
          title,
          body,
          createdAt: String(message.timestamp || Date.now()),
        },

        android: {
          priority: "high",
        },

        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: "default",
              "thread-id": String(chatId),
            },
          },
        },
      });
    } catch (e) {
      // Token expire / uninstall: DB se hata do taaki dobara try na ho
      if (
        e &&
        (e.code === "messaging/registration-token-not-registered" ||
          e.code === "messaging/invalid-registration-token")
      ) {
        await db
          .ref(`userPrivate/${receiverId}/fcmToken`)
          .remove()
          .catch(() => {});
      }

      throw e;
    }

    return res.json({ success: true });
  } catch (e) {
    console.log("NOTIFY ERROR =>", e && e.message);

    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

// -----------------------------------------------------
// Incoming call alert (app background / kill ho tab bhi ring ho)
//
// Data-only high-priority FCM bhejte hain; app ka background handler isse
// "Accept / Decline" buttons wali call notification banata hai.
// Server verify karta hai: call sach me isi user ne start ki hai aur
// abhi ringing hai.
// -----------------------------------------------------
const CALL_TTL_MS = 45 * 1000;

app.post("/notifyCall", async (req, res) => {
  try {
    const uid = await authenticate(req);

    if (!uid) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    if (rateLimited(uid)) {
      return res
        .status(429)
        .json({ success: false, message: "Too many requests" });
    }

    const { callId } = req.body || {};

    if (!ID_REGEX.test(String(callId))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const callSnap = await db.ref(`calls/${callId}`).get();

    if (!callSnap.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "Call not found" });
    }

    const call = callSnap.val();

    if (call.caller !== uid) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden" });
    }

    const skip = (reason) =>
      res.json({ success: true, skipped: reason });

    if (
      call.status !== "ringing" ||
      Date.now() - (call.createdAt || 0) > CALL_TTL_MS
    ) {
      return skip("not-ringing");
    }

    const calleeId = call.callee;

    const [blockSnap, tokenSnap, nameSnap] = await Promise.all([
      db.ref(`blocks/${calleeId}/${uid}`).get(),
      db.ref(`userPrivate/${calleeId}/fcmToken`).get(),
      db.ref(`users/${uid}/name`).get(),
    ]);

    if (blockSnap.exists()) {
      return skip("blocked");
    }

    const token = tokenSnap.val();

    if (!token) {
      return skip("no-token");
    }

    try {
      await admin.messaging().send({
        token,

        data: {
          type: "call",
          callId: String(callId),
          callerId: String(uid),
          callerName: String(nameSnap.val() || "TruSphere").slice(0, 60),
          callType: call.type === "video" ? "video" : "audio",
          createdAt: String(call.createdAt || Date.now()),
        },

        android: {
          priority: "high",
          ttl: CALL_TTL_MS,
        },

        apns: {
          headers: { "apns-priority": "10" },
          payload: { aps: { "content-available": 1 } },
        },
      });
    } catch (e) {
      if (
        e &&
        (e.code === "messaging/registration-token-not-registered" ||
          e.code === "messaging/invalid-registration-token")
      ) {
        await db
          .ref(`userPrivate/${calleeId}/fcmToken`)
          .remove()
          .catch(() => {});
      }

      throw e;
    }

    return res.json({ success: true });
  } catch (e) {
    console.log("CALL NOTIFY ERROR =>", e && e.message);

    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

process.on("unhandledRejection", (reason) => {
  console.log("UNHANDLED REJECTION =>", reason);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
