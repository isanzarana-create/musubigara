#!/usr/bin/env node
/*
  Control de calidad SEO antes de publicar.

  Comprueba, en todas las páginas HTML de la web:
    1. Que cada bloque JSON-LD es JSON válido.
    2. Que TODA imagen declarada como ImageObject lleva los cinco campos que
       pide el informe «Metadatos de imagen» de Google Search Console:
       creator, creditText, copyrightNotice, license y acquireLicensePage.
       (Origen: avisos de GSC del 10 nov 2026 por falta de creator y
       copyrightNotice.)
    3. Que cada URL del sitemap.xml tiene un <lastmod> igual o posterior a la
       fecha del último cambio real de su página. Si el sitemap dice que una
       página no ha cambiado, Google no tiene motivo para reprocesarla y
       sigue mostrando avisos ya corregidos.

  Uso:
    node scripts/check-seo.mjs                 → solo comprueba (sale con error si algo falla)
    node scripts/check-seo.mjs --fix-sitemap   → además pone al día los <lastmod>

  Opciones:
    --root <carpeta>   carpeta publicada (por defecto, la raíz del repositorio)
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const FIX = args.includes('--fix-sitemap');
const rootIdx = args.indexOf('--root');
const ROOT = path.resolve(rootIdx !== -1 ? args[rootIdx + 1] : '.');
const REQUIRED = ['creator', 'creditText', 'copyrightNotice', 'license', 'acquireLicensePage'];

const errors = [];
const fail = (msg) => errors.push(msg);

const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());

function git(argv) {
  try {
    return execFileSync('git', argv, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, TZ: 'Europe/Madrid' } }).trim();
  } catch { return ''; }
}

/* Fecha (Europe/Madrid) del último cambio de un fichero: hoy si tiene cambios
   sin confirmar; si no, la del último commit que lo tocó. */
function lastChange(file) {
  const rel = path.relative(ROOT, file);
  if (git(['status', '--porcelain', '--', rel])) return today();
  return git(['log', '-1', '--format=%cd', '--date=format-local:%Y-%m-%d', '--', rel]) || null;
}

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function walkImages(node, where, file) {
  if (Array.isArray(node)) { node.forEach((n, i) => walkImages(n, `${where}[${i}]`, file)); return; }
  if (!node || typeof node !== 'object') return;
  const types = [].concat(node['@type'] || []);
  if (types.includes('ImageObject')) {
    const missing = REQUIRED.filter((k) => node[k] === undefined || node[k] === '');
    if (node.creator && typeof node.creator === 'object' && !node.creator.name) missing.push('creator.name');
    if (missing.length) {
      fail(`${file}: imagen ${node.contentUrl || node.url || '(sin URL)'} en ${where || 'raíz'} sin: ${missing.join(', ')}`);
    }
  }
  for (const [k, v] of Object.entries(node)) walkImages(v, where ? `${where}.${k}` : k, file);
}

/* 1 y 2: JSON-LD válido y licencias completas en todas las imágenes */
const files = await htmlFiles(ROOT);
let images = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f);
  const html = await fs.readFile(f, 'utf8');
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, body] of blocks) {
    let data;
    try { data = JSON.parse(body); } catch (e) { fail(`${rel}: JSON-LD no válido (${e.message})`); continue; }
    walkImages(data, '', rel);
    images += (body.match(/"ImageObject"/g) || []).length;
  }
}

/* 3: <lastmod> del sitemap al día */
const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemap = '';
try { sitemap = await fs.readFile(sitemapPath, 'utf8'); } catch { fail('No se encuentra sitemap.xml'); }
let fixed = 0;
if (sitemap) {
  sitemap = sitemap.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const loc = (inner.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (!loc) return block;
    const urlPath = new URL(loc).pathname;
    const file = path.join(ROOT, decodeURIComponent(urlPath), urlPath.endsWith('/') ? 'index.html' : '');
    const changed = lastChange(file);
    if (!changed) { fail(`sitemap: ${loc} no corresponde a ningún fichero (${path.relative(ROOT, file)})`); return block; }
    const lm = (inner.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
    if (lm && lm.slice(0, 10) >= changed) return block;
    if (FIX) {
      fixed++;
      return lm ? block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${changed}</lastmod>`)
                : block.replace(/(<loc>[^<]+<\/loc>)/, `$1\n    <lastmod>${changed}</lastmod>`);
    }
    fail(`sitemap: ${loc} tiene lastmod ${lm || '(ninguno)'} pero la página cambió el ${changed}`);
    return block;
  });
  if (FIX && fixed) await fs.writeFile(sitemapPath, sitemap, 'utf8');
}

console.log(`Revisadas ${files.length} páginas y ${images} imágenes en datos estructurados.`);
if (FIX) console.log(`lastmod actualizados en el sitemap: ${fixed}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problema(s):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log('✓ Todo correcto.');
