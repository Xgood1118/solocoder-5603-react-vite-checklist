import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()((set) => ({
  isDark: 
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches),
  
  toggleTheme: () => {
    set((state) => {
      const newDark = !state.isDark;
      localStorage.theme = newDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newDark);
      return { isDark: newDark };
    });
  },
  
  setTheme: (dark: boolean) => {
    localStorage.theme = dark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', dark);
    set({ isDark: dark });
  },
}));
