import {
  ref,
  get,
  set,
  remove,
  onValue,
} from "firebase/database";
import { database } from "./firebase";

export async function getSession(uid: string) {
  const snap = await get(
    ref(database, `sessions/${uid}`)
  );

  if (!snap.exists()) return null;

  return snap.val();
}

import uuid from "react-native-uuid";

export async function createSession(
  uid: string,
  deviceId: string
) {

  const sessionId =
    uuid.v4().toString();

  await set(
    ref(database, `sessions/${uid}`),
    {
      deviceId,
      sessionId,
      loginAt: Date.now(),
      lastActive: Date.now(),
    }
  );

  return sessionId;
}

import { update } from "firebase/database";

export async function updateSession(
  uid: string
) {
  await update(
    ref(database, `sessions/${uid}`),
    {
      lastActive: Date.now(),
    }
  );
}

const SESSION_TIMEOUT =
  30 * 24 * 60 * 60 * 1000; // 30 days




export function isSessionExpired(
  session: any
) {
  return (
    Date.now() - session.lastActive >
    SESSION_TIMEOUT
  );
}

export async function deleteSession(uid: string) {
  await remove(
    ref(database, `sessions/${uid}`)
  );
}

export async function getCurrentSessionId(
  uid: string
) {

  const snap = await get(
    ref(
      database,
      `sessions/${uid}/sessionId`
    )
  );

  if (!snap.exists()) return null;

  return snap.val();
}

export function subscribeSession(
  uid: string,
  callback: (
    session: any | null
  ) => void
) {
  return onValue(
    ref(database, `sessions/${uid}`),
    (snapshot) => {
      callback(
        snapshot.exists()
          ? snapshot.val()
          : null
      );
    }
  );
}