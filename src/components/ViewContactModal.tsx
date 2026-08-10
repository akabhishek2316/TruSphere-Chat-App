import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  uid?: string;
  name: string;
  username?: string;
  photo?: string;
  about?: string;
  createdAt?: number;
  online?: boolean;
  lastSeen?: string;
  hideUserInfo?: boolean;
};

export default function ViewContactModal({
  visible,
  onClose,
  name,
  username,
  uid,
  createdAt,
  photo,
  about,
  online,
  lastSeen,
  hideUserInfo = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          <View style={styles.header}>

            <TouchableOpacity
              style={styles.close}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            {hideUserInfo ? (

              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={42}
                  color="#FFFFFF"
                />
              </View>

            ) : photo ? (

              <Image
                source={{ uri: photo }}
                style={styles.avatar}
              />

            ) : (

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>

            )}

          </View>

          <View style={styles.content}>

            <Text style={styles.name}>
              {name}
            </Text>

            {!hideUserInfo && !!username && (
              <Text style={styles.username}>
                @{username}
              </Text>
            )}

            <Text style={styles.about}>
              {!hideUserInfo && !!about && (
                <Text style={styles.about}>
                  {about}
                </Text>
              )}
            </Text>

            <View style={styles.statusRow}>
              {!hideUserInfo && (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: online
                        ? "#22C55E"
                        : "#9CA3AF",
                    },
                  ]}
                />
              )}

              <Text style={styles.status}>
                {hideUserInfo
                  ? ""
                  : online
                    ? "Online"
                    : lastSeen || "Offline"}
              </Text>
            </View>



            <View style={styles.infoContainer}>

              <View style={styles.divider} />

              {!!uid && !hideUserInfo && (

                <View style={styles.infoRow}>



                  <Text style={styles.infoLabel}>
                    UID
                  </Text>

                  <View style={styles.infoRight}>

                    <Text
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      style={styles.infoValue}
                    >
                      {uid}
                    </Text>

                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setStringAsync(uid);


                      }}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color="#2563EB"
                      />
                    </TouchableOpacity>

                  </View>

                </View>

              )}

              <View style={styles.divider} />

              {!!createdAt && !hideUserInfo && (

                <View style={styles.infoRow}>

                  <Text style={styles.infoLabel}>
                    Joined
                  </Text>

                  <Text style={styles.infoValue}>
                    {new Date(createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </Text>

                </View>

              )}

            </View>

            <View style={styles.divider} />

            <View style={styles.actions}>

              <TouchableOpacity style={styles.action}>

                <View style={styles.iconCircle}>
                  <Ionicons
                    name="call-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.actionTitle}>
                  Call
                </Text>

                <Text style={styles.actionSub}>
                  Coming Soon
                </Text>

              </TouchableOpacity>

              <TouchableOpacity style={styles.action}>

                <View style={styles.iconCircle}>
                  <Ionicons
                    name="videocam-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.actionTitle}>
                  Video
                </Text>

                <Text style={styles.actionSub}>
                  Coming Soon
                </Text>

              </TouchableOpacity>

              <TouchableOpacity style={styles.action}>

                <View style={styles.iconCircle}>
                  <Ionicons
                    name="images-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.actionTitle}>
                  Media
                </Text>

                <Text style={styles.actionSub}>
                  Coming Soon
                </Text>

              </TouchableOpacity>

            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  header: {
    height: 170,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  close: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 5,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,

    borderWidth: 4,
    borderColor: "#FFFFFF",

    backgroundColor: "#1D4ED8",

    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
    alignItems: "center",
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  username: {
    marginTop: 4,
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },

  about: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  status: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  infoContainer: {
    width: "100%",
    marginTop: 22,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 14,

  },

  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "68%",
  },

  infoValue: {
    flexShrink: 1,
    marginRight: 8,
    fontSize: 14,
    color: "#111827",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 5,
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  action: {
    flex: 1,
    alignItems: "center",
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,

    backgroundColor: "#EEF4FF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  actionTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  actionSub: {
    marginTop: 4,
    fontSize: 11,
    color: "#94A3B8",
  },

});