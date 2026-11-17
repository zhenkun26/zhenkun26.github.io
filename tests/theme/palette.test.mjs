import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../..');
const css = readFileSync(resolve(root, 'public/theme/palette.css'), 'utf8');
const declarations = (selector) => {
  const block = css.slice(css.indexOf(`${selector} {`)).split('}')[0];
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2]]));
};
const light = declarations(':root');
const dark = { ...light, ...declarations('.dark') };

function rgb(palette, name) {
  let value = palette[name];
  while (value.startsWith('var(')) value = palette[value.slice(4, -1)];
  const [h, s, l] = value.split(' ').map((part, i) => Number.parseFloat(part) / (i === 0 ? 360 : 100));
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
}

function luminance(color) {
  const channels = color.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

for (const [mode, palette] of Object.entries({ light, dark })) {
  test(`${mode}: body, links, muted text and solid buttons meet AA normal-text contrast`, () => {
    for (const [fg, bg] of [
      ['--foreground', '--background'],
      ['--card-foreground', '--card'],
      ['--muted-foreground', '--card'],
      ['--muted-foreground', '--muted'],
      ['--primary', '--card'],
      ['--primary-foreground', '--primary'],
      ['--primary-foreground', '--brand-hover'],
    ]) {
      const ratio = contrast(rgb(palette, fg), rgb(palette, bg));
      assert.ok(ratio >= 4.5, `${mode} ${fg} on ${bg}: ${ratio.toFixed(2)}:1`);
    }
  });

  test(`${mode}: gradient button labels stay readable across the whole gradient`, () => {
    const start = rgb(palette, '--brand-button-start');
    const end = rgb(palette, '--brand-button-end');
    const text = rgb(palette, '--brand-button-foreground');
    for (let step = 0; step <= 20; step++) {
      const background = start.map((channel, i) => channel + ((end[i] - channel) * step) / 20);
      assert.ok(contrast(text, background) >= 4.5, `${mode}: gradient step ${step}`);
    }
  });
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(css|astro|tsx?|mjs|yaml)$/.test(path) ? [path] : [];
  });
}

test('UI sources do not reintroduce the former literal sakura brand palette', () => {
  // Named Markdown colors, status colors, Christmas ornaments and artwork are intentional.
  const oldBrand =
    /#(?:e9546[b9]|e9536a|ed788[cb]|ed6ea0|ec8c69|f18bb3|f0a387|ffc0cb|ffc5d4|ef7396|ed719a|ffacde|fbd7ed)\b|rgb\(233 84 107\b/i;
  for (const directory of ['src', 'config', 'public/theme', 'public/rss']) {
    for (const path of sourceFiles(resolve(root, directory))) {
      if (path.endsWith('.test.ts') || path.endsWith('/utils.ts')) continue;
      assert.doesNotMatch(readFileSync(path, 'utf8'), oldBrand, path);
    }
  }
  assert.doesNotMatch(readFileSync(resolve(root, 'tailwind.config.mjs'), 'utf8'), oldBrand);
});
