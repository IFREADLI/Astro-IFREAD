import type { CollectionEntry } from 'astro:content';

// 搜索结果接口
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  tags?: string[];
  publishDate: Date;
  relevanceScore: number;
  highlightedTitle?: string;
  highlightedDescription?: string;
}

// 搜索选项接口
export interface SearchOptions {
  query: string;
  limit?: number;
  category?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 高亮搜索关键词
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 计算相关性得分
function calculateRelevanceScore(
  title: string,
  description: string,
  content: string,
  tags: string[],
  query: string
): number {
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const contentLower = content.toLowerCase();
  const tagsLower = tags.map(tag => tag.toLowerCase());
  
  let score = 0;
  
  // 标题匹配得分最高
  if (titleLower.includes(queryLower)) {
    score += 100;
    
    // 如果标题以查询词开头，额外加分
    if (titleLower.startsWith(queryLower)) {
      score += 50;
    }
  }
  
  // 描述匹配得分次之
  if (descriptionLower.includes(queryLower)) {
    score += 50;
  }
  
  // 内容匹配得分
  if (contentLower.includes(queryLower)) {
    score += 20;
    
    // 计算内容中查询词出现的次数
    const contentMatches = contentLower.match(new RegExp(escapeRegExp(queryLower), 'g'));
    if (contentMatches) {
      score += contentMatches.length * 5;
    }
  }
  
  // 标签匹配得分
  if (tagsLower.some(tag => tag.includes(queryLower))) {
    score += 30;
    
    // 如果有标签完全匹配查询词，额外加分
    if (tagsLower.includes(queryLower)) {
      score += 20;
    }
  }
  
  return score;
}

// 执行搜索
export async function searchPosts(
  posts: CollectionEntry<'blog'>[],
  options: SearchOptions
): Promise<SearchResult[]> {
  const {
    query,
    limit = 10,
    category,
    tags,
    sortBy = 'relevance',
    sortOrder = 'desc'
  } = options;
  
  // 如果没有查询词，返回空结果
  if (!query.trim()) {
    return [];
  }
  
  // 过滤文章
  let filteredPosts = posts.filter(post => {
    // 过滤掉草稿
    if (post.data.draft) return false;
    
    // 按分类过滤
    if (category && post.data.category !== category) {
      return false;
    }
    
    // 按标签过滤
    if (tags && tags.length > 0) {
      const postTags = post.data.tags || [];
      const hasAllTags = tags.every(tag => postTags.includes(tag));
      if (!hasAllTags) return false;
    }
    
    return true;
  });
  
  // 计算相关性得分并生成搜索结果
  const searchResults: SearchResult[] = [];
  
  for (const post of filteredPosts) {
    // 获取文章内容
    const { Content } = await post.render();
    const content = await getPostContent(Content);
    
    // 计算相关性得分
    const relevanceScore = calculateRelevanceScore(
      post.data.title,
      post.data.description || '',
      content,
      post.data.tags || [],
      query
    );
    
    // 如果得分为0，说明没有匹配项，跳过
    if (relevanceScore === 0) continue;
    
    // 生成高亮文本
    const highlightedTitle = highlightText(post.data.title, query);
    const highlightedDescription = highlightText(
      post.data.description || '',
      query
    );
    
    // 添加到结果列表
    searchResults.push({
      id: post.id,
      title: post.data.title,
      description: post.data.description || '',
      url: `/blog/${post.slug}/`,
      category: post.data.category,
      tags: post.data.tags,
      publishDate: post.data.pubDate,
      relevanceScore,
      highlightedTitle,
      highlightedDescription
    });
  }
  
  // 排序结果
  searchResults.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'relevance':
        comparison = b.relevanceScore - a.relevanceScore;
        break;
      case 'date':
        comparison = b.publishDate.getTime() - a.publishDate.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }
    
    return sortOrder === 'desc' ? comparison : -comparison;
  });
  
  // 限制结果数量
  return searchResults.slice(0, limit);
}

// 获取文章内容（纯文本）
async function getPostContent(Content: any): Promise<string> {
  // 这里需要根据实际的渲染结果来提取纯文本
  // 由于Astro的渲染结果可能是HTML，我们需要去除HTML标签
  try {
    // 假设Content是一个字符串或可以转换为字符串的对象
    const htmlString = typeof Content === 'string' ? Content : String(Content);
    
    // 简单的HTML标签移除
    return htmlString.replace(/<[^>]*>/g, '').trim();
  } catch (error) {
    console.error('Error extracting post content:', error);
    return '';
  }
}

// 获取搜索建议
export function getSearchSuggestions(
  posts: CollectionEntry<'blog'>[],
  query: string,
  limit = 5
): string[] {
  if (!query.trim()) return [];
  
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();
  
  // 从标题中提取建议
  posts.forEach(post => {
    const titleWords = post.data.title.toLowerCase().split(/\s+/);
    
    titleWords.forEach(word => {
      if (word.includes(queryLower) && word.length > query.length) {
        suggestions.add(word);
      }
    });
  });
  
  // 从标签中提取建议
  posts.forEach(post => {
    const tags = post.data.tags || [];
    
    tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(queryLower) && tagLower.length > query.length) {
        suggestions.add(tag);
      }
    });
  });
  
  // 转换为数组并排序
  return Array.from(suggestions)
    .sort((a, b) => {
      // 优先显示以查询词开头的建议
      const aStartsWith = a.startsWith(queryLower);
      const bStartsWith = b.startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // 然后按长度排序（较短的优先）
      return a.length - b.length;
    })
    .slice(0, limit);
}