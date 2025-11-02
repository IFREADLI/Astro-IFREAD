---
title: "欢迎来到极简博客"
description: "这是一个示例文章，展示了极简博客的设计风格和功能特性。"
pubDate: 2024-01-15
updatedDate: 2024-01-16
category: "技术"
tags: ["Astro", "博客", "极简主义"]
featured: true
featuredImage:
  src: "./cover.jpg"
  alt: "极简博客封面"
draft: false
---

# 欢迎来到极简博客

这是一个示例文章，展示了极简博客的设计风格和功能特性。极简主义不仅仅是视觉上的简约，更是一种注重内容本身、去除冗余的设计哲学。

## 极简设计理念

极简主义设计遵循"少即是多"的原则，通过以下方式实现：

- **大量留白**：给内容呼吸的空间，提高可读性
- **克制用色**：使用有限的色彩，创造视觉层次
- **系统字体**：确保加载性能和跨平台一致性
- **精心排版**：通过字体大小、行距等细节提升阅读体验

## 功能特性

### 1. 响应式设计

博客采用移动优先的设计理念，在各种设备上都能提供优秀的阅读体验。

```css
/* 响应式布局示例 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
```

### 2. 深色模式

支持浅色和深色两种主题模式，根据用户偏好或系统设置自动切换。

### 3. 文章目录

自动生成的文章目录，方便快速导航到感兴趣的内容。

### 4. 阅读进度

顶部的阅读进度条，直观显示当前阅读位置。

## 技术栈

本博客使用以下技术构建：

- **Astro**：现代化的静态网站生成器
- **Tailwind CSS**：实用优先的CSS框架
- **TypeScript**：类型安全的JavaScript
- **Markdown**：简洁的标记语言

## 代码高亮

支持多种编程语言的语法高亮：

```javascript
// JavaScript示例
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("极简博客"));
```

```python
# Python示例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## 总结

极简博客注重内容本身，通过精心的设计和交互，为读者提供舒适的阅读体验。无论是技术文章、随笔杂记还是摄影作品，都能在这里找到合适的展示方式。

希望你喜欢这个博客，也欢迎分享你的想法和建议！