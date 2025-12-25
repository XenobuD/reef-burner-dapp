// PWA Registration
// Built by XenobuD

export function registerServiceWorker() {
  // TEMPORARILY DISABLED - Service Worker causing cache issues
  console.log('⚠️ PWA: Service Worker DISABLED for debugging');

  // Unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('🗑️ PWA: Unregistered old service worker');
      });
    });
  }

  /* ORIGINAL CODE - RE-ENABLE AFTER TESTING
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ PWA: Service Worker registered!', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.log('❌ PWA: Service Worker registration failed:', error);
        });
    });
  }
  */
}

// Install prompt for "Add to Home Screen"
let deferredPrompt;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    console.log('💡 PWA: Install prompt available');

    // Optionally show your own install button
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA: App installed!');
    deferredPrompt = null;
  });
}

function showInstallButton() {
  // Create install button (optional - can be styled later)
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Install App';
  installButton.className = 'install-prompt-btn';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #7043FF, #FF43B9);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(112, 67, 255, 0.4);
    z-index: 1000;
    font-size: 14px;
  `;

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response: ${outcome}`);

    // Clear the prompt
    deferredPrompt = null;

    // Hide the button
    installButton.remove();
  });

  // Add to page
  document.body.appendChild(installButton);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    installButton.style.opacity = '0';
    setTimeout(() => installButton.remove(), 300);
  }, 10000);
}

// Detect if running as installed PWA
export function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// iOS specific - detect if saved to home screen
export function isIOSInstalled() {
  return window.navigator.standalone === true;
}

// Check if device is mobile
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Network status monitoring
export function setupNetworkMonitoring() {
  window.addEventListener('online', () => {
    console.log('🌐 PWA: Back online!');
    showNetworkStatus('online');
  });

  window.addEventListener('offline', () => {
    console.log('📡 PWA: Offline mode');
    showNetworkStatus('offline');
  });
}

function showNetworkStatus(status) {
  const message = status === 'online'
    ? '🌐 Back online!'
    : '📡 Offline - Some features unavailable';

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: ${status === 'online' ? '#48bb78' : '#f6ad55'};
    color: white;
    border-radius: 8px;
    font-weight: 600;
    z-index: 2000;
    animation: slideDown 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
