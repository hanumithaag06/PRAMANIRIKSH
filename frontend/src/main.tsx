import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// PWA Service Worker management
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development mode: Unregister service workers and clear caches so Vite HMR / dev scripts are never cached or intercepted
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.includes('pramaniriksh')) {
            caches.delete(key).catch(() => {});
          }
        }
      }).catch(() => {});
    }
  } else {
    // In production mode: register service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA ServiceWorker registration error:', err)
      })
    })
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  console.error('Fatal: #root element not found in DOM.');
}
