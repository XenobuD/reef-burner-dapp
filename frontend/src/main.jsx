import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import {
  registerServiceWorker,
  setupInstallPrompt,
  setupNetworkMonitoring,
  isInstalled,
  isMobile
} from './pwa-register';

// Initialize PWA features
if (import.meta.env.PROD) {
  // Only in production
  registerServiceWorker();
  setupInstallPrompt();
  setupNetworkMonitoring();

  // Log PWA status
  console.log('📱 Mobile device:', isMobile());
  console.log('💜 Installed as PWA:', isInstalled());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
