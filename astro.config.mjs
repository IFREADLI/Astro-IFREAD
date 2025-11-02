// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { ExpressiveCode } from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://minimal-blog.example.com',
  integrations: [
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    ExpressiveCode({
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
    }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['pagefind'],
    },
  },
});
