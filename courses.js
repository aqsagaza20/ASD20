// js/courses.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function loadCourses(container, session) {
    try {
        const specialty = session?.specialty || null;
        
        let html = `
            <div class="page-header">
                <h1>المساقات الطبية</h1>
                <p>تصفح جميع المساقات المتاحة حسب تخصصك</p>
            </div>
            
            <div class="filter-bar">
                <select id="specialtyFilter" class="filter-select">
                    <option value="">جميع التخصصات</option>
                    <option value="medicine" ${specialty === 'medicine' ? 'selected' : ''}>الطب البشري</option>
                    <option value="nursing" ${specialty === 'nursing' ? 'selected' : ''}>التمريض</option>
                    <option value="pharmacy" ${specialty === 'pharmacy' ? 'selected' : ''}>الصيدلة</option>
                    <option value="lab" ${specialty === 'lab' ? 'selected' : ''}>المختبرات</option>
                    <option value="physio" ${specialty === 'physio' ? 'selected' : ''}>العلاج الطبيعي</option>
                </select>
                
                <input type="text" id="courseSearch" placeholder="ابحث عن مساق..." class="search-input">
            </div>
            
            <div id="coursesContainer" class="card-grid">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>جاري تحميل المساقات...</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // تحميل المساقات
        await loadCoursesList(specialty);
        
        // إضافة أحداث الفلاتر
        document.getElementById('specialtyFilter').addEventListener('change', filterCourses);
        document.getElementById('courseSearch').addEventListener('input', filterCourses);
        
    } catch (error) {
        console.error('خطأ في تحميل صفحة المساقات:', error);
        container.innerHTML = '<p class="error">حدث خطأ في تحميل المساقات</p>';
    }
}

async function loadCoursesList(specialtyFilter = null) {
    try {
        const coursesRef = collection(db, 'courses');
        let q;
        
        if (specialtyFilter) {
            q = query(coursesRef, where('specialtyId', '==', specialtyFilter));
        } else {
            q = query(coursesRef);
        }
        
        const querySnapshot = await getDocs(q);
        const coursesContainer = document.getElementById('coursesContainer');
        
        if (querySnapshot.empty) {
            coursesContainer.innerHTML = '<p class="no-data">لا توجد مساقات متاحة حالياً</p>';
            return;
        }
        
        let html = '';
        const courses = [];
        
        querySnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        
        // ترتيب حسب الترتيب المحدد
        courses.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        courses.forEach(course => {
            const title = course.title?.['ar'] || 'عنوان المساق';
            const desc = course.description?.['ar'] || '';
            const specialtyNames = {
                medicine: 'الطب',
                nursing: 'التمريض',
                pharmacy: 'الصيدلة',
                lab: 'المختبرات',
                physio: 'العلاج الطبيعي'
            };
            const specialtyName = specialtyNames[course.specialtyId] || '';
            
            html += `
                <div class="card" data-course-id="${course.id}" data-specialty="${course.specialtyId || ''}" data-title="${title}">
                    <img src="${course.imageUrl || 'assets/images/default-course.jpg'}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/300x150/007bff/ffffff?text=Course'">
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-subtitle">${desc.substring(0, 60)}...</p>
                        <span class="specialty-badge">${specialtyName}</span>
                    </div>
                    <div class="card-footer">
                        <button class="btn-view" onclick="viewCourse('${course.id}')"><i class="fas fa-eye"></i> عرض</button>
                    </div>
                </div>
            `;
        });
        
        coursesContainer.innerHTML = html;
        
        // حفظ البيانات للفلترة
        window.allCourses = courses;
        
    } catch (error) {
        console.error('خطأ في جلب المساقات:', error);
        document.getElementById('coursesContainer').innerHTML = '<p class="error">حدث خطأ في تحميل المساقات</p>';
    }
}

function filterCourses() {
    const specialty = document.getElementById('specialtyFilter').value;
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    
    const cards = document.querySelectorAll('#coursesContainer .card');
    
    cards.forEach(card => {
        const cardSpecialty = card.dataset.specialty || '';
        const cardTitle = card.dataset.title || '';
        
        const matchesSpecialty = !specialty || cardSpecialty === specialty;
        const matchesSearch = !searchTerm || cardTitle.includes(searchTerm);
        
        if (matchesSpecialty && matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// دالة عرض المساق
window.viewCourse = async (courseId) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (courseDoc.exists()) {
            const course = courseDoc.data();
            
            // إنشاء نافذة منبثقة لعرض تفاصيل المساق
            const modal = document.createElement('div');
            modal.className = 'modal active';
            
            modal.innerHTML = `
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>${course.title?.['ar'] || 'تفاصيل المساق'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="course-detail-image">
                            <img src="${course.imageUrl || 'assets/images/default-course.jpg'
