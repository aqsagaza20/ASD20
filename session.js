// js/session.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// دالة لإنشاء بصمة متصفح فريدة
function generateFingerprint() {
    const nav = navigator;
    const screen = window.screen;
    
    const fingerprintData = [
        nav.userAgent,
        nav.language,
        nav.platform,
        screen.colorDepth,
        `${screen.width}x${screen.height}`,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || 'unknown',
        nav.maxTouchPoints || 0,
        !!nav.cookieEnabled,
        !!window.indexedDB,
        !!window.localStorage,
        !!window.sessionStorage
    ].join('|');
    
    // تحويل إلى base64
    return btoa(encodeURIComponent(fingerprintData)).substring(0, 60);
}

// دالة لإنشاء معرف جلسة جديد
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// حفظ الجلسة محلياً
function saveSessionLocally(sessionId, fingerprint, specialty = null) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365); // سنة كاملة
    
    const sessionData = {
        id: sessionId,
        fingerprint: fingerprint,
        specialty: specialty,
        expires: expiryDate.toISOString(),
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('medical_session', JSON.stringify(sessionData));
    return sessionData;
}

// جلب الجلسة المحلية
function getLocalSession() {
    try {
        const sessionStr = localStorage.getItem('medical_session');
        if (!sessionStr) return null;
        
        const session = JSON.parse(sessionStr);
        
        // التحقق من الصلاحية
        if (new Date(session.expires) < new Date()) {
            localStorage.removeItem('medical_session');
            return null;
        }
        
        return session;
    } catch (e) {
        console.error('خطأ في قراءة الجلسة المحلية', e);
        return null;
    }
}

// الدالة الرئيسية - الحصول على الجلسة أو إنشاء جديدة
export async function getOrCreateSession() {
    let localSession = getLocalSession();
    const currentFingerprint = generateFingerprint();
    
    // إذا وجدت جلسة محلية صالحة
    if (localSession) {
        // التحقق من تطابق البصمة
        if (localSession.fingerprint === currentFingerprint) {
            // محاولة جلب البيانات من Firebase
            try {
                const sessionRef = doc(db, 'sessions', localSession.id);
                const sessionDoc = await getDoc(sessionRef);
                
                if (sessionDoc.exists()) {
                    const data = sessionDoc.data();
                    
                    // تحديث آخر نشاط
                    await updateDoc(sessionRef, {
                        lastActive: new Date()
                    });
                    
                    return {
                        sessionId: localSession.id,
                        isNew: false,
                        data: data,
                        specialty: data.specialty || null
                    };
                } else {
                    // الجلسة موجودة محلياً لكن ليس في Firebase
                    return await createNewSession(localSession.id, currentFingerprint, localSession.specialty);
                }
            } catch (e) {
                console.error('خطأ في الاتصال بـ Firebase', e);
                // إذا كان هناك خطأ، نستخدم البيانات المحلية
                return {
                    sessionId: localSession.id,
                    isNew: false,
                    localOnly: true,
                    specialty: localSession.specialty || null
                };
            }
        } else {
            // البصمة مختلفة - ننشئ جلسة جديدة
            localStorage.removeItem('medical_session');
            return await createNewSession(null, currentFingerprint);
        }
    } else {
        // لا توجد جلسة محلية - ننشئ جديدة
        return await createNewSession(null, currentFingerprint);
    }
}

// إنشاء جلسة جديدة
async function createNewSession(existingId = null, fingerprint, initialSpecialty = null) {
    const sessionId = existingId || generateSessionId();
    
    const today = new Date().toDateString();
    
    const sessionData = {
        sessionId: sessionId,
        fingerprint: fingerprint,
        createdAt: new Date(),
        lastActive: new Date(),
        specialty: initialSpecialty,
        settings: {
            language: 'ar',
            theme: 'light'
        },
        stats: {
            examsTaken: 0,
            questionsSolved: 0,
            averageScore: 0,
            streak: 0,
            lastVisitDate: today,
            visitCount: 1
        }
    };
    
    try {
        // حفظ في Firebase
        const sessionRef = doc(db, 'sessions', sessionId);
        await setDoc(sessionRef, sessionData);
        
        // حفظ محلياً
        saveSessionLocally(sessionId, fingerprint, initialSpecialty);
        
        return {
            sessionId: sessionId,
            isNew: true,
            data: sessionData,
            specialty: initialSpecialty
        };
    } catch (e) {
        console.error('خطأ في حفظ الجلسة في Firebase', e);
        // حفظ محلياً فقط
        saveSessionLocally(sessionId, fingerprint, initialSpecialty);
        return {
            sessionId: sessionId,
            isNew: true,
            localOnly: true,
            data: sessionData,
            specialty: initialSpecialty
        };
    }
}

// تحديث تخصص المستخدم
export async function updateUserSpecialty(sessionId, specialty) {
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        await updateDoc(sessionRef, {
            specialty: specialty,
            lastActive: new Date()
        });
        
        // تحديث البيانات المحلية
        const localSession = getLocalSession();
        if (localSession) {
            localSession.specialty = specialty;
            localStorage.setItem('medical_session', JSON.stringify(localSession));
        }
        
        return true;
    } catch (e) {
        console.error('خطأ في تحديث التخصص', e);
        return false;
    }
}

// تحديث إحصائيات المستخدم
export async function updateUserStats(sessionId, statsUpdate) {
    try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const sessionDoc = await getDoc(sessionRef);
        
        if (sessionDoc.exists()) {
            const currentStats = sessionDoc.data().stats || {};
            const updatedStats = { ...currentStats, ...statsUpdate };
            
            await updateDoc(sessionRef, {
                stats: updatedStats,
                lastActive: new Date()
            });
        }
    } catch (e) {
        console.error('خطأ في تحديث الإحصائيات', e);
    }
}

// تصدير الدوال المساعدة
export { generateFingerprint };
