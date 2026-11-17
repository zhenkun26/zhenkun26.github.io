import type { APIContext } from 'astro';
import palette from '../../../public/theme/palette.css?raw';
import overrides from '../../styles/components/giscus.css?raw';

export const prerender = true;

export function getStaticPaths() {
  return ['light', 'dark'].map((mode) => ({ params: { mode } }));
}

export function GET({ params }: APIContext) {
  const mode = params.mode === 'dark' ? 'dark' : 'light';
  // An iframe cannot inherit the parent .dark class. Emit only the requested palette.
  const scopedPalette = mode === 'dark' ? palette.replace('.dark {', ':root {') : palette.replace(/\.dark \{[^}]*\}/, '');
  const css = `@import url("https://giscus.app/themes/${mode}.css");\n${scopedPalette}\n${overrides}`;
  return new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
}
