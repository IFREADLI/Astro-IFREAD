// Service Worker 注册脚本
(function() {
  const swPath = '/sw.js';
  
  // 检查浏览器是否支持Service Worker
  if ('serviceWorker' in navigator) {
    // 等待页面加载完成
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath)
        .then(registration => {
          console.log('Service Worker 注册成功:', registration.scope);
          
          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新的Service Worker已安装，提示用户刷新页面
                  if (confirm('发现新版本，是否立即更新？')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
    });
  }
})();