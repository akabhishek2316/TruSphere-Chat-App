import { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";

import { onAuthStateChanged } from "../services/authService";
import { auth } from "../services/firebase";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Colors } from "../theme/colors";


type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "Splash"
  >;

export default function SplashScreen({
  navigation,
}: Props) {

  

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE =>", user?.uid);

    if (user) {
      navigation.replace("ChatList");
    } else {
      navigation.replace("Login");
    }
  });

  return unsubscribe;
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
});