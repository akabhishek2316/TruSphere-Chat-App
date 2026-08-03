import {
  ref,
  set,
  onValue,
} from "firebase/database";
import { UserId } from "../types/chat";
import { database } from "./firebase";


export async function setTyping(
  userId: UserId,
  typing: boolean,
  recording: boolean = false
) {
  await set(
    ref(database, `typing/${userId}`),
    {
      typing,
      recording,
    }
  );
}

export function subscribeTyping(
  userId: UserId,
  callback: (
    state: {
      typing: boolean;
      recording: boolean;
    }
  ) => void
) {
  return onValue(
    ref(database, `typing/${userId}`),
    snapshot => {
      callback(
        snapshot.val() || {
          typing: false,
          recording: false,
        }
      );
    }
  );
}