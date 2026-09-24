import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
if (!dist.startsWith(`${root}${sep}`) || dist === root) throw new Error('Unsafe build destination');
await rm(dist, { recursive: true, force: true });
await mkdir(dist);

for (const name of ['assets', 'a', 'b', 'c', 'privacy-policy', 'terms']) {
  await cp(resolve(root, name), resolve(dist, name), { recursive: true });
}
for (const name of ['index.html', 'config.js', 'legal.css', '_headers', '_redirects']) {
  await cp(resolve(root, name), resolve(dist, name));
}
