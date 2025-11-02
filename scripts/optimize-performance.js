// 性能优化脚本
// 用于优化图片、压缩资源、预加载关键资源等

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// 配置
const config = {
  // 图片优化配置
  imageOptimization: {
    // 支持的图片格式
    formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    // 输出目录
    outputDir: 'public/images/optimized',
    // 原始图片目录
    inputDir: 'public/images',
    // 图片质量
    quality: {
      jpg: 85,
      webp: 85,
      avif: 75
    },
    // 图片尺寸
    sizes: [
      { name: 'small', width: 480 },
      { name: 'medium', width: 768 },
      { name: 'large', width: 1024 },
      { name: 'xlarge', width: 1920 }
    ]
  },
  // 预加载配置
  preloading: {
    // 关键资源
    criticalResources: [
      '/styles/global.css',
      '/fonts/inter-var.woff2'
    ],
    // 预加载输出文件
    outputFile: 'src/layouts/preload.astro'
  }
};

// 确保目录存在
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 优化图片
async function optimizeImages() {
  console.log('开始优化图片...');
  
  const { inputDir, outputDir, formats, quality, sizes } = config.imageOptimization;
  
  // 确保输出目录存在
  await ensureDirectoryExists(outputDir);
  
  try {
    // 获取所有图片文件
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).substring(1).toLowerCase();
      return formats.includes(ext);
    });
    
    console.log(`找到 ${imageFiles.length} 个图片文件`);
    
    for (const file of imageFiles) {
      const filePath = path.join(inputDir, file);
      const fileExt = path.extname(file).substring(1).toLowerCase();
      const baseName = path.basename(file, path.extname(file));
      
      // 获取图片信息
      const imageInfo = await sharp(filePath).metadata();
      
      // 为每种尺寸生成优化图片
      for (const size of sizes) {
        const outputDirForSize = path.join(outputDir, size.name);
        await ensureDirectoryExists(outputDirForSize);
        
        // 生成WebP格式
        const webpOutputPath = path.join(outputDirForSize, `${baseName}.webp`);
        await sharp(filePath)
          .resize(size.width, null, { withoutEnlargement: true })
          .webp({ quality: quality.webp })
          .toFile(webpOutputPath);
        
        // 生成AVIF格式
        const avifOutputPath = path.join(outputDirForSize, `${baseName}.avif`);
        await sharp(filePath)
          .resize(size.width, null, { withoutEnlargement: true })
          .avif({ quality: quality.avif })
          .toFile(avifOutputPath);
        
        // 如果原图是JPEG或PNG，也生成优化版本
        if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
          const optimizedOutputPath = path.join(outputDirForSize, `${baseName}.${fileExt}`);
          await sharp(filePath)
            .resize(size.width, null, { withoutEnlargement: true })
            .jpeg({ quality: quality.jpg })
            .toFile(optimizedOutputPath);
        }
      }
      
      console.log(`已优化: ${file}`);
    }
    
    console.log('图片优化完成');
  } catch (error) {
    console.error('图片优化失败:', error);
  }
}

// 生成预加载组件
async function generatePreloadComponent() {
  console.log('生成预加载组件...');
  
  const { criticalResources, outputFile } = config.preloading;
  
  // 确保输出目录存在
  const outputDir = path.dirname(outputFile);
  await ensureDirectoryExists(outputDir);
  
  // 生成预加载链接
  const preloadLinks = criticalResources.map(resource => {
    let as = '';
    let type = '';
    
    if (resource.endsWith('.css')) {
      as = 'style';
    } else if (resource.endsWith('.js')) {
      as = 'script';
    } else if (resource.endsWith('.woff2')) {
      as = 'font';
      type = 'font/woff2';
      resource = resource.replace(/^\/fonts\//, '/'); // 确保路径正确
    } else if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(resource)) {
      as = 'image';
    }
    
    let linkTag = `<link rel="preload" href="${resource}" as="${as}"`;
    
    if (type) {
      linkTag += ` type="${type}"`;
    }
    
    if (as === 'font') {
      linkTag += ' crossorigin';
    }
    
    linkTag += '>';
    
    return linkTag;
  }).join('\n  ');
  
  // 生成组件内容
  const componentContent = `---
// 预加载关键资源组件
// 用于预加载关键CSS、字体和JavaScript资源
---

${preloadLinks}
`;

  // 写入文件
  try {
    await fs.writeFile(outputFile, componentContent);
    console.log(`预加载组件已生成: ${outputFile}`);
  } catch (error) {
    console.error('生成预加载组件失败:', error);
  }
}

// 生成响应式图片组件
async function generateResponsiveImageComponent() {
  console.log('生成响应式图片组件...');
  
  const { sizes } = config.imageOptimization;
  const outputFile = 'src/components/images/ResponsiveImage.astro';
  
  // 确保输出目录存在
  const outputDir = path.dirname(outputFile);
  await ensureDirectoryExists(outputDir);
  
  // 生成srcset属性
  const generateSrcSet = (baseName, format) => {
    return sizes.map(size => `/images/optimized/${size.name}/${baseName}.${format} ${size.width}w`).join(', ');
  };
  
  // 生成sizes属性
  const generateSizes = () => {
    return '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';
  };
  
  // 生成组件内容
  const componentContent = `---
// 响应式图片组件
// 自动生成响应式图片，支持多种格式和尺寸

export interface Props {
  src: string; // 图片文件名（不含路径和扩展名）
  alt: string; // 图片替代文本
  width?: number; // 图片宽度
  height?: number; // 图片高度
  class?: string; // CSS类名
  loading?: 'lazy' | 'eager'; // 加载方式
  decoding?: 'async' | 'sync' | 'auto'; // 解码方式
  priority?: boolean; // 是否为优先加载图片
}

const { 
  src, 
  alt, 
  width, 
  height, 
  class: className = '', 
  loading = 'lazy', 
  decoding = 'async',
  priority = false
} = Astro.props;

// 生成不同格式的srcset
const webpSrcSet = ${sizes.map(size => `'/images/optimized/${size.name}/\${src}.webp ${size.width}w'`).join(' + ', ')};
const avifSrcSet = ${sizes.map(size => `'/images/optimized/${size.name}/\${src}.avif ${size.width}w'`).join(' + ', ')};
const jpgSrcSet = ${sizes.map(size => `'/images/optimized/${size.name}/\${src}.jpg ${size.width}w'`).join(' + ', ')};

// 生成sizes属性
const sizesAttr = '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';

// 默认图片路径
const defaultSrc = \`/images/optimized/medium/\${src}.jpg\`;
---

{priority ? (
  <link rel="preload" as="image" href={defaultSrc} imagesizes={sizesAttr} imagesrcset={jpgSrcSet} />
) : null}

<picture>
  <source srcset={avifSrcSet} sizes={sizesAttr} type="image/avif" />
  <source srcset={webpSrcSet} sizes={sizesAttr} type="image/webp" />
  <img 
    src={defaultSrc}
    srcset={jpgSrcSet}
    sizes={sizesAttr}
    width={width}
    height={height}
    alt={alt}
    class={className}
    loading={loading}
    decoding={decoding}
  />
</picture>
`;

  // 写入文件
  try {
    await fs.writeFile(outputFile, componentContent);
    console.log(`响应式图片组件已生成: ${outputFile}`);
  } catch (error) {
    console.error('生成响应式图片组件失败:', error);
  }
}

// 生成Service Worker用于缓存优化
async function generateServiceWorker() {
  console.log('生成Service Worker...');
  
  const outputFile = 'public/sw.js';
  
  // 生成Service Worker内容
  const serviceWorkerContent = `// Service Worker for performance optimization
// 缓存关键资源，提供离线支持

const CACHE_NAME = 'astro-ifread-v1';
const STATIC_CACHE = 'astro-ifread-static-v1';
const RUNTIME_CACHE = 'astro-ifread-runtime-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/styles/global.css',
  '/fonts/inter-var.woff2',
  // 其他关键资源
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE;
          }).map(cacheName => {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) return;
  
  // 处理静态资源请求
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith('/images/optimized/'))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // 网络请求并缓存
          return fetch(request)
            .then(response => {
              // 检查是否是有效响应
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // 克隆响应，因为响应流只能使用一次
              const responseToCache = response.clone();
              
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});
`;

  // 写入文件
  try {
    await fs.writeFile(outputFile, serviceWorkerContent);
    console.log(`Service Worker已生成: ${outputFile}`);
  } catch (error) {
    console.error('生成Service Worker失败:', error);
  }
}

// 主函数
async function main() {
  console.log('开始性能优化...');
  
  // 优化图片
  await optimizeImages();
  
  // 生成预加载组件
  await generatePreloadComponent();
  
  // 生成响应式图片组件
  await generateResponsiveImageComponent();
  
  // 生成Service Worker
  await generateServiceWorker();
  
  console.log('性能优化完成');
}

// 运行主函数
main().catch(console.error);