// Service Worker for caching and offline support
const CACHE_NAME = 'ifread-blog-v1';
const STATIC_CACHE = 'ifread-static-v1';
const CONTENT_CACHE = 'ifread-content-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/styles/global.css',
  '/fonts/inter-var.woff2',
  '/logo.svg',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本缓存
            if (cacheName !== STATIC_CACHE && 
                cacheName !== CONTENT_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 网络请求拦截 - 缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 对于静态资源，使用缓存优先策略
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.includes('/fonts/') ||
    url.pathname.includes('/images/')
  ) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          // 缓存命中，返回缓存资源
          if (response) {
            return response;
          }
          
          // 缓存未命中，从网络获取
          return fetch(request)
            .then((response) => {
              // 检查响应是否有效
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // 克隆响应，因为响应是流，只能使用一次
              const responseToCache = response.clone();
              
              // 将响应添加到缓存
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
    return;
  }
  
  // 对于HTML页面，使用网络优先策略
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 克隆响应
          const responseToCache = response.clone();
          
          // 将响应添加到内容缓存
          caches.open(CONTENT_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // 网络失败，尝试从缓存获取
          return caches.match(request)
            .then((response) => {
              return response || caches.match('/');
            });
        })
    );
    return;
  }
  
  // 对于其他请求，使用网络优先策略
  event.respondWith(
    fetch(request)
      .catch(() => {
        // 网络失败，尝试从缓存获取
        return caches.match(request);
      })
  );
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 后台同步函数
function doBackgroundSync() {
  // 这里可以执行后台同步任务，如发送离线时的表单数据
  console.log('Background sync completed');
}

// 推送通知事件
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});