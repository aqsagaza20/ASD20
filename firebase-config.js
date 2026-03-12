// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// إعدادات Firebase الخاصة بمشروع NADER
// تم نسخها من Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyOj7tZ67zeIARUo0P4z___________________", // أكمل القيمة من الموقع
    authDomain: "nader-c1691.firebaseapp.com",
    databaseURL: "https://nader-c1691.firebaseio.com", // لاحظ التعديل هنا
    projectId: "nader-c1691",
    storageBucket: "nader-c1691.appspot.com", // لاحظ التعديل هنا (حذفت .firebase)
    messagingSenderId: "455346952959",
    appId: "1:456346892595:web:8e4afdc7dcd22d509690db8a"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير الخدمات التي سنستخدمها
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ تم الاتصال بـ Firebase بنجاح');
