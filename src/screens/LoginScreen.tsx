import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/AppNavigator";
import { startMessageSync } from "../services/messageSyncService";
import { getCurrentUser } from "../services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../services/authService";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { getDeviceId } from "../services/deviceService";

import {
  getSession,
  createSession,
  getCurrentSessionId,
  subscribeSession,
  isSessionExpired,
} from "../services/sessionService";





type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;


export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      "Missing Fields",
      "Please enter email and password."
    );
    return;
  }

  try {
    setLoading(true);

    // Firebase Login
    await login(
      email.trim(),
      password
    );

    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not found.");
    }

    // Current device id
    const deviceId =
      await getDeviceId();

    // Existing session
    const session =
      await getSession(user.uid);

    // Existing session check
if (
  session &&
  session.deviceId !== deviceId &&
  !isSessionExpired(session.lastActive)
) {

  // Sirf current Firebase login remove hoga
  // Database session delete nahi hogi
  await signOut(auth);

  Alert.alert(
    "Already Logged In",
    "This account is already active on another device."
  );

  return;
}

    // First login ya same device
   const sessionId =
await createSession(
   user.uid,
   deviceId
);

await AsyncStorage.setItem(
   "SESSION_ID",
   sessionId
);

navigation.replace("ChatList");

  } catch (e: any) {

    Alert.alert(
      "Login Failed",
      e.message
    );

  } finally {

    setLoading(false);

  }
};

  return (
    <SafeAreaView style={styles.container}>

<KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
>

<ScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
>

    <Image
      source={require("../../assets/branding/app-logo.png")}
      style={styles.logo}
    />

      <Text style={styles.title}>
  Welcome to TruSphere
</Text>

<View style={styles.taglineRow}>
        <View style={styles.line} />

        <Ionicons
          name="lock-closed"
          size={11}
          color="#2563EB"
        />

        <Text style={styles.tagline}>
          Secure Communication
        </Text>

        <View style={styles.line} />
      </View>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
      />

  <TouchableOpacity
  onPress={() =>
    navigation.navigate("ForgotPassword")
  }
>
  <Text
    style={{
      color: "#2563EB",
      fontSize: 15,
      fontWeight: "600",
      marginTop: 12,
      alignSelf: "flex-end",
    }}
  >
    Forgot Password?
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Register")
        }
      >
        <Text style={styles.bottomText}>
          Don't have an account?
          <Text style={styles.link}>
            {" "}
            Register
          </Text>
        </Text>
      </TouchableOpacity>
   </ScrollView>

</KeyboardAvoidingView>

</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
   
  },

  
  logo:{
   width:120,
   height:120,
   resizeMode:"contain",
   alignSelf:"center",

},

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
     
    textAlign: "center",
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 35,
  },

  input: {
    backgroundColor: "#fff",
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  button: {
    height: 56,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  bottomText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
    fontSize: 15,
  },

  link: {
    color: "#2563EB",
    fontWeight: "700",
  },

   taglineRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 5,
  display:"flex",
  justifyContent:"center",
  marginBottom:20
 
  
},

  line: {
  width: 24,
  height: 1,
  backgroundColor: "#CBD5E1",
  marginHorizontal: 6,
},

scrollContent:{
    flexGrow:1,
    justifyContent:"center",
    paddingHorizontal:24,
    paddingVertical:30,
},

tagline: {
  fontSize: 11,
  color: "#2563EB",
  display:"flex",
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"center",
  fontWeight: "600",
},
});