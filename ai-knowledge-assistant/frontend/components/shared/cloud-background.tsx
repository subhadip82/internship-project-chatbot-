'use client';

import React, { useEffect, useRef } from 'react';

export default function CloudBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initClouds();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    const isDarkMode = () =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';

    // Cloud Puff structure for realistic 3D volumetric clouds
    interface CloudPuff {
      relX: number;
      relY: number;
      radius: number;
      alpha: number;
      shade: number; // 0 (dark shadow) to 1 (bright sunlit highlight)
    }

    interface CloudCluster {
      x: number;
      y: number;
      speed: number;
      scale: number;
      baseAlpha: number;
      depth: number; // 1 = far, 2 = mid, 3 = foreground
      puffs: CloudPuff[];
    }

    let clouds: CloudCluster[] = [];

    const createCloudCluster = (x: number, y: number, depth: number): CloudCluster => {
      const puffCount = 14 + Math.floor(Math.random() * 12);
      const puffs: CloudPuff[] = [];
      const cloudWidth = 260 + Math.random() * 220;
      const cloudHeight = 110 + Math.random() * 80;

      for (let i = 0; i < puffCount; i++) {
        // Distribute puffs horizontally in a natural cloud cluster shape
        const u = (Math.random() - 0.5) * 2;
        const relX = u * (cloudWidth * 0.45);
        // Flatter bottom, puffier top
        const relY = ((Math.random() - 0.6) * cloudHeight * 0.45) - Math.abs(u) * 20;
        const radius = (50 + Math.random() * 45) * (1 - Math.abs(u) * 0.3);
        const shade = 0.5 + (relY < 0 ? 0.45 : -0.2) + (Math.random() - 0.5) * 0.2;

        puffs.push({
          relX,
          relY,
          radius: Math.max(30, radius),
          alpha: 0.5 + Math.random() * 0.4,
          shade: Math.max(0.1, Math.min(1.0, shade)),
        });
      }

      return {
        x,
        y,
        speed: (0.25 + depth * 0.35) * (0.8 + Math.random() * 0.4),
        scale: 0.65 + depth * 0.35,
        baseAlpha: 0.45 + depth * 0.2,
        depth,
        puffs,
      };
    };

    const initClouds = () => {
      clouds = [];
      const count = Math.max(8, Math.floor(width / 180));
      for (let i = 0; i < count; i++) {
        const depth = (i % 3) + 1; // 1, 2, or 3
        const x = (i / count) * width + (Math.random() - 0.5) * 200;
        const y = Math.random() * (height * 0.85);
        clouds.push(createCloudCluster(x, y, depth));
      }
    };

    initClouds();

    // Floating atmospheric sparkles / light rays
    const sparkles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      const parallaxX = (mouse.x - width / 2) * 0.05;
      const parallaxY = (mouse.y - height / 2) * 0.03;

      const isDark = isDarkMode();

      // 1. Vibrant Atmospheric Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        skyGrad.addColorStop(0, '#060a17');
        skyGrad.addColorStop(0.4, '#0c1429');
        skyGrad.addColorStop(0.8, '#131e3d');
        skyGrad.addColorStop(1, '#080d1e');
      } else {
        skyGrad.addColorStop(0, '#5fa8e8');
        skyGrad.addColorStop(0.35, '#87c7f8');
        skyGrad.addColorStop(0.7, '#bde0fe');
        skyGrad.addColorStop(1, '#e4f2fe');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Radiant Sun / Moon Aura with Sunlight Glare
      const sunX = width * 0.75 + parallaxX * 0.3;
      const sunY = height * 0.22 + parallaxY * 0.3;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.min(width, height) * 0.6);

      if (isDark) {
        sunGrad.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
        sunGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.2)');
        sunGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        sunGrad.addColorStop(0, 'rgba(255, 236, 179, 0.85)');
        sunGrad.addColorStop(0.2, 'rgba(255, 183, 77, 0.45)');
        sunGrad.addColorStop(0.5, 'rgba(255, 224, 130, 0.2)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Volumetric 3D Clouds (sorted by depth: far to near)
      const sortedClouds = [...clouds].sort((a, b) => a.depth - b.depth);

      for (const cloud of sortedClouds) {
        // Move cloud horizontally from left to right
        cloud.x += cloud.speed;
        if (cloud.x - 300 * cloud.scale > width) {
          cloud.x = -350 * cloud.scale;
          cloud.y = Math.random() * (height * 0.85);
        }

        const cloudDrawX = cloud.x + parallaxX * (cloud.depth * 0.4);
        const cloudDrawY = cloud.y + parallaxY * (cloud.depth * 0.3);

        for (const puff of cloud.puffs) {
          const puffX = cloudDrawX + puff.relX * cloud.scale;
          const puffY = cloudDrawY + puff.relY * cloud.scale;
          const puffR = puff.radius * cloud.scale;

          const puffGrad = ctx.createRadialGradient(
            puffX - puffR * 0.25,
            puffY - puffR * 0.35,
            0,
            puffX,
            puffY,
            puffR
          );

          if (isDark) {
            // Dark Mode Volumetric Silver & Indigo Night Clouds
            const highlight = `rgba(165, 180, 252, ${0.4 * puff.alpha * cloud.baseAlpha})`;
            const mid = `rgba(30, 41, 59, ${0.75 * puff.alpha * cloud.baseAlpha})`;
            const shadow = `rgba(15, 23, 42, ${0.9 * puff.alpha * cloud.baseAlpha})`;
            puffGrad.addColorStop(0, highlight);
            puffGrad.addColorStop(0.5, mid);
            puffGrad.addColorStop(1, shadow);
          } else {
            // Light Mode Fluffy Sunlit White & Sky Clouds
            const highlight = `rgba(255, 255, 255, ${0.95 * puff.alpha * cloud.baseAlpha})`;
            const sunlit = `rgba(254, 243, 199, ${0.85 * puff.alpha * cloud.baseAlpha})`;
            const mid = `rgba(224, 236, 250, ${0.7 * puff.alpha * cloud.baseAlpha})`;
            const shadow = `rgba(168, 197, 235, ${0.5 * puff.alpha * cloud.baseAlpha})`;

            if (puff.shade > 0.7) {
              puffGrad.addColorStop(0, highlight);
              puffGrad.addColorStop(0.3, sunlit);
              puffGrad.addColorStop(0.7, mid);
              puffGrad.addColorStop(1, 'rgba(224, 236, 250, 0)');
            } else {
              puffGrad.addColorStop(0, highlight);
              puffGrad.addColorStop(0.4, mid);
              puffGrad.addColorStop(0.85, shadow);
              puffGrad.addColorStop(1, 'rgba(168, 197, 235, 0)');
            }
          }

          ctx.fillStyle = puffGrad;
          ctx.beginPath();
          ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Subtle Floating Light Particles / Stardust
      for (const sp of sparkles) {
        sp.y += sp.speedY;
        if (sp.y < 0) {
          sp.y = height;
          sp.x = Math.random() * width;
        }

        const pulse = Math.sin(tick * 0.03 + sp.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(199, 210, 254, ${sp.alpha * pulse})`
          : `rgba(255, 255, 255, ${sp.alpha * pulse * 0.9})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{
          filter: 'contrast(1.05) saturate(1.1)',
        }}
      />
      {/* Light glassmorphism overlay to ensure pristine typography readability */}
      <div
        className="absolute inset-0 transition-colors duration-300 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(var(--bg-rgb, 255, 255, 255), 0.2) 65%, rgba(var(--bg-rgb, 255, 255, 255), 0.4) 100%)',
        }}
      />
    </div>
  );
}
