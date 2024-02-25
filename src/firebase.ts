import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAoZVnKPayn5Lz8LFPvH6nV1EUMLombdPA",
  authDomain: "nwitter-reloaded-6b559.firebaseapp.com",
  projectId: "nwitter-reloaded-6b559",
  storageBucket: "nwitter-reloaded-6b559.appspot.com",
  messagingSenderId: "106733546961",
  appId: "1:106733546961:web:a5aa1cfa2d3db322a504f0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
