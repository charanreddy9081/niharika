'use client';

/**
 * KeepAlive — prevents Render free tier cold starts.
 *
 * Render spins down after 15 min of inactivity causing 30-50s delays.
 * This component:
 * 1. Pings /api/health immediately on every page load
 * 2. Pings every 9 minutes while tab is open
 * 3. Pings when user returns to the tab (visibility change)
 *
 * For permanent warm server, also set up https://cron-job.org with
 * URL: https://niharikartist-backend.onrender.com/api/health every 14 min
 */

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PING_INTERVAL = 9 * 60 * 1000; // 9 min — under Render's 15min spin-down threshold

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API}/api/health`, { cache: 'no-store' }).catch(() => {});
    };

    // Immediate ping on mount — wakes Render before user clicks anything
    ping();

    // Recurring ping to keep it warm while tab is open
    const interval = setInterval(ping, PING_INTERVAL);

    // Also ping when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return null;
}
