require("dotenv").config();

const crypto = require("crypto");
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
app.use(express.json({ limit: "8kb" }));

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

    case "video":
      return "🎥 Video";

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

    let [messageSnap, participantsSnap] = await Promise.all([
      messageRef.get(),
      db.ref(`chatRooms/${chatId}/participants`).get(),
    ]);

    // App ab push request DB write ke SAATH bhejta hai (jaldi delivery) =>
    // message abhi server tak na pahuncha ho sakta hai. Thoda ruk kar dobara.
    for (let i = 0; i < 6 && !messageSnap.exists(); i++) {
      await new Promise((r) => setTimeout(r, 300));
      messageSnap = await messageRef.get();
    }

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
      (message.type === "image" ||
        message.type === "voice" ||
        message.type === "video") &&
      message.uploadCompleted !== true
    ) {
      return skip("upload-pending");
    }

    const receiverId = message.receiver;

    const [
      blockSnap,
      tokenSnap,
      nameSnap,
      muteSnap,
    ] = await Promise.all([
        db.ref(`blocks/${receiverId}/${uid}`).get(),
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

    // NOTE: pehle yahan "receiver chat me hai (online + activeChat) => push
    // mat bhejo" tha. App background me jaate waqt activeChat/online ka
    // write (network) kabhi pahunchta nahi tha => stale "chat me hai" => uske
    // baad ke messages ki notification skip ho jati thi (jab tak user kuch
    // aur na kare). Ab push hamesha jata hai; app foreground me us chat me
    // ho to client (onMessage + activeChatId) khud notification dabata hai.

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
      // Push gaya hi nahi => claim wapas lo, warna client ka retry
      // "duplicate" maan kar skip ho jata aur notification hamesha ke liye
      // kho jati thi
      await messageRef
        .child("pushed")
        .remove()
        .catch(() => {});

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

// =====================================================
// MESSAGE CLEANUP (Firebase + Cloudinary)
//
// Jab koi message DONO taraf se delete ho jaye (kisi bhi tarah) to:
//   1. uska image / voice Cloudinary se delete,
//   2. phir message Firebase Realtime Database se hata diya jaye.
// Isse database saaf rehta hai aur chat halki (kam hang).
//
// "Dono taraf se delete" ka matlab (server DB dekh kar khud tay karta hai,
// client ki baat par bharosa nahi):
//   - Delete for everyone              (deletedForEveryone)
//   - Delete for me, dono users ne     (deletedFor[sender] && deletedFor[receiver])
//   - Clear chat / delete chat dono ne (message time <= dono ke deletedAt)
//   - Disappearing message expire hua  (expiresAt <= ab)
//
// Cloudinary delete me API secret chahiye, jo app me nahi rakh sakte, isliye
// ye kaam server par hai. Env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET. Media delete fail ho to message Firebase me RAHEGA
// (taaki baad me dobara try ho sake, media orphan na ho).
// =====================================================

const CLD_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLD_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLD_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLD_ENABLED = Boolean(CLD_CLOUD && CLD_KEY && CLD_SECRET);

if (!CLD_ENABLED) {
  console.log(
    "Cloudinary env missing: media messages will NOT be removed (text messages still are)"
  );
}

const MAX_CLEANUP_IDS = 50;
const SWEEP_PAGE = 300;
const SWEEP_MAX = 3000;

/**
 * Cloudinary delivery URL se { resourceType, publicId } nikalo.
 *   https://res.cloudinary.com/<cloud>/<image|video|raw>/upload/
 *       [transformations/][v123/]<public_id>[.ext]
 * Hamare cloud ke alawa kisi URL ko nahi chhuta (null).
 */
function parseCloudinaryUrl(url) {
  if (typeof url !== "string" || url.length > 1000) return null;

  const m = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/([^?#]+)/.exec(
    url
  );

  if (!m || m[1] !== CLD_CLOUD) return null;

  const resourceType = m[2];

  let segs = m[3].split("/");

  // Transformations (w_600,c_limit ...) hatao
  while (
    segs.length > 1 &&
    /^[a-z]{1,3}_[^/]*$/i.test(segs[0]) &&
    !/^v\d+$/.test(segs[0])
  ) {
    segs.shift();
  }

  // Version (v1699999999)
  if (segs.length > 1 && /^v\d+$/.test(segs[0])) {
    segs.shift();
  }

  let publicId = segs.map((s) => decodeURIComponent(s)).join("/");

  // image / video me public_id extension ke bina hota hai
  if (resourceType !== "raw") {
    publicId = publicId.replace(/\.[A-Za-z0-9]{1,5}$/, "");
  }

  return publicId ? { resourceType, publicId } : null;
}

/** Cloudinary se ek asset delete. "not found" bhi success (pehle hi delete) */
async function destroyCloudinaryAsset(resourceType, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);

  // Signature: params alphabetical (api_key / resource_type / signature chhodkar)
  const toSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha1")
    .update(toSign + CLD_SECRET)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: CLD_KEY,
    signature,
    invalidate: "true",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/${resourceType}/destroy`,
      { method: "POST", body, signal: controller.signal }
    );

    const json = await res.json().catch(() => ({}));

    return json.result === "ok" || json.result === "not found";
  } catch (e) {
    console.log("CLOUDINARY DESTROY ERROR =>", e && e.message);

    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Message ke saare Cloudinary media (image, voice, aur delete-for-everyone ka trash) */
function collectMediaUrls(m) {
  const urls = [m.image, m.voiceUrl, m.videoUrl, m.thumbnail];

  if (m.trashMedia && typeof m.trashMedia === "object") {
    urls.push(
      m.trashMedia.image,
      m.trashMedia.voiceUrl,
      m.trashMedia.videoUrl
    );
  }

  return [...new Set(urls.filter((u) => typeof u === "string" && u))];
}

/** Kya ye message dono taraf se delete mana jaye? */
function isDeadMessage(m, cutoffs, now) {
  if (!m || typeof m !== "object") return false;

  // Delete-for-everyone tombstone yahan dead nahi: "This message was deleted"
  // chat me dikhta rehta hai (sirf uska Cloudinary media cleanupOne me trim hota hai)
  const df = m.deletedFor || {};

  if (df[m.sender] === true && df[m.receiver] === true) return true;

  if (
    typeof m.expiresAt === "number" &&
    m.expiresAt > 0 &&
    m.expiresAt <= now
  ) {
    return true;
  }

  const a = cutoffs[m.sender];
  const b = cutoffs[m.receiver];

  if (
    typeof a === "number" &&
    typeof b === "number" &&
    typeof m.timestamp === "number" &&
    m.timestamp <= a &&
    m.timestamp <= b
  ) {
    return true;
  }

  return false;
}

async function loadCutoffs(chatId) {
  const snap = await db.ref(`chatRooms/${chatId}/deletedForUsers`).get();

  const cutoffs = {};

  if (snap.exists()) {
    snap.forEach((child) => {
      const at = child.val() && child.val().deletedAt;

      if (typeof at === "number") cutoffs[child.key] = at;
    });
  }

  return cutoffs;
}

async function isParticipant(chatId, uid) {
  if (!ID_REGEX.test(chatId) || !chatId.includes(uid)) return false;

  const snap = await db.ref(`chatRooms/${chatId}/participants/${uid}`).get();

  return snap.exists();
}

/**
 * Ek message: dead ho to media delete -> node remove.
 * Return: "removed" | "alive" | "gone" | "retry"
 */
async function cleanupOne(chatId, messageId, msg, cutoffs, now) {
  if (!isDeadMessage(msg, cutoffs, now)) {
    // Tombstone: message rehne do, bas trash media Cloudinary se hatao
    if (
      msg &&
      msg.deletedForEveryone === true &&
      msg.trashMedia &&
      typeof msg.trashMedia === "object"
    ) {
      for (const url of collectMediaUrls({ trashMedia: msg.trashMedia })) {
        const parsed = parseCloudinaryUrl(url);

        if (!parsed) continue;

        if (!CLD_ENABLED) return "retry";

        const ok = await destroyCloudinaryAsset(
          parsed.resourceType,
          parsed.publicId
        );

        if (!ok) return "retry";
      }

      await db
        .ref(`chatRooms/${chatId}/messages/${messageId}/trashMedia`)
        .remove();

      return "trimmed";
    }

    return "alive";
  }

  const urls = collectMediaUrls(msg);

  for (const url of urls) {
    const parsed = parseCloudinaryUrl(url);

    // Hamara Cloudinary URL nahi (ya parse nahi hua): chhod do, message hatao
    if (!parsed) continue;

    if (!CLD_ENABLED) return "retry";

    const ok = await destroyCloudinaryAsset(parsed.resourceType, parsed.publicId);

    // Media delete nahi hua: message rakho, baad me dobara try hoga
    if (!ok) return "retry";
  }

  await db.ref(`chatRooms/${chatId}/messages/${messageId}`).remove();

  return "removed";
}

// POST /cleanupMessages { chatId, messageIds: [..] }
app.post("/cleanupMessages", async (req, res) => {
  try {
    const uid = await authenticate(req);

    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (rateLimited(uid)) {
      return res.status(429).json({ success: false, message: "Too many requests" });
    }

    const { chatId, messageIds } = req.body || {};

    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0 ||
      messageIds.length > MAX_CLEANUP_IDS ||
      !messageIds.every((id) => typeof id === "string" && ID_REGEX.test(id))
    ) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!(await isParticipant(String(chatId), uid))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const cutoffs = await loadCutoffs(chatId);
    const now = Date.now();

    const results = {};

    for (const id of messageIds) {
      const snap = await db.ref(`chatRooms/${chatId}/messages/${id}`).get();

      if (!snap.exists()) {
        results[id] = "gone";
        continue;
      }

      results[id] = await cleanupOne(chatId, id, snap.val(), cutoffs, now);
    }

    return res.json({ success: true, results });
  } catch (e) {
    console.log("CLEANUP MESSAGES ERROR =>", e && e.message);

    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /cleanupChat { chatId }
// Poori chat history sweep (clear chat / delete chat ke baad): jo bhi message
// dono taraf se delete hai (flags / cutoff / expiry) uska media + node hatao.
const sweeping = new Set();

app.post("/cleanupChat", async (req, res) => {
  const uid = await authenticate(req);

  if (!uid) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (rateLimited(uid)) {
    return res.status(429).json({ success: false, message: "Too many requests" });
  }

  const chatId = String((req.body || {}).chatId || "");

  if (!(await isParticipant(chatId, uid))) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  // Ek chat ka ek hi sweep ek time par
  if (sweeping.has(chatId)) {
    return res.json({ success: true, running: true });
  }

  sweeping.add(chatId);

  try {
    const cutoffs = await loadCutoffs(chatId);
    const now = Date.now();

    let removed = 0;
    let retry = 0;
    let scanned = 0;
    let lastKey = null;

    while (scanned < SWEEP_MAX) {
      let q = db
        .ref(`chatRooms/${chatId}/messages`)
        .orderByKey()
        .limitToFirst(SWEEP_PAGE + (lastKey ? 1 : 0));

      if (lastKey) q = q.startAt(lastKey);

      const snap = await q.get();

      if (!snap.exists()) break;

      const entries = [];

      snap.forEach((child) => {
        if (child.key !== lastKey) entries.push([child.key, child.val()]);
      });

      if (entries.length === 0) break;

      for (const [id, msg] of entries) {
        scanned += 1;

        const r = await cleanupOne(chatId, id, msg, cutoffs, now);

        if (r === "removed") removed += 1;
        if (r === "retry") retry += 1;
      }

      lastKey = entries[entries.length - 1][0];

      if (entries.length < SWEEP_PAGE) break;
    }

    return res.json({ success: true, scanned, removed, retry });
  } catch (e) {
    console.log("CLEANUP CHAT ERROR =>", e && e.message);

    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    sweeping.delete(chatId);
  }
});

process.on("unhandledRejection", (reason) => {
  console.log("UNHANDLED REJECTION =>", reason);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
