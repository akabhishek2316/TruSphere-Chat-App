import React, { useState, useEffect } from "react";
import { Menu, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { formatLastSeen } from "../types/utils/dateTime";
import { Alert } from "react-native";
import ClearChatModal from "./ClearChatModal";
import DisappearingMessageModal from "./DisappearingMessageModal";
import { blockUser } from "../services/userService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {

  unblockUser,
  isBlocked,
} from "../services/userService";
import {
  deleteChat,

} from "../services/chatService";
import {
  getDisappearingMessages,
  setDisappearingMessages,
} from "../services/chatService";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import {
  clearChatForMe,
  clearChatForEveryone,


} from "../services/chatService";

import { Switch } from "react-native";


import ViewContactModal from "./ViewContactModal";

import {
  ChatMessage,
  UserId,
} from "../types/chat";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";


type Props = {
  name: string;
  username?: string;
  uid?: string;
  online: boolean;
  createdAt?: number;
  lastSeen?: number;
  photo?: string;
  about?: string;
  chatId: string;
  currentUserId: UserId;
  messages: ChatMessage[];
  iBlocked: boolean;
  blockedMe: boolean;
};

export default function ChatHeader({
  name,
  username,
  uid,
  online,
  lastSeen,
  createdAt,
  photo,
  about,
  currentUserId,
  messages,
  chatId,
  iBlocked,
  blockedMe,
}: Props) {

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const hideUserInfo =
    iBlocked || blockedMe;

  const [showContact, setShowContact] =
    useState(false);

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [showClearChat, setShowClearChat] =
    useState(false);

  const [mute, setMute] = useState(false);

  const [disappearing, setDisappearing] =
    useState(false);

  const [showDisappearing, setShowDisappearing] =
    useState(false);

  const [disappearingEnabled, setDisappearingEnabled] =
    useState(false);

  const [selectedDuration, setSelectedDuration] =
    useState<number | null>(null);




  useEffect(() => {
    loadDisappearing();

  }, []);

  async function loadDisappearing() {
    const setting =
      await getDisappearingMessages(chatId);

    setDisappearingEnabled(setting.enabled);

    setSelectedDuration(setting.duration);
  }


  useEffect(() => {
    loadDisappearing();
  }, []);

  return (
    
    <>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (hideUserInfo) return;
            if (!photo) return;
            navigation.navigate(
              "ProfilePhoto",
              {
                photo,
              }
            );
          }}
        >

          {hideUserInfo ? (

            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={26}
                color="#FFF"
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

        </TouchableOpacity>

        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={styles.name}
          >
            {name}
          </Text>

          <View style={styles.statusRow}>
            {!hideUserInfo && (
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: online
                      ? Colors.online
                      : "#9CA3AF",
                  },
                ]}
              />
            )}

            <Text
              numberOfLines={1}
              style={styles.status}
            >
              {hideUserInfo
                ? ""
                : online
                  ? "Online"
                  : lastSeen
                    ? formatLastSeen(lastSeen)
                    : "Offline"}
            </Text>
          </View>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.iconButton}
              onPress={() =>
                setMenuVisible(true)
              }
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={Colors.text}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            title="View Contact"
            leadingIcon="account-circle-outline"
            onPress={() => {
              setMenuVisible(false);
              setShowContact(true);
            }}
          />

          <Divider />

          <Menu.Item
            title="Clear Chat"
            leadingIcon="delete-sweep"
            onPress={() => {
              setMenuVisible(false);
              setShowClearChat(true);
            }}
          />

          <Divider />

          <Menu.Item
            title="Delete Chat"
            leadingIcon="delete-outline"
            onPress={() => {
              setMenuVisible(false);

              Alert.alert(
                "Delete Chat",
                "This chat will be removed only from your device.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {

                      // 1. Messages delete only for me
                      await clearChatForMe(
                        chatId,
                        currentUserId,
                        messages
                      );

                      // 2. Chat hide
                      await deleteChat(
                        currentUserId,
                        chatId
                      );

                    },
                  },
                ]
              );
            }}
          />

          <Divider />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="notifications-off-outline"
                size={22}
                color="#555"
              />

              <Text
                style={{
                  marginLeft: 16,
                  fontSize: 15,
                }}
              >
                Mute Notifications
              </Text>
            </View>

            <Switch
              value={mute}
              onValueChange={setMute}
            />
          </View>

          <Divider />

          <Menu.Item
            title="Disappearing Messages"
            leadingIcon="timer-outline"
            onPress={() => {
              setMenuVisible(false);

              setShowDisappearing(true);
            }}
          />
          <Divider />

          <Menu.Item
            title={iBlocked ? "Unblock" : "Block"}
            titleStyle={{
              color: iBlocked ? "#16A34A" : "#DC2626",
              fontWeight: "600",
            }}
            leadingIcon={() => (
              <MaterialCommunityIcons
                name={
                  iBlocked
                    ? "lock-open-outline"
                    : "block-helper"
                }
                size={22}
                color={iBlocked ? "#16A34A" : "#DC2626"}
              />
            )}
            onPress={() => {
              setMenuVisible(false);

              Alert.alert(
                iBlocked ? "Unblock User" : "Block User",
                iBlocked
                  ? `Unblock ${name}?`
                  : `Block ${name}?`,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: iBlocked ? "Unblock" : "Block",
                    style: iBlocked ? "default" : "destructive",

                    onPress: async () => {

                      if (iBlocked) {

                        await unblockUser(
                          currentUserId,
                          uid!
                        );

                      } else {

                        await blockUser(
                          currentUserId,
                          uid!
                        );

                      }

                    },
                  },
                ]
              );
            }}
          />
        </Menu>


        <ViewContactModal
          visible={showContact}
          onClose={() => setShowContact(false)}
          name={name}
          username={hideUserInfo ? undefined : username}
          uid={hideUserInfo ? undefined : uid}
          createdAt={hideUserInfo ? undefined : createdAt}
          photo={hideUserInfo ? undefined : photo}
          about={hideUserInfo ? undefined : about}
          online={hideUserInfo ? false : online}
          lastSeen={
            hideUserInfo
              ? ""
              : online
                ? "Online"
                : lastSeen
                  ? formatLastSeen(lastSeen)
                  : "Offline"
          }
        />
      </View>

     

      <ClearChatModal
        visible={showClearChat}
        onClose={() => setShowClearChat(false)}

        onDeleteMe={async () => {
          setShowClearChat(false);

          await clearChatForMe(
            chatId,
            currentUserId,
            messages
          )
        }}

        onDeleteBoth={async () => {
          setShowClearChat(false);

          await clearChatForEveryone(
            chatId,
            currentUserId,
            messages
          );
        }}
      />

      <DisappearingMessageModal
        visible={showDisappearing}
        selectedDuration={selectedDuration}
        onClose={() =>
          setShowDisappearing(false)
        }
        onSelect={async (
          enabled,
          duration
        ) => {

          await setDisappearingMessages(
            chatId,
            enabled,
            duration,
            currentUserId
          );

          setDisappearingEnabled(enabled);

          setSelectedDuration(duration);

        }}
      />
    </>
    
  );

}










const styles = StyleSheet.create({
  

  container: {
    height: 64,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,

    borderBottomWidth: 0.8,
    borderBottomColor: "#EEF2F7",

    elevation: 1,
    shadowOpacity: 0,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,

    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,

    marginHorizontal: 8,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",
  },

  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },

  status: {
    fontSize: 11.5,
    color: "#64748B",
  },
});