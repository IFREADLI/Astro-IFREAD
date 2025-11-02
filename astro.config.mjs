// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://minimal-blog.example.com',
  integrations: [
    expressiveCode({
      themes: [
        {
          name: 'github-light-default',
          base: 'github-light',
        },
        {
          name: 'github-dark-default',
          base: 'github-dark',
        },
      ],
      themeCssSelector: (theme) => {
        if (theme.type === 'dark') return '[data-theme="dark"]';
        return '[data-theme="light"]';
      },
      // 启用行号
      lineNumbers: true,
      // 启用复制按钮
      copyToClipboardButton: true,
      // 启用文件名显示
      frames: {
        style: 'classic',
      },
      // 启用语法高亮
      styleOverrides: {
        codeBackground: 'var(--code-bg)',
        codeForeground: 'var(--code-text)',
        borderColor: 'var(--border)',
        activeLineBackground: 'var(--code-highlight-bg, rgba(255, 255, 0, 0.1))',
      },
      // 启用行内代码样式
      inlineCode: {
        style: 'punctuation-color',
      },
    }),
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['pagefind'],
    },
  },
});
