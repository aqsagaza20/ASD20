// service-worker.js
const CACHE_NAME = 'medical-platform-v1';
const DYNAMIC_CACHE = 'medical-platform-dynamic-v1';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/session.js',
    '/js/firebase-config.js',
    '/js/home.js',
    '/js/courses.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('✅ Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker activated');
    
    // تنظيف الكاش القديم
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// استراتيجية: Cache First ثم Network
self.addEventListener('fetch', event => {
    // تجاهل طلبات Firebase (لأنها تحتاج اتصال)
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis')) {
        return;
    }
    
    // للملفات الثابتة - من الكاش أولاً
    if (event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    } 
    // للصفحات - استراتيجية Network First مع fallback للكاش
    else {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // تخزين الرد في الكاش الديناميكي
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => {
                            if (response) return response;
                            
                            // إذا كانت صفحة ولم توجد في الكاش
                            if (event.request.mode === 'navigate') {
                                return caches.match('/index.html');
                            }
                        });
                })
        );
    }
});

// مزامنة البيانات في الخلفية (للعمليات التي تحتاج اتصال)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-notes') {
        console.log('🔄 Syncing notes...');
        // هنا يمكن إضافة منطق لمزامنة الملاحظات عند العودة للاتصال
    }
});
