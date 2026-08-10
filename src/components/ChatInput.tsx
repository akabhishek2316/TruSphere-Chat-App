
import React, { useState, useEffect, useRef } from "react";



import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  BackHandler,

} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";


import { UserId } from "../types/chat";

import VoiceRecorder from "./VoiceRecorder";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";

import { ChatMessage } from "../types/chat";
import { Audio } from "expo-av";
import { setTyping } from "../services/typingService";

type Props = {
  currentUserId: UserId;

  onSend?: (message: string) => void;
  onSendVoice?: (
   
    localUri: string,
    duration: number
  ) => void;
  onTyping?: (typing: boolean) => void;
  onPickImage?: () => void;
  replyTo?: ChatMessage | null;
  replyUserName?: string;
  onCancelReply?: () => void;

};

export default function ChatInput({
  currentUserId,
  onSend,
  onSendVoice,
  onPickImage,
  onTyping,
  replyTo,
  replyUserName,
  onCancelReply,
}: Props) {
  const [message, setMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const emojiHeight = useSharedValue(0);
  const emojiOpacity = useSharedValue(0);


  const [recording, setRecording] = useState(false);
  const [voiceUri, setVoiceUri] =
    useState<string | null>(null);

  const [voiceDuration, setVoiceDuration] =
    useState(0);
  const [sound, setSound] =
    useState<Audio.Sound | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const emojis = [
    "😀", "😂", "🤣", "😊", "😍", "🥰",
    "😘", "😎", "🤩", "😭", "😢", "😡",
    "🤔", "😮", "😱", "🥳", "🤗", "👍",
    "👎", "👏", "🙏", "❤️", "🧡", "💛",
    "💚", "💙", "💜", "🔥", "✨", "🎉",
    "💯", "😂", "😇", "😉", "😴", "🤝",
  ];


  const toggleEmojiPicker = () => {
    if (showEmojiPicker) {
      

      emojiOpacity.value = withTiming(0, {
        duration: 140,
      });

      emojiHeight.value = withTiming(
        0,
        {
          duration: 220,
        }
      );

      setTimeout(() => {
        setShowEmojiPicker(false);

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }, 200);

    } else {
      

      Keyboard.dismiss();

      setShowEmojiPicker(true);

      requestAnimationFrame(() => {
        emojiHeight.value = withTiming(230, {
          duration: 260,
        });

        emojiOpacity.value = withTiming(1, {
          duration: 180,
        });
      });
    }
  };


  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    height: emojiHeight.value,
    opacity: emojiOpacity.value,
  }));

  const handleEmojiBackspace = () => {
    setMessage((prev) => {
      if (!prev) return prev;

      return Array.from(prev).slice(0, -1).join("");
    });
  };

  const handleEmojiPress = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  useEffect(() => {
    onTyping?.(message.trim().length > 0);
  }, [message, onTyping]);


  useEffect(() => {

    if (recording) return;

    setTyping(
      currentUserId,
      message.trim().length > 0,
      false
    );

  }, [message, recording]);


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showEmojiPicker) {
          
          emojiOpacity.value = withTiming(0, {
            duration: 120,
          });

          emojiHeight.value = withTiming(0, {
            duration: 180,
          });

          setTimeout(() => {
            setShowEmojiPicker(false);
          }, 170);

          return true; 
        }

       
        return false;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, [showEmojiPicker]);


  const handleSend = () => {
    const text = message.trim();

    if (!text) return;

    onSend?.(text);

    setMessage("");


  };

  const wave = useSharedValue(0.4);




  async function playVoice() {
    if (!voiceUri) return;

    try {
      if (playing && sound) {
        await sound.stopAsync();
        await sound.unloadAsync();

        setPlaying(false);
        setSound(null);
        return;
      }

      const result =
        await Audio.Sound.createAsync(
          { uri: voiceUri }
        );

      const newSound = result.sound;

      setSound(newSound);

      setPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (
          status.isLoaded &&
          status.didJustFinish
        ) {
          setPlaying(false);

          newSound.unloadAsync();

          setSound(null);
        }
      });

      await newSound.playAsync();

    } catch (e) {
      console.log("PLAY ERROR =>", e);
    }
  }

  return (
    <View style={styles.wrapper}>



      {
        replyTo && (
          <View style={styles.replyContainer}>


            <View
              style={{
                flex: 1,
                marginRight: 8,
                justifyContent: "center",
              }}
            >
              <Text style={styles.replyTitle}>
                Replying to {replyUserName}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.replyText}
              >
                {replyTo.type === "text"
                  ? replyTo.text
                  : replyTo.type === "image"
                    ? "📷 Photo"
                    : "🎤 Voice Message"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.replyClose}
              onPress={onCancelReply}
            >
              <Ionicons
                name="close"
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        )
      }

      <View style={styles.container}>

        {!voiceUri ? (
          <>
            <TouchableOpacity
              style={[
                styles.iconButton,
                recording && { opacity: 0.4 },
              ]}
              activeOpacity={0.7}
              disabled={recording}
              onPress={toggleEmojiPicker}
            >
              <Ionicons
                name={
                  showEmojiPicker
                    ? "keypad-outline"
                    : "happy-outline"
                }
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                recording && { opacity: 0.4 },
              ]}
              activeOpacity={0.7}
              disabled={recording}
              onPress={onPickImage}
            >
              <Ionicons
                name="images-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {recording ? (
              <View style={styles.recordingContainer}>

                <Ionicons
                  name="mic"
                  size={22}
                  color="#EF4444"
                />

                <Text style={styles.recordingText}>
                  Recording...
                </Text>

              </View>
            ) : (
              <TextInput
                ref={inputRef}
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
                onFocus={() => {
                  if (showEmojiPicker) {
                    emojiOpacity.value = withTiming(0, {
                      duration: 120,
                    });

                    emojiHeight.value = withTiming(
                      0,
                      {
                        duration: 180,
                      }
                    );

                    setTimeout(() => {
                      setShowEmojiPicker(false);
                    }, 170);
                  }
                }}
                editable={!recording}
                autoCorrect={false}
                spellCheck={false}
                selectTextOnFocus={!recording}
                style={styles.input}
                textAlignVertical="center"
                underlineColorAndroid="transparent"
                selectionColor="#2563EB"
                cursorColor="#2563EB"
              />
            )}

            {message.trim() ? (
              <TouchableOpacity
                style={styles.send}
                onPress={handleSend}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            ) : (
              <VoiceRecorder
                onStart={() => {
                  Keyboard.dismiss();

                  setRecording(true);

                  onTyping?.(false);

                  setTyping(currentUserId, false, true);
                }}
                onStop={(uri, duration) => {

                  setRecording(false);

                  setTyping(currentUserId, false, false);

                  setVoiceUri(uri);

                  setVoiceDuration(duration);

                }}
              />
            )}
          </>
        ) : (
          <View style={styles.voicePreviewContainer}>

            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => {
                setVoiceUri(null);
                setVoiceDuration(0);
              }}
            >
              <Ionicons
                name="trash"
                size={26}
                color="#EF4444"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewButton}
              onPress={playVoice}
            >
              <Ionicons
                name={playing ? "pause" : "play"}
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.voiceInfo}>

              <Text
                style={styles.voiceTitle}
              >
                Voice Message
              </Text>

              <Text
                style={styles.voiceDuration}
              >
                {`${String(
                  Math.floor(voiceDuration / 60)
                ).padStart(2, "0")}:${String(
                  voiceDuration % 60
                ).padStart(2, "0")}`}
              </Text>

            </View>

            <TouchableOpacity
              style={styles.previewSend}
              onPress={() => {

                if (!voiceUri) return;

                const uri = voiceUri;
                const duration = voiceDuration;

                setVoiceUri(null);
                setVoiceDuration(0);

                onSendVoice?.(
                  uri,
                  duration
                );

              }}
            >
              <Ionicons
                name="send"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

          </View>
        )}

      </View>

      {showEmojiPicker && (
        <Animated.View
          style={[
            styles.emojiPicker,
            emojiAnimatedStyle,
          ]}
        >
          <View style={styles.emojiContent}>

            <View style={styles.emojiGrid}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={`${emoji}-${index}`}
                  style={styles.emojiItem}
                  activeOpacity={0.6}
                  onPress={() => {
                    setMessage((prev) => prev + emoji);
                  }}
                >
                  <Text style={styles.emojiText}>
                    {emoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.emojiBackspace}
              activeOpacity={0.7}
              onPress={handleEmojiBackspace}
            >
              <Ionicons
                name="backspace-outline"
                size={25}
                color="#475569"
              />
            </TouchableOpacity>

          </View>
        </Animated.View>
      )}


    </View>



  );
}

const styles = StyleSheet.create({

  wrapper: {
    backgroundColor: "#F8FAFC",

    paddingHorizontal: 12,

    paddingTop: 4,

    paddingBottom: Platform.OS === "ios" ? 10 : 2,
  },

  voicePreviewContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  previewButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  voiceInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  voiceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  voiceDuration: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  previewSend: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 30,

    paddingHorizontal: 12,

    minHeight: 56,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  iconButton: {
    width: 40,
    height: 40,

    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 2,
  },

  input: {
    flex: 1,

    fontSize: 16,

    borderWidth: 0,



    color: "#111827",

    paddingHorizontal: 10,

    paddingVertical: 8,

    maxHeight: 120,

    textAlignVertical: "center",

    marginTop: Platform.OS === "android" ? 2 : 0,

  },

  send: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 6,
  },

  replyContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingHorizontal: 12,
    paddingVertical: 10,

    marginBottom: 6,

    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,

    borderWidth: 1,
    borderColor: "#E5E7EB",
  },


  replyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  replyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  replyClose: {
    width: 34,
    height: 34,

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 8,
  },

  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  recordingText: {
    marginLeft: 8,
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },

  waveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 14,
  },

  waveBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: "#EF4444",
  },


  emojiPicker: {
    overflow: "hidden",

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",

    marginTop: 4,

    borderRadius: 12,

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: -2,
    },
  },

  emojiContent: {
    flex: 1,

    position: "relative",

    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },

  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 12,
    paddingRight: 52,
  },

  emojiItem: {
    width: "12.5%",
    height: 42,

    justifyContent: "center",
    alignItems: "center",
  },

  emojiText: {
    fontSize: 25,
  },

  emojiBackspace: {
    position: "absolute",

    right: 10,
    bottom: 10,

    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "#E2E8F0",

    justifyContent: "center",
    alignItems: "center",

    elevation: 2,
  },


});