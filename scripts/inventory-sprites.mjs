import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/sprites');
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function inspectPng(buffer) {
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(pngSignature)) {
    return { validPng: false, width: null, height: null, colorType: null, transparency: 'unknown' };
  }
  let hasTransparencyChunk = false;
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'tRNS') hasTransparencyChunk = true;
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  const colorType = buffer[25];
  const alphaByFormat = colorType === 4 || colorType === 6;
  return {
    validPng: true,
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType,
    transparency: alphaByFormat || hasTransparencyChunk ? 'alpha-channel-or-tRNS-present (pixel alpha still needs sampling)' : 'no PNG alpha channel/tRNS',
  };
}

const names = (await readdir(root)).filter((name) => name.toLowerCase().endsWith('.png')).sort((a, b) => a.localeCompare(b, 'es'));
const rows = [];
for (const name of names) {
  const fullPath = path.join(root, name);
  const [buffer, info] = await Promise.all([readFile(fullPath), stat(fullPath)]);
  rows.push({ file: name, bytes: info.size, ...inspectPng(buffer) });
}
console.log(JSON.stringify({ folder: 'public/sprites', count: rows.length, files: rows }, null, 2));
