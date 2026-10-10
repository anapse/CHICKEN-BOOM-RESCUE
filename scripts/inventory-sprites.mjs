import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = path.resolve('public/sprites');
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function parsePng(buffer) {
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)) {
    return { validPng: false, width: null, height: null, transparency: 'invalid-png' };
  }

  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  let palette = null, transparencyChunk = null;
  const imageData = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8, dataEnd = dataStart + length;
    if (dataEnd + 4 > buffer.length) break;
    const data = buffer.subarray(dataStart, dataEnd);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'tRNS') transparencyChunk = Buffer.from(data);
    else if (type === 'IDAT') imageData.push(data);
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }

  const channelsByType = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  const channels = channelsByType[colorType];
  const hasAlpha = colorType === 4 || colorType === 6 || Boolean(transparencyChunk);
  let transparency = hasAlpha ? 'alpha-present-pixel-scan-pending' : 'no-alpha-channel';
  let transparentPixels = null, semiTransparentPixels = null;

  // Exact alpha-pixel scan for non-interlaced PNGs with supported standard color types.
  const pixelScanSupported = (colorType === 6 || colorType === 4) && bitDepth >= 8 ||
    colorType === 3 && bitDepth === 8 ||
    (colorType === 2 || colorType === 0) && Boolean(transparencyChunk) && bitDepth === 8;
  if (channels && interlace === 0 && [1, 2, 4, 8, 16].includes(bitDepth) && imageData.length && pixelScanSupported) {
    const packed = inflateSync(Buffer.concat(imageData));
    const bitsPerPixel = channels * bitDepth;
    const rowBytes = Math.ceil(width * bitsPerPixel / 8);
    const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));
    const scanlines = Buffer.alloc((rowBytes + 1) * height);
    let srcOffset = 0;
    let prev = Buffer.alloc(rowBytes);
    let transparentCount = 0, semiCount = 0;
    const maxSample = bitDepth === 16 ? 65535 : (1 << bitDepth) - 1;

    for (let y = 0; y < height; y++) {
      const filter = packed[srcOffset++];
      const raw = packed.subarray(srcOffset, srcOffset + rowBytes);
      srcOffset += rowBytes;
      const row = Buffer.alloc(rowBytes);
      for (let x = 0; x < rowBytes; x++) {
        const rawValue = raw[x];
        const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
        const up = prev[x] ?? 0;
        const upLeft = x >= bytesPerPixel ? (prev[x - bytesPerPixel] ?? 0) : 0;
        let value = rawValue;
        if (filter === 1) value += left;
        else if (filter === 2) value += up;
        else if (filter === 3) value += Math.floor((left + up) / 2);
        else if (filter === 4) value += paeth(left, up, upLeft);
        else if (filter !== 0) throw new Error('Unsupported PNG filter: ' + filter);
        row[x] = value & 255;
      }

      if (colorType === 6 && bitDepth >= 8) {
        const sampleBytes = bitDepth / 8;
        for (let x = 0; x < width; x++) {
          const alphaOffset = (x * 4 + 3) * sampleBytes;
          const alpha = sampleBytes === 2 ? row.readUInt16BE(alphaOffset) : row[alphaOffset];
          const max = sampleBytes === 2 ? 65535 : 255;
          if (alpha === 0) transparentCount++;
          else if (alpha < max) semiCount++;
        }
      } else if (colorType === 4 && bitDepth >= 8) {
        const sampleBytes = bitDepth / 8;
        for (let x = 0; x < width; x++) {
          const alphaOffset = (x * 2 + 1) * sampleBytes;
          const alpha = sampleBytes === 2 ? row.readUInt16BE(alphaOffset) : row[alphaOffset];
          const max = sampleBytes === 2 ? 65535 : 255;
          if (alpha === 0) transparentCount++;
          else if (alpha < max) semiCount++;
        }
      } else if (colorType === 3 && bitDepth === 8 && transparencyChunk) {
        for (let x = 0; x < width; x++) {
          const alpha = transparencyChunk[row[x]] ?? 255;
          if (alpha === 0) transparentCount++;
          else if (alpha < 255) semiCount++;
        }
      } else if ((colorType === 2 || colorType === 0) && transparencyChunk && bitDepth === 8) {
        const transparentKey = colorType === 2
          ? [transparencyChunk.readUInt16BE(0) & 255, transparencyChunk.readUInt16BE(2) & 255, transparencyChunk.readUInt16BE(4) & 255]
          : [transparencyChunk.readUInt16BE(0) & 255];
        const n = channels;
        for (let x = 0; x < width; x++) {
          let match = true;
          for (let c = 0; c < n; c++) if (row[x * n + c] !== transparentKey[c]) match = false;
          if (match) transparentCount++;
        }
      }
      prev = row;
    }

    transparentPixels = transparentCount;
    semiTransparentPixels = semiCount;
    transparency = transparentCount > 0 || semiCount > 0
      ? 'transparent-pixels-confirmed'
      : hasAlpha ? 'alpha-capable-but-no-transparent-pixels-found' : 'no-alpha-channel';
  } else if (hasAlpha) {
    transparency = interlace !== 0 ? 'alpha-present-interlaced-pixel-scan-unsupported' : 'alpha-present-pixel-scan-unsupported';
  }

  return {
    validPng: true, width, height, bitDepth, colorType, interlace,
    alphaChannelOrTRNS: hasAlpha, transparency, transparentPixels, semiTransparentPixels,
  };
}

function inferGrid(name, width, height) {
  const match = name.match(/(\d+)x(\d+)/i);
  if (!match) return { declaredGrid: null, gridDivisible: null, cellWidth: null, cellHeight: null, gridVerified: false };
  const columns = Number(match[1]), rows = Number(match[2]);
  const divisible = columns > 0 && rows > 0 && width % columns === 0 && height % rows === 0;
  return {
    declaredGrid: `${columns}x${rows} (filename hint)`,
    gridDivisible: divisible,
    cellWidth: divisible ? width / columns : null,
    cellHeight: divisible ? height / rows : null,
    gridVerified: false,
  };
}

const names = (await readdir(root)).filter((name) => name.toLowerCase().endsWith('.png')).sort((a, b) => a.localeCompare(b, 'es'));
const rows = [];
for (const name of names) {
  const fullPath = path.join(root, name);
  const [buffer, info] = await Promise.all([readFile(fullPath), stat(fullPath)]);
  const parsed = parsePng(buffer);
  rows.push({ file: name, bytes: info.size, ...parsed, ...inferGrid(name, parsed.width ?? 0, parsed.height ?? 0) });
}

if (process.argv.includes('--markdown')) {
  console.log('# PNG inventory (automatically inspected)');
  console.log('');
  console.log('Grid hints come from filenames only; divisibility does not prove correct cell boundaries. Transparency is pixel-scanned only for supported PNG encodings.');
  console.log('');
  console.log('| File | Dimensions | Size | Transparency | Grid hint / equal cell size |');
  console.log('|---|---:|---:|---|---|');
  for (const r of rows) {
    const dims = r.width && r.height ? `${r.width}×${r.height}` : 'unreadable';
    const grid = r.declaredGrid
      ? `${r.declaredGrid}; divisible=${r.gridDivisible}; cell=${r.cellWidth ?? '?'}×${r.cellHeight ?? '?'}; verified=no`
      : 'not declared';
    console.log(`| ${r.file.replaceAll('|', '\\|')} | ${dims} | ${Math.round(r.bytes / 1024)} KiB | ${r.transparency} | ${grid} |`);
  }
} else {
  console.log(JSON.stringify({ folder: 'public/sprites', count: rows.length, files: rows }, null, 2));
}
