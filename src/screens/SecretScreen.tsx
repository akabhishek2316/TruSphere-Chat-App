import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { STORAGE_KEYS } from "../constants/storage";
import {
  getSecret,
  saveSecret,
} from "../services/userService";

import { Colors } from "../theme/colors";

export default function SecretScreen() {
  const [role, setRole] = useState<"A" | "B">("A");

  const [current, setCurrent] = useState("");

  const [secret, setSecret] = useState("");

  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const r = await AsyncStorage.getItem(
      STORAGE_KEYS.USER_ROLE
    );

    if (r === "A" || r === "B") {
      setRole(r);

      const s = await getSecret(r);

      setCurrent(s);

      setSecret(s);
    }
  }

  async function save() {
    if (!secret.trim()) {
      Alert.alert(
        "Error",
        "Secret cannot be empty."
      );

      return;
    }

    if (secret !== confirm) {
      Alert.alert(
        "Error",
        "Secrets do not match."
      );

      return;
    }

    await saveSecret(role, secret);

    Alert.alert(
      "Success",
      "Secret Updated Successfully"
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Change Secret Expression
      </Text>

      <Text style={styles.label}>
        Current Secret
      </Text>

      <View style={styles.passwordBox}>
        <TextInput
          value={current}
          editable={false}
          secureTextEntry={!showCurrent}
          style={styles.passwordInput}
          underlineColorAndroid="transparent"
          selectionColor="#2563EB"
          cursorColor="#2563EB"
        />

        <Ionicons
          name={
            showCurrent
              ? "eye-off-outline"
              : "eye-outline"
          }
          size={22}
          color="#666"
          onPress={() =>
            setShowCurrent(!showCurrent)
          }
        />
      </View>

      <Text style={styles.label}>
        New Secret
      </Text>

      <View style={styles.passwordBox}>
        <TextInput
          value={secret}
          onChangeText={setSecret}
          secureTextEntry={!showNew}
          style={styles.passwordInput}
          underlineColorAndroid="transparent"
          selectionColor="#2563EB"
          cursorColor="#2563EB"
        />

        <Ionicons
          name={
            showNew
              ? "eye-off-outline"
              : "eye-outline"
          }
          size={22}
          color="#666"
          onPress={() =>
            setShowNew(!showNew)
          }
        />
      </View>

      <Text style={styles.label}>
        Confirm Secret
      </Text>

      <View style={styles.passwordBox}>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showConfirm}
          style={styles.passwordInput}
          underlineColorAndroid="transparent"
          selectionColor="#2563EB"
          cursorColor="#2563EB"
        />

        <Ionicons
          name={
            showConfirm
              ? "eye-off-outline"
              : "eye-outline"
          }
          size={22}
          color="#666"
          onPress={() =>
            setShowConfirm(!showConfirm)
          }
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={save}
      >
        <Text style={styles.buttonText}>
          SAVE
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    color: Colors.text,
  },

  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: Colors.text,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  button: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  passwordInput: {
    flex: 1,
    height: 54,
    fontSize: 16,
  },
});