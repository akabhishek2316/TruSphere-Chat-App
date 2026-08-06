import { AppState, AppStateStatus } from "react-native";
import { onAuthStateChanged, User } from "@react-native-firebase/auth";

import { auth } from "./firebase";

import {
  setUserOnline,
  setUserOffline,
} from "./presenceService";

import {
  startMessageSync,
  stopMessageSync,
} from "./messageSyncService";

let currentUser: User | null = null;
let appStateSubscription: { remove: () => void } | null = null;

export function startAppServices() {
  onAuthStateChanged(auth, async (user) => {

     console.log("AUTH OBJECT =>", user);
    currentUser = user;

    

    if (!user) {
      stopMessageSync();
      return;
    }

     console.log("UID =>", user.uid);

    console.log("AUTH RESTORED =>", user.uid);

    await setUserOnline(user.uid);


    startMessageSync(user.uid);

    appStateSubscription?.remove();

    appStateSubscription = AppState.addEventListener(
      "change",
      handleAppState
    );
  });
}

async function handleAppState(state: AppStateStatus) {
  if (!currentUser) return;

  if (state === "active") {
    console.log("APP ACTIVE");

    await setUserOnline(currentUser.uid);
  } else {
    console.log("APP BACKGROUND");

    await setUserOffline(currentUser.uid);
  }
}

export function stopAppServices() {
  stopMessageSync();

  appStateSubscription?.remove();
}

// temp code

onAuthStateChanged(auth, (user) => {
  console.log("========== AUTH CALLBACK ==========");
  console.log("USER =>", user);
  console.log("CURRENT =>", auth.currentUser);
});