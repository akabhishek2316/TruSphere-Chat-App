import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ChatMessage } from "../types/chat";


type Props = {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
};

function formatTime(timestamp?: number) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor(
    (startOfToday.getTime() -
      startOfDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(timestamp?: number) {
  if (!timestamp) return "";

  return `${formatDate(timestamp)} • ${formatTime(timestamp)}`;
}

export default function MessageInfoModal({
  visible,
  message,
  onClose,
}: Props) {
  if (!message) return null;

  const isRead = message.status === "read";

  const isDelivered =
    message.status === "delivered" ||
    message.status === "read";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>

        {/* BACKDROP */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        {/* BOTTOM SHEET */}
        <View style={styles.sheet}>

          {/* HANDLE */}
          <View style={styles.handle} />

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Message Info
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={23}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* MESSAGE PREVIEW */}
          <View style={styles.preview}>

            {message.type === "image" &&
              message.image ? (
              <Image
                source={{
                  uri: message.image,
                }}
                style={styles.image}
              />
            ) : null}

            {message.type === "voice" && (
              <View style={styles.voicePreview}>
                <View style={styles.voiceIcon}>
                  <Ionicons
                    name="mic"
                    size={20}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.previewText}>
                  Voice message
                </Text>
              </View>
            )}

            {message.type === "text" &&
              message.text ? (
              <Text
                style={styles.previewText}
                numberOfLines={4}
              >
                {message.text}
              </Text>
            ) : null}

            {message.type === "image" &&
              message.caption ? (
              <Text
                style={styles.caption}
                numberOfLines={3}
              >
                {message.caption}
              </Text>
            ) : null}

          </View>

          {/* STATUS */}
          <View style={styles.statusContainer}>

            {/* SENT */}
            <View style={styles.statusRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="checkmark"
                  size={21}
                  color="#64748B"
                />
              </View>

              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  Sent
                </Text>

                <Text style={styles.time}>
                  {formatDateTime(
                    message.timestamp
                  )}
                </Text>
              </View>
            </View>

            {/* DELIVERED */}
            {isDelivered &&
              message.deliveredAt && (
                <View style={styles.statusRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="checkmark-done"
                      size={21}
                      color="#64748B"
                    />
                  </View>

                  <View
                    style={
                      styles.statusTextContainer
                    }
                  >
                    <Text style={styles.statusTitle}>
                      Delivered
                    </Text>

                    <Text style={styles.time}>
                      {formatDateTime(
                        message.deliveredAt
                      )}
                    </Text>
                  </View>
                </View>
              )}

            {/* READ */}
            {isRead && (
              <View style={styles.statusRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="checkmark-done"
                    size={21}
                    color="#2563EB"
                  />
                </View>

                <View
                  style={
                    styles.statusTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.statusTitle,
                      styles.readTitle,
                    ]}
                  >
                    Read
                  </Text>

                  <Text style={styles.time}>
                    {message.readAt
                      ? formatDateTime(
                          message.readAt
                        )
                      : ""}
                  </Text>
                </View>
              </View>
            )}

          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    paddingTop: 10,
    paddingBottom: 32,

    maxHeight: "75%",

    elevation: 12,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    alignSelf: "center",

    marginBottom: 8,
  },

  header: {
    height: 58,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  closeButton: {
    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: "#F1F5F9",

    justifyContent: "center",
    alignItems: "center",
  },

  preview: {
    marginHorizontal: 16,
    marginTop: 14,

    padding: 10,

    backgroundColor: "#F8FAFC",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    alignItems: "center",
  },

  image: {
    width: 100,
    height: 100,

    borderRadius: 14,
  },

  caption: {
    marginTop: 9,

    fontSize: 14,
    color: "#475569",

    textAlign: "center",
  },

  previewText: {
    fontSize: 15,
    color: "#1E293B",
    lineHeight: 21,

    textAlign: "center",
  },

  voicePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    minHeight: 42,
  },

  voiceIcon: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: "#EFF6FF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 9,
  },

  statusContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  iconContainer: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  statusTextContainer: {
    marginLeft: 10,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "700",

    color: "#1E293B",
  },

  readTitle: {
    color: "#2563EB",
  },

  time: {
    marginTop: 3,

    fontSize: 13,

    color: "#64748B",
  },
});