'use client';

import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePWA } from '@/components/shared/pwa-provider';

export default function InstallAppButton({
  variant = 'navbar',
  className = '',
}: {
  variant?: 'navbar' | 'hero' | 'floating' | 'drawer';
  className?: string;
}) {
  const { isInstalled, promptInstall } = usePWA();
  const [isPrompting, setIsPrompting] = useState(false);

  const handleClick = async () => {
    setIsPrompting(true);
    try {
      await promptInstall();
    } finally {
      setIsPrompting(false);
    }
  };

  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 font-medium">
          <Check className="h-3.5 w-3.5" />
          <span>App Installed</span>
        </span>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400 font-medium shrink-0">
        <Check className="h-3.5 w-3.5" />
        <span className="text-[11px]">Installed</span>
      </span>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      type="button"
      disabled={isPrompting}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all shadow-sm shrink-0 select-none ${
        variant === 'navbar'
          ? 'border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 px-2.5 sm:px-3 py-1.5 text-xs'
          : variant === 'hero'
          ? 'border border-blue-500/40 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-sm'
          : variant === 'drawer'
          ? 'border border-blue-500/30 bg-blue-600 text-white px-3 py-1.5 text-xs'
          : 'border border-slate-700 bg-slate-900/90 text-white px-3 py-2 text-xs'
      } ${className}`}
      title="Install App to Home Screen"
    >
      {isPrompting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span>{isPrompting ? 'Installing...' : 'Install App'}</span>
    </motion.button>
  );
}
