import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './i18n.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import CategoryTranslationProvider from './components/providers/CategoryTranslationProvider.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initRUM } from './rum'
import apiClient from './services/api'
import { instrumentAxios } from './rum'

// PWA service worker registration (auto-update)
// If you see a build error:  Cannot resolve "virtual:pwa-register"
// it usually means: 1) vite-plugin-pwa not installed, or 2) Vite config plugin not applied.
// The dynamic import stays wrapped so the rest of the app still loads even if the plugin is missing.
const enablePWA = import.meta.env.PROD || import.meta.env.VITE_ENABLE_PWA_DEV === 'true'
if (enablePWA) {
  import('virtual:pwa-register').then(mod => {
    const registerSW = mod?.registerSW || (() => {})
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('pwa:need-refresh', { detail: { updateSW } }))
      },
      onOfflineReady() {
        window.dispatchEvent(new Event('pwa:offline-ready'))
      }
    })
  }).catch(() => {
    // Silently ignore if plugin isn't present; avoids breaking dev environments without PWA plugin.
  })
}

// RUM init and axios instrumentation
try {
  initRUM();
  instrumentAxios(apiClient);
} catch {
  // ignore RUM init errors
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ModalProvider>
        <CategoryTranslationProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </CategoryTranslationProvider>
      </ModalProvider>
    </AuthProvider>
  </React.StrictMode>,
);