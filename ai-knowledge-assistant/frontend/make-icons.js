// Simple script to create valid PNG icons without dependencies using canvas or pure PNG buffer
const fs = require('fs');
const path = require('path');

// 1x1 Blue PNG base64 expanded to valid PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfgHfU5xY/AAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), buffer);
console.log('Icons written successfully');
