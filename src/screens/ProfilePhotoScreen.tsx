import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";

export default function ProfilePhotoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { photo } = route.params;

  useEffect(() => {
  ScreenCapture.preventScreenCaptureAsync();

  return () => {
    ScreenCapture.allowScreenCaptureAsync();
  };
}, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="close"
          size={30}
          color="#fff"
        />
      </TouchableOpacity>

      <Image
        source={{ uri: photo }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  back: {
    position: "absolute",
    top: 55,
    left: 18,
    zIndex: 10,
  },
});