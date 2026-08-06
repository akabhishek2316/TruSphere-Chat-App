import { registerRootComponent } from 'expo';


import { getMessaging } from "@react-native-firebase/messaging";

import App from "./App";

const messaging = getMessaging();

messaging.setBackgroundMessageHandler(async (remoteMessage: any) => {
  console.log(
    "BACKGROUND MESSAGE =>",
    JSON.stringify(remoteMessage)
  );
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
