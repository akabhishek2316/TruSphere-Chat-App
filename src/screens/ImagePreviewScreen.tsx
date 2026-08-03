import React, { useState } from "react";
import { uploadImage } from "../services/cloudinary";
import {
  
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,

} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";

import { update } from "firebase/database";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../navigation/AppNavigator";

import { Colors } from "../theme/colors";



import {
  sendMessage,
  updateMessage,
  updateMessageStatus,
  updateLastMessage,
} from "../services/chatService";

import { getCurrentUser } from "../services/authService";

import uuid from "react-native-uuid";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "ImagePreview"
  >;

type RouteProps =
  RouteProp<
    RootStackParamList,
    "ImagePreview"
  >;

export default function ImagePreviewScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<RouteProps>();

  const {
  imageUri,
  chatId,
  otherUserId,
} = route.params;

const currentUserId =
  getCurrentUser()?.uid ?? "";

  const [caption, setCaption] =
    useState("");

    const [sending, setSending] = useState(false);

  return (

     <SafeAreaView style={{ flex: 1 }}>


      <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 18}
            >
    
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.bottom}>

        <TextInput
          placeholder="Add a caption..."
          placeholderTextColor="#999"
          value={caption}
          onChangeText={setCaption}
          style={styles.input}
          underlineColorAndroid="transparent"
  selectionColor="#2563EB"
  cursorColor="#2563EB"
        />

<TouchableOpacity
    style={[
      styles.send,
      sending && { opacity: 0.5 }
    ]}
    disabled={sending}
    onPress={async () => {

      if (sending) return;

      setSending(true);

      const clientId = uuid.v4().toString();

      let firebaseId = "";

      const timestamp = Date.now();

      try {

        firebaseId = await sendMessage(chatId,{
          clientId,
          type:"image",
          image:"",
          localUri:imageUri,
          caption,
          sender:currentUserId,
          receiver:otherUserId,
          timestamp,
          status:"sending",
          uploadCompleted:false,
        });

        navigation.goBack();

        const imageUrl =
          await uploadImage(imageUri);

        await updateMessage(
          chatId,
          firebaseId,
          {
            image:imageUrl,
            localUri:"",
            status:"sent",
            uploadCompleted:true,
            caption,
          }
        );

        await updateLastMessage(chatId,{
          type:"image",
          sender:currentUserId,
          timestamp,
        });

      } catch(e){

        if(firebaseId){
          await updateMessageStatus(
            chatId,
            firebaseId,
            "failed"
          );
        }

      } finally{
        setSending(false);
      }

    }}
>
          <Ionicons
            name="send"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

      </View>
      </KeyboardAvoidingView>
     
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000",
  },

  image:{
    flex:1,
    width:"100%",
  },

  bottom:{
    flexDirection:"row",
    alignItems:"center",
    padding:15,
    backgroundColor:"#111827",
  },

  input:{
    flex:1,
    backgroundColor:"#fff",
    borderRadius:25,
    paddingHorizontal:18,
    height:48,
  },

  send:{
    width:52,
    height:52,
    borderRadius:26,
    marginLeft:12,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:Colors.primary,
  }

});