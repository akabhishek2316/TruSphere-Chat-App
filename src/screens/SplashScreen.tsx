import { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

import { Colors } from "../theme/colors";

import { getCurrentUser } from "../services/authService";

import { logout } from "../services/authService";

import { getDeviceId } from "../services/deviceService";

import {
  getSession,
  isSessionExpired,
} from "../services/sessionService";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "Splash"
  >;

export default function SplashScreen({
  navigation,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(async () => {
  try {
    const user = getCurrentUser();

    if (!user) {
      navigation.replace("Login");
      return;
    }

    const deviceId =
      await getDeviceId();

    const session =
      await getSession(user.uid);

    // Session deleted
    if (!session) {
      await logout();

      navigation.replace("Login");
      return;
    }

    // Session expired
    if (
      isSessionExpired(session)
    ) {
      await logout();

      navigation.replace("Login");
      return;
    }

    // Logged in another device
    if (
      session.deviceId !== deviceId
    ) {
      await logout();

      navigation.replace("Login");
      return;
    }

    navigation.replace("ChatList");

  } catch (error) {

    console.log(error);

    navigation.replace("Login");

  }
},1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
      }}
    >
      <Image
  source={require("../../assets/branding/splash-logo.png")}
  style={styles.logo}
/>

      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  logo: {
  width: 350,
  height: 350,
  resizeMode: "contain",
  marginBottom: 50,
},

title: {
  marginTop: 20,
  fontSize: 38,
  fontWeight: "900",
  color: "#FFFFFF",
  textAlign: "center",
  letterSpacing: 1,
},

subtitle: {
  marginTop: 10,
  fontSize: 16,
  fontWeight: "500",
  color: "rgba(255,255,255,0.85)",
  textAlign: "center",
  letterSpacing: 0.8,
},

})