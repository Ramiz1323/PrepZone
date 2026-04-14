import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import '../styles/components/_reload-prompt.scss';

function ReloadPrompt() {
  const swState = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Safety check to prevent destructuring null/undefined
  if (!swState) return null;

  // Extremely defensive access to handle potential undefined states in different environments
  const offlineReady = swState.offlineReady ? swState.offlineReady[0] : false;
  const setOfflineReady = swState.offlineReady ? swState.offlineReady[1] : () => {};
  
  const needUpdate = swState.needUpdate ? swState.needUpdate[0] : false;
  const setNeedUpdate = swState.needUpdate ? swState.needUpdate[1] : () => {};
  
  const updateServiceWorker = swState.updateServiceWorker;

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  return (
    <div className="pwa-reload-prompt">
      {(offlineReady || needUpdate) && (
        <div className="pwa-toast">
          <div className="pwa-message">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click on reload button to update.</span>
            )}
          </div>
          <div className="pwa-buttons">
            {needUpdate && (
              <button className="pwa-button reload" onClick={() => updateServiceWorker(true)}>
                Reload
              </button>
            )}
            <button className="pwa-button close" onClick={close}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt;
