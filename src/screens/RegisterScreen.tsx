import React, { useState, useEffect, useRef } from "react";
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
import { registerForPushNotifications } from "../services/notificationService";
import { saveFcmToken } from "../services/userService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserId } from "../types/chat";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

import { register } from "../services/authService";
import { getDeviceId } from "../services/deviceService";
import { createSession } from "../services/sessionService";
import {
  createUserProfile,
  isUsernameExists,
  getUsernameSuggestions,
} from "../services/userService";

import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";


type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [checkingUsername, setCheckingUsername] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] =
    useState<
      "idle" |
      "checking" |
      "available" |
      "taken" |
      "invalid"
    >("idle");

  const [usernameMessage, setUsernameMessage] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [suggestions, setSuggestions] =
    useState<string[]>([]);

  const USERNAME_REGEX =
    /^[a-z][a-z0-9._]{3,19}$/;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function validateUsername(
    value: string
  ) {

    if (value.length < 4) {

      return "Minimum 4 characters";

    }

    if (value.length > 20) {

      return "Maximum 20 characters";

    }

    if (
      !USERNAME_REGEX.test(value)
    ) {

      return "Only letters, numbers, . and _ allowed";

    }

    if (
      value.includes("..") ||
      value.includes("__")
    ) {

      return "Avoid consecutive dots or underscores";

    }

    if (
      value.endsWith(".") ||
      value.endsWith("_")
    ) {

      return "Username can't end with . or _";

    }

    return "";
  }

  useEffect(() => {
    const value = username.trim().toLowerCase();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length === 0) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus("invalid");
      setUsernameMessage(
        "4-20 chars • lowercase letters, numbers, . and _"
      );
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setCheckingUsername(true);

      const exists =
        await isUsernameExists(value);

      setCheckingUsername(false);

      if (exists) {
        setUsernameStatus("taken");
        setUsernameMessage(
          "Username already taken"
        );
        setSuggestions(
          await getUsernameSuggestions(value)
        );
      } else {
        setUsernameStatus("available");
        setUsernameMessage(
          "Username available"
        );
        setSuggestions([]);
      }
    }, 450);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [username]);

  const handleRegister = async () => {

    const errors: string[] = [];

if (!name.trim()) errors.push("• Full Name");
if (!username.trim()) errors.push("• Username");
if (!email.trim()) errors.push("• Email");
if (!password.trim()) errors.push("• Password");

if (errors.length > 0) {
  Alert.alert(
    "Missing Information",
    "Please fill the following fields:\n\n" +
      errors.join("\n")
  );
  return;
}

if (usernameStatus !== "available") {
  Alert.alert(
    "Username",
    "Please choose an available username."
  );
  return;
}

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill all fields."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await register(
  email.trim(),
  password
);

await createUserProfile(result.user.uid, {
  name: name.trim(),
  username: username.trim(),
  email: email.trim(),
});

const deviceId = await getDeviceId();

const sessionId =
await createSession(
   result.user.uid,
   deviceId
);

await AsyncStorage.setItem(
   "SESSION_ID",
   sessionId
);


const fcmToken =
  await registerForPushNotifications();

if (fcmToken) {
  await saveFcmToken(
    result.user.uid,
    fcmToken
  );
}



      Alert.alert(
        "Success",
        "Account Created Successfully",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.replace("Login"),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        "Registration Failed",
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
        placeholder="Full Name"
        placeholderTextColor="#94A3B9"
        style={styles.input}
        value={name}
        onChangeText={setName}
        underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
      />

      <View style={styles.usernameContainer}>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#94A3B9"
          style={styles.usernameInput}
          value={username}
          onChangeText={(text) =>
            setUsername(text.toLowerCase())
          }
          autoCapitalize="none"
          underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
        />

      

        {
          checkingUsername ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          )
            :
            usernameStatus === "available" ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#22C55E"
              />
            )
              :
              usernameStatus === "taken" ? (
                <Ionicons
                  name="close-circle"
                  size={22}
                  color="#EF4444"
                />
              )
                :
                usernameStatus === "invalid" ? (
                  <Ionicons
                    name="alert-circle"
                    size={22}
                    color="#F59E0B"
                  />
                )
                  :
                  null
        }

      </View>

      <Text
        style={{
          marginBottom: 10,
          color:
            usernameStatus === "available"
              ? "#22C55E"
              : usernameStatus === "taken" ||
                usernameStatus === "invalid"
                ? "#EF4444"
                : "#64748B",
        }}
      >

        {
          usernameMessage
        }


        

      </Text>

      {usernameStatus === "taken" && suggestions.length > 0 && (
  <View style={styles.suggestionBox}>

    <Text style={styles.suggestionTitle}>
      Suggested usernames
    </Text>

    <View style={styles.suggestionWrap}>
      {suggestions.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.suggestionChip}
          onPress={() => setUsername(item)}
        >
          <Text style={styles.suggestionChipText}>
            @{item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

  </View>
)}

  

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94A3B9"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
      />

      <View style={styles.passwordContainer}>
  <TextInput
    placeholder="Password"
    placeholderTextColor="#94A3B9"
    style={styles.passwordInput}
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    underlineColorAndroid="transparent"
    selectionColor="#2563EB"
    cursorColor="#2563EB"
  />

  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
    activeOpacity={0.7}
  >
    <Ionicons
      name={showPassword ? "eye-off-outline" : "eye-outline"}
      size={22}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Login")
        }
      >
        <Text style={styles.loginText}>
          Already have an account?
          <Text style={styles.loginLink}>
            {" "}
            Login
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

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",

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
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 50,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },

  passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 14,
  paddingHorizontal: 18,
  height: 50,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

passwordInput: {
  flex: 1,
  fontSize: 16,
  color: "#111827",
},

  button: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },

  loginText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
    fontSize: 15,
  },

  loginLink: {
    color: "#2563EB",
    fontWeight: "700",
  },

  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    display: "flex",
    justifyContent: "center",
    marginBottom: 30


  },

  line: {
    width: 24,
    height: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
  },

  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 50,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  usernameInput: {
    flex: 1,
    fontSize: 16,
  },
suggestionBox:{
  marginBottom:18,
},

suggestionTitle:{
  fontSize:15,
  fontWeight:"700",
  color:"#374151",
  marginBottom:10,
},

suggestionWrap:{
  flexDirection:"row",
  flexWrap:"wrap",
},

suggestionChip:{
  backgroundColor:"#EFF6FF",
  borderWidth:1,
  borderColor:"#BFDBFE",
  paddingHorizontal:14,
  paddingVertical:8,
  borderRadius:20,
  marginRight:8,
  marginBottom:8,
},

suggestionChipText:{
  color:"#2563EB",
  fontWeight:"600",
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
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },
});