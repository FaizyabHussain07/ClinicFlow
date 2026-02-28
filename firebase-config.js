// ============================================================
// firebase-config.js - Firebase Configuration
// ClinicFlow – Realtime Database Version
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration – clinic-app-5a960
export const firebaseConfig = {
    apiKey: "AIzaSyDb9KGgn3THlM_5YLcFiD0zkApepQgJv6A",
    authDomain: "clinic-app-5a960.firebaseapp.com",
    projectId: "clinic-app-5a960",
    databaseURL: "https://clinic-app-5a960-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "clinic-app-5a960.firebasestorage.app",
    messagingSenderId: "267825681091",
    appId: "1:267825681091:web:8b106d3b8a90f04ca10876"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Export Auth + Realtime Database instances
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// ============================================================
// CLOUDINARY CONFIGURATION
// ⚠️ REPLACE WITH YOUR ACTUAL CLOUDINARY CONFIG
// ============================================================
export const CLOUDINARY_CONFIG = {
    cloudName: "dxg7emkw9",
    uploadPreset: "clinic-pdf",
    apiUrl: "https://api.cloudinary.com/v1_1/dxg7emkw9/upload"
};
