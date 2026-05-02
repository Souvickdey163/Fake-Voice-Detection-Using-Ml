import { useEffect, useRef, useState } from 'react';

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let gsiScriptPromise;
let initializedClientId;
let latestCredentialHandler = () => {};

function loadGsiScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${GIS_SCRIPT_SRC}"]`
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

function initializeGsi(clientId) {
  if (initializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (credentialResponse) => {
      latestCredentialHandler(credentialResponse);
    },
  });
  initializedClientId = clientId;
}

export default function GoogleSignInButton({
  clientId,
  onSuccess,
  onError,
  text = 'signin_with',
}) {
  const buttonRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    let cancelled = false;
    const buttonElement = buttonRef.current;

    latestCredentialHandler = (credentialResponse) => {
      if (!credentialResponse?.credential) {
        onErrorRef.current?.();
        return;
      }

      onSuccessRef.current?.(credentialResponse);
    };

    loadGsiScript()
      .then(() => {
        if (cancelled || !buttonElement) {
          return;
        }

        initializeGsi(clientId);
        buttonElement.replaceChildren();
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'filled_black',
          shape: 'pill',
          size: 'large',
          text,
        });
        setFailed(false);
      })
      .catch((error) => {
        console.error('Google Identity Services failed to load:', error);
        if (!cancelled) {
          setFailed(true);
          onErrorRef.current?.();
        }
      });

    return () => {
      cancelled = true;
      buttonElement?.replaceChildren();
    };
  }, [clientId, text]);

  if (failed) {
    return (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
        Google login could not be loaded. Please try again later.
      </div>
    );
  }

  return <div ref={buttonRef} className="min-h-10" />;
}
