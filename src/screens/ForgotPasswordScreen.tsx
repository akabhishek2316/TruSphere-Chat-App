import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

import {
  getUserByUsername,
} from "../services/userService";

import {
  sendResetPasswordEmail,
} from "../services/authService";

import { Colors } from "../theme/colors";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export default function ForgotPasswordScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleContinue = async () => {

    if (!username.trim()) {
      Alert.alert(
        "Validation",
        "Enter username."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Validation",
        "Enter email."
      );
      return;
    }

    try {

      setLoading(true);

      const user =
        await getUserByUsername(
          username.trim()
        );

      if (!user) {

        setLoading(false);

        Alert.alert(
          "User Not Found",
          "Username doesn't exist."
        );

        return;
      }

      if (
        user.email.toLowerCase() !==
        email.trim().toLowerCase()
      ) {

        setLoading(false);

        Alert.alert(
          "Invalid Details",
          "Email doesn't match this username."
        );

        return;
      }

      setLoading(false);

      Alert.alert(
        "Reset Password",
        `Send password reset email to\n\n${email}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Send",
            onPress: sendEmail,
          },
        ]
      );

    } catch (e: any) {

      setLoading(false);

      Alert.alert(
        "Error",
        e.message
      );

    }

  };

  const sendEmail = async () => {

    try {

      setLoading(true);

      await sendResetPasswordEmail(
        email.trim()
      );

      setLoading(false);

      Alert.alert(
        "Success",
        "Password reset email sent successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );

    } catch (e: any) {

      setLoading(false);

      Alert.alert(
        "Error",
        e.message
      );

    }

  };

  return (

    <SafeAreaView style={styles.container}>

  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >

    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

    <View style={styles.iconContainer}>
  <Ionicons
    name="lock-closed"
    size={42}
    color={Colors.primary}
  />
</View>

      <Text style={styles.title}>
  Forgot Password
</Text>

<Text style={styles.subtitle}>
  Recover your TruSphere account.
  {"\n"}
  Verify your username and email to
  receive a password reset link.
</Text>

      <View style={styles.inputContainer}>
  <Ionicons
    name="person-outline"
    size={20}
    color="#64748B"
  />

  <TextInput
    placeholder="Username"
    style={styles.textInput}
    value={username}
    autoCapitalize="none"
    onChangeText={setUsername}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
  />
</View>

      <View style={styles.inputContainer}>
  <Ionicons
    name="mail-outline"
    size={20}
    color="#64748B"
  />

  <TextInput
    placeholder="Email"
    style={styles.textInput}
    keyboardType="email-address"
    autoCapitalize="none"
    value={email}
    onChangeText={setEmail}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
  />
</View>

      <TouchableOpacity
    style={styles.button}
    onPress={handleContinue}
    disabled={loading}
>

{
loading
?
<ActivityIndicator color="#fff"/>

:
<>
<Text style={styles.buttonText}>
Continue
</Text>

<Ionicons
name="arrow-forward"
size={18}
color="#fff"
/>
</>
}

</TouchableOpacity>

<TouchableOpacity
    onPress={() =>
        navigation.goBack()
    }
>

<Text style={styles.backText}>
← Back to Login
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
  backgroundColor: "#fff",
},

  content: {
  flexGrow: 1,
  justifyContent: "center",
  paddingHorizontal: 24,
  paddingVertical: 30,
},

  iconContainer:{
    width:90,
    height:90,
    borderRadius:45,
    backgroundColor:"#EEF4FF",

    justifyContent:"center",
    alignItems:"center",

    alignSelf:"center",

    marginBottom:25,
},

inputContainer:{
    flexDirection:"row",
    alignItems:"center",

    height:58,

    borderWidth:1,
    borderColor:"#E5E7EB",

    borderRadius:16,

    backgroundColor:"#F8FAFC",

    paddingHorizontal:16,

    marginBottom:18,
},

textInput:{
    flex:1,

    fontSize:16,

    marginLeft:12,

    color:"#111827",
},

button:{
    marginTop:10,

    height:58,

    borderRadius:16,

    backgroundColor:Colors.primary,

    flexDirection:"row",

    justifyContent:"center",

    alignItems:"center",
},

buttonText:{
    color:"#fff",

    fontSize:17,

    fontWeight:"700",

    marginRight:8,
},

backText:{
    marginTop:20,

    color:Colors.primary,

    fontSize:15,

    fontWeight:"600",

    textAlign:"center",
},

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
  },

 

});