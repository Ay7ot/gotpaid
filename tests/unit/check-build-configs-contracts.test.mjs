// Build-config clean-file guard — contract test (trimfitt-patient-web).
//   node tests/unit/check-build-configs-contracts.test.mjs
//
// Proves the guard (a) passes this repo's real build configs, (b) catches the
// actual 2026-08/09 loader signatures (global.o= family, EtherHiding C2), and
// (c) is wired into package.json + CI. Mirrors trimfitt-rx's guard (6e713a45).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { scanText } from '../../scripts/check-build-configs.mjs';

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}`); } };
const read = (r) => readFile(path.join(process.cwd(), r), 'utf8');

console.log('\n── clean configs produce ZERO hits (no false positives) ──');
for (const f of ['postcss.config.mjs', 'next.config.ts', 'eslint.config.mjs']) {
  const hits = scanText(f, await read(f));
  ok(`${f} is clean`, hits.length === 0);
}

console.log('\n── the real payload signatures are caught ──');
// Representative fragments taken verbatim from the decoded loader (data only).
const cleanTail = 'export default config;\n';
const injected = cleanTail +
  "global.o='7-v2217';var _$_3035=(function(j,p){});" +
  "String.fromCharCode(127);eval(g);require('child_process');";
const hits = scanText('postcss.config.mjs', injected);
const has = (frag) => hits.some(h => h.rule.includes(frag));
ok('flags global.o= tag', has('global.o='));
ok('flags _$_ obfuscator prefix', has('_$_'));
ok('flags eval() in a build config', has('eval()'));
ok('flags child_process reference', has('child_process'));
ok('flags char-127 delimiter', has('char-127'));

console.log('\n── the obfuscated one-liner (5.6KB single line) trips the length rule ──');
const longLine = cleanTail + 'x'.repeat(5657);
ok('flags a >400-char line', scanText('postcss.config.mjs', longLine).some(h => h.rule.includes('obfuscated one-liner')));

console.log('\n── EtherHiding C2 IOCs are caught ──');
ok('flags Ethereum RPC dead-drop call', scanText('c.config.mjs', 'eth_getBlockByNumber').some(h => h.rule.includes('EtherHiding')));
ok('flags public RPC host', scanText('c.config.mjs', 'eth.drpc.org').some(h => h.rule.includes('C2 resolver')));
ok('flags createRequire shim', scanText('c.config.mjs', 'createRequire(import.meta.url)').some(h => h.rule.includes('createRequire')));

console.log('\n── wiring: package.json script + CI job exist ──');
const pkg = await read('package.json');
ok('package.json has check:build-configs', /"check:build-configs":\s*"node scripts\/check-build-configs\.mjs"/.test(pkg));
const ci = await read('.github/workflows/ci.yml');
ok('ci.yml runs the guard', /npm run check:build-configs/.test(ci));
ok('ci.yml has a dedicated job', /Build-config clean-file guard/.test(ci));

console.log(`\ncheck-build-configs: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);