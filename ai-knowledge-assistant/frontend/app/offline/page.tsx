'use client';

import React from 'react';
import { WifiOff, RefreshCw, ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Knowledge Assistant
          </span>
        </div>

        {/* Offline Icon Illustration */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-sm">
            <WifiOff className="h-8 w-8" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            You&apos;re Offline
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            No internet connection detected. Previously cached documents and chat histories remain accessible, but online AI reasoning requires an active connection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking Network...' : 'Retry Connection'}</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs sm:text-sm font-medium transition hover:border-slate-500"
            style={{
              backgroundColor: 'var(--card-inner)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Open Offline Workspace</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
