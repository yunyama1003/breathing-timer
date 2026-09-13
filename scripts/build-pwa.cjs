// Publish only the static app; never include local databases or server settings.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'build/pwa');
fs.mkdirSync(out, { recursive: true });
for (const name of fs.readdirSync(path.join(root, 'site'))) fs.copyFileSync(path.join(root, 'site', name), path.join(out, name));
fs.copyFileSync(path.join(root, 'src/main/resources/static/js/breathing-timer.js'), path.join(out, 'breathing-timer.js'));
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body)); return Buffer.concat([length, body, crc]);
}
// Deterministic raster version of the concentric-circle app icon; no external assets.
for (const size of [192, 512]) {
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const distance = Math.hypot(x - size / 2, y - size / 2) / size;
    const color = distance < .127 ? [245,244,239] : distance < .219 ? [165,198,176] : distance < .303 ? [58,108,96] : [22,78,69];
    const offset = y * (1 + size * 3) + 1 + x * 3;
    color.forEach((value, channel) => { raw[offset + channel] = value; });
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  fs.writeFileSync(path.join(out, `icon-${size}.png`), Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
console.log('PWA built: build/pwa');
