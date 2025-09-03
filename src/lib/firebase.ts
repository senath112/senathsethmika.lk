
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTppb1WVIZes6Lj_aHHzSwk77LWF2Gvj8",
  authDomain: "synapse-learning-xpw9a.firebaseapp.com",
  projectId: "synapse-learning-xpw9a",
  storageBucket: "synapse-learning-xpw9a.appspot.com",
  messagingSenderId: "413572779495",
  appId: "1:413572779495:web:86b1b59ecae1915aa7c142"
};

// Initialize Firebase for Singleton Pattern
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    googleProvider.setCustomParameters({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
}


export { app, db, auth, storage, googleProvider };
