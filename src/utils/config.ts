import { getCollection } from 'astro:content';

export async function getSiteConfig() {
  const { data: siteConfig } = await getCollection('config', ({ id }) => id === 'site');
  return siteConfig;
}

// 站点基本信息
export const SITE = {
  title: 'IFREAD blog',
  description: '一个专注于内容与阅读体验的极简风格博客',
  author: 'IFREAD',
  email: 'author@example.com',
  url: 'https://minimal-blog.example.com',
  logo: '/logo.svg',
  favicon: '/favicon.svg',
  image: '/cover.svg',
  locale: 'zh-CN',
  type: 'website',
  social: [
    {
      name: 'GitHub',
      url: 'https://github.com/username',
      icon: 'github',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/username',
      icon: 'twitter',
    },
    {
      name: 'RSS',
      url: '/rss.xml',
      icon: 'rss',
    },
  ],
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    plausibleDomain: 'minimal-blog.example.com',
  },
  // SEO配置
  seo: {
    enableRobotsTxt: true,
    enableSitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    // 结构化数据
    structuredData: {
      enable: true,
      type: 'Blog',
      publisher: {
        '@type': 'Organization',
        name: 'IFREAD blog',
        logo: {
          '@type': 'ImageObject',
          url: 'https://minimal-blog.example.com/logo.svg',
        },
      },
      author: {
        '@type': 'Person',
        name: 'IFREAD',
        email: 'author@example.com',
      },
    },
  },
};

// 导航菜单
export const NAVIGATION = [
  {
    name: '首页',
    href: '/',
  },
  {
    name: '博客',
    href: '/blog',
  },
  {
    name: '分类',
    href: '/categories',
  },
  {
    name: '标签',
    href: '/tags',
  },
  {
    name: '归档',
    href: '/archives',
  },
  {
    name: '关于',
    href: '/about',
  },
];

// 页脚链接
export const FOOTER_LINKS = [
  {
    title: '内容',
    links: [
      { name: '所有文章', href: '/blog' },
      { name: '分类', href: '/categories' },
      { name: '标签', href: '/tags' },
      { name: '归档', href: '/archives' },
    ],
  },
  {
    title: '资源',
    links: [
      { name: 'RSS订阅', href: '/rss.xml' },
      { name: '网站地图', href: '/sitemap-index.xml' },
    ],
  },
  {
    title: '关于',
    links: [
      { name: '关于我', href: '/about' },
      { name: '联系方式', href: '/contact' },
    ],
  },
];