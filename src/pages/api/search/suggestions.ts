import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSearchSuggestions } from '../../../utils/search';

export const GET: APIRoute = async ({ url }) => {
  try {
    // 获取查询参数
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    // 获取所有文章
    const allPosts = await getCollection('blog');
    
    // 获取搜索建议
    const suggestions = getSearchSuggestions(allPosts, query, limit);
    
    // 返回JSON响应
    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to fetch suggestions' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};