import React from "react";
import {
  
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
export default function PrivacyScreen() {

  const navigation =
  useNavigation<
    NativeStackNavigationProp<RootStackParamList>
  >();

 function MenuItem({
  icon,
  title,
  onPress,
  rightText,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
  rightText?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={22}
          color="#2563EB"
        />

        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      {rightText ? (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            {rightText}
          </Text>
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      )}
    </TouchableOpacity>
  );
}

function SwitchItem({
  icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (

    
    <TouchableOpacity
      activeOpacity={1}
      style={styles.row}
    >
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={22}
          color="#2563EB"
        />

        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>
          Soon
        </Text>
      </View>
    </TouchableOpacity>
  );
}

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <AppHeader title="Privacy" />

    <ScrollView
  contentContainerStyle={styles.scrollContent}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>

      {/* Visibility */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Who can see my info</Text>

        <MenuItem
          icon="time-outline"
          title="Last Seen & Online"
          rightText="Soon"
        />

        <MenuItem
          icon="person-circle-outline"
          title="Profile Photo"
          rightText="Soon"
        />

        <MenuItem
          icon="information-circle-outline"
          title="About"
          rightText="Soon"
        />
      </View>

      {/* Messaging */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Messaging</Text>

        <SwitchItem
          icon="checkmark-done-outline"
          title="Read Receipts"
          
        />

        <SwitchItem
          icon="create-outline"
          title="Typing Indicator"
         
        />

        

        <MenuItem
          icon="timer-outline"
          title="Disappearing Messages"
          rightText="Soon"
        />
      </View>

      {/* Security */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <MenuItem
  icon="ban-outline"
  title="Blocked Contacts"
  onPress={() =>
    navigation.navigate("BlockedContacts")
  }
/>

        <MenuItem
          icon="finger-print-outline"
          title="Fingerprint Lock"
          rightText="Soon"
        />
      </View>
      <View style={styles.footer}>
  <Ionicons
    name="shield-checkmark-outline"
    size={18}
    color="#64748B"
  />

  <Text style={styles.footerText}>
    Privacy controls will be available in a future update.
  </Text>
</View>
    
  </ScrollView>
    </SafeAreaView>
  
  );

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  scrollContent: {
  paddingHorizontal: 10,
  paddingTop: 4,
  paddingBottom: 40,
  
},

  footer: {
  marginTop: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

footerText: {
  marginLeft: 8,
  color: "#64748B",
  fontSize: 13,
  textAlign: "center",
},

  comingSoon: {
      backgroundColor: "#EEF2FF",
  
      paddingHorizontal: 10,
  
      paddingVertical: 4,
  
      borderRadius: 20,
    },
  
    comingSoonText: {
      color: Colors.primary,
  
      fontSize: 11,
  
      fontWeight: "700",
    },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 22,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 2,
  },

  sectionTitle: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 14,
    marginHorizontal: 18,
    marginBottom: 6,
  },

  row: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    marginLeft: 16,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});