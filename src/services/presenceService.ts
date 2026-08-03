import {
  ref,
  set,
  onValue,
  onDisconnect,
} from "firebase/database";
import { UserId } from "../types/chat";
import { database } from "./firebase";

export async function setUserOnline(userId: UserId) {
   console.log("ONLINE =>", userId);
  const userRef = ref(database, `presence/${userId}`);

  await set(userRef, {
    online: true,
    lastSeen: Date.now(),
  });

  onDisconnect(userRef).set({
    online: false,
    lastSeen: Date.now(),
  });
}

export async function setUserOffline(userId: UserId) {
  console.log("OFFLINE =>", userId);
  const userRef = ref(database, `presence/${userId}`);

  await set(userRef, {
    online: false,
    lastSeen: Date.now(),
  });
}

export function subscribePresence(
  userId: UserId,
  callback: (data: {
    online: boolean;
    lastSeen: number;
  }) => void
) {
  const userRef = ref(database, `presence/${userId}`);

  return onValue(userRef, (snapshot) => {
    const value = snapshot.val();

    if (!value) {
      callback({
        online: false,
        lastSeen: 0,
      });
      return;
    }

    callback(value);
  });
}