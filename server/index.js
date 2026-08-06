require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

const serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
        title,
        body,
      },

      data: data || {},

      android: {
        priority: "high",
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

const PORT =
  process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});