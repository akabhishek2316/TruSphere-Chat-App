

import React, { useEffect, useRef, useState, useMemo } from "react";
import MessageOptionsModal from "../components/MessageOptionsModal";
import * as Clipboard from "expo-clipboard";
import { clearChatForMe } from "../services/chatService";
import uuid from "react-native-uuid";
import useChatScroll from "../hooks/useChatScroll";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { unblockUser } from "../services/userService";
import { setCurrentChat } from "../services/chatService";
import {

  removeReaction,
} from "../services/chatService";
import {
  sendMessage,
  updateMessage,
  updateMessageStatus,
  updateLastMessage,
} from "../services/chatService";
import {
  ChatMessage,
  UserId,
} from "../types/chat";
import { Ref } from "react";
import { get } from "firebase/database";
import { ref } from "firebase/database";
import { database } from "../services/firebase";
import {
  subscribeDeletedAt,
} from "../services/chatService";
import {
  subscribeUserProfile,
  UserProfile,
} from "../services/userService";

import {
  deleteForEveryone,
  deleteForMe,
  addReaction,
} from "../services/chatService";
import { update } from "firebase/database";
import { Database } from "firebase/database";
import {
  
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  View,
  Text,
  BackHandler,
  Keyboard,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {

  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";


import { TouchableOpacity } from "react-native";

import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import TypingIndicator from "../components/TypingIndicator";
import useMessages from "../hooks/useMessages";
import { Colors } from "../theme/colors";
import DateSeparator from "../components/DateSeparator";
import { formatChatDate } from "../types/utils/formatTime";
import { subscribePrivacy } from "../services/privacyService";
import * as ImagePicker from "expo-image-picker";
import {
  cleanupExpiredMessages,
  subscribeDisappearingMessages,
} from "../services/chatService";
import { getUserProfile } from "../services/userService";
import {
  setUserOnline,
  setUserOffline,
  subscribePresence,
} from "../services/presenceService";

import {
  setTyping,
  subscribeTyping,
} from "../services/typingService";

import { getCurrentUser } from "../services/authService";

import { uploadVoice, uploadImage } from "../services/cloudinary";

import {
  setActiveChat,
} from "../services/notificationService";



type ChatNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "Chat"
  >;

export default function ChatScreen() {



  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const flatListRef = useRef<FlatList>(null);

  const route =
    useRoute<RouteProp<RootStackParamList, "Chat">>();

  const {
    chatId,
    otherUserId,
    imageUri,
    caption,
  } = route.params;



  const currentUserId =
    getCurrentUser()?.uid ?? "";

  console.log("Current UID:", currentUserId);

  const {
    messages,
  } = useMessages(
    chatId,
    currentUserId
  );

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) return;

    setCurrentChat(user.uid, chatId);

    return () => {
      setCurrentChat(user.uid, null);
    };
  }, [chatId]);

  useEffect(() => {

    setActiveChat(chatId);


    return () => {
      setActiveChat(null);
    };

  }, [chatId]);

  const [deleteCutoff, setDeleteCutoff] =
    useState(0);

  const {
    listRef,
    scrollToBottom,
    shouldAutoScroll,
    isUserScrolling,
  } = useChatScroll();


  

  const scrollToMessage = (messageId: string) => {
    const index = allMessages.findIndex(
      m =>
        m.id === messageId ||
        m.clientId === messageId
    );

    if (index === -1) return;

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });

    setHighlightedMessageId(messageId);

    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 1800);
  };

 useEffect(() => {
  const keyboardShow = Keyboard.addListener(
    Platform.OS === "ios"
      ? "keyboardWillShow"
      : "keyboardDidShow",
    () => {
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  );

  return () => {
    keyboardShow.remove();
  };
}, []);

  const [presence, setPresence] = useState({
    online: false,
    lastSeen: 0,
  });

  const [otherProfile, setOtherProfile] =
    useState<UserProfile>({
      uid: "",
      name: "User",
      username: "",
      about: "",
      photo: "",
      createdAt: 0,
    });

  const [myProfile, setMyProfile] = useState<UserProfile>({
    uid: "",
    name: "",
    username: "",
    about: "",
    photo: "",
    createdAt: 0,
  });


  const [typingState, setTypingState] =
    useState({
      typing: false,
      recording: false,
    });

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [selectedMessage, setSelectedMessage] =
    useState<ChatMessage | null>(null);
  const [localMessages, setLocalMessages] =
    useState<ChatMessage[]>([]);

  const [highlightedMessageId, setHighlightedMessageId] =
    useState<string | null>(null);

  const [deletedAt, setDeletedAt] =
    useState(0);



  const [privacy, setPrivacy] = useState({
    iBlocked: false,
    blockedMe: false,
    hideProfile: false,
    canSend: true,
  });

  const closeMessageOptions = () => {
    setShowOptions(false);
    setSelectedMessage(null);
  };


  useEffect(() => {
    const loadMyProfile = async () => {
      const me = getCurrentUser()?.uid;

      if (!me) return;

      const profile = await getUserProfile(me);

      if (profile) {
        setMyProfile(profile);
      }
    };

    loadMyProfile();
  }, []);

  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Gallery permission denied");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

    if (result.canceled) {
      return;
    }

    navigation.navigate("ImagePreview", {
      chatId,
      otherUserId,
      imageUri: result.assets[0].uri,
    });

    console.log(result.assets[0]);
  };


  useEffect(() => {



    if (!currentUserId) return;

    setUserOnline(currentUserId);

    cleanupExpiredMessages(chatId);







    const unsubscribeDisappearing =
      subscribeDisappearingMessages(
        chatId,
        setDisappearingSetting
      );

    const unsubscribePresence =
      subscribePresence(
        otherUserId,
        setPresence
      );
    const unsubscribeTyping =
      subscribeTyping(
        otherUserId,
        setTypingState
      );

    const unsubscribeProfile =
      subscribeUserProfile(
        otherUserId,
        setOtherProfile
      );




    const unsubscribeDeletedAt =
      subscribeDeletedAt(
        currentUserId,
        chatId,
        setDeletedAt
      );

    const unsubscribePrivacy =
      subscribePrivacy(
        currentUserId,
        otherUserId,
        setPrivacy
      );


    return () => {


      unsubscribeDisappearing();

      unsubscribePresence();
      unsubscribeTyping();
      unsubscribeProfile();
      unsubscribeDeletedAt();
      unsubscribePrivacy();
    };
  }, [currentUserId, otherUserId]);


  const [disappearingSetting, setDisappearingSetting] =
    useState<{
      enabled: boolean;
      duration: number | null;
    }>({
      enabled: false,
      duration: null,
    });



  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredMessages(chatId);
    }, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, [chatId]);





  useEffect(() => {

    async function loadDeleteTime() {

      const snap = await get(
        ref(
          database,
          `chatRooms/${chatId}/deletedForUsers/${currentUserId}`
        )
      );

      if (snap.exists()) {

        setDeleteCutoff(
          snap.val().deletedAt || 0
        );

      } else {

        setDeleteCutoff(0);

      }

    }

    loadDeleteTime();

  }, [chatId]);


  const allMessages = useMemo(() => {

    return [

      ...messages,

      ...localMessages.filter(
        local =>
          !messages.some(
            firebase =>
              firebase.clientId === local.clientId
          )
      ),

    ]
      .filter(
        m =>
          m.timestamp > deleteCutoff
      )
      .sort(
        (a, b) =>
          a.timestamp - b.timestamp
      );

  }, [
    messages,
    localMessages,
    deleteCutoff,
  ]);



  const retryVoiceMessage = async (
    message: ChatMessage
  ) => {
    if (!message.localUri) return;

    try {
      await updateMessageStatus(
        chatId,
        message.id,
        "sending"
      );

      const url = await uploadVoice(message.localUri);

      await updateMessage(
        chatId,
        message.id,
        {
          voiceUrl: url,
          localUri: "",
          status: "sent",
          uploadCompleted: true,
        }
      );


      await updateLastMessage(chatId, {
        type: "voice",
        sender: message.sender,
        timestamp: message.timestamp,
      });

    } catch {
      await updateMessageStatus(
        chatId,
        message.id,
        "failed"
      );
    }
  };


  const retryImageMessage = async (
    message: ChatMessage
  ) => {

    if (!message.localUri) return;

    try {

      await updateMessageStatus(
        chatId,
        message.id,
        "sending"
      );

      const imageUrl = await uploadImage(
        message.localUri
      );

      await updateMessage(
        chatId,
        message.id,
        {
          image: imageUrl,
          localUri: "",
          uploadCompleted: true,
          status: "sent",
        }
      );


      await updateLastMessage(chatId, {
        type: "image",
        sender: message.sender,
        timestamp: message.timestamp,
      });

    } catch {

      await updateMessageStatus(
        chatId,
        message.id,
        "failed"
      );

    }

  };



  


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 18}
      >
        <ChatHeader
          name={otherProfile.name}
          username={otherProfile.username}
          uid={otherProfile.uid}
          createdAt={otherProfile.createdAt}
          photo={otherProfile.photo}
          online={presence.online}
          lastSeen={presence.lastSeen}
          currentUserId={currentUserId}
          messages={allMessages}
          chatId={chatId}
          about={otherProfile.about}
          iBlocked={privacy.iBlocked}
          blockedMe={privacy.blockedMe}
        />

        {
          disappearingSetting.enabled && (
            <View
              style={{
                backgroundColor: "#EEF4FF",
                paddingVertical: 8,
                paddingHorizontal: 18,
                borderBottomWidth: 1,
                borderBottomColor: "#D6E4FF",
              }}
            >
              <Text
                style={{
                  color: "#2563EB",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                🔒 Messages disappear after{" "}
                {
                  disappearingSetting.duration === 86400000
                    ? "24 Hours"
                    : disappearingSetting.duration === 604800000
                      ? "7 Days"
                      : disappearingSetting.duration === 2592000000
                        ? "30 Days"
                        : "90 Days"
                }.
              </Text>
            </View>
          )
        }



        <FlatList


          ref={listRef}
          data={allMessages}

          keyExtractor={(item) =>
            item.clientId ?? item.id
          }

          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            paddingHorizontal: 4
          }}

          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

            const isNearBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 120;

            shouldAutoScroll.current = isNearBottom;
          }}
          scrollEventThrottle={16}

         onContentSizeChange={() => {
  if (!shouldAutoScroll.current) return;

  scrollToBottom(false);
}}



          renderItem={({ item, index }) => {


            if (item.deletedFor?.[currentUserId]) {
              return null;
            }

            const currentDate = formatChatDate(item.timestamp);

            const previousMessage =
              index > 0 ? allMessages[index - 1] : null;

            const previousDate = previousMessage
              ? formatChatDate(previousMessage.timestamp)
              : null;

            const showDate =
              index === 0 || currentDate !== previousDate;

            return (
              <>
                {showDate && (
                  <DateSeparator
                    label={currentDate}
                  />
                )}

                <TouchableOpacity
                  key={`${item.id}-${item.deletedForEveryone}-${item.type}`}
                  activeOpacity={0.8}
                  style={[
                    styles.messageRow,
                    selectedMessage?.id === item.id && styles.selectedMessageRow,
                  ]}
                  onLongPress={() => {
                    setSelectedMessage(item);
                    setShowOptions(true);
                  }}
                >
                  <MessageBubble
                    message={item}
                    currentUserId={currentUserId}
                    onRetry={retryVoiceMessage}
                    onRetryImage={retryImageMessage}
                    onScrollToMessage={scrollToMessage}
                    selected={selectedMessage?.id === item.id}
                    highlighted={
                      highlightedMessageId === item.id ||
                      highlightedMessageId === item.clientId
                    }
                    onReply={(message) => {
                      setReplyTo(message);
                    }}
                    onReaction={(message, emoji) => {
                      const currentReaction =
                        message.reactions?.[currentUserId];

                      if (currentReaction === emoji) {
                        removeReaction(
                          chatId,
                          message.id,
                          currentUserId
                        );
                      } else {
                        addReaction(
                          chatId,
                          message.id,
                          currentUserId,
                          emoji
                        );
                      }
                    }}

                  />
                </TouchableOpacity>
              </>
            );
          }}

        />

        <View
          style={{
            paddingHorizontal: 18,
            paddingBottom: 8
          }}
        >

          <TypingIndicator
            visible={
              typingState.typing ||
              typingState.recording
            }
            recording={
              typingState.recording
            }
          />

        </View>


        {privacy.iBlocked ? (

          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              backgroundColor: "#F8FAFC",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#64748B",
                fontSize: 14,
              }}
            >
              You blocked this contact.
            </Text>

            <TouchableOpacity
              onPress={async () => {
                await unblockUser(
                  currentUserId,
                  otherUserId
                );
              }}
            >
              <Text
                style={{
                  marginTop: 8,
                  color: "#2563EB",
                  fontWeight: "700",
                }}
              >
                UNBLOCK
              </Text>
            </TouchableOpacity>
          </View>

        ) : privacy.blockedMe ? (

          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              backgroundColor: "#F8FAFC",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#64748B",
                fontSize: 14,
              }}
            >
              You can't send messages to this contact.
            </Text>
          </View>

        ) : (

          <ChatInput
            currentUserId={currentUserId}
            replyTo={replyTo}
            replyUserName={
              replyTo
                ? replyTo.sender === currentUserId
                  ? "You"
                  : otherProfile.name
                : ""
            }
            onCancelReply={() => setReplyTo(null)}
            onTyping={(typing) => {
              setTyping(currentUserId, typing);
            }}
            onPickImage={pickImage}
            onSend={async (msg) => {


              const clientId = uuid.v4().toString();
              const timestamp = Date.now();

              const localMessage: ChatMessage = {
                id: clientId,
                clientId,
                type: "text",
                text: msg,
                sender: currentUserId,
                receiver: otherUserId,
                timestamp,
                status: "sending",
              };

              setLocalMessages((prev) => [...prev, localMessage]);

              try {
                console.log("Sending...", msg);

                const messageData: any = {
                  clientId,
                  type: "text",
                  text: msg,
                  sender: currentUserId,
                  receiver: otherUserId,
                  timestamp,
                  status: "sent",
                  
                };

                if (replyTo) {
                  messageData.replyTo = {
                    id: replyTo.id,
                    sender: replyTo.sender,


                    senderName:
                      replyTo.sender === currentUserId
                        ? myProfile.name
                        : otherProfile.name,


                    type: replyTo.type,

                    text: replyTo.text || "",

                    image: replyTo.image || "",

                    voiceUrl: replyTo.voiceUrl || "",
                  };
                }
                setReplyTo(null);

                await sendMessage(chatId, messageData);

                setLocalMessages((prev) =>
                  prev.filter(m => m.clientId !== clientId)
                );

                console.log("Message sent successfully");




              } catch (e) {
                console.log("SEND ERROR =>", e);
                setLocalMessages((prev) =>
                  prev.map((m) =>
                    m.clientId === clientId
                      ? {
                        ...m,
                        status: "failed",
                      }
                      : m
                  )
                );
              }
            }




            }


            onSendVoice={async (localUri, duration) => {

              const clientId = uuid.v4().toString();

              const messageData: any = {
                clientId,
                type: "voice",
                voiceUrl: "",
                localUri,
                duration,
                sender: currentUserId,
                receiver: otherUserId,
                timestamp: Date.now(),
                status: "sending",

                uploadCompleted: false,
              };

              if (replyTo) {
                messageData.replyTo = {
                  id: replyTo.id,
                  sender: replyTo.sender,

                  senderName:
                    replyTo.sender === currentUserId
                      ? myProfile.name
                      : otherProfile.name,


                  type: replyTo.type,

                  text: replyTo.text || "",

                  image: replyTo.image || "",

                  voiceUrl: replyTo.voiceUrl || "",
                };
              }

              let firebaseId = "";

              try {
                setReplyTo(null);
                firebaseId = await sendMessage(
                  chatId,
                  messageData
                );

                const cloudUrl = await uploadVoice(localUri);

                await updateMessage(
                  chatId,
                  firebaseId,
                  {
                    voiceUrl: cloudUrl,
                    localUri: "",
                    status: "sent",
                    uploadCompleted: true,
                  }
                );

                //new code

                await updateLastMessage(chatId, {
                  type: "voice",
                  sender: currentUserId,
                  timestamp: messageData.timestamp,
                });



              } catch (e) {

                console.log("VOICE SEND ERROR =>", e);

                if (firebaseId) {
                  await updateMessageStatus(
                    chatId,
                    firebaseId,
                    "failed"
                  );
                }

              }

            }}
          />
        )}

        <MessageOptionsModal
          visible={showOptions}
          onClose={closeMessageOptions}

         onReply={() => {
  if (selectedMessage) {
    setReplyTo(selectedMessage);
  }

  setShowOptions(false);
  setSelectedMessage(null);
}}

          isDeletedMessage={
            selectedMessage?.deletedForEveryone === true
          }

          onCopy={async () => {
            if (selectedMessage) {
              await Clipboard.setStringAsync(
                selectedMessage.text || ""
              );
            }
          }}

          onDeleteMe={async () => {
            if (selectedMessage) {
              await deleteForMe(
                chatId,
                selectedMessage.id,
                currentUserId
              );
            }
          }}

          onDeleteEveryone={async () => {
            if (selectedMessage) {
              await deleteForEveryone(
                chatId,
                selectedMessage.id,
              );

              setLocalMessages(prev =>
                prev.filter(
                  m =>
                    m.id !== selectedMessage.id &&
                    m.clientId !== selectedMessage.clientId
                )
              );

              setShowOptions(false);
              setSelectedMessage(null);
            }
          }}

          canDeleteEveryone={
            selectedMessage?.sender === currentUserId &&
            !selectedMessage?.deletedForEveryone
          }


          onReaction={async (emoji) => {
            if (!selectedMessage) return;

            const currentReaction =
              selectedMessage.reactions?.[currentUserId];

            if (currentReaction === emoji) {

              await removeReaction(
                chatId,
                selectedMessage.id,
                currentUserId
              );

            } else {

              await addReaction(
                chatId,
                selectedMessage.id,
                currentUserId,
                emoji
              );

            }
          }}
        />


      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  list: {
    flex: 1,
    paddingHorizontal: 10
  },

  messageRow: {
    width: "100%",
  },

  selectedMessageRow: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    borderRadius: 8,
  },
});