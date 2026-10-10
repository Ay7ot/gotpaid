#!/usr/bin/env node
// Build-config clean-file guard — permanent CI backstop against the obfuscated
// build-time RCE loader that gets appended to postcss.config.mjs (and could hit
// any build-executed config). Root cause it blocks: `next build` imports these
// configs, so an injected payload runs with full Node privileges on every build
// (local, CI, and Vercel preview). The infection recurred on 620 branch tips
// after the first cleanup because NOTHING gated it — ESLint / tsc / the
// migration guard all pass an obfuscated blob in a config file. This closes that
// hole (2026-09-07 incident; loader family = Ethereum "EtherHiding" dead-drop →
// child_process/eval staging).
//
// Read-only, pure Node (no deps, no DB, never executes the files it scans).
// Fails the build if any build-executed config contains an injection signature
// or an implausibly long (obfuscated one-liner) line. Runs in CI and locally via
// `npm run check:build-configs`.

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Build-executed configs live at repo root. `next build` evaluates these, so a
// payload here is a build-time RCE. Scan every root-level *.config.* + the known
// trio explicitly (belt-and-suspenders if a future config uses a new base name).
const CONFIG_RE = /\.config\.(js|cjs|mjs|ts|jsx|tsx)$/;
const ALWAYS = ['postcss.config.mjs', 'postcss.config.js', 'next.config.mjs', 'next.config.js', 'tailwind.config.ts', 'tailwind.config.js'];

// Longest legitimate line across the repo's real configs is ~127 chars; the
// injected payload is a single ~5.6KB line. 400 leaves generous headroom while
// still catching any minified/obfuscated blob.
const MAX_LINE = 400;

// High-signal signatures. Each is either a direct IOC from the decoded loader or
// a generic dynamic-code-execution / obfuscation marker that has no business in a
// static build config. Kept tight to avoid false positives (verified against the
// repo's real next/postcss/tailwind configs, which trip none of these).
const SIGNATURES = [
  [/global\s*\.\s*o\s*=/, "stage-1 loader tag `global.o=`"],
  [/_\$_\d/, "obfuscator variable prefix `_$_<n>`"],
  [/_0x[0-9a-f]{4,}/i, "js-obfuscator hex identifier `_0x…`"],
  [/String\s*\.\s*fromCharCode\s*\(\s*127\s*\)/, "char-127 delimiter (string-shuffle decoder)"],
  [/\beth_(getBlockByNumber|blockNumber)\b/, "Ethereum RPC dead-drop call (EtherHiding C2)"],
  [/\b(publicnode\.com|drpc\.org|blastapi\.io)\b/i, "public Ethereum RPC host (C2 resolver)"],
  [/33ff3edaf55a8e03dcbc7cb40d498a49/i, "known campaign id (2026-09-07 loader)"],
  [/require\s*\(\s*['"]child_process['"]\s*\)|['"]child_process['"]/, "child_process reference in a build config"],
  [/\beval\s*\(/, "eval() in a build config"],
  [/\bnew\s+Function\s*\(|\bFunction\s*\(\s*['"]/, "Function() constructor (dynamic code build)"],
  [/\batob\s*\(/, "atob() base64 decode in a build config"],
  [/[A-Za-z0-9+/]{200,}={0,2}/, "long base64/hex blob (200+ chars)"],
  [/createRequire\s*\(/, "createRequire() injected into an ESM config (loader's require shim)"],
];

// Scan one file's text; returns an array of { rule, line, sample } hits.
// Exported so the contract test can exercise it without shelling out.
export function scanText(fileName, text) {
  const hits = [];
  const lines = text.split('\n');
  lines.forEach((ln, i) => {
    if (ln.length > MAX_LINE) {
      hits.push({ rule: `line > ${MAX_LINE} chars (obfuscated one-liner)`, line: i + 1, sample: `${ln.length} chars` });
    }
    for (const [re, label] of SIGNATURES) {
      const m = ln.match(re);
      if (m) hits.push({ rule: label, line: i + 1, sample: m[0].slice(0, 60) });
    }
  });
  return hits;
}

async function main() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const targets = new Set();
  for (const e of entries) {
    if (e.isFile() && CONFIG_RE.test(e.name)) targets.add(e.name);
  }
  for (const a of ALWAYS) targets.add(a);

  let failed = false;
  let scanned = 0;
  for (const name of [...targets].sort()) {
    let text;
    try {
      text = await readFile(join(ROOT, name), 'utf8');
    } catch {
      continue; // ALWAYS entries that don't exist in this repo
    }
    scanned++;
    const hits = scanText(basename(name), text);
    if (hits.length) {
      failed = true;
      console.error(`\n✗ ${name} — build-config injection signature(s):`);
      for (const h of hits) console.error(`    line ${h.line}: ${h.rule}  [${h.sample}]`);
    }
  }

  if (failed) {
    console.error('\n  → A build-executed config contains an injected/obfuscated payload.');
    console.error('    `next build` runs these files, so this is a build-time RCE. Restore the');
    console.error('    clean config (e.g. `git checkout origin/main -- postcss.config.mjs`) and');
    console.error('    hunt the reinjector before merging. See the 2026-09-07 EtherHiding incident.');
    process.exit(1);
  }
  console.log(`✓ build configs clean — no injection signatures in ${scanned} file(s).`);
}

// Only run the guard when invoked directly (`node scripts/check-build-configs.mjs`),
// so the contract test can import scanText without triggering process.exit.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
