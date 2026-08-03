import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import { getChatId } from "../types/utils/chatUtils";
import { createChatRoom } from "../services/chatService";
import { Ionicons } from "@expo/vector-icons";

export default function SearchUserScreen() {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const current = getCurrentUser();

    const list: any[] = await getAllUsers();

    setUsers(
      list.filter(user => user.uid !== current?.uid)
    );
  }

  const filtered = users.filter(user => {
    const text = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(text) ||
      user.username.toLowerCase().includes(text)
    );
  });

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

  <View style={{ flex: 1 }}>
    <Text style={styles.headerTitle}>
      New Chat
    </Text>

    <Text style={styles.contactCount}>
      {filtered.length} Contacts
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
placeholder="Search people..."
placeholderTextColor="#94A3B8"
value={search}
onChangeText={setSearch}
style={styles.search}
underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
/>

</View>

      <FlatList

      ItemSeparatorComponent={()=>

<View style={styles.divider}/>

}
        data={filtered}
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

header:{
flexDirection:"row",
alignItems:"center",
paddingHorizontal:20,
paddingTop:15,
paddingBottom:20,
backgroundColor:"#fff",
elevation:2,
},

backButton:{
width:42,
height:42,
borderRadius:21,
justifyContent:"center",
alignItems:"center",
marginRight:12,
},

headerTitle:{
fontSize:30,
fontWeight:"800",
color:"#111827",
},

contactCount:{
marginTop:3,
fontSize:14,
color:"#64748B",
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