'use client';

import React, { useEffect, useRef } from 'react';

export default function IndianFlagBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating glowing tri-color particles
    const particleCount = Math.min(60, Math.floor((width * height) / 20000));
    const particles = Array.from({ length: particleCount }, () => {
      const type = Math.random();
      let color = '255, 153, 51'; // Saffron
      if (type > 0.66) {
        color = '19, 136, 8'; // Green
      } else if (type > 0.33) {
        color = '255, 255, 255'; // White
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.6 - 0.15,
        radius: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.3,
        color,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const h = height;
      const w = width;

      // 1. ===== TOP SAFFRON (Kesari) FLUID WAVE LAYER =====
      const saffronGrad = ctx.createLinearGradient(0, 0, w, h * 0.4);
      saffronGrad.addColorStop(0, 'rgba(255, 140, 26, 0.45)');
      saffronGrad.addColorStop(0.5, 'rgba(255, 166, 77, 0.32)');
      saffronGrad.addColorStop(1, 'rgba(255, 179, 102, 0.05)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      for (let x = w; x >= 0; x -= 25) {
        const wave =
          Math.sin((x / w) * 3 + tick * 0.02) * 28 +
          Math.cos((x / w) * 2 + tick * 0.015) * 16;
        ctx.lineTo(x, h * 0.33 + wave);
      }
      ctx.closePath();
      ctx.fillStyle = saffronGrad;
      ctx.fill();

      // 2. ===== MIDDLE ASHOKA CHAKRA WATERMARK & WHITE AURA =====
      const chakraCenterX = w * 0.5;
      const chakraCenterY = h * 0.5;
      const chakraRadius = Math.min(w, h) * 0.22;
      const chakraAngle = tick * 0.004;

      ctx.save();
      ctx.translate(chakraCenterX, chakraCenterY);
      ctx.rotate(chakraAngle);
      ctx.strokeStyle = 'rgba(0, 0, 128, 0.22)';
      ctx.lineWidth = 3;

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, chakraRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(0, 0, chakraRadius * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      // 24 Spokes
      for (let i = 0; i < 24; i++) {
        const rad = (i * Math.PI) / 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * chakraRadius, Math.sin(rad) * chakraRadius);
        ctx.stroke();
      }
      ctx.restore();

      // 3. ===== BOTTOM GREEN (Hara) FLUID WAVE LAYER =====
      const greenGrad = ctx.createLinearGradient(0, h * 0.6, w, h);
      greenGrad.addColorStop(0, 'rgba(19, 136, 8, 0.05)');
      greenGrad.addColorStop(0.5, 'rgba(19, 136, 8, 0.32)');
      greenGrad.addColorStop(1, 'rgba(4, 106, 56, 0.45)');

      ctx.beginPath();
      for (let x = 0; x <= w; x += 25) {
        const wave =
          Math.sin((x / w) * 3 + tick * 0.02 + Math.PI) * 28 +
          Math.cos((x / w) * 2 + tick * 0.015) * 16;
        if (x === 0) {
          ctx.moveTo(0, h * 0.67 + wave);
        } else {
          ctx.lineTo(x, h * 0.67 + wave);
        }
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = greenGrad;
      ctx.fill();

      // 4. ===== FLOATING TRI-COLOR GLOW PARTICLES =====
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const pulse = Math.sin(tick * 0.03 + p.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = p.baseAlpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Base Multi-Layer Animated Tiranga Gradient Bands (Always Clearly Visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/25 via-white/40 to-[#138808]/25 dark:from-[#FF9933]/20 dark:via-slate-900/40 dark:to-[#138808]/20" />

      {/* Top Saffron Animated Aura Orb */}
      <div className="absolute -top-28 -left-20 w-[650px] h-[450px] rounded-full bg-gradient-to-br from-[#FF9933]/50 via-[#FF7700]/35 to-transparent blur-3xl animate-pulse" />
      
      {/* Top Right Saffron Radiant Orb */}
      <div className="absolute -top-20 -right-20 w-[600px] h-[400px] rounded-full bg-gradient-to-bl from-[#FF9933]/45 via-[#FFB866]/30 to-transparent blur-3xl" />

      {/* Center White/Navy Chakra Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-radial from-blue-600/20 via-white/30 to-transparent blur-2xl pointer-events-none" />

      {/* Bottom Left India Green Animated Aura Orb */}
      <div className="absolute -bottom-28 -left-20 w-[650px] h-[500px] rounded-full bg-gradient-to-tr from-[#138808]/50 via-[#22C55E]/40 to-transparent blur-3xl animate-pulse" />

      {/* Bottom Right India Green Radiant Orb */}
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[450px] rounded-full bg-gradient-to-tl from-[#046A38]/50 via-[#138808]/40 to-transparent blur-3xl" />

      {/* 2. Interactive Canvas with Waves & Rotating Ashoka Chakra */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block opacity-95" />

      {/* 3. Subtle Ambient Moving Grid */}
      <div
        className="absolute inset-0 animate-grid-move opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--grid-color) 1.5px, transparent 1.5px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 4. Top Header Tri-Color Saffron, White, Green Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-100 shadow-md" />
    </div>
  );
}
