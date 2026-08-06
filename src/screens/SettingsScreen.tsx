import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,Modal} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { getUserProfile } from "../services/userService";
import MyProfileModal from "../components/MyProfileModal";
import AppHeader from "../components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { changePassword } from "../services/authService";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Colors } from "../theme/colors";
import { Alert } from "react-native";
import { logout, getCurrentUser } from "../services/authService";
import { setUserOffline } from "../services/presenceService";
import { ActivityIndicator } from "react-native";

export default function SettingsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [profile, setProfile] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] =
  useState(false);

  const [changingPassword, setChangingPassword] =
  useState(false);

const [currentPassword, setCurrentPassword] =
  useState("");

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

  const [showMyProfile, setShowMyProfile] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const me = getCurrentUser()?.uid;

      if (!me) return;

      const user = await getUserProfile(me);

      setProfile(user);
    };

    loadProfile();
  }, []);


  const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const uid = getCurrentUser()?.uid;

            if (uid) {
              await setUserOffline(uid);
            }

            await logout();

            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]
  );
};

  return (

<SafeAreaView style={{ flex: 1 }}>

  
  

      <AppHeader title="Settings" />

      <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
  >
    <View style={styles.container}>


      <TouchableOpacity
  style={styles.profileCard}
  activeOpacity={0.75}
  onPress={() => setShowMyProfile(true)}
>
        {profile?.photo ? (
          <Image
            source={{ uri: profile.photo }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {profile?.name
                ? profile.name.charAt(0).toUpperCase()
                : "?"}
            </Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.profileName}>
            {profile?.name || "Your Name"}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.profileAbout}
          >
            {profile?.about || "Tap to edit profile"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Account
      </Text>




      <TouchableOpacity
        activeOpacity={0.72}
        style={styles.item}
        onPress={() =>
          navigation.navigate("Profile")
        }
      >
        <Ionicons
          name="person-circle-outline"
          size={26}
          color={Colors.primary}
        />

        <View style={styles.textArea}>
          <Text style={styles.heading}>
            Profile
          </Text>

          <Text style={styles.sub}>
            Edit your profile
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#999"
        />
      </TouchableOpacity>






      <TouchableOpacity
        activeOpacity={0.72}
        style={styles.item}
        onPress={() => navigation.navigate("Privacy")}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color={Colors.primary}
        />

        <View style={styles.textArea}>
          <Text style={styles.heading}>
            Privacy
          </Text>
          <Text style={styles.sub}>
            Manage Your Privacy
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#999"
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.72}
        style={styles.item}
        onPress={() =>
          setShowPasswordModal(true)
        }
      >
        <Ionicons
          name="lock-closed-outline"
          size={22}
          color="#2563EB"
        />

         <View style={styles.textArea}>
          <Text style={styles.heading}>
            Change Password
          </Text>
          <Text style={styles.sub}>
            Set a New Password
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#999"
        />
      </TouchableOpacity>

     

      <Text style={styles.sectionTitle}>
        App
      </Text>


      <TouchableOpacity
        activeOpacity={0.72}
        style={styles.item}>
        <Ionicons
          name="moon-outline"
          size={26}
          color={Colors.primary}
        />

        <View style={styles.textArea}>
          <Text style={styles.heading}>
            Dark Mode
          </Text>

          <Text style={styles.sub}>
            Coming Soon
          </Text>
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            Soon
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.75}
        onPress={() => navigation.navigate("About")}
      >
        <Ionicons
          name="information-circle-outline"
          size={26}
          color={Colors.primary}
        />

        <View style={styles.textArea}>
          <Text style={styles.heading}>
            About TruSphere
          </Text>

          <Text style={styles.sub}
          >
            Version 1.0.0
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>

        <TouchableOpacity
  activeOpacity={0.8}
  style={styles.logoutButton}
  onPress={handleLogout}
>
  <Ionicons
    name="log-out-outline"
    size={24}
    color="#EF4444"
  />

  <View style={styles.textArea}>
    <Text style={styles.logoutTitle}>
      Logout
    </Text>

    <Text style={styles.sub}>
      Sign out from your account
    </Text>
  </View>

  <Ionicons
    name="chevron-forward"
    size={20}
    color="#999"
  />
</TouchableOpacity>


            <Modal
  visible={showPasswordModal}
  
  transparent
  animationType="fade"
  onRequestClose={() => setShowPasswordModal(false)}
>
  






  <View style={styles.modalBg}>
    <View style={styles.modal}>

<View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  }}
>
  <Text style={styles.passtitle}>
        Change Password
      </Text>

  <TouchableOpacity
    onPress={() => setShowPasswordModal(false)}
  >
    <Ionicons
      name="close"
      size={28}
      color="#444"
    />
  </TouchableOpacity>
</View>
      
      <View style={styles.passwordContainer}>
  <TextInput
    placeholder="Current Password"
    placeholderTextColor="#94A3B9"
    secureTextEntry={!showCurrentPassword}
    value={currentPassword}
    onChangeText={setCurrentPassword}
    style={styles.passwordInput}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
  />

  <TouchableOpacity
    onPress={() =>
      setShowCurrentPassword(!showCurrentPassword)
    }
  >
    <Ionicons
      name={
        showCurrentPassword
          ? "eye-off-outline"
          : "eye-outline"
      }
      size={22}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

     <View style={styles.passwordContainer}>
  <TextInput
    placeholder="New Password"
    placeholderTextColor="#94A3B9"
    secureTextEntry={!showNewPassword}
    value={newPassword}
    onChangeText={setNewPassword}
    style={styles.passwordInput}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
  />

  <TouchableOpacity
    onPress={() =>
      setShowNewPassword(!showNewPassword)
    }
  >
    <Ionicons
      name={
        showNewPassword
          ? "eye-off-outline"
          : "eye-outline"
      }
      size={22}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

      <View style={styles.passwordContainer}>
  <TextInput
    placeholder="Confirm Password"
    placeholderTextColor="#94A3B9"
    secureTextEntry={!showConfirmPassword}
    value={confirmPassword}
    onChangeText={setConfirmPassword}
    style={styles.passwordInput}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
  />

  <TouchableOpacity
    onPress={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
  >
    <Ionicons
      name={
        showConfirmPassword
          ? "eye-off-outline"
          : "eye-outline"
      }
      size={22}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={async () => {

          if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          ) {
            alert("Fill all fields");
            return;
          }

          if (newPassword.length < 6) {
            alert(
              "Password must be at least 6 characters"
            );
            return;
          }

          if (
            newPassword !== confirmPassword
          ) {
            alert("Passwords do not match");
            return;
          }

          try {

  setChangingPassword(true);

  await changePassword(
    currentPassword,
    newPassword
  );

  alert("Password changed successfully");

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");

  setShowPasswordModal(false);

} catch (e: any) {

  if (e.code === "auth/wrong-password") {
    alert("Current password is incorrect.");
  } else {
    alert(e.message);
  }

} finally {

  setChangingPassword(false);

}

        }}
      >
        <TouchableOpacity
  style={[
    styles.saveButton,
    changingPassword && { opacity: 0.7 }
  ]}
  disabled={changingPassword}
  onPress={async () => {

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      setChangingPassword(true);

      await changePassword(
        currentPassword,
        newPassword
      );

      alert("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordModal(false);

    } catch (e: any) {

      if (e.code === "auth/wrong-password") {
        alert("Current password is incorrect.");
      } else {
        alert(e.message);
      }

    } finally {

      setChangingPassword(false);

    }

  }}
>
  {changingPassword ? (
    <ActivityIndicator
      color="#fff"
      size="small"
      
    />
  ) : (
    <Text
      style={{
        color: "#fff",
        fontWeight: "700",
        
      }}
    >
      Save
    </Text>
  )}
</TouchableOpacity>
      </TouchableOpacity>

    </View>
  </View>
</Modal>






      <View style={styles.footer}>
        <Text style={styles.version}>
          TruSphere v1.0.0
        </Text>

        <Text style={styles.footerText}>
          Made with ❤️ using React Native & Firebase
        </Text>



      </View>



    </View>

    <MyProfileModal
  visible={showMyProfile}
  onClose={() => setShowMyProfile(false)}
  name={profile?.name || ""}
  username={profile?.username || ""}
  photo={profile?.photo}
  about={profile?.about}
  email={profile?.email}
  createdAt={profile?.createdAt}
  online={true}
  uid={profile?.uid}
  onEdit={() => {
    setShowMyProfile(false);
    navigation.navigate("Profile");
  }}
/>

</ScrollView>
</SafeAreaView>

  );


}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingTop: 4,
  },

  passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 12,
  paddingHorizontal: 14,
  marginBottom: 16,
  backgroundColor: "#fff",
},

passwordInput: {
  flex: 1,
  height: 52,
  fontSize: 16,
  color: "#111827",
},

  logoutButton: {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  paddingHorizontal: 18,
  paddingVertical: 16,
  flexDirection: "row",
  alignItems: "center",
  marginTop: 25,
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 2,
  },
},

logoutTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#EF4444",
},

  profileCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,

    marginTop: 14,

    marginBottom: 14,

    flexDirection: "row",

    alignItems: "center",

    elevation: 2,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  profileImage: {
    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: Colors.primary,

    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",
  },

  profileInitial: {
    color: "#FFFFFF",

    fontSize: 24,

    fontWeight: "700",
  },

  profileName: {
    fontSize: 18,

    fontWeight: "700",

    color: "#111827",
  },

  profileAbout: {
    marginTop: 4,

    color: "#64748B",

    fontSize: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: Colors.text,
  },

  passtitle:{
 fontSize:24,
 fontWeight:"700",
 
},

  item: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingHorizontal: 18,

    paddingVertical: 16,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 8,

    elevation: 2,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },


  textArea: {
    flex: 1,
    marginLeft: 14,
  },

  heading: {
    fontSize: 16,

    fontWeight: "700",

    color: "#111827",
  },

  sub: {
    marginTop: 3,

    fontSize: 13,

    color: "#64748B",
  },

  sectionTitle: {
    marginTop: 26,

    marginBottom: 10,

    marginLeft: 4,

    fontSize: 13,

    fontWeight: "700",

    letterSpacing: 0.5,

    color: "#94A3B8",

    textTransform: "uppercase",
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

  footer: {
    marginTop: 35,

    alignItems: "center",

    paddingBottom: 25,
  },

  version: {
    fontSize: 14,

    fontWeight: "700",

    color: "#374151",
  },

  footerText: {
    marginTop: 6,

    fontSize: 12,

    color: "#94A3B8",

    textAlign: "center",
  },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20
  },

itemText: {
  fontSize: 16,
  color: "#111827",
  fontWeight: "500",
},

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20
  },

  saveButton: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 12,
    alignItems: "center"
  },


});

