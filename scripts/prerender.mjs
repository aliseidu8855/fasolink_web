import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const PREVIEW_PORT = process.env.PORT || 4173;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;
const ROUTES = ['/', '/listings'];

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeSnapshot(route, html) {
  const targetDir = path.join(process.cwd(), 'dist', 'prerender', route.replace(/^\//, '').replace(/\/$/, '')) || '';
  const dir = targetDir.endsWith('') && targetDir !== path.join(process.cwd(), 'dist', 'prerender')
    ? targetDir
    : path.join(process.cwd(), 'dist', 'prerender', 'index-holder');
  const finalDir = route === '/' ? path.join(process.cwd(), 'dist', 'prerender') : path.join(process.cwd(), 'dist', 'prerender', route.replace(/^\//, ''));
  const outDir = route === '/' ? finalDir : path.join(finalDir, '');
  const target = route === '/' ? path.join(finalDir, 'index.html') : path.join(finalDir, 'index.html');
  await ensureDir(outDir);
  await fs.writeFile(target, html, 'utf8');
}

async function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'preview', '--', '--port', PREVIEW_PORT], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let started = false;
    proc.stdout.on('data', (d) => {
      const s = d.toString();
      if (!started && s.includes(`http://localhost:${PREVIEW_PORT}`)) {
        started = true;
        resolve(proc);
      }
    });
    proc.stderr.on('data', (d) => {
      const s = d.toString();
      if (s.toLowerCase().includes('error')) {
        // ignore transient plugin warnings; only fail if process exits
      }
    });
    proc.on('exit', (code) => {
      if (!started) reject(new Error(`vite preview exited early with code ${code}`));
    });
  });
}

async function main() {
  console.log('[prerender] starting preview server...');
  const server = await startPreview();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    for (const route of ROUTES) {
      const url = BASE_URL + route;
      console.log(`[prerender] visiting ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      // small delay to allow any lazy i18n/meta updates
      await page.waitForTimeout(200);
      const html = await page.content();
      await writeSnapshot(route, html);
      console.log(`[prerender] saved ${route}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log('[prerender] done. Output in dist/prerender/');
}

main().catch((e) => {
  console.error('[prerender] failed:', e);
  process.exit(1);
});
