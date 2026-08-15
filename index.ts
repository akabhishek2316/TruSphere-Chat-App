import { registerRootComponent } from "expo";

import {
  getMessaging,
} from "@react-native-firebase/messaging";

import App from "./App";

import {markDelivered} from "./src/services/chatService"

console.log("INDEX TS LOADED");

const messaging = getMessaging();

console.log("REGISTERING FCM BACKGROUND HANDLER");

messaging.setBackgroundMessageHandler(
  async (remoteMessage) => {

    console.log(
      "========== BACKGROUND MESSAGE =========="
    );

    console.log(
      "BACKGROUND MESSAGE =>",
      JSON.stringify(remoteMessage)
    );

    const chatId = String(
  remoteMessage.data?.chatId ?? ""
);

const messageId = String(
  remoteMessage.data?.messageId ?? ""
);

    console.log(
      "BACKGROUND CHAT ID =>",
      chatId
    );

    console.log(
      "BACKGROUND MESSAGE ID =>",
      messageId
    );

    if (!chatId || !messageId) {
      console.log(
        "DELIVERED SKIPPED => chatId/messageId missing"
      );

      return;
    }

    try {

      await markDelivered(
        chatId,
        messageId
      );

      console.log(
        "========== MESSAGE MARKED DELIVERED =========="
      );

    } catch (error) {

      console.log(
        "BACKGROUND MARK DELIVERED ERROR =>",
        error
      );

    }
  }
);

console.log(
  "FCM BACKGROUND HANDLER REGISTERED"
);

registerRootComponent(App);