import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser } from "../services/authService";
import AppHeader from "../components/AppHeader";
import {
  subscribeBlockedUsers,
  getUserProfile,
  unblockUser,
  UserProfile,
} from "../services/userService";


export default function BlockedContactsScreen() {

  const [blockedUsers, setBlockedUsers] =
    useState<UserProfile[]>([]);



  useEffect(() => {
    const me = getCurrentUser()?.uid;

    if (!me) return;

    return subscribeBlockedUsers(
      me,
      async (uids) => {
        const users: UserProfile[] = [];

        for (const uid of uids) {
          const profile =
            await getUserProfile(uid);

          users.push(profile);
        }

        setBlockedUsers(users);
      }
    );
  }, []);

  const handleUnblock = (
    uid: string,
    name: string
  ) => {
    const me = getCurrentUser()?.uid;

    if (!me) return;

    Alert.alert(
      "Unblock Contact",
      `Unblock ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unblock",
          onPress: () =>
            unblockUser(me, uid),
        },
      ]
    );
  };
  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.container}>

        <AppHeader title="Block Contacts" />

        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.uid!}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No blocked contacts
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>

              <View>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.username}>
                  @{item.username}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  handleUnblock(
                    item.uid!,
                    item.name
                  )
                }
              >
                <Text style={styles.buttonText}>
                  Unblock
                </Text>
              </TouchableOpacity>

            </View>
          )}
        />

      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  username: {
    marginTop: 3,
    color: "#777",
  },

  button: {
    backgroundColor: "#EF4444",

    paddingHorizontal: 18,
    paddingVertical: 8,

    borderRadius: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  empty: {
    marginTop: 70,
    textAlign: "center",
    fontSize: 15,
    color: "#999",
  }

});