#!/usr/bin/env node
/**
 * Post-build: unify static export to "one HTML shell + JS injected".
 * - Builds one HTML template that includes every script needed by the app
 *   (union of all script tags across pages).
 * - Each route's HTML is that same shell with its own __NEXT_DATA__ so
 *   the correct page is shown on first load.
 * Result: one index.html-style structure everywhere; one set of JS (injected).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'out');

function getAllHtmlFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      files.push(...getAllHtmlFiles(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.html')) {
      files.push(rel);
    }
  }
  return files;
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  return match ? match[1].trim() : null;
}

function getScriptTags(html) {
  const matches = html.matchAll(/<script[^>]*src="[^"]*"[^>]*>[\s\S]*?<\/script>/g);
  return [...matches].map((m) => m[0]);
}

function buildUnifiedShell(htmlFiles) {
  const allScriptTags = new Set();
  let indexHtml = null;
  for (const rel of htmlFiles) {
    const fullPath = path.join(outDir, rel);
    const html = fs.readFileSync(fullPath, 'utf8');
    if (rel === 'index.html') indexHtml = html;
    for (const tag of getScriptTags(html)) allScriptTags.add(tag);
  }
  if (!indexHtml) indexHtml = fs.readFileSync(path.join(outDir, htmlFiles[0]), 'utf8');

  const headEnd = indexHtml.indexOf('</head>');
  const headContent = indexHtml.slice(0, headEnd);
  const scriptTagRegex = /<script[^>]*src="[^"]*"[^>]*>[\s\S]*?<\/script>\s*/g;
  const headWithoutScripts = headContent.replace(scriptTagRegex, '');
  const unionScripts = [...allScriptTags].join('\n');
  const newHead = headWithoutScripts + '\n' + unionScripts + '\n</head>';

  const bodyOpenMatch = indexHtml.match(/<body[^>]*>/);
  const bodyOpen = bodyOpenMatch ? bodyOpenMatch[0] : '<body class="antialiased">';
  const minimalBodyContent = '<div id="__next"></div>\n{{__NEXT_DATA__}}';

  return indexHtml.replace(/[\s\S]*?<\/head>/, newHead).replace(/<body[^>]*>[\s\S]*?<\/body>/, bodyOpen + minimalBodyContent + '</body>');
}

const htmlFiles = getAllHtmlFiles(outDir);
if (htmlFiles.length === 0) {
  console.warn('post-build-unify-html: no HTML files in out/');
  process.exit(0);
}

const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('post-build-unify-html: out/index.html not found');
  process.exit(1);
}

const unifiedShell = buildUnifiedShell(htmlFiles);

for (const rel of htmlFiles) {
  const fullPath = path.join(outDir, rel);
  const currentHtml = fs.readFileSync(fullPath, 'utf8');
  const nextData = extractNextData(currentHtml);
  if (!nextData) {
    console.warn('post-build-unify-html: no __NEXT_DATA__ in', rel);
    continue;
  }
  const nextDataScript = `<script id="__NEXT_DATA__" type="application/json">${nextData}</script>`;
  const unified = unifiedShell.replace('{{__NEXT_DATA__}}', nextDataScript);
  fs.writeFileSync(fullPath, unified, 'utf8');
}

console.log('post-build-unify-html: unified', htmlFiles.length, 'HTML files to one shell (same scripts everywhere).');
