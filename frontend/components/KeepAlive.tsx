'use client';

/**
 * KeepAlive — wakes the Render backend on first page load.
 *
 * Render free tier spins down after 15 min of inactivity.
 * This component silently pings /api/health as soon as the app loads,
 * so by the time the user clicks anything the backend is already warm.
 *
 * Also sets up a 10-minute interval ping to keep it warm while the tab is open.
 */

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API}/api/health`, { cache: 'no-store' }).catch(() => {});
    };

    // Immediate ping on mount
    ping();

    // Recurring ping to prevent cold start during active sessions
    const interval = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null; // renders nothing
}
