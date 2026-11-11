import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const repo = new URL('../../', import.meta.url);
const output = new URL('./www/', import.meta.url);
const source = new URL('tilely/', repo);
const assets = [
  'motion.css', 'motion.js',
  'logos/tilely.svg', 'logos/tilely-32.png', 'logos/tilely-180.png',
];

await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/logos/', output), { recursive: true });
for (const file of assets) {
  await cp(new URL(`assets/${file}`, repo), new URL(`assets/${file}`, output));
}
for (const file of ['curated-review.js', 'generator.js', 'reviewed-art.js', 'sprites.js']) {
  await cp(new URL(file, source), new URL(file, output));
}
const html = (await readFile(new URL('index.html', source), 'utf8'))
  .replace('<html lang="tr">', '<html lang="tr" class="native-app">')
  // Keep rapid paint taps from triggering the iOS WebView's double-tap zoom.
  .replace(/(<meta name="viewport" content="[^"]+)(">)/, '$1,minimum-scale=1,maximum-scale=1,user-scalable=no$2')
  .replaceAll('../assets/', './assets/')
  .replace(/^<link[^\n]+fonts\.(?:googleapis|gstatic)\.com[^\n]*\n/gm, '')
  .replace(/^<script[^\n]+static\.cloudflareinsights\.com[^\n]+<\/script>/gm, '')
  .replace('href="../index.html"', 'href="https://furkankale.com/tilely/"');
await writeFile(new URL('index.html', output), html);
