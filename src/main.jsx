import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './i18n.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AuthProvider>
  </React.StrictMode>,
);