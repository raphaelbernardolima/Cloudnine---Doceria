import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeMode } from './tokens';
import { createCloudnineTheme } from './theme';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme deve ser usado dentro de um AppThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  // Inicializa o modo escuro a partir do localStorage ou da preferência do sistema
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('cloudnine-theme') as ThemeMode | null;
    if (savedMode) return savedMode;
    
    // Fallback para a preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const setTheme = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('cloudnine-theme', newMode);
  };

  const toggleTheme = () => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  // Observa mudanças na preferência do sistema, se não houver preferência salva
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('cloudnine-theme')) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = React.useMemo(() => createCloudnineTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
