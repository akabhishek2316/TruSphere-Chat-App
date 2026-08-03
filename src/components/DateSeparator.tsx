import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  label: string;
};

export default function DateSeparator({
  label,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <Text style={styles.text}>
        {label}
      </Text>

      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 12,

    paddingHorizontal: 20,
  },

  line: {
    flex: 1,

    height: 1,

    backgroundColor: "#D1D5DB",
  },

  text: {
    marginHorizontal: 10,

    fontSize: 12,

    color: "#6B7280",

    fontWeight: "600",
  },
});