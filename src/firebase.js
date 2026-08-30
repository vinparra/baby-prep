import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIj8Tq1tHwKPPUZepECvnmEVYsm9EATtw",
  authDomain: "luckyplanning-95a95.firebaseapp.com",
  projectId: "luckyplanning-95a95",
  storageBucket: "luckyplanning-95a95.firebasestorage.app",
  messagingSenderId: "845670247844",
  appId: "1:845670247844:web:1e906eef1bbe8e91b76531"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);