import type { MarkdownHeading } from 'astro';

// 匹配图片的正则表达式
const imageRegex = /!\[(.*?)\]\((.*?)\)(?:\s*\{(.*?)\})?/g;

// 匹配代码块的正则表达式
const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

// 匹配视频的正则表达式
const videoRegex = /!\[video\]\((.*?)\)(?:\s*\{(.*?)\})?/g;

// 匹配音频的正则表达式
const audioRegex = /!\[audio\]\((.*?)\)(?:\s*\{(.*?)\})?/g;

// 匹配画廊的正则表达式
const galleryRegex = /!\[gallery\]\((.*?)\)(?:\s*\{(.*?)\})?/g;

// 解析图片属性
function parseImageAttributes(attrStr: string) {
  if (!attrStr) return {};
  
  const attributes: Record<string, string> = {};
  const pairs = attrStr.split(/\s+/);
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      attributes[key] = value.replace(/['"]/g, '');
    }
  }
  
  return attributes;
}

// 处理图片
function processImages(content: string): string {
  // 添加空值检查，确保content存在
  if (!content || typeof content.replace !== 'function') {
    return '';
  }
  
  return content.replace(imageRegex, (match, alt, src, attrs) => {
    const attributes = parseImageAttributes(attrs || '');
    const width = attributes.width ? `width="${attributes.width}"` : '';
    const height = attributes.height ? `height="${attributes.height}"` : '';
    const className = attributes.class ? `class="${attributes.class}"` : '';
    const caption = attributes.caption ? `caption="${attributes.caption}"` : '';
    const priority = attributes.priority === 'true' ? 'priority={true}' : '';
    
    return `<OptimizedImage src="${src}" alt="${alt}" ${width} ${height} ${className} ${caption} ${priority} />`;
  });
}

// 处理代码块
function processCodeBlocks(content: string): string {
  return content.replace(codeBlockRegex, (match, lang, code) => {
    const titleMatch = code.match(/\/\/\s*title:\s*(.*?)\s*\n/);
    const title = titleMatch ? titleMatch[1] : '';
    const cleanCode = titleMatch ? code.replace(/\/\/\s*title:\s*(.*?)\s*\n/, '') : code;
    
    return `<CodeBlock language="${lang || ''}" title="${title}" code={\`${cleanCode}\`} />`;
  });
}

// 处理视频
function processVideos(content: string): string {
  return content.replace(videoRegex, (match, src, attrs) => {
    const attributes = parseImageAttributes(attrs || '');
    const title = attributes.title ? `title="${attributes.title}"` : '';
    const poster = attributes.poster ? `poster="${attributes.poster}"` : '';
    const width = attributes.width ? `width="${attributes.width}"` : '';
    const height = attributes.height ? `height="${attributes.height}"` : '';
    const className = attributes.class ? `class="${attributes.class}"` : '';
    const autoplay = attributes.autoplay === 'true' ? 'autoplay={true}' : '';
    const controls = attributes.controls === 'false' ? 'controls={false}' : '';
    const loop = attributes.loop === 'true' ? 'loop={true}' : '';
    const muted = attributes.muted === 'true' ? 'muted={true}' : '';
    
    return `<VideoPlayer src="${src}" ${title} ${poster} ${width} ${height} ${className} ${autoplay} ${controls} ${loop} ${muted} />`;
  });
}

// 处理音频
function processAudio(content: string): string {
  return content.replace(audioRegex, (match, src, attrs) => {
    const attributes = parseImageAttributes(attrs || '');
    const title = attributes.title ? `title="${attributes.title}"` : '';
    const artist = attributes.artist ? `artist="${attributes.artist}"` : '';
    const cover = attributes.cover ? `cover="${attributes.cover}"` : '';
    const className = attributes.class ? `class="${attributes.class}"` : '';
    const autoplay = attributes.autoplay === 'true' ? 'autoplay={true}' : '';
    const controls = attributes.controls === 'false' ? 'controls={false}' : '';
    const loop = attributes.loop === 'true' ? 'loop={true}' : '';
    
    return `<AudioPlayer src="${src}" ${title} ${artist} ${cover} ${className} ${autoplay} ${controls} ${loop} />`;
  });
}

// 处理画廊
function processGalleries(content: string): string {
  return content.replace(galleryRegex, (match, src, attrs) => {
    const attributes = parseImageAttributes(attrs || '');
    const columns = attributes.columns || '3';
    const gap = attributes.gap || '1';
    const className = attributes.class || '';
    const lightbox = attributes.lightbox === 'false' ? 'lightbox={false}' : '';
    
    // 这里假设src是一个JSON数组，实际应用中可能需要更复杂的解析
    try {
      const images = JSON.parse(src);
      return `<Gallery images={${JSON.stringify(images)}} columns={${columns}} gap={${gap}} class="${className}" ${lightbox} />`;
    } catch (e) {
      console.error('Failed to parse gallery images:', e);
      return match;
    }
  });
}

// 处理所有媒体元素
export function processMedia(content: string): string {
  let processedContent = content;
  
  processedContent = processImages(processedContent);
  processedContent = processCodeBlocks(processedContent);
  processedContent = processVideos(processedContent);
  processedContent = processAudio(processedContent);
  processedContent = processGalleries(processedContent);
  
  return processedContent;
}

// 提取标题
export function extractHeadings(content: string): MarkdownHeading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: MarkdownHeading[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    headings.push({
      depth,
      text,
      slug,
    });
  }
  
  return headings;
}