// Este sería tu nuevo archivo de configuración si usas Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB9wjp-3fYnXALBR7j4i760D58PBQy4knM",
  authDomain: "sistema-turnos-24658.firebaseapp.com",
  projectId: "sistema-turnos-24658",
  storageBucket: "sistema-turnos-24658.firebasestorage.app",
  messagingSenderId: "697570955913",
  appId: "1:697570955913:web:bef4a2486d4f2c84a0ac58",
  databaseURL: "https://sistema-turnos-24658-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);