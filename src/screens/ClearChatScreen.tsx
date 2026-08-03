import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";
import AppHeader from "../components/AppHeader";
import { Colors } from "../theme/colors";

export default function ClearChatScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  return (
    <View style={styles.container}>
      <AppHeader title="Clear Chat" />

      <Text style={styles.info}>
        Delete messages from this chat.
      </Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          Alert.alert("Coming Soon");
        }}
      >
        <Text style={styles.itemText}>
          Delete for Me
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.item,
          { borderColor: "#EF4444" },
        ]}
        onPress={() => {
          Alert.alert("Coming Soon");
        }}
      >
        <Text
          style={[
            styles.itemText,
            { color: "#EF4444" },
          ]}
        >
          Delete for Both
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  info: {
    margin: 20,
    color: "#666",
    fontSize: 15,
  },

  item: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemText: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
});