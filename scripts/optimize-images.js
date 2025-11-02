#!/usr/bin/env node

/**
 * 图片优化脚本
 * 自动生成不同尺寸的图片，用于响应式设计
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  // 源图片目录
  sourceDir: 'public/images',
  // 输出目录
  outputDir: 'public/images/generated',
  // 图片格式
  formats: ['webp', 'avif', 'jpg'],
  // 图片尺寸
  sizes: [
    { name: 'thumb', width: 150, quality: 80 },
    { name: 'small', width: 400, quality: 80 },
    { name: 'medium', width: 800, quality: 80 },
    { name: 'large', width: 1200, quality: 85 },
    { name: 'xlarge', width: 1920, quality: 85 }
  ],
  // 支持的图片类型
  supportedTypes: ['.jpg', '.jpeg', '.png', '.tiff', '.webp']
};

// 检查是否安装了sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('请先安装sharp: npm install sharp');
  process.exit(1);
}

// 创建输出目录
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 获取所有图片文件
function getAllImages(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过生成的目录
        if (item !== 'generated') {
          traverse(fullPath);
        }
      } else {
        const ext = path.extname(item).toLowerCase();
        if (config.supportedTypes.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 处理单个图片
async function processImage(filePath) {
  const relativePath = path.relative(config.sourceDir, filePath);
  const fileName = path.basename(relativePath, path.extname(relativePath));
  const subDir = path.dirname(relativePath);
  
  console.log(`处理图片: ${relativePath}`);
  
  // 创建子目录
  const outputSubDir = path.join(config.outputDir, subDir);
  ensureDir(outputSubDir);
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // 为每种尺寸生成图片
    for (const size of config.sizes) {
      const sizeDir = path.join(outputSubDir, size.name);
      ensureDir(sizeDir);
      
      // 为每种格式生成图片
      for (const format of config.formats) {
        const outputPath = path.join(sizeDir, `${fileName}.${format}`);
        
        // 如果文件已存在，跳过
        if (fs.existsSync(outputPath)) {
          continue;
        }
        
        // 调整图片尺寸
        let transformer = image.clone().resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
        
        // 设置格式和质量
        switch (format) {
          case 'webp':
            transformer = transformer.webp({ quality: size.quality });
            break;
          case 'avif':
            transformer = transformer.avif({ quality: size.quality });
            break;
          case 'jpg':
            transformer = transformer.jpeg({ quality: size.quality });
            break;
        }
        
        await transformer.toFile(outputPath);
        console.log(`  生成: ${path.relative(process.cwd(), outputPath)}`);
      }
    }
  } catch (error) {
    console.error(`处理图片失败: ${filePath}`, error);
  }
}

// 生成srcset
function generateSrcset(relativePath) {
  const fileName = path.basename(relativePath, path.extname(relativePath));
  const subDir = path.dirname(relativePath);
  
  const srcset = [];
  
  for (const size of config.sizes) {
    // 优先使用现代格式
    const webpPath = `/images/generated/${subDir}/${size.name}/${fileName}.webp ${size.width}w`;
    srcset.push(webpPath);
  }
  
  return srcset.join(', ');
}

// 生成图片数据文件
async function generateImageData() {
  const images = getAllImages(config.sourceDir);
  const imageData = {};
  
  for (const imagePath of images) {
    const relativePath = path.relative(config.sourceDir, imagePath);
    const fileName = path.basename(relativePath, path.extname(relativePath));
    const subDir = path.dirname(relativePath);
    
    try {
      const metadata = await sharp(imagePath).metadata();
      
      imageData[fileName] = {
        src: `/images/${relativePath}`,
        srcset: generateSrcset(relativePath),
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width / metadata.height,
        sizes: config.sizes.map(size => ({
          name: size.name,
          width: size.width,
          path: `/images/generated/${subDir}/${size.name}/${fileName}.webp`
        }))
      };
    } catch (error) {
      console.error(`获取图片元数据失败: ${imagePath}`, error);
    }
  }
  
  // 写入JSON文件
  const outputPath = path.join(config.outputDir, 'image-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2));
  console.log(`图片数据已生成: ${outputPath}`);
}

// 主函数
async function main() {
  console.log('开始优化图片...');
  
  // 创建输出目录
  ensureDir(config.outputDir);
  
  // 获取所有图片
  const images = getAllImages(config.sourceDir);
  
  if (images.length === 0) {
    console.log('没有找到图片文件');
    return;
  }
  
  console.log(`找到 ${images.length} 个图片文件`);
  
  // 处理每个图片
  for (const image of images) {
    await processImage(image);
  }
  
  // 生成图片数据
  await generateImageData();
  
  console.log('图片优化完成!');
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processImage, generateImageData, config };