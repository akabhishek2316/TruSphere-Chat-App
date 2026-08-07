import { registerRootComponent } from "expo";

import { getMessaging } from "@react-native-firebase/messaging";

import App from "./App";

import { markDelivered } from "./src/services/chatService";


console.log("INDEX TS LOADED");


const messaging = getMessaging();


messaging.setBackgroundMessageHandler(
  async (remoteMessage: any) => {

    try {

      console.log(
        "BACKGROUND MESSAGE =>",
        JSON.stringify(remoteMessage)
      );


      const chatId =
        remoteMessage.data?.chatId;


      const messageId =
        remoteMessage.data?.messageId;


      console.log(
        "BACKGROUND DATA =>",
        {
          chatId,
          messageId,
        }
      );


      if (
        chatId &&
        messageId
      ) {

        console.log(
          "BACKGROUND MARK DELIVERED START"
        );


        await markDelivered(
          chatId,
          messageId
        );


        console.log(
          "BACKGROUND MARK DELIVERED DONE"
        );

      } else {

        console.log(
          "BACKGROUND DATA MISSING"
        );

      }


    } catch (error) {

      console.log(
        "BACKGROUND HANDLER ERROR =>",
        error
      );

    }

  }
);


registerRootComponent(App);
