/**
 * admin-server.mjs — 文章编辑后台
 * 用法: npm run admin → http://localhost:3456
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { marked } from 'marked';

const PORT = 3456;
const ROOT = join(import.meta.dirname, '..');
const ARTICLES_DIR = join(ROOT, 'content', 'articles');

function getAdminHTML() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GTA6 情报站 — 文章编辑</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, system-ui, sans-serif; background: #0A0A1A; color: #eaeaf0; min-height: 100vh; }
  .app { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .panel { background: rgba(18,18,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; }
  .panel h2 { font-size: 1.1rem; margin-bottom: 16px; color: #FF00AA; }
  .form-group { margin-bottom: 14px; }
  label { display: block; font-size: 0.82rem; color: #a8a8c0; margin-bottom: 4px; font-weight: 600; }
  input, textarea, select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); color: #eaeaf0; font-size: 0.9rem; font-family: inherit; resize: vertical; }
  textarea { min-height: 320px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.6; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #FF00AA; }
  .row { display: flex; gap: 12px; }
  .row > * { flex: 1; }
  .btn { padding: 10px 24px; border-radius: 8px; border: none; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-primary { background: linear-gradient(135deg, #FF0055, #FF00AA); color: #fff; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(255,0,85,0.3); }
  .btn-secondary { background: rgba(255,255,255,0.06); color: #a8a8c0; border: 1px solid rgba(255,255,255,0.08); }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); }
  .btn-success { background: #00c853; color: #fff; }
  .actions { display: flex; gap: 8px; margin-top: 16px; }
  .toast { position: fixed; top: 20px; right: 20px; padding: 14px 20px; border-radius: 10px; font-weight: 600; z-index: 999; animation: slideIn 0.3s ease; }
  .toast.ok { background: #00c853; color: #fff; }
  .toast.err { background: #FF0055; color: #fff; }
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  #preview { line-height: 1.8; }
  #preview h2 { font-size: 1.3rem; color: #fff; margin: 20px 0 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  #preview p { margin-bottom: 12px; color: #c0c0d0; }
  #preview ul { margin-left: 18px; color: #c0c0d0; }
  #preview li { margin-bottom: 6px; }
  #preview strong { color: #fff; }
  #preview pre { background: rgba(0,0,0,0.4); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
  #preview code { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
  #preview blockquote { border-left: 3px solid #FF00AA; margin: 12px 0; padding: 8px 16px; background: rgba(255,0,170,0.05); color: #a8a8c0; }
  #preview table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  #preview th { text-align: left; padding: 8px 12px; border-bottom: 2px solid rgba(255,0,85,0.3); color: #FF0055; }
  #preview td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .upload-zone { border: 2px dashed rgba(255,255,255,0.12); border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 14px; transition: all 0.2s; cursor: pointer; }
  .upload-zone:hover, .upload-zone.dragover { border-color: #FF00AA; background: rgba(255,0,170,0.04); }
  .upload-zone p { color: #6e6e88; font-size: 0.85rem; margin: 0; }
  .upload-zone p span { color: #FF00AA; text-decoration: underline; }
  .image-gallery { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; min-height: 0; }
  .image-gallery .img-item { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
  .image-gallery .img-item img { width: 100%; height: 100%; object-fit: cover; }
  .image-gallery .img-item .img-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: #FF0055; color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .image-gallery .img-item .img-copy { position: absolute; bottom: 2px; left: 2px; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; font-size: 9px; cursor: pointer; }
  .upload-progress { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 14px; overflow: hidden; display: none; }
  .upload-progress .bar { height: 100%; background: linear-gradient(90deg, #FF0055, #FF00AA); border-radius: 2px; transition: width 0.3s; width: 0%; }
  @media (max-width: 768px) { .app { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="app">
  <div class="panel">
    <h2>✏️ 编辑文章</h2>
    <div class="form-group">
      <label>标题</label>
      <input id="title" placeholder="文章标题">
    </div>
    <div class="row">
      <div class="form-group">
        <label>分类</label>
        <select id="category">
          <option>预告分析</option><option>爆料追踪</option><option>深度分析</option>
          <option>官方动态</option><option>角色解析</option><option>游戏文化</option>
        </select>
      </div>
      <div class="form-group">
        <label>日期</label>
        <input id="date" type="date">
      </div>
    </div>
    <div class="form-group">
      <label>标签（逗号分隔）</label>
      <input id="tags" placeholder="GTA6, Rockstar, 预告片">
    </div>
    <div class="form-group">
      <label>摘要（首页显示）</label>
      <input id="excerpt" placeholder="一两句话概括文章">
    </div>
    <div class="form-group">
      <label>封面图 URL（可选）</label>
      <input id="cover" placeholder="images/cover.jpg 或 https://...">
    </div>
    <div class="form-group">
      <label>正文插图</label>
      <div class="upload-zone" id="uploadZone">
        <p>📷 拖拽图片到这里，或 <span>点击上传</span></p>
        <p style="font-size:0.75rem;margin-top:4px;">也可以 Ctrl+V 粘贴截图</p>
      </div>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none">
      <div class="upload-progress" id="uploadProgress"><div class="bar"></div></div>
      <div class="image-gallery" id="imageGallery"></div>
    </div>
    <div class="form-group">
      <label>正文（Markdown）</label>
      <textarea id="body" placeholder="支持 Markdown 语法&#10;注意：加粗带引号的文字用 <strong>&#34;文本&#34;</strong>"></textarea>
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick="save()">💾 保存文章</button>
      <button class="btn btn-secondary" onclick="clearForm()">清空</button>
      <button class="btn btn-success" onclick="deploy()" id="deployBtn">🚀 部署上线</button>
    </div>
  </div>

  <div class="panel">
    <h2>👁️ 预览</h2>
    <div id="preview"><p style="color:#6e6e88;">输入正文后这里会实时预览…</p></div>
  </div>
</div>

<script>
  // 自动填日期
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  // 实时预览
  document.getElementById('body').addEventListener('input', function() {
    const md = this.value;
    if (!md.trim()) {
      document.getElementById('preview').innerHTML = '<p style="color:#6e6e88">输入正文后这里会实时预览…</p>';
      return;
    }
    fetch('/preview', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({md}) })
      .then(r => r.text())
      .then(html => { document.getElementById('preview').innerHTML = html; });
  });

  function toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function getFields() {
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    if (!title || !body) { toast('请填写标题和正文', 'err'); return null; }
    const cat = document.getElementById('category').value;
    const id = 'article-' + Date.now();
    return {
      id, title,
      category: cat,
      tags: document.getElementById('tags').value.split(',').map(s => s.trim()).filter(Boolean),
      date: document.getElementById('date').value,
      excerpt: document.getElementById('excerpt').value.trim(),
      coverImage: document.getElementById('cover').value.trim(),
      readTime: Math.max(1, Math.ceil(body.length / 500)),
      featured: false,
      body: body
    };
  }

  async function save() {
    const data = getFields();
    if (!data) return;
    const resp = await fetch('/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const result = await resp.json();
    if (result.ok) {
      toast('✅ 已保存: ' + result.file, 'ok');
    } else {
      toast('❌ ' + result.error, 'err');
    }
  }

  async function deploy() {
    const btn = document.getElementById('deployBtn');
    btn.textContent = '⏳ 部署中…';
    btn.disabled = true;
    try {
      const resp = await fetch('/deploy');
      const result = await resp.json();
      if (result.ok) {
        toast('🚀 部署完成! ' + result.url, 'ok');
      } else {
        toast('❌ ' + (result.error || '部署失败'), 'err');
      }
    } catch(e) {
      toast('❌ 部署失败', 'err');
    }
    btn.textContent = '🚀 部署上线';
    btn.disabled = false;
  }

  function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('body').value = '';
    document.getElementById('excerpt').value = '';
    document.getElementById('cover').value = '';
    document.getElementById('tags').value = '';
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    document.getElementById('preview').innerHTML = '<p style="color:#6e6e88">输入正文后这里会实时预览…</p>';
    uploadedImages = [];
    renderGallery();
  }

  // ── 图片上传 ──
  let uploadedImages = [];
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const gallery = document.getElementById('imageGallery');
  const progressBar = document.getElementById('uploadProgress').querySelector('.bar');
  const bodyTextarea = document.getElementById('body');

  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => uploadFiles(e.target.files));

  // 拖拽上传
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    uploadFiles(e.dataTransfer.files);
  });

  // 粘贴截图
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        uploadFiles([item.getAsFile()]);
        break;
      }
    }
  });

  async function uploadFiles(fileList) {
    const files = [...fileList].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    document.getElementById('uploadProgress').style.display = 'block';
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const formData = new FormData();
      formData.append('image', f);
      progressBar.style.width = ((i / files.length) * 100) + '%';
      try {
        const resp = await fetch('/upload-image', { method: 'POST', body: formData });
        const result = await resp.json();
        if (result.ok) {
          uploadedImages.push(result.path);
          renderGallery();
          toast('✅ 已上传: ' + result.path, 'ok');
        } else {
          toast('❌ ' + (result.error || '上传失败'), 'err');
        }
      } catch(err) {
        toast('❌ 上传失败: ' + err.message, 'err');
      }
      progressBar.style.width = (((i + 1) / files.length) * 100) + '%';
    }
    setTimeout(() => {
      document.getElementById('uploadProgress').style.display = 'none';
      progressBar.style.width = '0%';
    }, 500);
    fileInput.value = '';
  }

  function renderGallery() {
    gallery.innerHTML = uploadedImages.map((path, i) =>
      '<div class="img-item">' +
        '<img src="/images/' + path + '" alt="">' +
        '<button class="img-del" onclick="removeImage(' + i + ')">✕</button>' +
        '<button class="img-copy" onclick="insertImage(\\'' + path + '\\')">插入</button>' +
      '</div>'
    ).join('');
  }

  function removeImage(i) {
    uploadedImages.splice(i, 1);
    renderGallery();
  }

  function insertImage(path) {
    const md = '![图片](images/' + path + ')';
    const ta = bodyTextarea;
    const start = ta.selectionStart;
    ta.value = ta.value.substring(0, start) + md + '\\n' + ta.value.substring(ta.selectionEnd);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + md.length + 1;
    ta.dispatchEvent(new Event('input'));
    toast('📷 已插入: ' + md, 'ok');
  }
</script>
</body>
</html>`;
  return html;
}

function makeFrontmatter(data) {
  let fm = '---\n';
  fm += `id: ${data.id}\n`;
  fm += `title: "${data.title}"\n`;
  fm += `excerpt: "${data.excerpt}"\n`;
  fm += `author: GTA6情报站\n`;
  fm += `category: ${data.category}\n`;
  fm += `tags: [${(data.tags || []).join(', ')}]\n`;
  fm += `date: ${data.date}\n`;
  fm += `coverImage: "${data.coverImage || ''}"\n`;
  fm += `readTime: ${data.readTime}\n`;
  fm += `featured: ${data.featured || false}\n`;
  fm += '---\n\n';
  fm += data.body + '\n';
  return fm;
}

// ── Server ──

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getAdminHTML());
    return;
  }

  // 上传图片
  if (req.method === 'POST' && req.url === '/upload-image') {
    try {
      const boundary = req.headers['content-type']?.split('boundary=')[1];
      if (!boundary) throw new Error('No boundary');
      const raw = await readBody(req);
      const parts = raw.split('--' + boundary);
      for (const part of parts) {
        if (!part.includes('filename=')) continue;
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd < 0) continue;
        const header = part.substring(0, headerEnd);
        const fnMatch = header.match(/filename="(.+?)"/);
        const extMatch = fnMatch?.[1]?.match(/\.(\w+)$/);
        const ext = extMatch?.[1] || 'png';
        const body = part.substring(headerEnd + 4);
        const cleanBody = body.replace(/\r\n$/, '').replace(/--$/, '');
        const filename = Date.now() + '-' + Math.random().toString(36).slice(2,6) + '.' + ext;
        const IMAGES_DIR = join(ROOT, 'images');
        if (!existsSync(IMAGES_DIR)) { mkdirSync(IMAGES_DIR, { recursive: true }); }
        writeFileSync(join(IMAGES_DIR, filename), Buffer.from(cleanBody, 'binary'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, path: filename }));
        return;
      }
      throw new Error('No file found');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // 预览
  if (req.method === 'POST' && req.url === '/preview') {
    const raw = await readBody(req);
    const { md } = JSON.parse(raw);
    const html = marked.parse(md || '');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    const raw = await readBody(req);
    const data = JSON.parse(raw);
    const fm = makeFrontmatter(data);
    const filename = `${data.id}.md`;
    const filepath = join(ARTICLES_DIR, filename);

    try {
      writeFileSync(filepath, fm, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, file: filename }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/deploy') {
    try {
      console.log('\n🚀 开始部署...');
      const result = execSync('npm run deploy', { cwd: ROOT, timeout: 120000, encoding: 'utf-8' });
      console.log(result);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, url: 'https://www.gta6hub.us' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.stderr || e.message }));
    }
    return;
  }

  // 提供 images/ 目录下的静态文件
  if (req.method === 'GET' && req.url.startsWith('/images/')) {
    const imgPath = join(ROOT, req.url);
    try {
      const img = readFileSync(imgPath);
      const ext = req.url.split('.').pop().toLowerCase();
      const mimes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': mimes[ext] || 'image/png' });
      res.end(img);
    } catch (e) {
      res.writeHead(404);
      res.end('Image not found');
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => resolve(body));
  });
}

server.listen(PORT, () => {
  console.log(`\n📝 GTA6 情报站 — 文章编辑器`);
  console.log(`   打开 → http://localhost:${PORT}\n`);
});
