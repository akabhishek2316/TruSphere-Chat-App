import "react-native-gesture-handler";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";

import AppNavigator from "./src/navigation/AppNavigator";

import { AppState } from "react-native";
import { auth } from "./src/services/firebase";

import { getCurrentUser } from "./src/services/authService";
import { updateSession } from "./src/services/sessionService";

import {
  startAppServices,
  stopAppServices,
} from "./src/services/appService";

import {
 startForegroundNotificationListener,
 stopForegroundNotificationListener
} from "./src/services/notificationService";


export default function App() {
  
  useEffect(() => {

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
  
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
  