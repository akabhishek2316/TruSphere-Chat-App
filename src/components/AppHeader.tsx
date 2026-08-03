import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../theme/colors";

type Props = {
  title: string;
  showBack?: boolean;
};

export default function AppHeader({
  title,
  showBack = true,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.empty} />
      )}

      <Text style={styles.title}>
        {title}
      </Text>

      <View style={styles.empty} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#fff",

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#ECECEC",

    paddingHorizontal: 12,
  },

  backButton: {
    width: 40,

    height: 40,

    justifyContent: "center",

    alignItems: "center",
  },

  title: {
    flex: 1,

    fontSize: 22,

    fontWeight: "700",

    color: Colors.text,

    marginLeft: 8,
  },

  empty: {
    width: 40,
  },
});