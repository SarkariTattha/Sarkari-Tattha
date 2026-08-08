import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'saffron' | 'emerald' | 'indigo' | 'crimson' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  colorPreview: string[]; // 3 colors for swatch
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  heroBg: string;
  navBg: string;
  cardBorder: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  saffron: {
    id: 'saffron',
    name: 'Sarkari Light Grey & Orange',
    description: 'Light Grey canvas with Light Orange & Crisp Black Typography',
    colorPreview: ['#f8fafc', '#f97316', '#0f172a'],
    primaryBg: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-500',
    primaryText: 'text-orange-600',
    accentText: 'text-orange-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    heroBg: 'bg-slate-100',
    navBg: 'bg-white',
    cardBorder: 'border-orange-200',
  },
  emerald: {
    id: 'emerald',
    name: 'Light Orange & White',
    description: 'Clean White & Light Grey with Warm Orange Accents',
    colorPreview: ['#ffffff', '#ffedd5', '#f97316'],
    primaryBg: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryText: 'text-orange-600',
    accentText: 'text-orange-500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-900',
    heroBg: 'bg-orange-50/50',
    navBg: 'bg-white',
    cardBorder: 'border-orange-200',
  },
  indigo: {
    id: 'indigo',
    name: 'Monochrome Slate & Orange',
    description: 'High contrast Black, White, Light Grey & Light Orange',
    colorPreview: ['#e2e8f0', '#1e293b', '#f97316'],
    primaryBg: 'bg-slate-900',
    primaryHover: 'hover:bg-slate-800',
    primaryText: 'text-slate-900',
    accentText: 'text-orange-600',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-900',
    heroBg: 'bg-slate-100',
    navBg: 'bg-white',
    cardBorder: 'border-slate-300',
  },
  crimson: {
    id: 'crimson',
    name: 'Clean Grey & Saffron',
    description: 'Light Grey with Saffron Orange Highlights',
    colorPreview: ['#f1f5f9', '#fb923c', '#000000'],
    primaryBg: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryText: 'text-orange-600',
    accentText: 'text-orange-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    heroBg: 'bg-slate-100',
    navBg: 'bg-white',
    cardBorder: 'border-orange-300',
  },
  dark: {
    id: 'dark',
    name: 'Light Grey Premium',
    description: 'Clean Minimalist Light Grey with Orange & Black',
    colorPreview: ['#f8fafc', '#000000', '#f97316'],
    primaryBg: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-500',
    primaryText: 'text-orange-600',
    accentText: 'text-orange-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    heroBg: 'bg-slate-100',
    navBg: 'bg-white',
    cardBorder: 'border-slate-200',
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('sarkari_theme') as ThemeId;
    return saved && THEMES[saved] ? saved : 'saffron';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('sarkari_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig: THEMES[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
