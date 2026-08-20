'use client';

/**
 * useAutoRefresh — automatically re-fetches data when:
 * 1. The user switches back to the tab (visibilitychange)
 * 2. The window regains network connection (online event)
 *
 * This ensures that if the admin makes changes, visitors see
 * them the next time they return to the tab — no manual refresh needed.
 */

import { useEffect, useCallback } from 'react';

export function useAutoRefresh(refetch: () => void, intervalMinutes = 0) {
  const stableRefetch = useCallback(refetch, []); // eslint-disable-line

  useEffect(() => {
    // Refetch when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        stableRefetch();
      }
    };

    // Refetch when network comes back online
    const handleOnline = () => {
      stableRefetch();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);

    // Optional periodic refresh (disabled by default, intervalMinutes = 0)
    let interval: ReturnType<typeof setInterval> | null = null;
    if (intervalMinutes > 0) {
      interval = setInterval(stableRefetch, intervalMinutes * 60 * 1000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      if (interval) clearInterval(interval);
    };
  }, [stableRefetch, intervalMinutes]);
}
