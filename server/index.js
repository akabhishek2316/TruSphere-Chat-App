require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

serviceAccount.private_key =
  serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

app.get("/", (req, res) => {
  res.send("TruSphere Notification Server Running");
});

app.post("/sendNotification", async (req, res) => {
  try {
    const {
      token,
      title,
      body,
      data,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token missing",
      });
    }

  const message = {
  token,

  notification: {
    title: String(title),
    body: String(body),
  },

  data: {
    
    chatId: String(data?.chatId || ""),
    messageId: String(data?.messageId || ""),
    senderId: String(data?.senderId || ""),
  },

  android: {
    priority: "high",
    notification: {
      channelId: "messages",
      sound: "default",
    },
  },

  apns: {
    payload: {
      aps: {
        sound: "default",
      },
    },
  },
};

    const response =
  await admin.messaging().send(message);

console.log("Notification Sent =>", response);

const chatId = String(data?.chatId || "");
const messageId = String(data?.messageId || "");

if (chatId && messageId) {
  await admin
    .database()
    .ref(`chatRooms/${chatId}/messages/${messageId}`)
    .update({
      status: "delivered",
      deliveredAt: Date.now(),
    });

  console.log(
    "MESSAGE DELIVERED =>",
    chatId,
    messageId
  );
}

res.json({
  success: true,
  response,
});
  } catch (e) {

    console.log(e);

    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

app.post("/testNotification", async (req, res) => {
  try {
    const { token, key } = req.body;

    if (key !== process.env.TEST_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token missing",
      });
    }

    const message = {
      token,

      notification: {
        title: "TruSphere Test",
        body: "Background notification test",
      },

      data: {
        chatId: "test-chat",
        messageId: "test-message",
        senderId: "test-sender",
      },

      android: {
        priority: "high",

        notification: {
          channelId: "messages",
          sound: "default",
        },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    console.log(
      "TEST FCM MESSAGE =>",
      JSON.stringify(message, null, 2)
    );

    const response = await admin.messaging().send(message);

    console.log("TEST NOTIFICATION SENT =>", response);

    return res.json({
      success: true,
      response,
    });
  } catch (e) {
    console.log("TEST NOTIFICATION ERROR =>", e);

    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

const PORT =
  process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});




