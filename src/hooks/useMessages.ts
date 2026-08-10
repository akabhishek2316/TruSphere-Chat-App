import {
  useEffect,
  useState,
} from "react";

import {
  AppState,
  AppStateStatus,
} from "react-native";

import {
  useIsFocused,
} from "@react-navigation/native";

import {
  ChatMessage,
  UserId,
} from "../types/chat";

import {
  subscribeMessages,
  markRead,
} from "../services/chatService";

export default function useMessages(
  chatId: string,
  currentUserId: UserId
) {
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const isFocused =
    useIsFocused();

  useEffect(() => {
    if (!currentUserId) return;

    let appState: AppStateStatus =
      AppState.currentState;

    const appStateSubscription =
      AppState.addEventListener(
        "change",
        (nextState) => {
          appState = nextState;
        }
      );

    const unsubscribe =
      subscribeMessages(
        chatId,
        (list) => {

          /*
           * --------------------------------
           * FILTER ONLY
           * --------------------------------
           */

          const now = Date.now();

          const visibleMessages =
            list.filter((msg) => {

              if (
                msg.expiresAt &&
                msg.expiresAt <= now
              ) {
                return false;
              }

              if (
                msg.sender !==
                  currentUserId &&
                (
                  msg.type === "image" ||
                  msg.type === "voice"
                ) &&
                !msg.uploadCompleted
              ) {
                return false;
              }

              return true;
            });

          /*
           * --------------------------------
           * IMPORTANT
           * No JSON.stringify comparison
           * --------------------------------
           */

          setMessages(
            visibleMessages
          );

          /*
           * --------------------------------
           * READ STATUS
           * --------------------------------
           */

          if (
            appState !== "active" ||
            !isFocused
          ) {
            return;
          }

          const unreadMessages =
            list.filter(
              (msg) =>
                msg.receiver ===
                  currentUserId &&
                msg.status ===
                  "delivered"
            );

          if (
            unreadMessages.length === 0
          ) {
            return;
          }

          /*
           * Parallel Firebase updates
           * instead of sequential await
           */

          Promise.all(
            unreadMessages.map(
              (msg) =>
                markRead(
                  chatId,
                  msg.id
                )
            )
          ).catch((error) => {
            console.log(
              "MARK READ ERROR =>",
              error
            );
          });
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

  return {
    messages,
  };
}