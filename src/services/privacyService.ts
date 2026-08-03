import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

export function subscribePrivacy(
  currentUid: string,
  otherUid: string,
  callback: (data: {
    iBlocked: boolean;
    blockedMe: boolean;
    hideProfile: boolean;
    canSend: boolean;
  }) => void
) {

  let iBlocked = false;
  let blockedMe = false;

  const update = () => {
    callback({
      iBlocked,
      blockedMe,
      hideProfile: iBlocked || blockedMe,
      canSend: !(iBlocked || blockedMe),
    });
  };

  const unsub1 = onValue(
    ref(database, `blocks/${currentUid}/${otherUid}`),
    snap => {
      iBlocked = snap.exists();
      update();
    }
  );

  const unsub2 = onValue(
    ref(database, `blocks/${otherUid}/${currentUid}`),
    snap => {
      blockedMe = snap.exists();
      update();
    }
  );

  return () => {
    unsub1();
    unsub2();
  };
}