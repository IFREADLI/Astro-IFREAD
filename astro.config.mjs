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
  ],
  vite: {
    optimizeDeps: {
      exclude: ['pagefind'],
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light-default',
      wrap: true,
    },
  },
  expressiveCode: {
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
  },
});
