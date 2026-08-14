import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('scoutopoly.html', 'dist/scoutopoly.html');
await cp('index.html', 'dist/index.html');

console.log('Exported Scoutopoly to dist/.');
