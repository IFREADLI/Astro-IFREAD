#!/usr/bin/env node

/**
 * 构建优化脚本
 * 在Astro构建后进行额外的优化
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  // 构建输出目录
  distDir: 'dist',
  // 是否压缩HTML
  compressHTML: true,
  // 是否压缩CSS
  compressCSS: true,
  // 是否压缩JS
  compressJS: true,
  // 是否生成gzip文件
  generateGzip: true,
  // 是否生成brotli文件
  generateBrotli: true,
  // 需要压缩的文件类型
  compressibleTypes: ['.html', '.css', '.js', '.json', '.svg', '.xml'],
  // 不需要压缩的文件路径
  excludePaths: [
    '/sw.js', // Service Worker需要保持可读性
    '/manifest.json' // 清单文件需要保持可读性
  ]
};

// 检查是否安装了必要的依赖
let htmlMinifier, cleanCSS, terser;
try {
  htmlMinifier = require('html-minifier-terser');
  cleanCSS = require('clean-css');
  terser = require('terser');
} catch (e) {
  console.error('请先安装必要的依赖: npm install html-minifier-terser clean-css terser');
  process.exit(1);
}

// 压缩HTML
async function minifyHTML(content) {
  if (!config.compressHTML) return content;
  
  try {
    const result = await htmlMinifier.minify(content, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    });
    return result;
  } catch (error) {
    console.error('HTML压缩失败:', error);
    return content;
  }
}

// 压缩CSS
function minifyCSS(content) {
  if (!config.compressCSS) return content;
  
  try {
    const result = new cleanCSS({ level: 2 }).minify(content);
    return result.styles;
  } catch (error) {
    console.error('CSS压缩失败:', error);
    return content;
  }
}

// 压缩JS
async function minifyJS(content) {
  if (!config.compressJS) return content;
  
  try {
    const result = await terser.minify(content, {
      compress: true,
      mangle: true,
      format: {
        comments: false
      }
    });
    return result.code;
  } catch (error) {
    console.error('JS压缩失败:', error);
    return content;
  }
}

// 压缩文件
async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(config.distDir, filePath);
  
  // 检查是否需要跳过
  if (config.excludePaths.some(excludePath => relativePath.includes(excludePath))) {
    console.log(`跳过: ${relativePath}`);
    return;
  }
  
  // 检查是否是可压缩的文件类型
  if (!config.compressibleTypes.includes(ext)) {
    return;
  }
  
  console.log(`压缩: ${relativePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let compressedContent;
    
    // 根据文件类型选择压缩方法
    switch (ext) {
      case '.html':
        compressedContent = await minifyHTML(content);
        break;
      case '.css':
        compressedContent = minifyCSS(content);
        break;
      case '.js':
        compressedContent = await minifyJS(content);
        break;
      default:
        compressedContent = content;
    }
    
    // 如果内容有变化，写入文件
    if (compressedContent !== content) {
      fs.writeFileSync(filePath, compressedContent);
      const saved = ((content.length - compressedContent.length) / content.length * 100).toFixed(2);
      console.log(`  压缩率: ${saved}%`);
    }
    
    // 生成gzip文件
    if (config.generateGzip) {
      const gzipPath = `${filePath}.gz`;
      if (!fs.existsSync(gzipPath)) {
        execSync(`gzip -c "${filePath}" > "${gzipPath}"`, { stdio: 'ignore' });
        console.log(`  生成: ${path.basename(gzipPath)}`);
      }
    }
    
    // 生成brotli文件
    if (config.generateBrotli) {
      const brotliPath = `${filePath}.br`;
      if (!fs.existsSync(brotliPath)) {
        execSync(`brotli -c "${filePath}" > "${brotliPath}"`, { stdio: 'ignore' });
        console.log(`  生成: ${path.basename(brotliPath)}`);
      }
    }
  } catch (error) {
    console.error(`压缩文件失败: ${filePath}`, error);
  }
}

// 递归处理目录
async function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      await processDirectory(itemPath);
    } else {
      await compressFile(itemPath);
    }
  }
}

// 生成构建报告
function generateBuildReport() {
  const report = {
    buildTime: new Date().toISOString(),
    config: config,
    stats: {}
  };
  
  // 计算文件大小统计
  function calculateStats(dirPath, stats = {}) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        calculateStats(itemPath, stats);
      } else {
        const ext = path.extname(item).toLowerCase();
        const size = stat.size;
        
        if (!stats[ext]) {
          stats[ext] = { count: 0, size: 0 };
        }
        
        stats[ext].count++;
        stats[ext].size += size;
      }
    }
    
    return stats;
  }
  
  report.stats = calculateStats(config.distDir);
  
  // 写入报告文件
  const reportPath = path.join(config.distDir, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`构建报告已生成: ${reportPath}`);
}

// 主函数
async function main() {
  console.log('开始构建优化...');
  
  // 检查构建目录是否存在
  if (!fs.existsSync(config.distDir)) {
    console.error(`构建目录不存在: ${config.distDir}`);
    console.error('请先运行构建命令: npm run build');
    process.exit(1);
  }
  
  // 处理所有文件
  await processDirectory(config.distDir);
  
  // 生成构建报告
  generateBuildReport();
  
  console.log('构建优化完成!');
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { compressFile, processDirectory, config };