// 主题类型定义
export type Theme = 'light' | 'dark' | 'system';

// 主题配置
export interface ThemeConfig {
  name: string;
  label: string;
  icon: string;
}

// 可用主题
export const THEMES: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    label: '浅色模式',
    icon: 'sun',
  },
  dark: {
    name: 'dark',
    label: '深色模式',
    icon: 'moon',
  },
  system: {
    name: 'system',
    label: '跟随系统',
    icon: 'desktop',
  },
};

// 获取系统主题
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 获取当前主题
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = localStorage.getItem('theme') as Theme;
  if (storedTheme && THEMES[storedTheme]) {
    return storedTheme;
  }
  return 'system';
}

// 应用主题
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', actualTheme);
  document.documentElement.setAttribute('data-theme-mode', theme);
  
  // 更新meta标签
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#1f2937' : '#3b82f6');
  }
}

// 设置主题
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
  applyTheme(theme);
  
  // 触发自定义事件
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

// 初始化主题
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
}

// 切换主题（在light和dark之间）
export function toggleTheme(): void {
  const currentTheme = getCurrentTheme();
  const actualTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
  const newTheme = actualTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// 获取主题图标
export function getThemeIcon(theme: Theme): string {
  return THEMES[theme].icon;
}

// 获取主题标签
export function getThemeLabel(theme: Theme): string {
  return THEMES[theme].label;
}