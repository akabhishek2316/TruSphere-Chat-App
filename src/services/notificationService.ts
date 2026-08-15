import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  getMessaging,
  getToken,
  onMessage,
} from "@react-native-firebase/messaging";


// =====================================================
// NOTIFICATION HANDLER
// =====================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


// =====================================================
// PENDING NOTIFICATION
// =====================================================

let pendingNotification: {
  chatId: string;
  senderId: string;
} | null = null;

export function setPendingNotification(data: {
  chatId: string;
  senderId: string;
}) {
  pendingNotification = data;
}

export function getPendingNotification() {
  return pendingNotification;
}

export function clearPendingNotification() {
  pendingNotification = null;
}


// =====================================================
// FCM TOKEN
// =====================================================

export async function registerForPushNotifications() {
  console.log("A");

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  console.log(
    "Permission =>",
    existingStatus
  );

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log(
      "Permission denied"
    );

    return null;
  }

  try {
    const messaging = getMessaging();

    if (Platform.OS === "android") {
      await messaging.registerDeviceForRemoteMessages();
    }

    const token =
      await getToken(messaging);

    console.log(
      "FCM TOKEN =>",
      token
    );

    return token;

  } catch (e) {

    console.log(
      "TOKEN ERROR =>",
      e
    );

    return null;
  }
}


// =====================================================
// SEND PUSH NOTIFICATION
// =====================================================

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
) {

  try {

    console.log(
      "========== PUSH START =========="
    );

    console.log(
      "FCM TOKEN =>",
      fcmToken
    );

    console.log(
      "TITLE =>",
      title
    );

    console.log(
      "BODY =>",
      body
    );

    console.log(
      "DATA =>",
      data
    );

    const response =
      await fetch(
        "https://trusphere-notification-server.onrender.com/sendNotification",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token: fcmToken,
            title,
            body,
            data: data || {},
          }),
        }
      );

    const result =
      await response.json();

    console.log(
      "PUSH HTTP STATUS =>",
      response.status
    );

    console.log(
      "PUSH SERVER RESULT =>",
      result
    );

    console.log(
      "========== PUSH END =========="
    );

    return result.success;

  } catch (e) {

    console.log(
      "PUSH ERROR =>",
      e
    );

    return false;
  }
}


// =====================================================
// FOREGROUND NOTIFICATION LISTENER
// =====================================================

let unsubscribeMessage:
  (() => void) | null = null;

export function startForegroundNotificationListener() {

  console.log(
    "FOREGROUND NOTIFICATION LISTENER START"
  );

  const messaging =
    getMessaging();

  // Prevent duplicate listeners
  unsubscribeMessage?.();

  unsubscribeMessage =
    onMessage(
      messaging,
      async (remoteMessage) => {

        console.log(
          "========== FOREGROUND FCM =========="
        );

        console.log(
          "REMOTE MESSAGE =>",
          JSON.stringify(
            remoteMessage
          )
        );

        const notificationChatId =
          String(
            remoteMessage.data?.chatId ??
              ""
          );

        // ==========================================
        // CURRENT CHAT OPEN
        // ==========================================

        if (
          activeChatId &&
          notificationChatId ===
            activeChatId
        ) {

          console.log(
            "CURRENT CHAT OPEN - SKIP NOTIFICATION"
          );

          return;
        }

        // ==========================================
        // NOTIFICATION CONTENT
        // ==========================================

        const title =
          String(
            remoteMessage.notification
              ?.title ??
              remoteMessage.data
                ?.title ??
              "New Message"
          );

        const body =
          String(
            remoteMessage.notification
              ?.body ??
              remoteMessage.data
                ?.body ??
              ""
          );

        console.log(
          "NOTIFICATION TITLE =>",
          title
        );

        console.log(
          "NOTIFICATION BODY =>",
          body
        );

        // ==========================================
        // SHOW LOCAL NOTIFICATION
        // ==========================================

        await Notifications.scheduleNotificationAsync(
          {
            content: {
              title,
              body,

              data:
                remoteMessage.data ??
                {},

              sound: "default",
              categoryIdentifier: "MESSAGE",
            },

            trigger: null,
          }
        );

        console.log(
          "FOREGROUND LOCAL NOTIFICATION SHOWN"
        );
      }
    );
}


// =====================================================
// STOP FOREGROUND LISTENER
// =====================================================

export function stopForegroundNotificationListener() {

  unsubscribeMessage?.();

  unsubscribeMessage = null;

  console.log(
    "FOREGROUND NOTIFICATION LISTENER STOPPED"
  );
}


// =====================================================
// ACTIVE CHAT
// =====================================================

let activeChatId:
  string | null = null;

export function setActiveChat(
  chatId: string | null
) {

  activeChatId = chatId;

  console.log(
    "ACTIVE CHAT =>",
    activeChatId
  );
}

// reply function

export async function setupNotificationActions() {
  await Notifications.setNotificationCategoryAsync(
    "MESSAGE",
    [
      {
        identifier: "reply",
        buttonTitle: "Reply",
        textInput: {
          submitButtonTitle: "Send",
          placeholder: "Type a reply...",
        },
      },
    ]
  );

  console.log("NOTIFICATION REPLY ACTION READY");
}


// =====================================================
// ANDROID NOTIFICATION CHANNEL
// =====================================================

export async function setupNotificationChannel() {

  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    "messages",
    {
      name: "Messages",

      importance:
        Notifications.AndroidImportance
          .HIGH,

      sound: "default",

      vibrationPattern: [
        0,
        250,
        250,
        250,
      ],

      lockscreenVisibility:
        Notifications
          .AndroidNotificationVisibility
          .PUBLIC,
    }
  );

  console.log(
    "NOTIFICATION CHANNEL READY"
  );
}