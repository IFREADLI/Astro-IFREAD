import { defineCollection, z } from 'astro:content';

// 博客文章集合
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featuredImage: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

// 分类集合
const categoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// 站点配置集合
const configCollection = defineCollection({
  type: 'data',
  schema: z.object({
    site: z.object({
      title: z.string(),
      description: z.string(),
      author: z.string(),
      email: z.string().optional(),
      url: z.string().url(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
    }),
    social: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      icon: z.string(),
    })).optional(),
    analytics: z.object({
      googleAnalyticsId: z.string().optional(),
      plausibleDomain: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  categories: categoriesCollection,
  config: configCollection,
};