const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, drawFn) {
  // RGBA buffer: each row has 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // Bit depth: 8
  ihdr.writeUInt8(6, 9); // Color type: RGBA (6)
  ihdr.writeUInt8(0, 10); // Compression
  ihdr.writeUInt8(0, 11); // Filter
  ihdr.writeUInt8(0, 12); // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Icon drawer logic: Deep Blue SaaS Icon with Central Core & Indian Tri-color Bottom Accent
function iconDrawer(x, y, w, h) {
  const cx = w / 2;
  const cy = h * 0.44;
  const radius = w * 0.22;
  
  // Rounded corner test
  const cornerR = w * 0.22;
  let inBounds = true;
  if (x < cornerR && y < cornerR) {
    if ((x - cornerR) ** 2 + (y - cornerR) ** 2 > cornerR ** 2) inBounds = false;
  } else if (x > w - cornerR && y < cornerR) {
    if ((x - (w - cornerR)) ** 2 + (y - cornerR) ** 2 > cornerR ** 2) inBounds = false;
  } else if (x < cornerR && y > h - cornerR) {
    if ((x - cornerR) ** 2 + (y - (h - cornerR)) ** 2 > cornerR ** 2) inBounds = false;
  } else if (x > w - cornerR && y > h - cornerR) {
    if ((x - (w - cornerR)) ** 2 + (y - (h - cornerR)) ** 2 > cornerR ** 2) inBounds = false;
  }

  if (!inBounds) return [0, 0, 0, 0];

  // Tri-color accent at bottom
  const yBottom = h * 0.82;
  const bandHeight = (h - yBottom) / 3;
  if (y >= yBottom) {
    const bandIdx = Math.floor((y - yBottom) / bandHeight);
    if (bandIdx === 0) return [255, 153, 51, 255]; // Saffron #FF9933
    if (bandIdx === 1) return [255, 255, 255, 255]; // White
    return [19, 136, 8, 255]; // Green #138808
  }

  // Central Hub Core
  const distCenter = Math.hypot(x - cx, y - cy);
  if (distCenter < radius * 0.45) {
    return [255, 255, 255, 255];
  }
  if (distCenter < radius * 0.65 && distCenter >= radius * 0.45) {
    return [30, 58, 138, 255];
  }

  // Radial Nodes
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const nx = cx + radius * 1.35 * Math.cos(angle);
    const ny = cy + radius * 1.35 * Math.sin(angle);
    const distNode = Math.hypot(x - nx, y - ny);
    if (distNode < w * 0.05) {
      return [56, 189, 248, 255]; // Sky Blue
    }
  }

  // Background Gradient
  const gradT = y / h;
  const r = Math.round(29 + (37 - 29) * gradT);
  const g = Math.round(78 + (99 - 78) * gradT);
  const b = Math.round(216 + (235 - 216) * gradT);
  return [r, g, b, 255];
}

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192, iconDrawer));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512, iconDrawer));
fs.writeFileSync(path.join(publicDir, 'maskable-icon.png'), createPng(512, 512, iconDrawer));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, iconDrawer));

console.log('High-definition pure PNG icons created successfully!');
