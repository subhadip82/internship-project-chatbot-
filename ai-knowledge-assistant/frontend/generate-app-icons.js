const fs = require('fs');
const path = require('path');

// Generate real SVG icon for crisp vector scaling
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background App Rounded Tile -->
  <rect width="512" height="512" rx="120" fill="url(#grad)" />

  <!-- Tri-color Indian Accent Ribbon at Bottom Corner -->
  <path d="M 0 460 Q 256 500 512 460 L 512 512 L 0 512 Z" fill="#138808" opacity="0.9" />
  <path d="M 0 440 Q 256 480 512 440 L 512 460 Q 256 500 0 460 Z" fill="#FFFFFF" opacity="0.9" />
  <path d="M 0 420 Q 256 460 512 420 L 512 440 Q 256 480 0 440 Z" fill="#FF9933" opacity="0.9" />

  <!-- AI Brain / Circuit Icon in Center -->
  <g filter="url(#shadow)" transform="translate(106, 96) scale(0.6)">
    <!-- Central Hexagon / Core -->
    <circle cx="250" cy="230" r="85" fill="#ffffff" />
    <circle cx="250" cy="230" r="70" fill="#1e3a8a" />
    
    <!-- Sparkles / Nodes -->
    <circle cx="120" cy="140" r="30" fill="#60a5fa" />
    <circle cx="380" cy="140" r="30" fill="#60a5fa" />
    <circle cx="80" cy="270" r="30" fill="#38bdf8" />
    <circle cx="420" cy="270" r="30" fill="#38bdf8" />
    <circle cx="150" cy="380" r="30" fill="#93c5fd" />
    <circle cx="350" cy="380" r="30" fill="#93c5fd" />

    <!-- Connecting Circuit Lines -->
    <path d="M 140 155 L 200 200" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 360 155 L 300 200" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 105 260 L 175 240" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 395 260 L 325 240" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 170 360 L 220 290" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 330 360 L 280 290" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>

    <!-- Inner Core Symbol -->
    <polygon points="250,180 290,250 210,250" fill="#38bdf8" />
    <polygon points="250,280 290,210 210,210" fill="#ffffff" opacity="0.8" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), svg);
console.log('App icons generated successfully');
