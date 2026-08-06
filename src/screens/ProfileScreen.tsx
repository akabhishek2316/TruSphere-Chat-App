import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { uploadImage } from "../services/cloudinary";
import { pickImage } from "../services/imageService";

import AppHeader from "../components/AppHeader";
import { getCurrentUser } from "../services/authService";
import {
  getUserProfile,
  updateUserProfile,
} from "../services/userService";

import { Colors } from "../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {

  const navigation = useNavigation();

  const currentUser = getCurrentUser();

  const [name, setName] = useState("");

  const [about, setAbout] = useState("");

  const [photo, setPhoto] = useState("");

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    if (!currentUser) return;

    const profile = await getUserProfile(currentUser.uid);

    setName(profile.name);
    setUsername(profile.username || "");
    setAbout(profile.about);
    setPhoto(profile.photo || "");
  }

  async function changePhoto() {
    const uri = await pickImage();

    if (uri) {
      setPhoto(uri);
    }
  }

  async function save() {

    

  if (!name.trim()) {
    Alert.alert("Validation", "Please enter your name.");
    return;
  }

  if (about.length > 120) {
  Alert.alert("About is too long");
  return;
}

  try {

    setLoading(true);

    let photoUrl = photo;

    if (
      photo.startsWith("file://") ||
      photo.startsWith("content://")
    ) {
      photoUrl = await uploadImage(photo);
    }

    const uid = getCurrentUser()?.uid;

    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    await updateUserProfile(uid, {
    name: name.trim(),
    about: about.trim(),
    photo: photoUrl,
});

    setPhoto(photoUrl);

    Alert.alert(
      "Success",
      "Profile updated successfully."
    );

    navigation.goBack();

  } catch (e) {

    Alert.alert(
      "Error",
      "Something went wrong."
    );

  } finally {

    setLoading(false);

  }

}
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader title="Profile" />
    <ScrollView
    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
>



      <View style={styles.avatarContainer}>


  
  {photo ? (
    <Image
      source={{ uri: photo }}
      style={styles.avatar}
    />
  ) : (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarLetter}>
        {name?.charAt(0).toUpperCase() || "U"}
      </Text>
    </View>
  )}

  <TouchableOpacity
    style={styles.cameraButton}
    onPress={changePhoto}
  >
    <Ionicons
      name="camera"
      size={18}
      color="#fff"
    />
  </TouchableOpacity>

</View>

<Text style={styles.userName}>
  @{username}
</Text>



<View style={styles.card}>

      <View style={styles.labelRow}>
<Ionicons
name="person-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.label}>
Name
</Text>

</View>

      <TextInput
        value={name}
        placeholderTextColor="#94A3B9"
        onChangeText={setName}
        style={styles.input}
        placeholder="Enter Name"
        underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
      />

     <View style={styles.labelRow}>
<Ionicons
name="chatbubble-outline"
size={18}
color="#2563EB"
/>

<Text style={styles.label}>
About
</Text>

</View>

      <TextInput
    value={about}
    placeholderTextColor="#94A3B9"
    onChangeText={setAbout}
    multiline
    maxLength={120}
    textAlignVertical="top"
    placeholder="Tell people about yourself..."
    style={[
        styles.input,
        {
            height:100,
            paddingTop:14,
        },
    ]}
    underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
/>

      </View>

      <TouchableOpacity
    style={[
        styles.button,
        loading && { opacity: 0.7 }
    ]}
    disabled={loading}
    onPress={save}
>

<Ionicons
name="checkmark-circle"
size={22}
color="#fff"
/>

<Text style={styles.buttonText}>
  {loading ? "Saving..." : "Save Changes"}
</Text>

</TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },

  userName:{
    marginTop:10,
    fontSize:15,
    color:"#64748B",
    textAlign:"center",
},

  avatarContainer:{
  alignSelf:"center",
  marginTop:25,
  marginBottom:35,
},

button:{
height:58,

borderRadius:18,

backgroundColor:"#2563EB",

marginTop:30,

flexDirection:"row",

justifyContent:"center",

alignItems:"center",

elevation:5,

shadowColor:"#2563EB",

shadowOpacity:0.25,

shadowRadius:8,
},

buttonText:{
marginLeft:10,
fontWeight:"700",
fontSize:17,
color:"#fff",
},

labelRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:8,
},

label:{
marginLeft:8,
fontWeight:"700",
fontSize:15,
color:"#111827",
},

card:{
  backgroundColor:"#fff",

  borderRadius:22,

  padding:22,

  elevation:3,

  shadowColor:"#000",

  shadowOpacity:0.05,

  shadowRadius:10,

  shadowOffset:{
    width:0,
    height:3,
  },

  marginTop:10,
},

cameraButton:{
  position:"absolute",
  right:2,
  bottom:2,

  width:38,
  height:38,

  borderRadius:19,

  backgroundColor:"#2563EB",

  justifyContent:"center",
  alignItems:"center",

  borderWidth:3,
  borderColor:"#fff",
},

  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },

  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  change: {
    marginTop: 10,
    color: Colors.primary,
    fontWeight: "600",
  },

 
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.text,
  },

  
 

  avatar: {
  width: 120,
  height: 120,
  borderRadius: 60,

  borderWidth: 3,
  borderColor: "#fff",

  alignSelf: "center",

  elevation: 6,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
},

avatarPlaceholder: {
  width: 120,
  height: 120,
  borderRadius: 60,

  backgroundColor: Colors.primary,

  justifyContent: "center",
  alignItems: "center",

  alignSelf: "center",

  elevation: 6,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
},

avatarLetter: {
  color: "#fff",
  fontSize: 42,
  fontWeight: "700",
},

changePhoto: {
  marginTop: 14,
  textAlign: "center",

  color: Colors.primary,

  fontSize: 16,
  fontWeight: "600",
},


});