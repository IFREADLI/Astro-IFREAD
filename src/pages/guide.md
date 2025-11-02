---
title: '使用指南'
description: '了解如何使用和维护这个博客系统'
layout: '../layouts/Layout.astro'
---

# 使用指南

本指南将帮助你了解如何使用和维护这个博客系统。

## 目录

1. [基本操作](#基本操作)
2. [内容管理](#内容管理)
3. [自定义配置](#自定义配置)
4. [SEO优化](#seo优化)
5. [性能优化](#性能优化)
6. [部署指南](#部署指南)
7. [常见问题](#常见问题)

## 基本操作

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321 查看网站。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 内容管理

### 创建新文章

1. 在 `src/content/blog/` 目录下创建新的 Markdown 文件
2. 文件名格式为 `slug.md`（例如：`my-first-post.md`）
3. 添加 frontmatter 和文章内容

#### 文章 Frontmatter 示例

```yaml
---
title: '文章标题'
pubDate: 2023-01-01
description: '文章描述'
author: '作者名'
image:
  url: 'https://example.com/image.jpg'
  alt: '图片描述'
tags: ['标签1', '标签2']
draft: false
---

# 文章内容

这里是文章的正文内容...
```

#### Frontmatter 字段说明

- `title`: 文章标题
- `pubDate`: 发布日期
- `description`: 文章描述
- `author`: 作者名称
- `image`: 文章封面图片
- `tags`: 文章标签
- `draft`: 是否为草稿

### 添加图片

#### 方法一：使用本地图片

1. 将图片放在 `public/images/` 目录下
2. 在 Markdown 中引用：

```markdown
![图片描述](/images/example.jpg)
```

#### 方法二：使用外部图片

直接在 Markdown 中引用外部图片链接：

```markdown
![图片描述](https://example.com/image.jpg)
```

### 创建新页面

在 `src/pages/` 目录下创建新的 Astro 文件或 Markdown 文件。

#### Astro 文件示例

```astro
---
title: '页面标题'
description: '页面描述'
layout: '../layouts/Layout.astro'
---

# 页面内容

这里是页面的内容...
```

## 自定义配置

### 修改网站信息

在 `src/config/site.ts` 文件中修改：

```typescript
export const siteConfig = {
  title: '你的博客标题',
  description: '你的博客描述',
  author: '你的名字',
  url: 'https://your-domain.com',
  // ...
};
```

### 修改主题配置

在 `src/config/theme.ts` 文件中修改：

```typescript
export const themeConfig = {
  defaultTheme: 'light',
  enableThemeToggle: true,
  // ...
};
```

### 修改导航菜单

在 `src/config/navigation.ts` 文件中修改：

```typescript
export const navigation = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '关于', href: '/about' },
  // ...
];
```

## SEO优化

### 页面元数据

每个页面都可以设置以下元数据：

```astro
---
title: '页面标题'
description: '页面描述'
image: '/images/page-image.jpg'
---
```

### 结构化数据

系统会自动生成以下结构化数据：

- 网站信息
- 文章信息
- 面包屑导航

### 站点地图

系统会自动生成 `sitemap.xml`，包含所有页面和文章。

## 性能优化

### 图片优化

系统会自动优化图片：

- 生成不同尺寸的图片
- 使用现代图片格式
- 实现懒加载

### 代码分割

系统会自动进行代码分割：

- 按页面分割 JavaScript
- 按需加载组件
- 预加载关键资源

### 缓存策略

系统实现了以下缓存策略：

- Service Worker 缓存静态资源
- 浏览器缓存优化
- CDN 缓存配置

## 部署指南

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如果有）
4. 部署

### Netlify 部署

1. 将代码推送到 GitHub
2. 在 Netlify 中导入项目
3. 配置构建设置：
   - 构建命令：`npm run build`
   - 发布目录：`dist`
4. 部署

### 自定义域名

#### Vercel

1. 在 Vercel 控制台中添加域名
2. 配置 DNS 记录

#### Netlify

1. 在 Netlify 控制台中添加域名
2. 配置 DNS 记录

## 常见问题

### 如何修改网站图标？

将你的图标文件放在 `public/` 目录下，并命名为 `favicon.svg` 或 `favicon.ico`。

### 如何添加自定义 CSS？

在 `src/styles/` 目录下创建新的 CSS 文件，然后在布局组件中引入：

```astro
---
import '../styles/custom.css';
---
```

### 如何添加自定义 JavaScript？

在 `src/scripts/` 目录下创建新的 JavaScript 文件，然后在页面或组件中引入：

```astro
---
import '../scripts/custom.js';
---
```

### 如何修改文章列表排序？

在 `src/pages/blog/index.astro` 文件中修改排序逻辑：

```typescript
const sortedPosts = posts.sort((a, b) => 
  new Date(b.data.pubDate).valueOf() - 
  new Date(a.data.pubDate).valueOf()
);
```

### 如何添加评论系统？

可以使用第三方评论服务，如：

1. **Giscus**：基于 GitHub Discussions 的评论系统
2. **Utterances**：基于 GitHub Issues 的评论系统
3. **Disqus**：第三方评论服务

### 如何添加分析工具？

在布局组件中添加分析代码：

```astro
---
// 在 Layout.astro 中
---
<html>
  <head>
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
  </head>
</html>
```

## 更多资源

- [Astro 官方文档](https://docs.astro.build/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Markdown 语法指南](https://www.markdownguide.org/basic-syntax/)

---

如果你有其他问题或需要帮助，请查看 [GitHub 仓库](https://github.com/lijnf/Astro-IFREAD) 或联系我。