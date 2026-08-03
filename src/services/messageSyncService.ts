
import { subscribeUserChats } from "./chatService";
import {
  subscribeMessages,
  markDelivered,
} from "./chatService";

let unsubChats: (() => void) | null = null;

const listeners: Record<string, () => void> = {};

export function startMessageSync(me: string) {
  console.log("SYNC START =>", me);
  unsubChats?.();

  Object.values(listeners).forEach((u) => u());

  Object.keys(listeners).forEach((k) => delete listeners[k]);

  unsubChats = subscribeUserChats(me, (chatIds) => {
    console.log("USER CHATS =>", chatIds);
    chatIds.forEach((chatId) => {
      if (listeners[chatId]) return;

      listeners[chatId] = subscribeMessages(
        chatId,
        async (messages) => {
          console.log("CHAT:", chatId);
          console.log("TOTAL MESSAGES:", messages.length);
          for (const msg of messages) {
            console.log(
              "CHECK =>",
              msg.text,
              msg.receiver,
              me,
              msg.status
            );

            if (
              msg.receiver === me &&
              msg.status === "sent"
            ) {
              try {
                console.log("MARKING", msg.text);
                await markDelivered(chatId, msg.id);
              } catch (e) {
                console.log(e);
              }
            }
          }
        }
      );
    });


  });
}

export function stopMessageSync() {
  unsubChats?.();

  Object.values(listeners).forEach((u) => u());

  Object.keys(listeners).forEach((k) => delete listeners[k]);
}