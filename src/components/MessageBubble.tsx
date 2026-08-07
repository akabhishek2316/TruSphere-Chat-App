import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { Linking } from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
  withSequence,
} from "react-native-reanimated";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import {
  ChatMessage,
  UserId,
} from "../types/chat";



import VoicePlayer from "./VoicePlayer";
import { Colors } from "../theme/colors";
import { Radius } from "../theme/radius";
type Props = {
  message: ChatMessage;
  currentUserId: UserId;
  onRetry?: (message: ChatMessage) => void;
  onImageLoaded?: () => void;
  onRetryImage?: (message: ChatMessage) => void;
  onReply?: (message: ChatMessage) => void;
  onScrollToMessage?: (messageId: string) => void;
  highlighted?: boolean;
  selected?: boolean;
};

export default function MessageBubble({
  message,
  currentUserId,
  onRetry,
  onImageLoaded,
  onRetryImage,
  onReply,
  onScrollToMessage,
  highlighted,
  selected = false,
}: Props) {

 

  const navigation = useNavigation<any>();
  const isMe = message.sender === currentUserId;
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  //reply

  const translateX = useSharedValue(0);


  const [isMultiLine, setIsMultiLine] =
    React.useState(false);


  const shouldInlineFooter =
    message.type === "text" &&
    (message.text?.length ?? 0) <= 22;


  const swipeGesture = Gesture.Pan()
    .activeOffsetX(20)
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      const x = Math.max(0, Math.min(e.translationX, 70));

      translateX.value =
        x > 55
          ? 55 + (x - 55) * 0.25
          : x;
    })
    .onEnd(() => {
      if (translateX.value >= 55) {
        if (onReply) {
          runOnJS(onReply)(message);
        }
      }

      translateX.value = withSpring(0, {
        damping: 18,
        stiffness: 220,
        mass: 0.5,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  const flash = useSharedValue(0);



  const renderMessage = (text?: string) => {
    if (!text) return null;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (urlRegex.test(part)) {
        const url = part.startsWith("http")
          ? part
          : `https://${part}`;

        return (
          <Text
            key={index}
            style={{
              color: "#2563EB",
              textDecorationLine: "underline",
            }}
            onPress={() => Linking.openURL(url)}
          >
            {part}
          </Text>
        );
      }

      return (
        <Text key={index}>
          {part}
        </Text>
      );
    });
  };
  React.useEffect(() => {
    if (highlighted) {
      flash.value = withSequence(
        withTiming(1, { duration: 250 }),
        withTiming(0, { duration: 250 }),
        withTiming(1, { duration: 250 }),
        withTiming(0, { duration: 250 })
      );
    }
  }, [highlighted]);

  const highlightStyle = useAnimatedStyle(() => ({
    backgroundColor:
      flash.value > 0
        ? "rgba(37,99,235,0.18)"
        : isMe
          ? "#DCF8C6"
          : "#FFFFFF",
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: translateX.value / 60,
    transform: [
      {
        scale: 0.8 + translateX.value / 180,
      },
    ],
  }));


  
  if (
    !isMe &&
    (message.type === "voice" || message.type === "image") &&
    !message.uploadCompleted
  ) {
    return null;
  }

  const time = new Date(
    message.timestamp
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });



  const renderTick = () => {

    if (!isMe) return null;

    switch (message.status) {
      case "sending":
        return (
          <Ionicons
            name="time-outline"
            size={15}
            color="#6B7280"
            style={{ marginBottom: -2 }}
          />
        );

      case "failed":
        return (
          <TouchableOpacity
            onPress={() => {
              if (message.type === "image") {
                onRetryImage?.(message);
              } else if (message.type === "voice") {
                onRetry?.(message);
              }
            }}
          >
            <Ionicons
              name="refresh-circle"
              size={18}
              color="#EF4444"
              style={{ marginBottom: -2 }}
            />
          </TouchableOpacity>
        );

      case "sent":
        return (
          <Ionicons
            name="checkmark"
            size={15}
            color="#6B7280"
            style={{ marginBottom: -2 }}
          />
        );

      case "delivered":
        return (
          <Ionicons
            name="checkmark-done"
            size={15}
            color="#6B7280"
            style={{ marginBottom: -2 }}
          />
        );

      case "read":
        return (
          <Ionicons
            name="checkmark-done"
            size={15}
            color={Colors.read}
            style={{ marginBottom: -2 }}
          />
        );

      default:
        return null;
    }
  };


  const deletedText = isMe
    ? "You deleted this message"
    : "This message was deleted";

  // Delete for everyone
  if (message.deletedForEveryone) {
    
    return (
      <View
        style={[
          styles.container,
          isMe ? styles.right : styles.left,
        ]}
      >
        <Animated.View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,

            selected && {
              backgroundColor: isMe
                ? "#BFE7AE"
                : "#E5E7EB",
            },

            animatedStyle,
            highlightStyle,
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="remove-circle-outline"
              size={15}
              color="#7C8798"
              style={{ marginRight: 5 }}
            />

            <Text style={styles.deletedMessage}>
              {deletedText}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.time}>{time}</Text>
            {!message.deletedForEveryone && renderTick()}
          </View>
        </Animated.View>
      </View>
    );
  }

  return (

    <View
      style={[
        styles.container,
        isMe ? styles.right : styles.left,
      ]}
    >

      <Animated.View
        style={[
          {
            position: "absolute",
            left: 22,
            top: "50%",
            marginTop: -10,
          },
          iconStyle,
        ]}
      >
        <Ionicons
          name="arrow-undo"
          size={22}
          color="#2563EB"
          style={{ marginBottom: -2 }}
        />
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>

        <Animated.View
          style={[
            styles.bubble,
            isMe
              ? styles.myBubble
              : styles.otherBubble,
            animatedStyle,
            highlightStyle,
          ]}
        >
          {message.replyTo && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.replyBox}
              onPress={() =>
                onScrollToMessage?.(message.replyTo!.id)
              }
            >
              <Text style={styles.replySender}>
                {message.replyTo.sender === currentUserId
                  ? "You"
                  : message.replyTo.senderName}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.replyMessage}
              >
                {message.replyTo.type === "text"
                  ? message.replyTo.text
                  : message.replyTo.type === "image"
                    ? "📷 Photo"
                    : "🎤 Voice Message"}
              </Text>
            </TouchableOpacity>
          )}



          {message.type === "text" && (
            shouldInlineFooter ? (
              <View style={styles.inlineRow}>
                <Text
                  selectable
                  style={[
                    styles.message,
                    {
                      maxWidth: "82%",
                      marginRight: 8,
                    },
                  ]}
                >
                  {renderMessage(message.text)}
                </Text>

                <View style={styles.inlineFooter}>
                  <Text style={styles.time}>
                    {time}
                  </Text>

                  {renderTick()}
                </View>
              </View>
            ) : (
              <Text
                selectable
                style={styles.message}
              >
                {renderMessage(message.text)}
              </Text>
            )
          )}

          {message.type === "image" && (

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                navigation.navigate(
                  "ImageViewer",
                  {
                    image:
                      message.image ??
                      message.localUri,
                  }
                );
              }}
            >

              <Image
                source={{
                  uri: message.image || message.localUri,
                }}
                style={styles.image}
                onLoadEnd={onImageLoaded}
              />

              {!!message.caption && (
                <Text style={styles.message}>
                  {message.caption}
                </Text>
              )}

              {message.status === "failed" && isMe && (

                <TouchableOpacity

                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="alert-circle"
                    size={24}
                    color="#EF4444"
                    style={{ marginBottom: -2 }}
                  />

                  <Text
                    style={{
                      marginLeft: 6,
                      color: "#EF4444",
                      fontWeight: "600",
                    }}
                  >
                    Failed
                  </Text>

                </TouchableOpacity>

              )}

            </TouchableOpacity>

          )}

          {message.type === "voice" && (
  <View style={styles.voiceWrapper}>
    <VoicePlayer
      voiceUrl={message.voiceUrl!}
      duration={message.duration!}
      status={message.status}
    />
  </View>
)}

<View style={styles.footer}>
  <Text style={styles.time}>{time}</Text>
  {renderTick()}
</View>

         {!shouldInlineFooter && message.type !== "voice" && (
            <View style={styles.footer}>
              <Text style={styles.time}>
                {time}
              </Text>

              {renderTick()}
            </View>
          )}

          {message.reactions &&
            Object.keys(message.reactions).length > 0 && (
              <View
                style={[
                  styles.reactionContainer,
                  isMe
                    ? styles.myReaction
                    : styles.otherReaction,
                ]}
              >
                {Object.entries(message.reactions).map(
                  ([user, emoji]) => (
                    <Text
                      key={user}
                      style={styles.reaction}
                    >
                      {emoji}
                    </Text>
                  )
                )}
              </View>
            )}
        </Animated.View>

      </GestureDetector>

    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 8,
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "flex-end",

  },

  deletedMessage: {
    fontSize: 14,
    color: "#7C8798",
    fontStyle: "italic",
  },

  inlineFooter: {


    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginLeft: "auto",
    marginBottom: -2,
  },

  messageContainer: {
    flexDirection: "column",
  },

  inlineContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },


  left: {
    alignItems: "flex-start",
  },

  right: {
    alignItems: "flex-end",
  },

  bubble: {
    maxWidth: "78%",

    minWidth: 70,

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 18,

    elevation: 1,

    shadowOpacity: 0.05,
    shadowRadius: 3,



    shadowColor: "#000",





    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  voiceWrapper: {
    width: 200,
  },

  myBubble: {
    backgroundColor: "#DCF8C6",

    borderBottomRightRadius: 5,
  },

  otherBubble: {
    backgroundColor: "#FFFFFF",

    borderBottomLeftRadius: 5,

    borderWidth: 1,

    borderColor: "#ECECEC",
  },

  message: {
   
    fontSize: 15,
    color: "#111827",
    lineHeight: 20,

    flexShrink: 1,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 3,
  },

  time: {
    fontSize: 10.5,
    color: "#7C8798",
    marginRight: 3,
    marginLeft: 4,
   
  },

  replyBox: {


    backgroundColor: "#F8FAFC",

    borderLeftWidth: 3,

    borderLeftColor: Colors.primary,

    borderRadius: 8,

    paddingHorizontal: 8,
    paddingVertical: 5,

    marginBottom: 5,
  },

  replySender: {
    fontSize: 11,
    fontWeight: "700",


    color: Colors.primary,
  },

  replyMessage: {
    marginTop: 2,
    fontSize: 12,

    color: "#64748B",


  },

  reactionContainer: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",

    alignSelf: "flex-end",



    borderRadius: 16,


    elevation: 1,
  },

  reaction: {
    fontSize: 14,
    marginHorizontal: 2,
  },

  myReaction: {
    backgroundColor: "#F8FFF1",
  },

  otherReaction: {
    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#EEEEEE",
  },

  voiceBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  voiceText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
  },

  image: {
    width: 190,
    height: 240,
    borderRadius: 14,
    marginBottom: 4,

  },

  voiceFooter: {
  marginTop: 4,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

voiceDuration: {
  fontSize: 11,
  color: "#6B7280",
},
});

