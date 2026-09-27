#!/usr/bin/env node
/**
 * Migrate quiz assets: Cloudinary (flat names) -> Cloudflare R2 (foldered).
 * Image optimization uses system `python3 + Pillow` (preinstalled, no npm
 * package needed). If Pillow webp support is missing, images pass through
 * as original PNG.
 *
 *   node scripts/migrate-assets.mjs plan
 *   node scripts/migrate-assets.mjs download [--limit=N]
 *   R2_ACCOUNT_ID=.. R2_ACCESS_KEY_ID=.. R2_SECRET_ACCESS_KEY=.. R2_BUCKET=.. \
 *     node scripts/migrate-assets.mjs upload
 *   node scripts/migrate-assets.mjs rewrite --base=https://assets.example.com
 *
 * Key layout in R2:
 *   videos/question-01.mp4
 *   images/q01/a.webp (or a.png when Pillow webp is unavailable)
 */
import { spawnSync } from 'node:child_process';
import { createHash, createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'r2-assets');
const CONCURRENCY = 20;
const FETCH_TIMEOUT_MS = 30000;

const pad2 = (n) => String(n).padStart(2, '0');

let webpMode = null;
function useWebp() {
  if (webpMode === null) {
    const r = spawnSync('python3', ['-c', 'from PIL import features; raise SystemExit(0 if features.check("webp") else 1)']);
    webpMode = r.status === 0;
  }
  return webpMode;
}

// Convert PNG bytes -> webp (w800, q60) via system Pillow. Zero npm deps.
function toWebp(pngBuf) {
  const r = spawnSync(
    'python3',
    ['-c', 'import sys; from PIL import Image; '
      + 'img = Image.open(sys.stdin.buffer); '
      + 'img.thumbnail((800, 800)); '
      + 'img.save(sys.stdout.buffer, "WEBP", quality=60, method=6)'],
    { input: pngBuf },
  );
  if (r.status !== 0) throw new Error(`webp convert failed: ${r.stderr.toString().slice(0, 200)}`);
  return r.stdout;
}

// '.../image/upload/f_webp,q_auto:good,q_60,w_800/q1-answer-a-v2.png'
//   -> '.../image/upload/q1-answer-a-v2.png'  (original, drops on-the-fly transform)
function originalImageUrl(url) {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  if (!m) return url;
  const slash = m[2].indexOf('/');
  if (slash !== -1 && m[2].slice(0, slash).includes(',')) return m[1] + m[2].slice(slash + 1);
  return url;
}

const mimeFor = (ext) =>
  ({ png: 'image/png', webp: 'image/webp', mp4: 'video/mp4' })[ext] ?? 'application/octet-stream';

function readQuestions() {
  return JSON.parse(readFileSync(join(ROOT, 'data/questions.json'), 'utf8'));
}

// srcUrl (original form) -> { key, contentType }
function buildMap(questions, webp) {
  const map = new Map();
  for (const q of questions) {
    const qn = pad2(q.id);
    map.set(q.videoUrl, { key: `videos/question-${qn}.mp4`, contentType: 'video/mp4' });
    for (const o of q.options) {
      const src = originalImageUrl(o.imageUrl);
      const ext = webp ? 'webp' : src.split('.').pop().toLowerCase();
      map.set(src, { key: `images/q${qn}/${o.id}.${ext}`, contentType: mimeFor(ext) });
    }
  }
  return map;
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          results[idx] = await fn(items[idx], idx);
        } catch (e) {
          results[idx] = e;
        }
      }
    }),
  );
  return results;
}

async function cmdPlan() {
  const webp = useWebp();
  const questions = readQuestions();
  const map = buildMap(questions, webp);
  const videos = [...map.values()].filter((m) => m.key.startsWith('videos/'));
  const images = [...map.values()].filter((m) => m.key.startsWith('images/'));
  console.log(`questions: ${questions.length}`);
  console.log(`unique videos: ${videos.length}, unique images: ${images.length}`);
  console.log(`image mode: ${webp ? 'webp w800 q60 (Pillow)' : 'original PNG (Pillow webp missing)'}`);
  console.log('sample:');
  const [vSrc, vMeta] = [...map.entries()].find(([, m]) => m.key.startsWith('videos/'));
  console.log(`  ${vSrc}\n    -> ${vMeta.key}`);
  const [iSrc, iMeta] = [...map.entries()].find(([, m]) => m.key.startsWith('images/'));
  console.log(`  ${originalImageUrl(iSrc) === iSrc ? iSrc : iSrc + '  (transform stripped)'}\n    -> ${iMeta.key}`);
  console.log('trial.ts reuses q01 assets (no extra files).');
}

async function fetchWithTimeout(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function cmdDownload(limit, opts = {}) {
  // Default: raw PNG (fast). Pass --webp to convert via Pillow.
  const webp = opts.webp ? useWebp() : false;
  console.log(`image mode: ${webp ? 'webp w800 q60 (Pillow)' : 'original PNG (raw, optimize later with --webp)'}`);
  const questions = readQuestions().slice(0, limit ?? Infinity);
  const map = buildMap(questions, webp);
  const entries = [...map.entries()];
  console.log(`downloading ${entries.length} files -> r2-assets/`);
  let bytes = 0;
  let skipped = 0;
  const fails = [];
  await pool(entries, CONCURRENCY, async ([src, meta]) => {
    const dest = join(OUT_DIR, meta.key);
    if (existsSync(dest)) {
      skipped++;
      return;
    }
    let res;
    try {
      res = await fetchWithTimeout(src);
    } catch (e) {
      fails.push(`${src} -> ${e.name === 'AbortError' ? 'TIMEOUT' : e.message}`);
      return;
    }
    if (!res.ok) {
      fails.push(`${src} -> HTTP ${res.status}`);
      return;
    }
    let buf = Buffer.from(await res.arrayBuffer());
    if (meta.key.endsWith('.webp')) {
      try {
        buf = toWebp(buf);
      } catch (e) {
        fails.push(`${src} -> ${e.message}`);
        return;
      }
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    bytes += buf.length;
    process.stdout.write(`\r  ${skipped + fails.length + 1}/${entries.length}...`);
  });
  process.stdout.write('\n');
  writeFileSync(join(OUT_DIR, 'map.json'), JSON.stringify(Object.fromEntries(map), null, 2) + '\n');
  console.log(`done: ${entries.length - fails.length}/${entries.length} files, skipped ${skipped} existing, ${(bytes / 1024 / 1024).toFixed(1)} MB new`);
  for (const f of fails) console.log(`  FAIL ${f}`);
  if (fails.length) process.exitCode = 1;
}

// --- minimal SigV4 for R2 S3-compatible API (PUT only what we need) ---
const hmac = (key, msg) => createHmac('sha256', key).update(msg).digest();

function s3Env() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error('missing env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET');
  }
  return { account: R2_ACCOUNT_ID, key: R2_ACCESS_KEY_ID, secret: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}

async function s3Put(key, body, contentType) {
  const env = s3Env();
  const host = `${env.account}.r2.cloudflarestorage.com`;
  const path = `/${env.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const payloadHash = createHash('sha256').update(body).digest('hex');
  const amzDate = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    path,
    '',
    `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');
  const signingKey = hmac(hmac(hmac(hmac('AWS4' + env.secret, dateStamp), 'auto'), 's3'), 'aws4_request');
  const signature = hmac(signingKey, stringToSign).toString('hex');
  return fetch(`https://${host}${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${env.key}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'content-type': contentType,
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body,
  });
}

async function cmdUpload(opts = {}) {
  const webp = opts.webp ? useWebp() : false;
  const map = buildMap(readQuestions(), webp);
  const entries = [...map.entries()];
  console.log(`uploading ${entries.length} files from r2-assets/`);
  let ok = 0;
  const fails = [];
  await pool(entries, CONCURRENCY, async ([, meta]) => {
    let body;
    try {
      body = readFileSync(join(OUT_DIR, meta.key));
    } catch {
      fails.push(`${meta.key}: file not found, run download first`);
      return;
    }
    const res = await s3Put(meta.key, body, meta.contentType);
    if (!res.ok) fails.push(`${meta.key}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    else ok++;
  });
  console.log(`done: ${ok}/${entries.length} uploaded`);
  for (const f of fails) console.log(`  FAIL ${f}`);
  if (fails.length) process.exitCode = 1;
}

async function cmdRewrite(base, opts = {}) {
  if (!base) throw new Error('rewrite needs --base=https://assets.example.com');
  base = base.replace(/\/+$/, '');
  const webp = opts.webp ? useWebp() : false;
  const questions = readQuestions();
  const map = buildMap(questions, webp);
  const urlFor = (u) => {
    const e = map.get(originalImageUrl(u));
    if (!e) throw new Error(`no mapping for ${u}`);
    return `${base}/${e.key}`;
  };

  const qPath = join(ROOT, 'data/questions.json');
  const qOrig = readFileSync(qPath, 'utf8');
  const next = questions.map((q) => ({
    ...q,
    videoUrl: urlFor(q.videoUrl),
    options: q.options.map((o) => ({ ...o, imageUrl: urlFor(o.imageUrl) })),
  }));
  writeFileSync(qPath + '.bak', qOrig);
  writeFileSync(qPath, JSON.stringify(next, null, 2) + '\n');

  const tPath = join(ROOT, 'data/trial.ts');
  let trial = readFileSync(tPath, 'utf8');
  const tOrig = trial;
  const urls = new Set(trial.match(/https:\/\/res\.cloudinary\.com\/[^"'`\s)]+/g) ?? []);
  for (const u of urls) trial = trial.split(u).join(urlFor(u));
  writeFileSync(tPath + '.bak', tOrig);
  writeFileSync(tPath, trial);

  console.log(`rewrote data/questions.json + data/trial.ts (backups: *.bak), base=${base}`);
  console.log('verify with: pnpm build, then delete the .bak files.');
}

const [, , cmd, ...rest] = process.argv;
const opt = (name) => rest.find((a) => a.startsWith(name + '='))?.slice(name.length + 1);

try {
  if (cmd === 'plan') await cmdPlan();
  else if (cmd === 'download') await cmdDownload(opt('--limit') ? Number(opt('--limit')) : undefined, { webp: rest.includes('--webp') });
  else if (cmd === 'upload') await cmdUpload({ webp: rest.includes('--webp') });
  else if (cmd === 'rewrite') await cmdRewrite(opt('--base'), { webp: rest.includes('--webp') });
  else {
    console.error('usage: node scripts/migrate-assets.mjs <plan|download [--limit=N]|upload|rewrite --base=URL>');
    process.exit(1);
  }
} catch (e) {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
}
