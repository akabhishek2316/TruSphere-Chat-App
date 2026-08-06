import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// JS SDK app (Realtime Database)
const jsApp = initializeApp(firebaseConfig);

// Native app (already initialized by google-services.json)
const nativeApp = getApp();

export const database = getDatabase(jsApp);
export const auth = getAuth(nativeApp);

export default nativeApp;

// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";

// import AsyncStorage from "@react-native-async-storage/async-storage";

// import {
//   initializeAuth,
//   getReactNativePersistence,
// } from "firebase/auth";



// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL!,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId:
//     process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
// };

// const app = initializeApp(firebaseConfig);

// export const database = getDatabase(app);

// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export default app;