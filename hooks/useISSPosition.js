'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchISSPosition, ISSApiError } from '@/lib/issApi';
import { SAMPLE_ISS_DATA } from '@/lib/sampleData';

const DEFAULT_POLL_INTERVAL_MS = 7000;
const MAX_TRAIL_LENGTH = 30;
const MANUAL_REFRESH_COOLDOWN_MS = 2500;
const STALE_THRESHOLD_MS = 21000;
/**
 * Hook to manage ISS live telemetry, polling, history trail, and lifecycle states.
 */
export function useISSPosition(options = {}) {
  const {
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
    initialSimulation = false
  } = options;

  // Telemetry state
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastValidPosition, setLastValidPosition] = useState(null);
  
  // History trail of valid positions: [{ latitude, longitude, timestamp, altitude }]
  const [trail, setTrail] = useState([]);
  
  // Status: 'INITIAL_LOADING' | 'LIVE' | 'UPDATING' | 'STALE' | 'ERROR'
  const [status, setStatus] = useState('INITIAL_LOADING');
  const [error, setError] = useState(null);
  const [lastSuccessTime, setLastSuccessTime] = useState(null);
  
  // Controls & UX state
  const [isFollowing, setIsFollowing] = useState(true);
  const [isTrailVisible, setIsTrailVisible] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState(initialSimulation);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [canManualRefresh, setCanManualRefresh] = useState(true);

  // Refs for tracking active operations and teardown
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const lastManualClickRef = useRef(0);
  const currentPositionRef = useRef(null);
  const isSimulationModeRef = useRef(isSimulationMode);

  // Keep ref synchronized with state
  useEffect(() => {
    isSimulationModeRef.current = isSimulationMode;
  }, [isSimulationMode]);

  useEffect(() => {
    currentPositionRef.current = currentPosition;
  }, [currentPosition]);
  // Automatically detect stale ISS telemetry
useEffect(() => {
  if (!lastSuccessTime || isSimulationMode) return;

  const checkStaleData = () => {
    const dataAge = Date.now() - lastSuccessTime;

    if (dataAge >= STALE_THRESHOLD_MS) {
      setStatus((prev) =>
        prev === 'ERROR' ? prev : 'STALE'
      );
    }
  };

  checkStaleData();

  const staleTimer = setInterval(checkStaleData, 1000);

  return () => clearInterval(staleTimer);
}, [lastSuccessTime, isSimulationMode]);

  /**
   * Appends a valid observation to the trail history without duplicates.
   */
  const appendToTrail = useCallback((newPos) => {
    // Never append demo data to real trail
    if (newPos.isDemo) return;

    setTrail((prevTrail) => {
      if (prevTrail.length > 0) {
        const last = prevTrail[prevTrail.length - 1];
        // Skip duplicate if lat, lon and timestamp match
        if (
          Math.abs(last.latitude - newPos.latitude) < 0.0001 &&
          Math.abs(last.longitude - newPos.longitude) < 0.0001 &&
          last.timestamp === newPos.timestamp
        ) {
          return prevTrail;
        }
      }

      const point = {
        latitude: newPos.latitude,
        longitude: newPos.longitude,
        timestamp: newPos.timestamp,
        altitude: newPos.altitude,
        velocity: newPos.velocity,
        timeString: new Date(newPos.timestamp * 1000).toLocaleTimeString()
      };

      const updated = [...prevTrail, point];
      // Keep only most recent 30 entries
      if (updated.length > MAX_TRAIL_LENGTH) {
        return updated.slice(updated.length - MAX_TRAIL_LENGTH);
      }
      return updated;
    });
  }, []);

  /**
   * Main fetch function.
   * Handles state transitions: INITIAL_LOADING -> LIVE / ERROR / STALE.
   */
  const executeFetch = useCallback(async (isManual = false) => {
    // Prevent overlapping requests
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    if (isManual) {
      setIsManualRefreshing(true);
    }

    // Abort any lingering request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Transition to UPDATING if we already have data
    if (currentPositionRef.current) {
      setStatus((prev) => (prev === 'STALE' ? 'STALE' : 'UPDATING'));
    }

    try {
      const data = await fetchISSPosition({
        signal: controller.signal,
        forceSimulation: isSimulationModeRef.current
      });

      // Successful response
      setCurrentPosition(data);
      setLastValidPosition(data);
      setLastSuccessTime(Date.now());
      setStatus('LIVE');
      setError(null);

      // Append to movement trail if not simulation data
      if (!data.isDemo) {
        appendToTrail(data);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request cancelled intentionally
        return;
      }

      console.warn('[ISS Tracker] Fetch error:', err.message);
      setError(err.message || 'Telemetry connection failed');

      if (currentPositionRef.current) {
        // We have previously valid data: mark as STALE, preserve last valid position
        setStatus('STALE');
      } else {
        // We have NEVER received valid data
        setStatus('ERROR');
      }
    } finally {
      inFlightRef.current = false;
      if (isManual) {
        setIsManualRefreshing(false);
      }
    }
  }, [appendToTrail]);

  /**
   * Manual refresh handler respecting rate limits (~1 req/s API limit)
   */
  const manualRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastManualClickRef.current < MANUAL_REFRESH_COOLDOWN_MS) {
      return; // Rate limit protection
    }
    lastManualClickRef.current = now;
    setCanManualRefresh(false);

    // Reset cooldown after delay
    setTimeout(() => {
      setCanManualRefresh(true);
    }, MANUAL_REFRESH_COOLDOWN_MS);

    executeFetch(true);
  }, [executeFetch]);

  /**
   * Clear recorded movement trail
   */
  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  /**
   * Toggle map follow mode
   */
  const toggleFollow = useCallback(() => {
    setIsFollowing((prev) => !prev);
  }, []);

  /**
   * Toggle trail visibility
   */
  const toggleTrail = useCallback(() => {
    setIsTrailVisible((prev) => !prev);
  }, []);

  /**
   * Toggle demo / simulation mode
   */
  const toggleSimulationMode = useCallback(() => {
    setIsSimulationMode((prev) => {
      const next = !prev;
      if (next) {
        // Switch to demo data immediately
        setCurrentPosition({
          ...SAMPLE_ISS_DATA,
          fetchedAt: Date.now()
        });
        setStatus('LIVE');
      } else {
        // Return to live polling
        setStatus('INITIAL_LOADING');
        executeFetch(false);
      }
      return next;
    });
  }, [executeFetch]);

  /**
   * Load demo data explicitly if in error state
   */
  const loadDemoData = useCallback(() => {
    setCurrentPosition({
      ...SAMPLE_ISS_DATA,
      fetchedAt: Date.now()
    });
    setStatus('LIVE');
    setIsSimulationMode(true);
  }, []);

  // Set up polling interval & visibility change listener
  useEffect(() => {
    let isMounted = true;

    // Defer initial fetch to next tick to avoid synchronous effect setState cascade
    const initialTimer = setTimeout(() => {
      if (isMounted) {
        executeFetch(false);
      }
    }, 0);

    const startPolling = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        // Only poll if tab is visible to conserve network and respect API rate limits
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          executeFetch(false);
        }
      }, intervalMs);
    };

    startPolling();

    // Listen to tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became active again, trigger an immediate refresh
        executeFetch(false);
        startPolling();
      } else {
        // Tab hidden, clear interval to stop background polling
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Online / offline browser events
    const handleOnline = () => {
      executeFetch(false);
    };
    const handleOffline = () => {
      setStatus((prev) => (currentPositionRef.current ? 'STALE' : 'ERROR'));
      setError('Browser network offline. Check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [intervalMs, executeFetch]);

  return {
    currentPosition: currentPosition || lastValidPosition,
    lastValidPosition,
    trail,
    status, // 'INITIAL_LOADING' | 'LIVE' | 'UPDATING' | 'STALE' | 'ERROR'
    error,
    lastSuccessTime,
    isFollowing,
    isTrailVisible,
    isSimulationMode,
    isManualRefreshing,
    canManualRefresh,
    intervalMs,
    // Actions
    refresh: manualRefresh,
    retry: manualRefresh,
    clearTrail,
    toggleFollow,
    toggleTrail,
    toggleSimulationMode,
    loadDemoData
  };
}
