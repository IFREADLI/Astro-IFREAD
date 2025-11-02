import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { searchPosts } from '../../../utils/search';

export const GET: APIRoute = async ({ url }) => {
  try {
    // 获取查询参数
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';
    const tagsParam = url.searchParams.get('tags') || '';
    const sortBy = (url.searchParams.get('sort') as 'relevance' | 'date' | 'title') || 'relevance';
    const sortOrder = (url.searchParams.get('order') as 'asc' | 'desc') || 'desc';
    
    // 解析标签
    const tags = tagsParam ? tagsParam.split(',').filter(tag => tag.trim()) : [];
    
    // 获取所有文章
    const allPosts = await getCollection('blog');
    
    // 执行搜索
    const searchResults = query 
      ? await searchPosts(allPosts, { query, limit, category, tags, sortBy, sortOrder })
      : [];
    
    // 返回JSON响应
    return new Response(JSON.stringify({ 
      results: searchResults,
      total: searchResults.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to search posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};