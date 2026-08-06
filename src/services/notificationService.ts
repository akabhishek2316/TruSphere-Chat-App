import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  getMessaging,
  getToken,
  
} from "@react-native-firebase/messaging";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  console.log("FCM TOKEN =>", fcmToken);
  console.log("TITLE =>", title);
  console.log("BODY =>", body);
  console.log("DATA =>", data);

  // Next step:
  // Yahin se Firebase Cloud Function call karenge.
}