import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import AdminApp from './admin/AdminApp.tsx'
import App from './App.tsx'
import { isCapacitorNative } from './lib/platform'

const Router = isCapacitorNative() ? HashRouter : BrowserRouter

if (import.meta.env.PROD && 'serviceWorker' in navigator && !isCapacitorNative()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </StrictMode>,
)
