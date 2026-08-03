import { useEffect, useState } from "react";
import { ChatMessage, UserId } from "../types/chat";
import {
  subscribeMessages,
  markDelivered,
  markRead,
} from "../services/chatService";


export default function useMessages(
  chatId: string,
  currentUserId: UserId
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeMessages(
      chatId,
      async (list) => {

         console.log(
        "MESSAGE STATUSS",
        list.map(m => ({
            text: m.text,
            status: m.status
        }))
    );

        const visibleMessages = list
          .filter((msg) => {
            if (msg.expiresAt && msg.expiresAt <= Date.now()) {
              return false;
            }

            if (
              msg.sender !== currentUserId &&
              (msg.type === "image" || msg.type === "voice") &&
              !msg.uploadCompleted
            ) {
              return false;
            }

            return true;
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        setMessages((prev) => {
          if (
            prev.length === visibleMessages.length &&
            JSON.stringify(prev) === JSON.stringify(visibleMessages)
          ) {
            return prev;
          }

          return visibleMessages;
        });

        // setMessages(visibleMessages);

        for (const msg of list) {
          
          if (
            msg.receiver === currentUserId &&
            msg.status === "delivered"
          ) {
            await markRead(chatId, msg.id);
          }
        }
      }
    );

    return unsubscribe;
  }, [chatId, currentUserId]);

  return { messages };
}