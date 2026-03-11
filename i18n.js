import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Common
      'app.name': 'MedMaster',
      'search': 'Search',
      'courses': 'Courses',
      'books': 'Books',
      'questions': 'Questions Bank',
      'dictionary': 'Medical Dictionary',
      'flashcards': 'Flashcards',
      'aiAssistant': 'AI Assistant',
      'profile': 'Profile',
      'settings': 'Settings',
      'logout': 'Logout',
      'login': 'Login',
      'register': 'Register',
      
      // Specialties
      'medicine': 'Medicine',
      'nursing': 'Nursing',
      'pharmacy': 'Pharmacy',
      'lab': 'Medical Laboratory',
      'physiotherapy': 'Physiotherapy',
      
      // Courses
      'anatomy': 'Anatomy',
      'physiology': 'Physiology',
      'biochemistry': 'Biochemistry',
      'pharmacology': 'Pharmacology',
      'microbiology': 'Microbiology',
      'pathology': 'Pathology',
      
      // Home page
      'welcome': 'Welcome to MedMaster',
      'subtitle': 'Your comprehensive medical education platform',
      'stats': 'Platform Statistics',
      'students': 'Students',
      'courses.count': 'Courses',
      'questions.count': 'Questions',
      'terms.count': 'Medical Terms',
      
      // Questions
      'select.course': 'Select Course',
      'select.questions.count': 'Number of Questions',
      'start.quiz': 'Start Quiz',
      'submit.answers': 'Submit Answers',
      'correct.answers': 'Correct Answers',
      'wrong.answers': 'Wrong Answers',
      'score': 'Score',
      'explanation': 'Explanation',
      
      // AI Assistant
      'ask.question': 'Ask a medical question...',
      'ask.button': 'Ask',
      'thinking': 'Thinking...',
      'error.message': 'An error occurred. Please try again.',
      
      // Books
      'read.book': 'Read Book',
      'download.book': 'Download PDF',
      'add.to.favorites': 'Add to Favorites',
      'remove.from.favorites': 'Remove from Favorites',
      'search.in.book': 'Search in Book',
      
      // Dictionary
      'search.term': 'Search medical term...',
      'term': 'Term',
      'translation': 'Translation',
      'description': 'Description',
      
      // Notes
      'add.note': 'Add Note',
      'edit.note': 'Edit Note',
      'delete.note': 'Delete Note',
      'save.note': 'Save Note',
      'notes': 'Notes',
      
      // Dark Mode
      'dark.mode': 'Dark Mode',
      'light.mode': 'Light Mode'
    }
  },
  ar: {
    translation: {
      // Common
      'app.name': 'ميد ماستر',
      'search': 'بحث',
      'courses': 'المساقات',
      'books': 'الكتب',
      'questions': 'بنك الأسئلة',
      'dictionary': 'المصطلحات الطبية',
      'flashcards': 'بطاقات الدراسة',
      'aiAssistant': 'المساعد الذكي',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات',
      'logout': 'تسجيل الخروج',
      'login': 'تسجيل الدخول',
      'register': 'إنشاء حساب',
      
      // Specialties
      'medicine': 'الطب البشري',
      'nursing': 'التمريض',
      'pharmacy': 'الصيدلة',
      'lab': 'المختبرات الطبية',
      'physiotherapy': 'العلاج الطبيعي',
      
      // Courses
      'anatomy': 'علم التشريح',
      'physiology': 'علم وظائف الأعضاء',
      'biochemistry': 'الكيمياء الحيوية',
      'pharmacology': 'علم الأدوية',
      'microbiology': 'علم الأحياء الدقيقة',
      'pathology': 'علم الأمراض',
      
      // Home page
      'welcome': 'مرحباً بك في ميد ماستر',
      'subtitle': 'منصتك الشاملة للتعليم الطبي',
      'stats': 'إحصائيات المنصة',
      'students': 'الطلاب',
      'courses.count': 'مساق',
      'questions.count': 'سؤال',
      'terms.count': 'مصطلح طبي',
      
      // Questions
      'select.course': 'اختر المساق',
      'select.questions.count': 'عدد الأسئلة',
      'start.quiz': 'ابدأ الاختبار',
      'submit.answers': 'تسليم الإجابات',
      'correct.answers': 'الإجابات الصحيحة',
      'wrong.answers': 'الإجابات الخاطئة',
      'score': 'النتيجة',
      'explanation': 'الشرح',
      
      // AI Assistant
      'ask.question': 'اسأل سؤالاً طبياً...',
      'ask.button': 'اسأل',
      'thinking': 'جاري التفكير...',
      'error.message': 'حدث خطأ. الرجاء المحاولة مرة أخرى.',
      
      // Books
      'read.book': 'قراءة الكتاب',
      'download.book': 'تحميل PDF',
      'add.to.favorites': 'أضف إلى المفضلة',
      'remove.from.favorites': 'إزالة من المفضلة',
      'search.in.book': 'بحث داخل الكتاب',
      
      // Dictionary
      'search.term': 'ابحث عن مصطلح طبي...',
      'term': 'المصطلح',
      'translation': 'الترجمة',
      'description': 'الشرح',
      
      // Notes
      'add.note': 'أضف ملاحظة',
      'edit.note': 'تعديل الملاحظة',
      'delete.note': 'حذف الملاحظة',
      'save.note': 'حفظ الملاحظة',
      'notes': 'الملاحظات',
      
      // Dark Mode
      'dark.mode': 'الوضع الليلي',
      'light.mode': 'الوضع النهاري'
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
