'use client';

import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for interactive ripple/gravity effect
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create dynamic neural nodes and floating cloud particles
    const particleCount = Math.min(85, Math.floor((width * height) / 14000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      color: string;
      pulseSpeed: number;
      pulseOffset: number;
    }> = [];

    const isDarkMode = () =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';

    const colorsDark = [
      'rgba(59, 130, 246, ', // blue
      'rgba(99, 102, 241, ', // indigo
      'rgba(147, 51, 234, ', // purple
      'rgba(56, 189, 248, ', // sky cyan
    ];

    const colorsLight = [
      'rgba(37, 99, 235, ', // vibrant blue
      'rgba(79, 70, 229, ', // deep indigo
      'rgba(14, 165, 233, ', // bright cyan
      'rgba(99, 102, 241, ', // purple
    ];

    for (let i = 0; i < particleCount; i++) {
      const isDark = isDarkMode();
      const palette = isDark ? colorsDark : colorsLight;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        size: Math.random() * 2.8 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.25,
        alpha: Math.random() * 0.45 + 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Floating large organic cloud orbs
    const cloudOrbs = [
      { x: width * 0.2, y: height * 0.25, radius: 280, vx: 0.15, vy: 0.1, hue: '59, 130, 246' },
      { x: width * 0.8, y: height * 0.4, radius: 340, vx: -0.12, vy: 0.15, hue: '147, 51, 234' },
      { x: width * 0.5, y: height * 0.75, radius: 300, vx: 0.1, vy: -0.12, hue: '56, 189, 248' },
    ];

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const isDark = isDarkMode();

      // 1. Draw glowing ambient organic background clouds
      for (const orb of cloudOrbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );

        const orbAlpha = isDark ? 0.08 : 0.05;
        gradient.addColorStop(0, `rgba(${orb.hue}, ${orbAlpha})`);
        gradient.addColorStop(0.5, `rgba(${orb.hue}, ${orbAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${orb.hue}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw neural constellation connection lines
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * (isDark ? 0.18 : 0.12);
            ctx.beginPath();
            ctx.strokeStyle = isDark
              ? `rgba(99, 102, 241, ${lineAlpha})`
              : `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw particles with subtle pulsing and interactive mouse repulsion/connection
      for (const p of particles) {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interactive distance
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius) {
          const force = (1 - distMouse / mouse.radius) * 1.5;
          p.x -= (dxMouse / distMouse) * force * 1.2;
          p.y -= (dyMouse / distMouse) * force * 1.2;

          // Connect particle to mouse with glowing line
          const mouseLineAlpha = (1 - distMouse / mouse.radius) * (isDark ? 0.35 : 0.22);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59, 130, 246, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Pulse alpha
        const currentAlpha =
          p.baseAlpha + Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.18;
        const safeAlpha = Math.max(0.1, Math.min(0.85, currentAlpha));

        // Draw particle dot with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${safeAlpha})`;
        ctx.fill();

        // Subtle outer aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${safeAlpha * 0.22})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Interactive HTML5 60fps Neural & Aurora Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{
          filter: 'blur(0.4px)',
        }}
      />

      {/* Moving Ambient Modern Grid Overlay */}
      <div
        className="absolute inset-0 animate-grid-move opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--grid-color) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radiant Ambient Vignette */}
      <div
        className="absolute inset-0 transition-colors duration-300 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(var(--bg-rgb, 10, 15, 30), 0.3) 70%, rgba(var(--bg-rgb, 10, 15, 30), 0.65) 100%)',
        }}
      />
    </div>
  );
}
