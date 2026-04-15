import React, { useEffect, useMemo, useState } from 'react';
import '../styles/components/_install-prompt.scss';

const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone;
};

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [androidVisible, setAndroidVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);

  const dismissedKey = useMemo(() => 'pwa_install_dismissed', []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return;
    if (sessionStorage.getItem(dismissedKey) === '1') return;

    if (isIos()) {
      setIosVisible(true);
    }

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setAndroidVisible(true);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setAndroidVisible(false);
      setIosVisible(false);
      sessionStorage.removeItem(dismissedKey);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [dismissedKey]);

  const dismiss = () => {
    sessionStorage.setItem(dismissedKey, '1');
    setAndroidVisible(false);
    setIosVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setAndroidVisible(false);
    }
  };

  const visible = androidVisible || iosVisible;
  if (!visible) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-toast">
        <div className="pwa-message">
          {androidVisible ? (
            <span>Install PrepZone for faster access and offline support.</span>
          ) : (
            <span>
              Install on iPhone: tap <strong>Share</strong> and choose <strong>Add to Home Screen</strong>.
            </span>
          )}
        </div>
        <div className="pwa-buttons">
          {androidVisible && (
            <button className="pwa-button install" onClick={install}>
              Install
            </button>
          )}
          <button className="pwa-button close" onClick={dismiss}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;

