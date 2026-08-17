'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    THREE?: any;
    VANTA?: any;
  }
}

export default function VantaClouds() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        if (existing) {
          if (existing.dataset.loaded === 'true') {
            resolve();
            return;
          }
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        if (!window.THREE || !window.THREE.Color) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        }
        if (!window.VANTA || !window.VANTA.CLOUDS) {
          await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js');
        }

        if (isCancelled || !vantaRef.current || !window.VANTA || !window.VANTA.CLOUDS || !window.THREE) {
          return;
        }

        // Clean up previous effect if any
        if (effectRef.current) {
          try {
            effectRef.current.destroy();
          } catch (e) {}
          effectRef.current = null;
        }

        const isDark =
          document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark';

        effectRef.current = window.VANTA.CLOUDS({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          backgroundColor: isDark ? 0x070b14 : 0xf1f5f9,
          skyColor: isDark ? 0x0f172a : 0x68b8d7,
          cloudColor: isDark ? 0x1e293b : 0xadc1de,
          cloudShadowColor: isDark ? 0x090d16 : 0x183550,
          sunColor: isDark ? 0x3b82f6 : 0xff9919,
          sunGlareColor: isDark ? 0x6366f1 : 0xff6633,
          sunlightColor: isDark ? 0x60a5fa : 0xff9933,
          speed: 1.0,
        });
      } catch (err) {
        console.error('Vanta Clouds initialization error:', err);
      }
    };

    initVanta();

    const handleThemeChange = () => {
      initVanta();
    };

    window.addEventListener('app-theme-change', handleThemeChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('app-theme-change', handleThemeChange);
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch (e) {}
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div ref={vantaRef} className="absolute inset-0 w-full h-full" />
      {/* Subtle overlay for text clarity */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(var(--bg-rgb, 10, 15, 30), 0.35) 70%, rgba(var(--bg-rgb, 10, 15, 30), 0.65) 100%)',
        }}
      />
    </div>
  );
}
