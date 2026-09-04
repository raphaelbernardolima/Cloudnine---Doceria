import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from './core/theme/ThemeContext';
import { App } from './App.tsx';
import { ErrorBoundary } from './core/ui/shared/ErrorBoundary';
import './core/i18n/i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </AppThemeProvider>
  </StrictMode>,
);
