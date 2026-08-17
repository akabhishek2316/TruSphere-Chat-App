import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  isDeletedMessage: boolean;
  onReply: () => void;
  onCopy: () => void;
  isOwnMessage: boolean;
  onInfo: () => void;
  onDeleteMe: () => void;
  onDeleteEveryone: () => void;
  canDeleteEveryone: boolean;
  onReaction: (emoji: string) => void;
};

export default function MessageOptionsModal({
  visible,
  onClose,
  isDeletedMessage,
  onReply,
  onCopy,
  isOwnMessage,
  onInfo,
  onDeleteMe,
  onDeleteEveryone,
  canDeleteEveryone,
  onReaction,

}: Props) {
  const Item = (
    icon: any,
    title: string,
    color: string,
    action: () => void
  ) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onClose();
        action();
      }}
    >
      <Ionicons
        name={icon}
        size={22}
        color={color}
      />

      <Text
        style={[
          styles.text,
          { color },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const emojis = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      />




      <View style={styles.sheet}>



        {!isDeletedMessage && (
          <View style={styles.emojiRow}>
            {emojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => {
                  onClose();
                  onReaction(emoji);
                }}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isDeletedMessage && (
          <>
            {Item(
              "return-up-back-outline",
              "Reply",
              Colors.text,
              onReply
            )}

            {Item(
              "copy-outline",
              "Copy",
              Colors.text,
              onCopy
            )}

        {isOwnMessage &&
  Item(
    "information-circle-outline",
    "Info",
    Colors.text,
    onInfo
  )}
          </>
        )}

        {Item(
          "trash-outline",
          "Delete for Me",
          "#F59E0B",
          onDeleteMe
        )}

        {!isDeletedMessage && canDeleteEveryone && (
          Item(
            "trash",
            "Delete for Everyone",
            "#EF4444",
            onDeleteEveryone
          )
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    backgroundColor: "#fff",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingVertical: 10,
    paddingBottom: 30,
  },

  item: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 20,

    paddingVertical: 13,
  },

  text: {
    fontSize: 17,

    marginLeft: 18,

    fontWeight: "600",
  },

  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  emojiButton: {
    padding: 6,
  },

  emoji: {
    fontSize: 28,
  },
});