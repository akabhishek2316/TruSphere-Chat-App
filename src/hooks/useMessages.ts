import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useIsFocused } from "@react-navigation/native";

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
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!currentUserId) return;

    let appState: AppStateStatus =
      AppState.currentState;

    const appStateSubscription =
      AppState.addEventListener(
        "change",
        (nextState) => {
          appState = nextState;

          console.log(
            "APP STATE =>",
            nextState
          );
        }
      );

    const unsubscribe = subscribeMessages(
      chatId,
      async (list) => {

        console.log(
          "MESSAGE STATUSS",
          list.map((m) => ({
            text: m.text,
            status: m.status,
          }))
        );

        const visibleMessages = list
          .filter((msg) => {
            if (
              msg.expiresAt &&
              msg.expiresAt <= Date.now()
            ) {
              return false;
            }

            if (
              msg.sender !== currentUserId &&
              (msg.type === "image" ||
                msg.type === "voice") &&
              !msg.uploadCompleted
            ) {
              return false;
            }

            return true;
          })
          .sort(
            (a, b) =>
              a.timestamp - b.timestamp
          );

        setMessages((prev) => {
          if (
            prev.length ===
              visibleMessages.length &&
            JSON.stringify(prev) ===
              JSON.stringify(visibleMessages)
          ) {
            return prev;
          }

          return visibleMessages;
        });

        // READ ONLY WHEN:
        // 1. App is active
        // 2. ChatScreen is focused

        if (
          appState !== "active" ||
          !isFocused
        ) {
          console.log(
            "SKIP READ => App not active or ChatScreen not focused"
          );

          return;
        }

        for (const msg of list) {

          if (
            msg.receiver === currentUserId &&
            msg.status === "delivered"
          ) {
            console.log(
              "MARKING READ =>",
              msg.id
            );

            await markRead(
              chatId,
              msg.id
            );
          }
        }
      }
    );

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [
    chatId,
    currentUserId,
    isFocused,
  ]);

  return { messages };
}