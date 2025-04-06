'use client';

import { useEffect } from 'react';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || 'http://localhost:3000';

export default function CookieSyncPage() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== ALLOWED_ORIGIN) {
        console.warn('Invalid origin:', event.origin);
        return;
      }

      if (event.data.type === 'SET_TOKEN') {
        // Sync the cookie
        fetch(`/api/auth/cookie-sync?token=${event.data.token}`, {
          credentials: 'include'
        });

        event.source?.postMessage({ type: 'TOKEN_SYNCED' }, {
          targetOrigin: event.origin
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <div>Syncing authentication...</div>;
}