import {
  ref,
  set,
  get,
  onValue,
  update,
  query,
  orderByChild,
  equalTo,
   remove,
} from "firebase/database";

import { UserId } from "../types/chat";
import { database } from "./firebase";
import { User } from "../types/chat";

export type UserProfile = {
  uid?:string;
  name: string;
  username: string;
  about: string;
  photo?: string;
  createdAt?: number;

  
};

export async function saveUserProfile(
  userId: UserId,
  profile: Pick<UserProfile, "name" | "about" | "photo">
) {
  await update(
    ref(database, `users/${userId}`),
    profile
  );
}

export async function updateUserProfile(
  userId: UserId,
  profile: Partial<UserProfile>
) {
  await update(ref(database, `users/${userId}`), profile);
}

export async function getUserProfile(
  userId: UserId
) {
  const snap = await get(ref(database, `users/${userId}`));

  if (snap.exists()) {
    return snap.val() as UserProfile;
  }

  return {
     uid: "",
  name: "User",
  username:"",
  about: "",
  photo: "",
  createdAt:0,
  
};
}

export function subscribeUserProfile(
  userId: UserId,
  callback: (profile: UserProfile) => void
) {
  return onValue(
    ref(database, `users/${userId}`),
    snapshot => {
      if (snapshot.exists()) {
        callback(snapshot.val() as UserProfile);
      }

    }
  );
}


export async function saveSecret(
  userId: UserId,
  secret: string
) {
  await update(
    ref(database, `users/${userId}`),
    {
      secret,
    }
  );
}

export async function getSecret(
  userId: UserId
) {
  const snap = await get(
    ref(database, `users/${userId}/secret`)
  );

  if (snap.exists()) {
    return snap.val();
  }

  return "2580";
}

export function subscribeSecret(
  userId: UserId,
  callback: (secret: string) => void
) {
  return onValue(
    ref(database, `users/${userId}/secret`),
    snap => {
      callback(
        snap.exists()
          ? snap.val()
          : "2580"
      );
    }
  );
}

export function subscribeUsers(
  callback: (users: Record<string, UserProfile>) => void
) {
  return onValue(
    ref(database, "users"),
    (snapshot) => {
      console.log("USERS NODE UPDATED")
      callback(snapshot.val() || {});
    }
  );
}

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    username: string;
    email: string;
  }
) {
  const username = data.username.toLowerCase();

await set(ref(database, `users/${uid}`), {
  uid,
  name: data.name,
  username,
  email: data.email,
  about: "Available on TruSphere..",
  photo: "",
  online: false,
  lastSeen: Date.now(),
  createdAt: Date.now(),
});

await set(
  ref(database, `usernames/${username}`),
  uid
);
}

export async function getAllUsers() {
  const snap = await get(ref(database, "users"));

  if (!snap.exists()) {
    return [];
  }

  return Object.values(snap.val());
}

export async function getUserById(uid: string) {
  const snap = await get(ref(database, `users/${uid}`));

  if (!snap.exists()) {
    return null;
  }

  return snap.val();
}

export async function isUsernameExists(
  username: string
) {
  const snap = await get(
    ref(
      database,
      `usernames/${username.toLowerCase()}`
    )
  );

  return snap.exists();
}

export async function getUsernameSuggestions(
  username: string
) {
  const suggestions: string[] = [];

  suggestions.push(username + "_" + Math.floor(Math.random() * 99));

  suggestions.push(username + "_" + Math.floor(Math.random() * 999));

  suggestions.push(username + "_official");

  suggestions.push(username + "_real");

  suggestions.push(username + "_" + new Date().getFullYear());

  return suggestions;
}

export async function getUserByUsername(
  username: string
) {
  const usernameSnap = await get(
    ref(
      database,
      `usernames/${username.toLowerCase()}`
    )
  );

  if (!usernameSnap.exists()) {
    return null;
  }

  const uid = usernameSnap.val();

  const userSnap = await get(
    ref(database, `users/${uid}`)
  );

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.val();
}

export async function blockUser(
  currentUid: string,
  otherUid: string
) {
  await set(
    ref(
      database,
      `blocks/${currentUid}/${otherUid}`
    ),
    {
      blockedAt: Date.now(),
    }
  );
}

export async function unblockUser(
  currentUid: string,
  otherUid: string
) {
  await remove(
    ref(
      database,
      `blocks/${currentUid}/${otherUid}`
    )
  );
}

export async function isBlocked(
  currentUid: string,
  otherUid: string
) {
  const snap = await get(
    ref(
      database,
      `blocks/${currentUid}/${otherUid}`
    )
  );

  return snap.exists();
}

export function subscribeBlockStatus(
  currentUid: string,
  otherUid: string,
  callback: (blocked: boolean) => void
) {
  return onValue(
    ref(
      database,
      `blocks/${currentUid}/${otherUid}`
    ),
    (snapshot) => {
      callback(snapshot.exists());
    }
  );
}

export async function hasBlockedMe(
  currentUid: string,
  otherUid: string
) {
  const snap = await get(
    ref(
      database,
      `blocks/${otherUid}/${currentUid}`
    )
  );

  return snap.exists();
}

export async function getBlockStatus(
  currentUid: string,
  otherUid: string
) {
  const [iBlocked, blockedMe] = await Promise.all([
    isBlocked(currentUid, otherUid),
    hasBlockedMe(currentUid, otherUid),
  ]);

  return {
    iBlocked,
    blockedMe,
  };
}

export function subscribeHasBlockedMe(
  currentUid: string,
  otherUid: string,
  callback: (value: boolean) => void
) {
  return onValue(
    ref(
      database,
      `blocks/${otherUid}/${currentUid}`
    ),
    snap => {
      callback(snap.exists());
    }
  );

  
}


export function subscribeBlockedUsers(
  currentUid: string,
  callback: (uids: string[]) => void
) {
  return onValue(
    ref(database, `blocks/${currentUid}`),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      callback(Object.keys(snapshot.val()));
    }
  );
}



export async function getCurrentChat(uid: string) {
  const snap = await get(
    ref(database, `presence/${uid}/currentChat`)
  );

  if (!snap.exists()) return null;

  return snap.val();
}

//fcm code 

export async function saveFcmToken(
  uid: string,
  token: string
) {
  await update(
    ref(database, `users/${uid}`),
    {
      fcmToken: token,
    }
  );
}

export async function getUserFcmToken(uid: string) {
  const snap = await get(
    ref(database, `users/${uid}/fcmToken`)
  );

  if (!snap.exists()) return null;

  return snap.val();
}