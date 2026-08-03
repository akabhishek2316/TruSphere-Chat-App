import React, { useEffect, useState } from "react";
import {
  
  FlatList,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import { getChatId } from "../types/utils/chatUtils";
import { createChatRoom } from "../services/chatService";
import { Ionicons } from "@expo/vector-icons";

export default function NewChatScreen() {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<any[]>([]);

  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  function searchUser(value: string) {
  const text = value.trim().toLowerCase();

  if (!text) {
    setResult(null);
    return;
  }

  const found = users.find(user => {
    const username =
      (user.username ?? "").toLowerCase();

    const uid =
      (user.uid ?? "").toLowerCase();

    return (
      username === text ||
      uid === text
    );
  });

  setResult(found || null);
}

  async function loadUsers() {
    const current = getCurrentUser();

    const list: any[] = await getAllUsers();

    setUsers(
      list.filter(user => user.uid !== current?.uid)
    );
  }

  

  return (
    <SafeAreaView style={styles.container}>

    <View style={styles.header}>

  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons
      name="arrow-back"
      size={24}
      color="#111827"
    />
  </TouchableOpacity>

 <View style={styles.headerContent}>

  {/* <Image
    source={require("../../assets/branding/logo-horizontal.png")}
    style={styles.logo}
  /> */}

  <Text style={styles.title}>
    Select Contact
  </Text>

  <Text style={styles.contactCount}>
  Search by Username or UID
</Text>

</View>

</View>

      <View style={styles.searchContainer}>

<Ionicons
name="search"
size={20}
color="#64748B"
/>

<TextInput
  placeholder="Enter username or UID..."
  placeholderTextColor="#94A3B8"
  value={search}
  onChangeText={(text) => {
    setSearch(text);
    searchUser(text);
  }}
  autoCapitalize="none"
  autoCorrect={false}
  style={styles.search}
  underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
/>
</View>

      <FlatList

      ListEmptyComponent={
  search.trim() !== "" ? (
    <View
      style={{
        alignItems: "center",
        marginTop: 70,
      }}
    >
      <Ionicons
        name="person-circle-outline"
        size={70}
        color="#CBD5E1"
      />

      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          color: "#64748B",
        }}
      >
        User not found
      </Text>
    </View>
  ) : null
}

      ItemSeparatorComponent={()=>

<View style={styles.divider}/>

}
        data={result ? [result] : []}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity
style={styles.contactItem}
onPress={async ()=>{

const me=getCurrentUser();

if(!me)return;

const chatId=getChatId(
me.uid,
item.uid
);

await createChatRoom(
chatId,
me.uid,
item.uid
);

navigation.navigate("Chat",{
chatId,
otherUserId:item.uid
});

}}
>

<View style={styles.avatarWrapper}>

{
item.photo
?

<Image
source={{uri:item.photo}}
style={styles.avatar}
/>

:

<View style={styles.avatar}>

<Text style={styles.avatarText}>
{item.name.charAt(0).toUpperCase()}
</Text>

</View>

}

{
item.online && (
<View style={styles.onlineDot}/>
)
}

</View>

<View style={{flex:1}}>

<Text style={styles.name}>
{item.name}
</Text>

<Text
numberOfLines={1}
style={styles.username}
>

{item.about || "Hey! I am using TruSphere."}

</Text>

</View>

<Ionicons
name="chevron-forward"
size={20}
color="#CBD5E1"
/>

</TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F8FAFC",
},

header: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  paddingHorizontal: 10,
  // paddingTop: 5,
  paddingBottom: 16,

  elevation: 2,
},

headerContent: {
  flex: 1,
  justifyContent: "center",
},

backButton: {
  width: 42,
  height: 42,
  borderRadius: 21,

  justifyContent: "center",
  alignItems: "center",

  marginRight: 12,
},

title: {
  marginTop: 18,
  fontSize: 18,
//   fontWeight: "800",
  color: "#0F172A",
  textAlign: "left",
},

logo: {
  width: 40,
  height: 48,
  resizeMode: "contain",

  marginLeft: -8,
},

subtitle: {
  marginTop: -2,
  marginLeft: 6,

  fontSize: 12,

  color: "#64748B",

  fontWeight: "600",

  letterSpacing: 0.3,
},

headerTitle:{
fontSize:30,
fontWeight:"800",
color:"#111827",
},

contactCount: {
  marginTop: 8,

  marginLeft: 6,

  fontSize: 13,

  color: "#94A3B8",

  fontWeight: "500",
},

searchContainer:{
height:56,
marginHorizontal:18,
marginTop:18,
marginBottom:16,
borderRadius:18,
backgroundColor:"#fff",
flexDirection:"row",
alignItems:"center",
paddingHorizontal:18,
elevation:2,
},

search:{
flex:1,
fontSize:16,
marginLeft:10,
},

contactItem:{
flexDirection:"row",
alignItems:"center",
paddingHorizontal:18,
paddingVertical:14,
backgroundColor:"#fff",
},

avatarWrapper:{
marginRight:14,
},

avatar:{
width:58,
height:58,
borderRadius:29,
backgroundColor:"#2563EB",
justifyContent:"center",
alignItems:"center",
},

avatarText:{
fontSize:24,
fontWeight:"700",
color:"#fff",
},

onlineDot:{
position:"absolute",
right:2,
bottom:2,
width:14,
height:14,
borderRadius:7,
backgroundColor:"#22C55E",
borderWidth:2,
borderColor:"#fff",
},

name:{
fontSize:17,
fontWeight:"700",
color:"#111827",
},

username:{
marginTop:4,
fontSize:14,
color:"#6B7280",
},

divider:{
height:1,
marginLeft:90,
backgroundColor:"#EEF2F7",
},

});