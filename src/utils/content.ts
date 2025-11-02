// 内容处理工具函数

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('zh-CN', options).format(date);
}

/**
 * 格式化阅读时间
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '少于1分钟';
  }
  
  return `约${Math.ceil(minutes)}分钟`;
}

/**
 * 计算文章阅读时间（基于字数）
 */
export function calculateReadingTime(content: string): number {
  // 中文阅读速度约为每分钟300字
  const wordsPerMinute = 300;
  
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // 计算中文字符数（包括标点符号）
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g)?.length || 0;
  
  // 计算英文单词数
  const englishWords = plainText.match(/[a-zA-Z]+/g)?.length || 0;
  
  // 计算总阅读时间（分钟）
  const totalMinutes = (chineseChars + englishWords * 2) / wordsPerMinute;
  
  return totalMinutes;
}

/**
 * 生成文章摘要
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // 移除多余的空白字符
  const cleanedText = plainText.replace(/\s+/g, ' ').trim();
  
  if (cleanedText.length <= maxLength) {
    return cleanedText;
  }
  
  // 截取指定长度并添加省略号
  return cleanedText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * 生成文章URL路径
 */
export function generatePostPath(slug: string): string {
  return `/blog/${slug}/`;
}

/**
 * 生成分类URL路径
 */
export function generateCategoryPath(category: string): string {
  return `/categories/${category}/`;
}

/**
 * 生成标签URL路径
 */
export function generateTagPath(tag: string): string {
  return `/tags/${tag}/`;
}

/**
 * 获取文章的上一篇/下一篇文章
 */
export function getAdjacentPosts(
  currentPost: { slug: string; pubDate: Date },
  allPosts: Array<{ slug: string; pubDate: Date }>
): {
  prev: { slug: string; pubDate: Date } | null;
  next: { slug: string; pubDate: Date } | null;
} {
  // 按发布日期排序
  const sortedPosts = [...allPosts].sort((a, b) => 
    new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
  );
  
  // 找到当前文章的索引
  const currentIndex = sortedPosts.findIndex(
    post => post.slug === currentPost.slug
  );
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  return {
    prev: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
    next: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
  };
}

/**
 * 从内容中提取标题用于生成目录
 */
export function extractHeadings(content: string): Array<{
  depth: number;
  text: string;
  slug: string;
}> {
  // 匹配h2和h3标题
  const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: Array<{
    depth: number;
    text: string;
    slug: string;
  }> = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, ''); // 移除标题内的HTML标签
    
    // 生成slug
    const slug = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留中文、英文、数字、空格和连字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .trim();
    
    headings.push({ depth, text, slug });
  }
  
  return headings;
}

/**
 * 高亮搜索关键词
 */
export function highlightSearchTerms(
  text: string,
  searchTerms: string[]
): string {
  if (!searchTerms || searchTerms.length === 0) {
    return text;
  }
  
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    if (!term) return;
    
    // 创建不区分大小写的正则表达式
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    
    // 高亮匹配的文本
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 格式化文章标签为字符串
 */
export function formatTags(tags: string[]): string {
  return tags.map(tag => `#${tag}`).join(' ');
}

/**
 * 从URL中提取标签
 */
export function extractTagFromUrl(url: string): string | null {
  const match = url.match(/\/tags\/([^\/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * 从URL中提取分类
 */
export function extractCategoryFromUrl(url: string): string | null {
  const match = url.match(/\/categories\/([^\/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}