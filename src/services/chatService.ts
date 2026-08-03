import {
  ref,
  push,
  set,
  onValue,
  off,
  update,
   get,
  remove,
  
} from "firebase/database";


import { database } from "./firebase";
import { MessageStatus } from "../types/chat";
import { isBlocked } from "./userService";

import {
  UserId,
  ChatId,
  ChatMessage,
} from "../types/chat";


export async function sendMessage(
  chatId: string,
  message: Omit<ChatMessage, "id">
): Promise<string> {

const blocked = await isBlocked(
  message.receiver,
  message.sender
);

if (blocked) {
  throw new Error(
    "You are blocked by this user."
  );
}

  try {
    const messagesRef = ref(
  database,
  `chatRooms/${chatId}/messages`
);

    const newRef = push(messagesRef);

    console.log("New Key:", newRef.key);


    const disappearing =
  await getDisappearingMessages(chatId);

let expiresAt = null;

if (
  disappearing.enabled &&
  disappearing.duration
) {
  expiresAt =
    Date.now() +
    disappearing.duration;
}

await set(newRef,{
   id: newRef.key,
   ...message,
   expiresAt,

   readBy: {
      [message.sender]: true,
   },
});

await update(
  ref(database, `userChats/${message.sender}`),
  {
    [chatId]: true,
  }
);

await update(
  ref(database, `userChats/${message.receiver}`),
  {
    [chatId]: true,
  }
);

await clearDeleteState(
  message.sender,
  chatId
);

await clearDeleteState(
  message.receiver,
  chatId
);



if (message.type === "text") {
  await updateLastMessage(chatId, {
    type: "text",
    text: message.text,
    sender: message.sender,
    timestamp: message.timestamp,
  });
}
console.log("Firebase write success");

return newRef.key;
  } catch (e) {
    console.log("Firebase write failed", e);
    throw e;
  }
}

export async function updateMessage(
  chatId: string,
  messageId: string,
  data: Partial<ChatMessage>
) {
  await update(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    ),
    data
  );
}

export async function updateMessageStatus(
  chatId: string,
  messageId: string,
  status: MessageStatus
) {
  await update(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    ),
    {
      status,
    }
  );
}

export function subscribeMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = ref(
    database,
    `chatRooms/${chatId}/messages`
  );

  const unsubscribe = onValue(
    messagesRef,
    (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        callback([]);
        return;
      }

      const list = Object.values(data) as ChatMessage[];

      list.sort(
        (a, b) => a.timestamp - b.timestamp
      );

      callback(list);
    }
  );

  return unsubscribe;
}

export async function markDelivered(
  chatId: string,
  messageId: string
) {

  console.log("MARK DELIVERED FUNCTION");

  await update(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    ),
    {
      status: "delivered",
    }
  );

  console.log("DATABASE UPDATED");
}

export async function markRead(
  chatId: string,
  messageId: string
) {
  console.log("MARK READ CALLED", chatId, messageId);
  await update(
    ref(
  database,
  `chatRooms/${chatId}/messages/${messageId}`
),
    {
      status: "read",
    }
  );
  console.log("READ UPDATED");
}

export async function deleteForEveryone(
  chatId: string,
  messageId: string
) {
  await update(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    ),
    {
      text: "This message was deleted",

      deleted: true,
      deletedForEveryone: true,

      // NEW
      type: "deleted",

      image: null,
      voiceUrl: null,
      localUri: null,
      caption: null,
      duration: null,
      uploadCompleted: true,
      reactions: null,
      replyTo: null,
    }
  );

  
}

export async function deleteForMe(
  chatId: string,
  messageId: string,
  userId: UserId
) {
  await update(
    ref(
  database,
  `chatRooms/${chatId}/messages/${messageId}`
),
    {
      [`deletedFor/${userId}`]: true,
    }
  );

  await cleanupDeletedMessages(chatId);
}


export async function addReaction(
  chatId: string,
  messageId: string,
  userId: UserId,
  emoji: string
) {
  // Message read karo
  const snap = await get(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    )
  );

  if (!snap.exists()) return;

  const message = snap.val();

  // Message ke andar reaction save
  await update(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}`
    ),
    {
      reactions: {
        ...(message.reactions || {}),
        [userId]: emoji,
      },
    }
  );

  // Chat level par last reaction save
  await update(
    ref(
      database,
      `chatRooms/${chatId}`
    ),
    {
      lastReaction: {
        emoji,
        reactedBy: userId,
        messageId,
        messageText: message.text || "",
        messageType: message.type || "text",
        timestamp: Date.now(),
      },
    }
  );
}


export async function removeReaction(
  chatId: string,
  messageId: string,
  userId: UserId
) {
  await remove(
    ref(
      database,
      `chatRooms/${chatId}/messages/${messageId}/reactions/${userId}`
    )
  );

  await update(
    ref(
      database,
      `chatRooms/${chatId}`
    ),
    {
      lastReaction: null,
    }
  );
}

export async function clearChatForMe(
  chatId: string,
  userId: UserId,
  messages: ChatMessage[]
) {

  const updates: Record<string, any> = {};

  const deletedAt = Date.now();

  updates[
    `chatRooms/${chatId}/deletedForUsers/${userId}`
  ] = {
    deletedAt,
  };

  messages.forEach((msg) => {

    updates[
      `chatRooms/${chatId}/messages/${msg.id}/deletedFor/${userId}`
    ] = true;

  });

  await update(
    ref(database),
    updates
  );

  await cleanupDeletedMessages(chatId);

}


export async function clearChatForEveryone(
  chatId: string,
  currentUserId: string,
  messages: ChatMessage[]
) {
  const updates: Record<string, any> = {};

  // Sirf current user ke bheje hue messages sabke liye delete
  messages.forEach((msg) => {
    if (msg.sender === currentUserId) {
      updates[
        `chatRooms/${chatId}/messages/${msg.id}`
      ] = null;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(database), updates);
  }

  // Current user ke phone se poora chat hide/delete
  // await deleteChat(
  //   currentUserId,
  //   chatId
  // );
}




export function subscribeLastMessage(
  chatId: string,
   currentUserId: string,
  callback: (message: ChatMessage | null) => void
) {
  return onValue(
    ref(database, `chatRooms/${chatId}/messages`),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const messages = Object.values(
        snapshot.val()
      ) as ChatMessage[];

      messages.sort(
        (a, b) => a.timestamp - b.timestamp
      );

     
const lastVisible = [...messages]
  .reverse()
  .find((m) => {

    // Sirf Delete for Me hide hoga
    if (m.deletedFor?.[currentUserId]) {
      return false;
    }

    // Failed upload ignore
    if (
      (m.type === "image" ||
       m.type === "voice") &&
      !m.uploadCompleted
    ) {
      return false;
    }

    // Delete for Everyone ko ignore MAT karo
    return true;
  });

callback(lastVisible || null);


    }
  );
}


export function subscribeLastReaction(
  chatId: string,
  callback: (reaction: any) => void
) {
  return onValue(
    ref(database, `chatRooms/${chatId}/lastReaction`),
    snapshot => {
      callback(
        snapshot.exists()
          ? snapshot.val()
          : null
      );
    }
  );
}

export async function createChatRoom(
  chatId: string,
  uid1: string,
  uid2: string
) {
  const roomRef = ref(
    database,
    `chatRooms/${chatId}`
  );

  const snap = await get(roomRef);

  if (snap.exists()) {
    return;
  }

  await set(roomRef, {
    participants: {
      [uid1]: true,
      [uid2]: true,
    },

    createdAt: Date.now(),

    lastMessage: "",

    lastMessageTime: 0,
  });

  await addChatToUser(uid1, chatId);

await addChatToUser(uid2, chatId);
}

export async function addChatToUser(
  uid: string,
  chatId: string
) {
  await update(
    ref(database, `userChats/${uid}`),
    {
      [chatId]: true,
    }
  );
}

export function subscribeUserChats(
  uid: string,
  callback: (chatIds: string[]) => void
) {
  return onValue(
    ref(database, `userChats/${uid}`),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      callback(Object.keys(snapshot.val()));
    }
  );
}

export async function setDisappearingMessages(
  chatId: string,
  enabled: boolean,
  duration: number | null,
  uid: string
) {
  await set(
    ref(
      database,
      `chatRooms/${chatId}/settings/disappearing`
    ),
    {
      enabled,
      duration,
      updatedBy: uid,
      updatedAt: Date.now(),
    }
  );
}

export async function getDisappearingMessages(
  chatId: string
) {
  const snapshot = await get(
    ref(
      database,
      `chatRooms/${chatId}/settings/disappearing`
    )
  );

  if (!snapshot.exists()) {
    return {
      enabled: false,
      duration: null,
    };
  }

  return snapshot.val();
}

export async function cleanupExpiredMessages(
  chatId: string
) {
  const snapshot = await get(
    ref(
      database,
      `chatRooms/${chatId}/messages`
    )
  );

  if (!snapshot.exists()) return;

  const messages = snapshot.val();

  const now = Date.now();

  for (const key in messages) {
    const msg = messages[key];

    if (
      msg.expiresAt &&
      msg.expiresAt <= now
    ) {
      await remove(
        ref(
          database,
          `chatRooms/${chatId}/messages/${key}`
        )
      );
    }
  }
}

export function subscribeDisappearingMessages(
  chatId: string,
  callback: (data: {
    enabled: boolean;
    duration: number | null;
  }) => void
) {
  const settingsRef = ref(
    database,
    `chatRooms/${chatId}/settings/disappearing`
  );

  const unsubscribe = onValue(
    settingsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          enabled: false,
          duration: null,
        });

        return;
      }

      callback(snapshot.val());
    }
  );

  return () => off(settingsRef);
}

export function subscribeUnreadCount(
  chatId: string,
  currentUserId: string,
  callback: (count: number) => void
) {
  const messagesRef = ref(
    database,
    `chatRooms/${chatId}/messages`
  );

  return onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(0);
      return;
    }

    const messages = Object.values(
      snapshot.val()
    ) as ChatMessage[];

    const unread = messages.filter(
  (m) =>
    m.receiver === currentUserId &&
    m.sender !== currentUserId &&
    m.status !== "read" &&
    !m.deleted &&
    !m.deletedForEveryone &&
    (
      m.type === "text" ||
      m.uploadCompleted === true
    )
).length;

    callback(unread);
  });
}

export async function updateLastMessage(
  chatId: string,
  message: {
    type: "text" | "image" | "voice";
    text?: string;
    sender: string;
    timestamp: number;
  }
) {
  await update(
    ref(database, `chatRooms/${chatId}`),
    {
      lastMessage:
        message.type === "text"
          ? message.text
          : message.type === "image"
          ? "📷 Photo"
          : "🎤 Voice Message",

      lastMessageType: message.type,
      lastMessageSender: message.sender,
      lastMessageTime: message.timestamp,
    }
  );
}


export async function cleanupDeletedMessages(
  chatId: string
) {
  const messagesRef = ref(
    database,
    `chatRooms/${chatId}/messages`
  );

  const snap = await get(messagesRef);

  if (!snap.exists()) return;

  const data = snap.val();

  const updates: Record<string, null> = {};

  Object.entries(data).forEach(
    ([messageId, value]: any) => {

      const deletedFor =
        value.deletedFor || {};

      const senderDeleted =
        deletedFor[value.sender] === true;

      const receiverDeleted =
        deletedFor[value.receiver] === true;

      if (
        senderDeleted &&
        receiverDeleted
      ) {
        updates[
          `chatRooms/${chatId}/messages/${messageId}`
        ] = null;
      }

    }
  );

  if (
    Object.keys(updates).length
  ) {
    await update(
      ref(database),
      updates
    );


    await update(
  ref(database, `chatRooms/${chatId}`),
  {
    lastMessage: "",
    lastMessageSender: "",
    lastMessageTime: 0,
    lastMessageType: "",
  }
);
  }
}

// Hide chat from chat list
export async function hideChat(
  userId: string,
  chatId: string
) {
  await set(
    ref(database, `hiddenChats/${userId}/${chatId}`),
    true
  );
}

// Show chat again
export async function restoreChat(
  userId: string,
  chatId: string
) {
  await remove(
    ref(database, `hiddenChats/${userId}/${chatId}`)
  );
}

// Delete chat timestamp
export async function deleteChat(
  userId: string,
  chatId: string
) {
  // Delete timestamp save
  await set(
    ref(database, `chatStates/${userId}/${chatId}`),
    {
      deletedAt: Date.now(),
    }
  );

  // Hide from chat list
  await hideChat(userId, chatId);

  // Get all messages
  const snap = await get(
    ref(database, `chatRooms/${chatId}/messages`)
  );

  if (!snap.exists()) return;

  const messages = Object.values(
    snap.val()
  ) as ChatMessage[];

  // Mark every message deleted for this user
  const updates: Record<string, boolean> = {};

  messages.forEach((msg) => {
    updates[
      `chatRooms/${chatId}/messages/${msg.id}/deletedFor/${userId}`
    ] = true;
  });

  await update(ref(database), updates);
}

// Get deletedAt once
export async function getDeletedAt(
  userId: string,
  chatId: string
) {
  const snap = await get(
    ref(database, `chatStates/${userId}/${chatId}`)
  );

  if (!snap.exists()) {
    return 0;
  }

  return snap.val().deletedAt || 0;
}

// Live listener
export function subscribeDeletedAt(
  userId: string,
  chatId: string,
  callback: (deletedAt: number) => void
) {
  const stateRef = ref(
    database,
    `chatStates/${userId}/${chatId}`
  );

  return onValue(stateRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(0);
      return;
    }

    callback(snapshot.val().deletedAt || 0);
  });
}


export function subscribeHiddenChats(
  userId: string,
  callback: (hidden: Record<string, boolean>) => void
) {
  const hiddenRef = ref(
    database,
    `hiddenChats/${userId}`
  );

  return onValue(hiddenRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export async function clearDeleteState(
  userId: string,
  chatId: string
) {
  await remove(
    ref(database, `chatStates/${userId}/${chatId}`)
  );

  await restoreChat(userId, chatId);
}

export async function blockUser(
  currentUserId: string,
  otherUserId: string
) {
  await set(
    ref(
      database,
      `blocks/${currentUserId}/${otherUserId}`
    ),
    true
  );
}

export async function unblockUser(
  currentUserId: string,
  otherUserId: string
) {
  await remove(
    ref(
      database,
      `blocks/${currentUserId}/${otherUserId}`
    )
  );
}

export async function isUserBlocked(
  currentUserId: string,
  otherUserId: string
) {
  const snap = await get(
    ref(
      database,
      `blocks/${currentUserId}/${otherUserId}`
    )
  );

  return snap.exists();
}

export async function updateLastReaction(
  chatId: string,
  reaction: any | null
) {
  await update(
    ref(database, `chatRooms/${chatId}`),
    {
      lastReaction: reaction,
    }
  );
}