import { create } from 'zustand';

type AccentColor = 'blue' | 'purple' | 'green' | 'rose' | 'orange';

interface ThemeState {
  isDark: boolean;
  accentColor: AccentColor;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setAccentColor: (color: AccentColor) => void;
}

const THEME_STORAGE_KEY = 'teamtrack-theme';
const ACCENT_STORAGE_KEY = 'teamtrack-accent';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return true;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;

  return true;
};

const getInitialAccent = (): AccentColor => {
  if (typeof window === 'undefined') return 'blue';

  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;
  if (stored && ['blue', 'purple', 'green', 'rose', 'orange'].includes(stored)) {
    return stored;
  }

  return 'blue';
};

export const useThemeStore = create<ThemeState>()((set) => ({
  isDark: getInitialTheme(),
  accentColor: getInitialAccent(),

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      }
      return { isDark: next };
    }),

  setTheme: (isDark) =>
    set(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
      }
      return { isDark };
    }),

  setAccentColor: (color) =>
    set(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCENT_STORAGE_KEY, color);
      }
      return { accentColor: color };
    }),
}));
