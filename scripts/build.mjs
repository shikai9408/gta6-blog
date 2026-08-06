/**
 * build.mjs — GTA 6 情报站内容构建脚本
 *
 * 递归扫描 content/articles/ 下所有 .md 文件，
 * 解析 YAML 风格 frontmatter + Markdown 正文，
 * 生成 data/articles.json 供前端消费。
 *
 * 用法:  node scripts/build.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { marked } from 'marked';

// =============================================
// CONFIG
// =============================================

const CONTENT_DIR  = join(import.meta.dirname, '..', 'content', 'articles');
const OUTPUT_FILE  = join(import.meta.dirname, '..', 'data', 'articles.json');

// Configure marked for code highlighting metadata
marked.setOptions({
  gfm: true,
  breaks: false,
});

// =============================================
// FRONTMATTER PARSER (no external dependency)
// =============================================

function parseFrontmatter(raw) {
  // Normalize line endings to LF (handle CRLF from Windows)
  raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Match YAML-style frontmatter delimited by ---
  const RE = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const m = raw.match(RE);
  if (!m) {
    // No frontmatter — treat whole file as markdown content
    return { meta: {}, content: raw };
  }

  const yamlBlock = m[1];
  const mdContent = m[2];
  const meta = {};

  // Parse simple YAML-ish key: value lines
  // Supports: key: value, key: "value", key: [item, item], nested arrays are NOT supported
  const lines = yamlBlock.split('\n');
  let currentKey = null;
  let arrayBuffer = [];

  for (const line of lines) {
    // Skip empty lines
    if (line.trim() === '') continue;

    // Check if collecting array items
    if (currentKey && /^\s*-\s+.+/.test(line)) {
      const item = line.replace(/^\s*-\s+/, '').trim();
      arrayBuffer.push(item.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
      continue;
    }

    // Flush previous array if any
    if (currentKey && arrayBuffer.length > 0) {
      meta[currentKey] = arrayBuffer;
      arrayBuffer = [];
      currentKey = null;
    }

    // Key: value line (or key: [inline array])
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    let value = kvMatch[2].trim();

    // Inline array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'))
        .filter(Boolean);
      continue;
    }

    // Check if next lines might be a block array (value is empty or just "[")
    if (value === '' || value === '[') {
      currentKey = key;
      arrayBuffer = [];
      continue;
    }

    // Strip quotes
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

    // Typed values
    if (value === 'true')  { meta[key] = true; continue; }
    if (value === 'false') { meta[key] = false; continue; }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      meta[key] = Number(value);
      continue;
    }

    meta[key] = value;
  }

  // Flush trailing array
  if (currentKey && arrayBuffer.length > 0) {
    meta[currentKey] = arrayBuffer;
  }

  return { meta, content: mdContent };
}

// =============================================
// FILE SCANNER (recursive)
// =============================================

function findMarkdownFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);

    if (st.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (extname(entry).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }

  return files;
}

// =============================================
// MAIN BUILD
// =============================================

function build() {
  console.log('📄 Scanning:', CONTENT_DIR);

  const mdFiles = findMarkdownFiles(CONTENT_DIR);
  console.log(`   Found ${mdFiles.length} markdown file(s)\n`);

  const articles = [];

  for (const filePath of mdFiles) {
    const raw = readFileSync(filePath, 'utf-8');
    const { meta, content } = parseFrontmatter(raw);

    // Validate required fields
    if (!meta.id) {
      console.warn(`⚠  Skipping ${basename(filePath)}: missing "id" in frontmatter`);
      continue;
    }
    if (!meta.title) {
      console.warn(`⚠  Skipping ${basename(filePath)}: missing "title" in frontmatter`);
      continue;
    }

    // Convert markdown content to HTML
    const htmlContent = marked.parse(content.trim());

    const article = {
      id:         meta.id,
      title:      meta.title,
      excerpt:    meta.excerpt || '',
      content:    htmlContent,
      author:     meta.author || 'GTA6情报站',
      category:   meta.category || '未分类',
      tags:       meta.tags || [],
      date:       meta.date || '',
      coverImage: meta.coverImage || '',
      readTime:   meta.readTime || Math.ceil(content.length / 500),
      featured:   meta.featured || false,
    };

    articles.push(article);
    console.log(`   ✅  ${article.id}`);
    console.log(`       ${article.title}`);
    console.log(`       ${article.tags.length} tags · ${article.readTime} min read · featured: ${article.featured}`);
  }

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write output
  writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`\n🎯 Wrote ${articles.length} articles → ${OUTPUT_FILE}`);
}

// =============================================
// RUN
// =============================================

try {
  build();
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
}
