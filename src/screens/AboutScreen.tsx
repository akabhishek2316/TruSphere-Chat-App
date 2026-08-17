import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import Constants from "expo-constants";


export default function AboutScreen() {

  const appVersion =
  Constants.expoConfig?.version ?? "0.0.0";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <AppHeader title="About" />

        <View style={styles.content}>
          <Image
            source={require("../../assets/branding/app-logo.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>
            TruSphere
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

          <Text style={styles.version}>
              Version {appVersion}
          </Text>

          <Text style={styles.desc}>
            TruSphere is a premium messaging platform built for fast, secure and private conversations with a modern experience.
          </Text>

          <View style={styles.techCard}>

            <View style={styles.techRow}>
              <Ionicons
                name="logo-react"
                size={22}
                color="#61DAFB"
              />
              <Text style={styles.techText}>
                React Native
              </Text>
            </View>

            <View style={styles.techRow}>
              <Ionicons
                name="flame"
                size={20}
                color="#F97316"
              />
              <Text style={styles.techText}>
                Firebase
              </Text>
            </View>

            <View style={styles.techRow}>
              <Ionicons
                name="cloud-outline"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.techText}>
                Cloudinary
              </Text>
            </View>

          </View>

          <Text style={styles.footerText}>
            Developed  by
          </Text>

          <Text style={styles.dev}>
            Abhishek Kumar
          </Text>


          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:webdeveloperabhi88@gmail.com"
              )
            }
          >
            <Text style={styles.email}>
              📧 webdeveloperabhi88@gmail.com
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerSub}>
            Need support, found a bug, or want to collaborate?
          </Text>

          <Text style={styles.footerSub}>
            Made with ❤️ in India
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  techCard: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    marginTop: 30,

    elevation: 2,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  techRow: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 8,
  },

  techText: {
    marginLeft: 12,

    fontSize: 15,

    fontWeight: "600",

    color: "#374151",

  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 25,
  },

  appName: {

    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },

  version: {
    marginTop: 8,
    fontSize: 15,
    color: "#6B7280",
  },

  desc: {
    marginTop: 24,

    textAlign: "center",

    fontSize: 15,

    color: "#4B5563",

    lineHeight: 25,
  },

  footer: {
    marginTop: 60,
    alignItems: "center",
  },

  footerText: {
    color: "#6B7280",
    marginTop: 24
  },

  dev: {
    marginTop: 6,
    fontWeight: "700",
    fontSize: 17,
    color: Colors.primary,
  },

  copy: {
    marginTop: 12,
    color: "#9CA3AF",
  },

  title: {

    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: 1,
  },

  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    display: "flex",
    justifyContent: "center",
    marginBottom: 10


  },

  line: {
    width: 24,
    height: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
  },

  role: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  email: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
    textDecorationLine: "underline",
  },

  footerSub: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
  },

  tagline: {
    fontSize: 10,
    color: "#2563EB",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },



  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    alignSelf: "center",


  },
});