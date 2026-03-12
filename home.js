// js/home.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function loadHomePage(container, session) {
    try {
        const specialty = session?.specialty || null;
        
        let html = `
            <div class="welcome-section">
                <h1>مرحباً بك في المنصة الطبية</h1>
                <p>منصتك الشاملة للتعلم والتدريب في المجال الطبي</p>
            </div>
        `;
        
        // جلب أحدث المساقات
        html += await getLatestCourses(specialty);
        
        // جلب الكتب الأكثر قراءة
        html += await getPopularBooks(specialty);
        
        // جلب أحدث المصطلحات
        html += await getRecentTerms();
        
        // عرض الإحصائيات السريعة
        if (session?.stats) {
            html += getQuickStats(session.stats);
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في تحميل الصفحة الرئيسية:', error);
        container.innerHTML = '<p class="error">حدث خطأ في تحميل الصفحة الرئيسية</p>';
    }
}

async function getLatestCourses(specialty) {
    try {
        const coursesRef = collection(db, 'courses');
        let q;
        
        if (specialty) {
            q = query(coursesRef, where('specialtyId', '==', specialty), limit(6));
        } else {
            q = query(coursesRef, limit(6));
        }
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return '';
        }
        
        let html = `
            <section class="home-section">
                <div class="section-header">
                    <h2><i class="fas fa-book-open"></i> أحدث المساقات</h2>
                    <a href="#" onclick="loadPage('courses')" class="view-all">عرض الكل <i class="fas fa-arrow-left"></i></a>
                </div>
                <div class="card-grid">
        `;
        
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            const title = course.title?.['ar'] || 'عنوان المساق';
            const desc = course.description?.['ar'] || '';
            
            html += `
                <div class="card" onclick="showCourseDetails('${doc.id}')">
                    <img src="${course.imageUrl || 'assets/images/default-course.jpg'}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/300x150/007bff/ffffff?text=Course'">
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-subtitle">${desc.substring(0, 50)}...</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div></section>';
        return html;
        
    } catch (error) {
        console.error('خطأ في جلب المساقات:', error);
        return '';
    }
}

async function getPopularBooks(specialty) {
    try {
        const booksRef = collection(db, 'books');
        let q;
        
        if (specialty) {
            q = query(booksRef, where('specialtyId', '==', specialty), limit(6));
        } else {
            q = query(booksRef, limit(6));
        }
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return '';
        }
        
        let html = `
            <section class="home-section">
                <div class="section-header">
                    <h2><i class="fas fa-book"></i> الكتب الموصى بها</h2>
                    <a href="#" onclick="loadPage('books')" class="view-all">عرض الكل <i class="fas fa-arrow-left"></i></a>
                </div>
                <div class="card-grid">
        `;
        
        querySnapshot.forEach((doc) => {
            const book = doc.data();
            const title = book.title?.['ar'] || 'عنوان الكتاب';
            const author = book.author || '';
            
            html += `
                <div class="card" onclick="showBookDetails('${doc.id}')">
                    <img src="${book.coverUrl || 'assets/images/default-book.jpg'}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/300x150/28a745/ffffff?text=Book'">
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-subtitle">${author}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div></section>';
        return html;
        
    } catch (error) {
        console.error('خطأ في جلب الكتب:', error);
        return '';
    }
}

async function getRecentTerms() {
    try {
        const termsRef = collection(db, 'terms');
        const q = query(termsRef, limit(8));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return '';
        }
        
        let html = `
            <section class="home-section">
                <div class="section-header">
                    <h2><i class="fas fa-language"></i> أحدث المصطلحات الطبية</h2>
                    <a href="#" onclick="loadPage('dictionary')" class="view-all">عرض الكل <i class="fas fa-arrow-left"></i></a>
                </div>
                <div class="terms-cloud">
        `;
        
        querySnapshot.forEach((doc) => {
            const term = doc.data();
            const termText = term.term?.['ar'] || term.term?.['en'] || 'مصطلح';
            
            html += `
                <span class="term-tag" onclick="showTermDetails('${doc.id}')">${termText}</span>
            `;
        });
        
        html += '</div></section>';
        return html;
        
    } catch (error) {
        console.error('خطأ في جلب المصطلحات:', error);
        return '';
    }
}

function getQuickStats(stats) {
    return `
        <section class="home-section">
            <h2><i class="fas fa-chart-line"></i> إحصائياتك السريعة</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-pencil-alt"></i>
                    <div class="stat-number">${stats.examsTaken || 0}</div>
                    <div class="stat-label">اختبارات</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-question-circle"></i>
                    <div class="stat-number">${stats.questionsSolved || 0}</div>
                    <div class="stat-label">سؤال محلول</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-percent"></i>
                    <div class="stat-number">${stats.averageScore || 0}%</div>
                    <div class="stat-label">متوسط النتيجة</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-fire"></i>
                    <div class="stat-number">${stats.streak || 0}</div>
                    <div class="stat-label">أيام متتالية</div>
                </div>
            </div>
        </section>
    `;
}

// دوال مساعدة للعرض (سيتم استدعاؤها من HTML)
window.showCourseDetails = (courseId) => {
    console.log('عرض تفاصيل المساق:', courseId);
    // يمكن إضافة نافذة منبثقة أو الانتقال لصفحة التفاصيل
};

window.showBookDetails = (bookId) => {
    console.log('عرض تفاصيل الكتاب:', bookId);
    // فتح نافذة عرض الكتاب
    const modal = document.getElementById('bookViewerModal');
    const title = document.getElementById('bookViewerTitle');
    const frame = document.getElementById('bookViewerFrame');
    
    title.textContent = 'عرض الكتاب';
    frame.src = `https://drive.google.com/viewerng/viewer?embedded=true&url=...`; // ضع رابط الكتاب هنا
    
    modal.classList.add('active');
};

window.showTermDetails = (termId) => {
    console.log('عرض تفاصيل المصطلح:', termId);
    // الانتقال لصفحة القاموس مع عرض المصطلح
    loadPage('dictionary');
};
