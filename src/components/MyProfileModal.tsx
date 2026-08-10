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
  createdAt?: number;
  name: string;
  username: string;
  photo?: string;
  about?: string;
  email?: string;
  online?: boolean;
  uid?: string;
  onEdit: () => void;
};

export default function MyProfileModal({
  visible,
  onClose,
  createdAt,
  name,
  username,
  photo,
  about,
  email,
  online,
  uid,
  onEdit,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          <TouchableOpacity
            style={styles.close}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={24}
              color="#64748B"
            />
          </TouchableOpacity>

          {
            photo ? (
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
            )
          }

          <Text style={styles.name}>
            {name}
          </Text>

          <TouchableOpacity
            style={styles.usernameRow}
            onPress={async () => {

              await Clipboard.setStringAsync(
                username ?? ""
              );



            }}
          >

            <Text style={styles.username}>
              @{username}
            </Text>


          </TouchableOpacity>

          <View style={styles.statusRow}>

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

            <Text style={styles.status}>
              {online ? "Online" : "Offline"}
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.info}>

            <Text style={styles.label}>
              About
            </Text>

            <Text style={styles.value}>
              {about || "No About"}
            </Text>

          </View>

          <View style={styles.info}>

            <Text style={styles.label}>
              Email
            </Text>

            <Text style={styles.value}>
              {email}
            </Text>

          </View>

          <View style={styles.info}>
            <Text style={styles.label}>
              Joined
            </Text>

            <Text style={styles.value}>
              {createdAt
                ? new Date(createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                ) : ""}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>
              User ID
            </Text>

            <View style={styles.usernameRow}>

              <Text style={styles.userId}>
                {uid}
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  await Clipboard.setStringAsync(uid ?? "");


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

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onClose();
              onEdit();
            }}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              Edit Profile
            </Text>

          </TouchableOpacity>

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
    padding: 24,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
  },

  close: {
    position: "absolute",
    top: 18,
    right: 18,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "700",
  },

  name: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  username: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
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
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },

  info: {
    width: "100%",
    marginBottom: 18,
  },

  label: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },

  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    width: "100%",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 6,
  },

  userId: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
    // marginRight: 6,
  },

});