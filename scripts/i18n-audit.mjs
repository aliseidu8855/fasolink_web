#!/usr/bin/env node
/*
 i18n-audit.mjs
 Scans src for t('ns:key') usage and string literals in JSX text, compares against locales resources.
 Reports:
  - Missing keys per locale
  - Unused keys per locale (not referenced in code)
  - Suspected untranslated literals (hard-coded text) in JSX/JS
  - Coverage summary per namespace and locale

 Usage:
   node scripts/i18n-audit.mjs [--fix-unused] [--src src] [--locales src/locales]
*/
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const getFlag = (f, def) => {
  const i = args.indexOf(f);
  if (i >= 0 && i + 1 < args.length) return args[i + 1];
  return def;
};

const SRC_DIR = path.resolve(__dirname, '..', getFlag('--src', 'src'));
const LOCALES_DIR = path.resolve(__dirname, '..', getFlag('--locales', 'src/locales'));
const FIX_UNUSED = hasFlag('--fix-unused');

const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);

/** Recursively list files under a directory */
function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dev-dist') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (exts.has(path.extname(e.name))) out.push(p);
    }
  }
  return out;
}

/** parse t() usages and collect keys: ns:key or key-with-defaultNS */
function extractTKeys(text) {
  const keys = new Set();
  // Matches t('ns:key', ...) or t("ns:key") with nested object keys allowed
  const re = /\bt\(\s*([`'"])([^\1\r\n]+?)\1\s*[,)]]/g; // capture first arg literal
  let m;
  while ((m = re.exec(text))) {
    const k = m[2].trim();
    if (k && !k.includes('{{')) keys.add(k);
  }
  return keys;
}

/** very simple heuristic to find likely untranslated hard-coded text */
function extractHardcodedText(text) {
  const bad = [];
  // capture sequences like >Some text< or value="Text" that are not obviously variables
  const tagText = />\s*([^<>{}][^<>{]{2,})\s*</g;
  let m;
  while ((m = tagText.exec(text))) {
    const s = m[1].trim();
    // skip obvious placeholders: units, punctuation-only, URLs, email, numbers
    if (/^[:;,.!?#$%&()\-]+$/.test(s)) continue;
    if (/https?:\/\//i.test(s)) continue;
    if (/^[0-9\s+.,%-]+$/.test(s)) continue;
    if (s.length < 3) continue;
    bad.push(s.slice(0, 120));
  }
  return bad;
}

/** load locales resources: { [lng]: { [ns]: flatKey->value } } */
function loadLocales(dir) {
  const lngs = fs.readdirSync(dir, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name);
  const resources = {};
  for (const lng of lngs) {
    const lngDir = path.join(dir, lng);
    const files = fs.readdirSync(lngDir).filter(f=>f.endsWith('.json') || fs.statSync(path.join(lngDir, f)).isDirectory());
    resources[lng] = {};
    for (const f of files) {
      const full = path.join(lngDir, f);
      if (fs.statSync(full).isDirectory()) {
        // merge nested folder jsons into the folder name as a namespace
        const ns = f;
        const flat = {};
        const walk = (dir, prefix='') => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const e of entries) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) walk(p, prefix + e.name + '.');
            else if (e.isFile() && e.name.endsWith('.json')) {
              const json = JSON.parse(fs.readFileSync(p, 'utf8'));
              flatten(json, prefix, flat);
            }
          }
        };
        walk(full);
        resources[lng][ns] = flat;
      } else if (f.endsWith('.json')) {
        const ns = path.basename(f, '.json');
        const json = JSON.parse(fs.readFileSync(full, 'utf8'));
        const flat = {};
        flatten(json, '', flat);
        resources[lng][ns] = flat;
      }
    }
  }
  return resources;
}

function flatten(obj, prefix, out) {
  for (const [k,v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key + '.', out);
    else out[key] = String(v);
  }
}

function main() {
  const files = listFiles(SRC_DIR);
  const resources = loadLocales(LOCALES_DIR);
  const allLngs = Object.keys(resources);
  const defaultNS = 'common';

  const usedKeys = new Set();
  const suspectedLiterals = new Map(); // file -> [text]

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const keys = extractTKeys(text);
    for (const k of keys) usedKeys.add(k);
    const literals = extractHardcodedText(text);
    if (literals.length) suspectedLiterals.set(path.relative(SRC_DIR, f), literals);
  }

  // Compute missing/unused per locale
  const perLocale = {};
  for (const lng of allLngs) {
    const nsMap = resources[lng];
    const missing = [];
    const unused = [];
    const coverage = []; // { ns, used, present, coverage }

    // Build a map ns->keys present
    const presentByNs = Object.fromEntries(Object.entries(nsMap).map(([ns, flat]) => [ns, new Set(Object.keys(flat))]));

    // Missing: used ns:key not present in that ns for lng
    for (const k of usedKeys) {
      const [ns, ...rest] = k.includes(':') ? k.split(':') : [defaultNS, k];
      const pureKey = rest.join(':');
      const presentNs = presentByNs[ns] || new Set();
      if (!presentNs.has(pureKey)) missing.push(`${ns}:${pureKey}`);
    }

    // Unused: present keys not referenced anywhere
    for (const [ns, flat] of Object.entries(nsMap)) {
      const keys = Object.keys(flat);
      for (const k of keys) {
        const full = `${ns}:${k}`;
        if (!usedKeys.has(full)) unused.push(full);
      }
      const usedInNs = keys.filter(k => usedKeys.has(`${ns}:${k}`)).length;
      const cov = keys.length > 0 ? Math.round((usedInNs / keys.length) * 100) : 100;
      coverage.push({ ns, used: usedInNs, present: keys.length, coverage: cov });
    }

    perLocale[lng] = { missing: Array.from(new Set(missing)).sort(), unused: unused.sort(), coverage };
  }

  // Output report
  console.log('i18n audit report');
  console.log('=================');
  console.log(`Scanned files: ${files.length}`);
  console.log(`Locales: ${allLngs.join(', ')}`);
  console.log(`Used keys: ${usedKeys.size}`);
  console.log('');
  for (const lng of allLngs) {
    const { missing, unused, coverage } = perLocale[lng];
    console.log(`Locale: ${lng}`);
    console.table(coverage);
    console.log(`Missing keys (${missing.length}):`);
    if (missing.length) console.log(missing.join('\n'));
    else console.log('  (none)');
    console.log(`Unused keys (${unused.length}):`);
    if (unused.length) console.log(unused.join('\n'));
    else console.log('  (none)');
    console.log('');
  }

  if (suspectedLiterals.size) {
    console.log('Suspected hard-coded text (audit needed):');
    for (const [file, literals] of suspectedLiterals.entries()) {
      console.log(`- ${file}`);
      for (const s of literals) console.log(`    · ${s}`);
    }
  }

  if (FIX_UNUSED) {
    // Remove unused keys from locale files (destructive!)
    for (const lng of allLngs) {
      for (const [ns, flat] of Object.entries(resources[lng])) {
        const pruned = {};
        for (const [k, v] of Object.entries(flat)) {
          const full = `${ns}:${k}`;
          if (usedKeys.has(full)) pruned[k] = v;
        }
        // rewrite JSON
        const filePath = path.join(LOCALES_DIR, lng, `${ns}.json`);
        if (fs.existsSync(filePath)) {
          // Convert flat back to nested object
          const nested = {};
          for (const [k, v] of Object.entries(pruned)) {
            const parts = k.split('.');
            let obj = nested;
            while (parts.length > 1) {
              const p = parts.shift();
              obj[p] = obj[p] || {};
              obj = obj[p];
            }
            obj[parts[0]] = v;
          }
          fs.writeFileSync(filePath, JSON.stringify(nested, null, 2) + '\n');
        }
      }
    }
    console.log('\nApplied --fix-unused: rewrote locale JSONs without unused keys.');
  }
}

main();
