// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: It's recommended to move this configuration to environment variables
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTppb1WVIZes6Lj_aHHzSwk77LWF2Gvj8",
  authDomain: "synapse-learning-xpw9a.firebaseapp.com",
  databaseURL: "https://synapse-learning-xpw9a-default-rtdb.firebaseio.com",
  projectId: "synapse-learning-xpw9a",
  storageBucket: "synapse-learning-xpw9a.appspot.com",
  messagingSenderId: "413572779495",
  appId: "1:413572779495:web:86b1b59ecae1915aa7c142"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
