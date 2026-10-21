import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import { minify } from 'html-minifier-terser';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const source = resolve(root, 'src');
const htmlPath = resolve(source, 'index.html');
const cssPath = resolve(source, 'styles.css');
const jsPath = resolve(source, 'app.js');
const outputPath = resolve(dist, 'index.html');

function replaceExactlyOnce(source, pattern, replacement, resourceName) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${resourceName} reference in index.html; found ${matches.length}.`);
  }
  return source.replace(pattern, replacement);
}

let html = await readFile(htmlPath, 'utf8');
const css = await readFile(cssPath, 'utf8');

const jsBundle = await build({
  entryPoints: [jsPath],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
});
const minifiedCss = await transform(css, {
  loader: 'css',
  minify: true,
  target: 'es2020',
});

// Escape closing tags so source text cannot terminate an inline element early.
const inlineCss = minifiedCss.code.replace(/<\/style/gi, '<\\/style');
const inlineJs = jsBundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

html = replaceExactlyOnce(
  html,
  /<link\b(?=[^>]*\bhref=["']styles\.css["'])[^>]*\/?\s*>/gi,
  `<style>${inlineCss}</style>`,
  'stylesheet',
);
html = replaceExactlyOnce(
  html,
  /<script\b(?=[^>]*\bsrc=["']app\.js["'])[^>]*>\s*<\/script>/gi,
  `<script>${inlineJs}</script>`,
  'application script',
);

const output = await minify(html, {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
});

await mkdir(dist, { recursive: true });
await writeFile(outputPath, `${output}\n`);
console.log(`Built ${outputPath} (${Buffer.byteLength(output)} bytes)`);
