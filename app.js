// js/app.js
import { db } from './firebase-config.js';
import { getOrCreateSession, updateUserSpecialty } from './session.js';
import { loadHomePage } from './home.js';
import { loadCourses } from './courses.js';
import { loadBooks } from './books.js';
import { loadExams } from './exams.js';
import { loadDictionary } from './dictionary.js';
import { loadFlashcards } from './flashcards.js';
import { loadNotes } from './notes.js';
import { loadFavorites } from './favorites.js';
import { loadStats } from './stats.js';
import { performSearch } from './search.js';

// عناصر الواجهة
const loadingScreen = document.getElementById('loadingScreen');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const pageContent = document.getElementById('pageContent');
const pageTitle = document.getElementById('pageTitle');
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const globalSearch = document.getElementById('globalSearch');
const clearSearch = document.getElementById('clearSearch');
const searchResults = document.getElementById('searchResults');
const bottomNavItems = document.querySelectorAll('.nav-item');
const sidebarLinks = document.querySelectorAll('.sidebar-menu a[id^="link"]');
const specialtyModal = document.getElementById('specialtyModal');
const specialtyCards = document.querySelectorAll('.specialty-card');
const changeSpecialtyBtn = document.getElementById('changeSpecialtyBtn');
const sidebarSpecialty = document.getElementById('sidebarSpecialty');

// حالة التطبيق
let currentSession = null;
let currentLanguage = 'ar';
let currentPage = 'home';
let searchTimeout = null;

// تهيئة التطبيق
async function initApp() {
    console.log('🚀 بدء تشغيل المنصة الطبية...');
    
    // إخفاء شاشة التحميل بعد ثانية
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);
    
    // 1. الحصول على الجلسة
    currentSession = await getOrCreateSession();
    console.log('📱 الجلسة الحالية:', currentSession);
    
    // 2. تحميل الإعدادات المحفوظة
    loadSavedSettings();
    
    // 3. تحديث واجهة المستخدم
    updateSidebarUserInfo();
    
    // 4. تحميل الصفحة الرئيسية
    await loadPage('home');
    
    // 5. إذا كانت جلسة جديدة وليس لديه تخصص، نعرض نافذة اختيار التخصص
    if (currentSession.isNew && !currentSession.specialty) {
        setTimeout(() => {
            showSpecialtyModal();
        }, 1500);
    }
    
    // 6. التحقق من وجود تخصص محدد
    if (currentSession.specialty) {
        loadContentBySpecialty(currentSession.specialty);
    }
}

// تحميل الإعدادات المحفوظة
function loadSavedSettings() {
    // اللغة
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLanguage = savedLang;
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        languageToggle.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
    }
    
    // الوضع المظلم
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }
}

// تحديث معلومات المستخدم في القائمة الجانبية
function updateSidebarUserInfo() {
    if (currentSession?.specialty) {
        const specialtyNames = {
            medicine: 'الطب البشري',
            nursing: 'التمريض',
            pharmacy: 'الصيدلة',
            lab: 'المختبرات الطبية',
            physio: 'العلاج الطبيعي'
        };
        sidebarSpecialty.textContent = specialtyNames[currentSession.specialty] || 'زائر';
    } else {
        sidebarSpecialty.textContent = 'زائر (اختر تخصصك)';
    }
}

// إظهار نافذة اختيار التخصص
function showSpecialtyModal() {
    specialtyModal.classList.add('active');
}

// إخفاء نافذة اختيار التخصص
function hideSpecialtyModal() {
    specialtyModal.classList.remove('active');
}

// تحميل الصفحات
async function loadPage(page) {
    currentPage = page;
    
    // تحديث عنوان الصفحة
    const pageTitles = {
        home: { ar: 'الرئيسية', en: 'Home' },
        courses: { ar: 'المساقات', en: 'Courses' },
        books: { ar: 'الكتب الطبية', en: 'Medical Books' },
        exams: { ar: 'الاختبارات', en: 'Exams' },
        dictionary: { ar: 'القاموس الطبي', en: 'Medical Dictionary' },
        flashcards: { ar: 'البطاقات التعليمية', en: 'Flashcards' },
        notes: { ar: 'ملاحظاتي', en: 'My Notes' },
        favorites: { ar: 'المفضلة', en: 'Favorites' },
        stats: { ar: 'إحصائياتي', en: 'My Statistics' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        help: { ar: 'مساعدة', en: 'Help' },
        about: { ar: 'عن المنصة', en: 'About' }
    };
    
    pageTitle.textContent = pageTitles[page]?.[currentLanguage] || page;
    
    // تحديث الرابط النشط في القائمة الجانبية
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === `link${page.charAt(0).toUpperCase() + page.slice(1)}`) {
            link.classList.add('active');
        }
    });
    
    // تحديث الرابط النشط في القائمة السفلية
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // إظهار التحميل
    pageContent.innerHTML = '<div class="loader-container"><div class="spinner"></div><p>جاري التحميل...</p></div>';
    
    // تحميل المحتوى حسب الصفحة
    try {
        switch(page) {
            case 'home':
                await loadHomePage(pageContent, currentSession);
                break;
            case 'courses':
                await loadCourses(pageContent, currentSession);
                break;
            case 'books':
                await loadBooks(pageContent, currentSession);
                break;
            case 'exams':
                await loadExams(pageContent, currentSession);
                break;
            case 'dictionary':
                await loadDictionary(pageContent, currentSession);
                break;
            case 'flashcards':
                await loadFlashcards(pageContent, currentSession);
                break;
            case 'notes':
                await loadNotes(pageContent, currentSession);
                break;
            case 'favorites':
                await loadFavorites(pageContent, currentSession);
                break;
            case 'stats':
                await loadStats(pageContent, currentSession);
                break;
            case 'settings':
                pageContent.innerHTML = '<h2>إعدادات</h2><p>قريباً...</p>';
                break;
            case 'help':
                pageContent.innerHTML = '<h2>مساعدة</h2><p>قريباً...</p>';
                break;
            case 'about':
                pageContent.innerHTML = '<h2>عن المنصة</h2><p>منصة تعليمية متكاملة للطلاب في المجال الطبي</p>';
                break;
            default:
                pageContent.innerHTML = '<p class="error">الصفحة غير موجودة</p>';
        }
    } catch (error) {
        console.error('خطأ في تحميل الصفحة:', error);
        pageContent.innerHTML = '<p class="error">حدث خطأ في تحميل المحتوى</p>';
    }
}

// تحميل محتوى حسب التخصص
function loadContentBySpecialty(specialty) {
    console.log('تحميل محتوى للتخصص:', specialty);
    // يمكن إضافة منطق خاص هنا
}

// أحداث القائمة الجانبية
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// أحداث روابط القائمة الجانبية
sidebarLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = link.id.replace('link', '').toLowerCase();
        await loadPage(page);
        sidebar.classList.remove('active');
    });
});

// أحداث القائمة السفلية
bottomNavItems.forEach(item => {
    item.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        await loadPage(page);
    });
});

// تبديل الوضع المظلم
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    const isDark = document.body.classList.contains('dark-mode');
    
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// تبديل اللغة
languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    languageToggle.textContent = currentLanguage === 'ar' ? 'EN' : 'AR';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', currentLanguage);
    
    // إعادة تحميل الصفحة الحالية
    loadPage(currentPage);
});

// إظهار/إخفاء البحث
searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
        globalSearch.focus();
    }
});

// البحث المباشر
globalSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // إظهار/إخفاء زر المسح
    if (query.length > 0) {
        clearSearch.classList.remove('hidden');
    } else {
        clearSearch.classList.add('hidden');
        searchResults.innerHTML = '';
    }
    
    // تأخير البحث لمنع كثرة الطلبات
    clearTimeout(searchTimeout);
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const results = await performSearch(query, currentLanguage);
        displaySearchResults(results);
    }, 500);
});

// مسح البحث
clearSearch.addEventListener('click', () => {
    globalSearch.value = '';
    clearSearch.classList.add('hidden');
    searchResults.innerHTML = '';
    globalSearch.focus();
});

// عرض نتائج البحث
function displaySearchResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">لا توجد نتائج</div>';
        return;
    }
    
    let html = '';
    results.forEach(result => {
        html += `
            <div class="search-result-item" data-type="${result.type}" data-id="${result.id}">
                <i class="fas ${result.icon}"></i>
                <div>
                    <div class="result-title">${result.title}</div>
                    <div class="result-subtitle">${result.subtitle || ''}</div>
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    // إضافة أحداث للنقر على النتائج
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const id = item.dataset.id;
            handleSearchResultClick(type, id);
            searchBar.classList.add('hidden');
            globalSearch.value = '';
            searchResults.innerHTML = '';
        });
    });
}

// معالجة النقر على نتيجة البحث
function handleSearchResultClick(type, id) {
    console.log('نقر على نتيجة:', type, id);
    // هنا يمكن إضافة منطق الانتقال إلى العنصر المحدد
}

// اختيار التخصص
specialtyCards.forEach(card => {
    card.addEventListener('click', async () => {
        const specialty = card.dataset.specialty;
        
        // تحديث التخصص في الجلسة
        if (currentSession) {
            const success = await updateUserSpecialty(currentSession.sessionId, specialty);
            if (success) {
                currentSession.specialty = specialty;
                updateSidebarUserInfo();
                hideSpecialtyModal();
                
                // إعادة تحميل الصفحة الحالية بالمحتوى المخصص
                loadPage(currentPage);
                
                // رسالة ترحيب
                alert(`مرحباً بك في تخصص ${card.querySelector('span').textContent}`);
            }
        }
    });
});

// إغلاق النوافذ المنبثقة
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('active');
    });
});

// تغيير التخصص من القائمة الجانبية
if (changeSpecialtyBtn) {
    changeSpecialtyBtn.addEventListener('click', () => {
        showSpecialtyModal();
    });
}

// منع إغلاق النافذة عند النقر على المحتوى
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', initApp);

// دوال مساعدة للترجمة (تصدير للاستخدام في الملفات الأخرى)
export function getTranslation(key) {
    const translations = {
        home: { ar: 'الرئيسية', en: 'Home' },
        courses: { ar: 'المساقات', en: 'Courses' },
        books: { ar: 'الكتب', en: 'Books' },
        exams: { ar: 'الاختبارات', en: 'Exams' },
        dictionary: { ar: 'القاموس الطبي', en: 'Medical Dictionary' },
        flashcards: { ar: 'البطاقات التعليمية', en: 'Flashcards' },
        notes: { ar: 'ملاحظاتي', en: 'My Notes' },
        favorites: { ar: 'المفضلة', en: 'Favorites' },
        stats: { ar: 'إحصائياتي', en: 'My Statistics' },
        loading: { ar: 'جاري التحميل...', en: 'Loading...' },
        noData: { ar: 'لا توجد بيانات', en: 'No data available' },
        error: { ar: 'حدث خطأ', en: 'An error occurred' }
    };
    
    return translations[key]?.[currentLanguage] || key;
}

export { currentLanguage, currentSession };
