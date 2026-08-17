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

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ChatMessage,
  UserId,
} from "../types/chat";

import {
  subscribeMessages,
  markRead,
} from "../services/chatService";

const getMessagesCacheKey = (chatId: string) =>
  `CHAT_MESSAGES_CACHE_${chatId}`;

export default function useMessages(
  chatId: string,
  currentUserId: UserId
) {
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const isFocused = useIsFocused();

  /*
   * --------------------------------
   * LOAD LOCAL CACHE IMMEDIATELY
   * --------------------------------
   */

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    let cancelled = false;

    const loadCache = async () => {
      try {
        const cached =
          await AsyncStorage.getItem(
            getMessagesCacheKey(chatId)
          );

        if (!cached || cancelled) return;

        const parsed: ChatMessage[] =
          JSON.parse(cached);

        const now = Date.now();

        const visibleCached =
          parsed.filter((msg) => {

            if (
              msg.expiresAt &&
              msg.expiresAt <= now
            ) {
              return false;
            }

            if (
              msg.sender !== currentUserId &&
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

        setMessages(visibleCached);

      } catch (error) {
        console.log(
          "LOAD MESSAGE CACHE ERROR =>",
          error
        );
      }
    };

    loadCache();

    return () => {
      cancelled = true;
    };

  }, [chatId, currentUserId]);


  /*
   * --------------------------------
   * FIREBASE REALTIME SYNC
   * --------------------------------
   */

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
                msg.sender !== currentUserId &&
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
           * UPDATE UI
           * --------------------------------
           */

          setMessages(
            visibleMessages
          );


          /*
           * --------------------------------
           * SAVE FRESH DATA TO CACHE
           * --------------------------------
           */

          AsyncStorage.setItem(
            getMessagesCacheKey(chatId),
            JSON.stringify(
              visibleMessages
            )
          ).catch((error) => {
            console.log(
              "SAVE MESSAGE CACHE ERROR =>",
              error
            );
          });


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
                msg.receiver === currentUserId &&
                msg.status === "delivered"
            );

          if (
            unreadMessages.length === 0
          ) {
            return;
          }


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