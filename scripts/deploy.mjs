/**
 * deploy.mjs — 一键部署到 GitHub Pages
 * 用法: npm run deploy
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
process.chdir(ROOT);

try {
  console.log('📦 git add...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('📝 git commit...');
  try {
    execSync('git commit -m "Update: ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '"', { stdio: 'inherit' });
  } catch (e) {
    // No changes to commit is OK
    console.log('   (nothing to commit)');
  }

  console.log('🚀 git push...');
  execSync('git push origin main', { stdio: 'inherit', timeout: 60000 });

  console.log('\n✅ 部署完成！');
  console.log('🌐 https://www.gta6hub.us');
  console.log('   (1-2 分钟后生效)\n');
} catch (e) {
  console.error('❌ 部署失败:', e.message);
  process.exit(1);
}
