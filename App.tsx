import "react-native-gesture-handler";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";
import { useShareIntent } from "expo-share-intent";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { AppState } from "react-native";


import { getCurrentUser } from "./src/services/authService";
import { updateSession } from "./src/services/sessionService";

import {
  startAppServices,
  stopAppServices,
} from "./src/services/appService";

import {
  startForegroundNotificationListener,
  stopForegroundNotificationListener,
  setupNotificationChannel,
} from "./src/services/notificationService";


export default function App() {

  const {
  hasShareIntent,
  shareIntent,
  resetShareIntent,
  error,
} = useShareIntent();

console.log("========== SHARE HOOK ==========");
console.log("HAS SHARE INTENT =>", hasShareIntent);
console.log("SHARE INTENT =>", JSON.stringify(shareIntent));
console.log("SHARE ERROR =>", JSON.stringify(error));
  
  useEffect(() => {
  setupNotificationChannel();

  startAppServices();
  startForegroundNotificationListener();

  return () => {
    stopForegroundNotificationListener();
    stopAppServices();
  };
}, []);
  
  useEffect(() => {
    
    const subscription =
    AppState.addEventListener(
      "change",
      async (state) => {
        
        if (state !== "active") return;
        
        const user =
        getCurrentUser();
        
        if (!user) return;
        
        await updateSession(
          user.uid
        );

      }
    );
    
    return () => subscription.remove();
    
  }, []);

  useEffect(() => {
  if (!shareIntent) return;

  console.log(
    "========== SHARE INTENT =========="
  );
  console.log(
    "SHARED TEXT =>",
    shareIntent.text
  );
  console.log(
    "SHARED FILES =>",
    shareIntent.files
  );
  console.log(
    "SHARED WEB URL =>",
    shareIntent.webUrl
  );

}, [shareIntent]);
  
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
      style="dark"
      backgroundColor="#F8FAFC"
    />
      <PaperProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
  