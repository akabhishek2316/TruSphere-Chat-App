import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  getMessaging,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

export async function registerForPushNotifications() {
  console.log("A");

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  console.log("Permission =>", existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission denied");
    return null;
  }

  try {
    const messaging = getMessaging();



    if (Platform.OS === "android") {
      await messaging.registerDeviceForRemoteMessages();
    }

    const token = await getToken(messaging);

    console.log("FCM TOKEN =>", token);

    return token;
  } catch (e) {
    console.log("TOKEN ERROR =>", e);
    return null;
  }
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const response = await fetch(
      "https://trusphere-notification-server.onrender.com/sendNotification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: fcmToken,
          title,
          body,
          data: data || {},
        }),
      }
    );



    const result = await response.json();

    console.log("PUSH RESPONSE =>", result);

    console.log("Sending notification...");
    console.log({
      fcmToken,
      title,
      body,
      data,
    });

    return result.success;

  } catch (e) {
    console.log("PUSH ERROR =>", e);
    return false;
  }
}

let unsubscribeMessage: (() => void) | null = null;


setBackgroundMessageHandler(
  getMessaging(),
  async (remoteMessage) => {
    console.log("BACKGROUND FCM MESSAGE =>", remoteMessage);

    const title = String(
      remoteMessage.data?.title ?? "New Message"
    );

    const body = String(
      remoteMessage.data?.body ?? ""
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: remoteMessage.data ?? {},
        sound: "default",
      },
      trigger: null,
    });
  }
);


export function startForegroundNotificationListener() {

  console.log("FOREGROUND NOTIFICATION LISTENER START");

  const messaging = getMessaging();


  unsubscribeMessage = onMessage(
    messaging,
    async (remoteMessage) => {

      const notificationChatId =
        remoteMessage.data?.chatId;


      if (
        activeChatId &&
        notificationChatId === activeChatId
      ) {

        console.log(
          "CURRENT CHAT OPEN - SKIP NOTIFICATION"
        );

        return;
      }

      const title = String(
        remoteMessage.notification?.title ??
        remoteMessage.data?.title ??
        "New Message"
      );

      const body = String(
        remoteMessage.notification?.body ??
        remoteMessage.data?.body ??
        ""
      );

      console.log("NOTIFICATION TITLE =>", title);
      console.log("NOTIFICATION BODY =>", body);

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: remoteMessage.data ?? {},
          sound: "default",
        },

        trigger: null,
      });

    }
  );

}


export function stopForegroundNotificationListener() {

  unsubscribeMessage?.();

  unsubscribeMessage = null;

}

let activeChatId: string | null = null;

export function setActiveChat(chatId: string | null) {
  activeChatId = chatId;

  console.log(
    "ACTIVE CHAT =>",
    activeChatId
  );
}




export async function setupNotificationChannel() {

  if (Platform.OS === "android") {

    await Notifications.setNotificationChannelAsync(
      "messages",
      {
        name: "Messages",
        importance:
          Notifications.AndroidImportance.HIGH,

        sound: "default",

        vibrationPattern: [0, 250, 250, 250],

        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      }
    );

  }

}