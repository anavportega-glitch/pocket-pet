
import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEdn4d8agXd9920H48VgC4gIPBcEnkMgU",
  authDomain: "pocket-pet-c1c04.firebaseapp.com",
  projectId: "pocket-pet-c1c04",
  storageBucket: "pocket-pet-c1c04.firebasestorage.app",
  messagingSenderId: "201225464988",
  appId: "1:201225464988:web:4551ef42474ed0fbce1159",
  measurementId: "G-3HESS607KN"
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
