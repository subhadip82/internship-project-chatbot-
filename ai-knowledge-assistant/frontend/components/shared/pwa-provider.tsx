'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WifiOff, Wifi, Smartphone, X, Download, Sparkles, Share, PlusSquare, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  promptInstall: () => Promise<boolean>;
  openInstallModal: () => void;
  closeInstallModal: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  promptInstall: async () => false,
  openInstallModal: () => {},
  closeInstallModal: () => {},
});

export const usePWA = () => useContext(PWAContext);

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // 1. Check standalone mode & listen to PWA install events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as any).__pwa_prompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      console.log('[PWA] App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if global prompt was captured before component mount
    if ((window as any).__pwa_prompt) {
      setDeferredPrompt((window as any).__pwa_prompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 2. Real-time Network Connection Monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic lightweight reachability check
    const pingInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const res = await fetch('/manifest.json?ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
          if (!res.ok && isOnline) {
            setIsOnline(false);
          } else if (res.ok && !isOnline) {
            handleOnline();
          }
        } catch {
          if (isOnline) setIsOnline(false);
        }
      }
    }, 25000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, [isOnline]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__pwa_prompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).__pwa_prompt = null;
          setShowInstallModal(false);
          return true;
        }
      } catch (err) {
        console.warn('[PWA] Native prompt execution error:', err);
      }
    }

    // Always open clean in-app install card if native prompt was not triggered
    setShowInstallModal(true);
    return false;
  }, [deferredPrompt]);

  const openInstallModal = () => setShowInstallModal(true);
  const closeInstallModal = () => setShowInstallModal(false);

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !isInstalled,
        isInstalled,
        isOnline,
        promptInstall,
        openInstallModal,
        closeInstallModal,
      }}
    >
      {children}

      {/* ===== 1. Non-Blocking Persistent Offline Warning Banner ===== */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium bg-amber-600 text-white shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2 max-w-2xl mx-auto flex-1 min-w-0">
              <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong>Offline Mode:</strong> No internet connection. Previously cached documents and chats remain available.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1 text-[11px] font-semibold transition"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 2. Temporary Online Recovery Toast ===== */}
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-xl"
          >
            <Wifi className="h-4 w-4 shrink-0" />
            <span>Back Online - Reconnected successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 3. In-App Professional Install Modal Card ===== */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            >
              <button
                onClick={closeInstallModal}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-md">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    AI Knowledge Assistant
                  </h3>
                  <p className="text-xs font-medium text-blue-400">
                    Official Mobile & Desktop App
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Install the app on your phone or PC for a faster, full-screen experience with instant access from your home screen.
              </p>

              {/* Platform Specific Action */}
              {isIOS ? (
                <div
                  className="space-y-2 rounded-xl p-3 border text-xs"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p className="font-semibold text-blue-400 text-[11px]">Install on iOS / Safari:</p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold shrink-0">1</span>
                    <span>Tap <strong>Share</strong> button in Safari</span>
                    <Share className="h-3.5 w-3.5 text-blue-400 inline shrink-0 ml-auto" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold shrink-0">2</span>
                    <span>Select <strong>Add to Home Screen</strong></span>
                    <PlusSquare className="h-3.5 w-3.5 text-blue-400 inline shrink-0 ml-auto" />
                  </div>
                </div>
              ) : deferredPrompt ? (
                <button
                  onClick={async () => {
                    if (deferredPrompt) {
                      await deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setIsInstalled(true);
                        setDeferredPrompt(null);
                        setShowInstallModal(false);
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Install App Now</span>
                </button>
              ) : (
                <div
                  className="space-y-2 rounded-xl p-3 border text-xs"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p className="font-semibold text-blue-400 text-[11px]">To Install on Android / Chrome / Edge:</p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold shrink-0">1</span>
                    <span>Tap browser menu (<strong>⋮</strong>) at top right</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold shrink-0">2</span>
                    <span>Tap <strong>Install App</strong> or <strong>Add to Home screen</strong></span>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <button
                  onClick={closeInstallModal}
                  className="w-full rounded-xl border py-2 text-xs font-medium transition hover:border-slate-500"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PWAContext.Provider>
  );
}
