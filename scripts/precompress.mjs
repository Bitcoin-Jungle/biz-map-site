// Precompress text assets in dist/ to .br and .gz at build time, so the server
// can serve brotli/gzip with zero runtime CPU (@fastify/static preCompressed).
// No deps — uses Node's built-in zlib. Skips already-compressed binaries
// (woff2/png/webp) and tiny files where compression isn't worth a round-trip.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const DIST = 'dist';
const COMPRESSIBLE = /\.(js|css|html|svg|json|map|txt|webmanifest|ico)$/;
const MIN_BYTES = 1024;

let count = 0;
let savedBr = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else if (COMPRESSIBLE.test(p) && s.size >= MIN_BYTES) {
      const buf = readFileSync(p);
      const br = brotliCompressSync(buf, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11,
          [constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
        },
      });
      const gz = gzipSync(buf, { level: 9 });
      writeFileSync(`${p}.br`, br);
      writeFileSync(`${p}.gz`, gz);
      count++;
      savedBr += buf.length - br.length;
    }
  }
}

walk(DIST);
console.log(`precompress: ${count} files → .br + .gz (brotli saved ${(savedBr / 1024).toFixed(0)} KB)`);
