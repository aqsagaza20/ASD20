// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// إعدادات Firebase الخاصة بك (نسختها من موقع Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyD70tZ67zeIARlOzOfP4zALbPjfmef31E8",
    authDomain: "nader-c1691.firebaseapp.com",
    projectId: "nader-c1691",
    storageBucket: "nader-c1691.firebasestorage.app",
    messagingSenderId: "455340592959",
    appId: "1:455340592959:web:8e4adc7dcd22d509690d8a",
    measurementId: "G-0WB2GLZGCL"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات التي سنستخدمها
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ تم الاتصال بـ Firebase بنجاح');
