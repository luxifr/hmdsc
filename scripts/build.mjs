import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { build, transform } from 'esbuild';
import { minify } from 'html-minifier-terser';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const htmlPath = resolve(root, 'index.html');
const cssPath = resolve(root, 'styles.css');
const jsPath = resolve(root, 'app.js');
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
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error(`Expected a full Git commit hash; received ${sourceCommit}.`);
}

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
html = replaceExactlyOnce(
  html,
  /<a\b(?=[^>]*\bclass=["']footer-github["'])(?=[^>]*\bhref=["']https:\/\/github\.com\/luxifr\/hmdsc["'])[^>]*>GitHub repository<\/a>/gi,
  `<a class="footer-github" href="https://github.com/luxifr/hmdsc/commit/${sourceCommit}" title="Built from source commit ${sourceCommit}">${sourceCommit.slice(0, 7)}</a>`,
  'footer repository link',
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
