import { ChatId, UserId } from "../chat";

/**
 * Personal chat id
 * Same id for both users.
 */


/**
 * Get other participant
 */
export function getOtherUserId(
  currentUserId: UserId,
  participants: UserId[]
): UserId | undefined {
  return participants.find(
    (id) => id !== currentUserId
  );
}

/**
 * Is current user's message?
 */
export function isMyMessage(
  sender: UserId,
  currentUserId: UserId
) {
  return sender === currentUserId;
}


export function getChatId(
  uid1: string,
  uid2: string
) {
  return [uid1, uid2]
    .sort()
    .join("_");
}