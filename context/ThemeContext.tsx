import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { themes, ColorScheme } from '@/constants/colors';

const ThemeContext = createContext<ColorScheme>(themes.light);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColors(): ColorScheme {
  return useContext(ThemeContext);
}
