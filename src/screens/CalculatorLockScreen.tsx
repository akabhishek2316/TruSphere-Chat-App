import React, { useState } from "react";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "../constants/storage";

import {
  subscribeSecret,
} from "../services/userService";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Colors } from "../theme/colors";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Calculator"
>;



export default function CalculatorLockScreen({
  navigation,
}: Props) {
  const [expression, setExpression] =
    useState("");
    const [secret, setSecret] = useState("2580");

  const press = (value: string) => {
    if (expression.length >= 20) return;

    setExpression((p) => p + value);
  };

  const clear = () => {
    setExpression("");
  };


  useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  async function loadSecret() {
    const role = await AsyncStorage.getItem(
      STORAGE_KEYS.USER_ROLE
    );

    if (role === "A" || role === "B") {
      unsubscribe = subscribeSecret(
        role,
        setSecret
      );
    }
  }

  loadSecret();

  return () => {
    unsubscribe?.();
  };
}, []);

  const equal = () => {
   if (expression === secret) {
  navigation.replace("ChatList");
  return;
}

    try {
      const result = eval(expression);

      setExpression(String(result));
    } catch {
      setExpression("Error");
    }
  };

  const Button = ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
    >
      <Text style={styles.btnText}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Calculator
      </Text>

      <View style={styles.display}>
        <Text style={styles.displayText}>
          {expression || "0"}
        </Text>
      </View>

      <View style={styles.row}>
        <Button title="7" onPress={() => press("7")} />
        <Button title="8" onPress={() => press("8")} />
        <Button title="9" onPress={() => press("9")} />
        <Button title="/" onPress={() => press("/")} />
      </View>

      <View style={styles.row}>
        <Button title="4" onPress={() => press("4")} />
        <Button title="5" onPress={() => press("5")} />
        <Button title="6" onPress={() => press("6")} />
        <Button title="*" onPress={() => press("*")} />
      </View>

      <View style={styles.row}>
        <Button title="1" onPress={() => press("1")} />
        <Button title="2" onPress={() => press("2")} />
        <Button title="3" onPress={() => press("3")} />
        <Button title="-" onPress={() => press("-")} />
      </View>

      <View style={styles.row}>
        <Button title="C" onPress={clear} />
        <Button title="0" onPress={() => press("0")} />
        <Button title="=" onPress={equal} />
        <Button title="+" onPress={() => press("+")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    padding: 18,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  display: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    minHeight: 80,
    justifyContent: "flex-end",
  },

  displayText: {
    color: "#fff",
    fontSize: 34,
    textAlign: "right",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  btn: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#2E2E2E",
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
});