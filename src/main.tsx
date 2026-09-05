import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppThemeProvider } from './core/theme/ThemeContext';
import { App } from './App.tsx';
import { ErrorBoundary } from './core/ui/shared/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';
import './core/i18n/i18n';
import './index.css';

// Registra o Service Worker do PWA
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AppThemeProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </AppThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
