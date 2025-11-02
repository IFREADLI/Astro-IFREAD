// Service Worker 注册脚本
(function() {
  // 检查浏览器是否支持Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // 检查是否有更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的服务工作者已安装，显示更新提示
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
    
    // 监听服务工作者控制的变化
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
  
  // 显示更新通知
  function showUpdateNotification() {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    notification.innerHTML = `
      <span>网站有新版本可用</span>
      <button id="update-btn" class="bg-white text-accent px-2 py-1 rounded text-sm font-medium">
        更新
      </button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加点击事件
    document.getElementById('update-btn').addEventListener('click', () => {
      // 通知所有页面刷新
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      notification.remove();
    });
    
    // 5秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
})();