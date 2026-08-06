/**
 * deploy.mjs — 一键部署到 GitHub Pages
 * 用法: npm run deploy
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { cpSync, rmSync, existsSync } from 'node:fs';

const ROOT = join(import.meta.dirname, '..');
process.chdir(ROOT);

try {
  // 1. Build articles
  console.log('📦 构建文章...');
  execSync('node scripts/build.mjs', { stdio: 'inherit' });

  // 2. Prepare static files
  console.log('📋 准备文件...');
  const PUBLIC = join(ROOT, 'public');
  if (existsSync(PUBLIC)) rmSync(PUBLIC, { recursive: true });

  for (const d of ['css', 'js', 'data', 'images']) {
    const src = join(ROOT, d);
    if (existsSync(src)) cpSync(src, join(PUBLIC, d), { recursive: true });
  }
  for (const f of ['index.html', 'article.html', '.nojekyll', 'CNAME']) {
    const src = join(ROOT, f);
    if (existsSync(src)) cpSync(src, join(PUBLIC, f));
  }

  // 3. Push to gh-pages
  console.log('🚀 推送...');
  execSync('git add public/ -f', { stdio: 'ignore' });
  try { execSync('git commit -m "deploy"', { stdio: 'ignore' }); } catch {}
  try {
    execSync('git subtree push --prefix=public origin gh-pages', { stdio: 'inherit', timeout: 60000 });
  } catch {
    console.log('   强制推送...');
    // Fallback: force push using subtree split
    const hash = execSync('git subtree split --prefix=public HEAD', { encoding: 'utf8' }).trim();
    execSync('git push origin ' + hash + ':gh-pages --force', { stdio: 'inherit', timeout: 60000 });
  }

  // Clean up commit
  try { execSync('git reset HEAD~1 --soft', { stdio: 'ignore' }); } catch {}
  try { execSync('git reset HEAD public/', { stdio: 'ignore' }); } catch {}

  console.log('\n✅ 部署完成！');
  console.log('   https://shikai9408.github.io/gta6-blog/');
} catch (e) {
  console.error('❌', e.message);
  process.exit(1);
}
