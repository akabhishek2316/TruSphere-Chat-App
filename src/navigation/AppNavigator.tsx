import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";

import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CalculatorLockScreen from "../screens/CalculatorLockScreen";
import SecretScreen from "../screens/SecretScreen";
import AboutScreen from "../screens/AboutScreen";
import ClearChatScreen from "../screens/ClearChatScreen";
import ChatListScreen from "../screens/ChatListScreen";
import { UserId } from "../types/chat";
import NewChatScreen from "../screens/NewChatScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SearchUserScreen from "../screens/SearchUserScreen";
import ImagePreviewScreen from "../screens/ImagePreviewScreen";
import ImageViewerScreen from "../screens/ImageViewerScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import ProfilePhotoScreen from "../screens/ProfilePhotoScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import BlockedContactsScreen from "../screens/BlockedContactsScreen";

export type RootStackParamList = {
  Splash: undefined;
  Setup: undefined;
  ImageViewer:{
    image:string;
};
  Calculator: undefined;
  Secret: undefined;

  ChatList: undefined;

  Chat: {
  chatId: string;
  otherUserId: UserId;

  imageUri?: string;
  caption?: string;
};

  ImagePreview:{
    chatId:string;
    otherUserId:string;

    imageUri:string;

    caption?:string;
}
  
  Profile: undefined;
  Settings: undefined;
  Privacy: undefined;
  ClearChat: undefined;
  About: undefined;
  NewChat: undefined;
  Login: undefined;
Register: undefined;
SearchUser: undefined;
ForgotPassword: undefined;
ProfilePhoto: {
    photo: string;
};
BlockedContacts:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
  initialRouteName="Splash"
  screenOptions={{ headerShown: false }}
>

  <Stack.Screen
    name="Splash"
    component={SplashScreen}
  />

  

  <Stack.Screen
  name="SearchUser"
  component={SearchUserScreen}
/>

  <Stack.Screen
    name="Calculator"
    component={CalculatorLockScreen}
  />

  <Stack.Screen
  name="Login"
  component={LoginScreen}
/>

<Stack.Screen
  name="Register"
  component={RegisterScreen}
/>

  <Stack.Screen
    name="Secret"
    component={SecretScreen}
  />

  

  <Stack.Screen
    name="ChatList"
    component={ChatListScreen}
  />

  <Stack.Screen
  name="NewChat"
  component={NewChatScreen}
/>

  <Stack.Screen
    name="Chat"
    component={ChatScreen}
  />

  <Stack.Screen
    name="Profile"
    component={ProfileScreen}
  />

  <Stack.Screen
    name="Settings"
    component={SettingsScreen}
  />

  <Stack.Screen
    name="ClearChat"
    component={ClearChatScreen}
  />

  <Stack.Screen
    name="About"
    component={AboutScreen}
  />

  <Stack.Screen
    name="ImagePreview"
    component={ImagePreviewScreen}
/>

<Stack.Screen
  name="ImageViewer"
  component={ImageViewerScreen}
/>

<Stack.Screen
  name="Privacy"
  component={PrivacyScreen}
/>

<Stack.Screen
  name="ProfilePhoto"
  component={ProfilePhotoScreen}
  options={{
    headerShown: false,
    animation: "fade",
  }}
/>

<Stack.Screen
  name="ForgotPassword"
  component={ForgotPasswordScreen}
/>

<Stack.Screen
  name="BlockedContacts"
  component={BlockedContactsScreen}
/>

</Stack.Navigator>
    </NavigationContainer>
  );
}