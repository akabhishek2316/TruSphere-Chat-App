import { registerRootComponent } from "expo";

import {
  getMessaging,
} from "@react-native-firebase/messaging";

import App from "./App";

console.log("INDEX TS LOADED");

const messaging = getMessaging();

messaging.setBackgroundMessageHandler(
  async (remoteMessage) => {
    console.log(
      "BACKGROUND MESSAGE =>",
      JSON.stringify(remoteMessage)
    );
  }
);

registerRootComponent(App);