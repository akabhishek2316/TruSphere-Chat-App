import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";

import { onValueCreated } from "firebase-functions/v2/database";

initializeApp();

export const sendMessageNotification =
onValueCreated(
  "/chatRooms/{chatId}/messages/{messageId}",
  async (event) => {

    const message = event.data?.val();

    if (!message) return;

    const receiverId = message.receiver;

    const db = getDatabase();

    const tokenSnap = await db.ref(
      `users/${receiverId}/fcmToken`
    ).get();

    if (!tokenSnap.exists()) {
      console.log("No FCM Token");
      return;
    }

    const token = tokenSnap.val();

    let body = "New Message";

    switch (message.type) {
      case "text":
        body = message.text;
        break;

      case "image":
        body = "📷 Photo";
        break;

      case "voice":
        body = "🎤 Voice Message";
        break;
    }

    const senderSnap = await db.ref(
      `users/${message.sender}/name`
    ).get();

    const senderName =
      senderSnap.exists()
        ? senderSnap.val()
        : "TruSphere";

    await getMessaging().send({

      token,

      notification: {
        title: senderName,
        body,
      },

      data: {
        chatId: event.params.chatId,
        senderId: message.sender,
      },

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
    });

    console.log("Notification Sent");
  }
);