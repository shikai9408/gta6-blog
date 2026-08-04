/**
 * copy-static.mjs
 * Copies static assets into public/ for Vercel deployment
 */

import { cpSync, mkdirSync, existsSync } from 'node:fs';

const ROOT = import.meta.dirname.replace(/scripts$/, '');
const PUBLIC = ROOT + 'public';

const DIRS = ['css', 'js', 'data'];
const FILES = ['index.html', 'article.html'];

if (!existsSync(PUBLIC)) mkdirSync(PUBLIC);

for (const d of DIRS) {
  cpSync(ROOT + d, PUBLIC + '/' + d, { recursive: true });
}
for (const f of FILES) {
  cpSync(ROOT + f, PUBLIC + '/' + f);
}

console.log('✅ Static files copied to public/');
