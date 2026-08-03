import { AppState, AppStateStatus } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";

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
    currentUser = user;

    if (!user) {
      stopMessageSync();
      return;
    }

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