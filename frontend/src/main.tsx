import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register Service Worker for PWA / Mobile
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('PWA ServiceWorker registration:', err)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


