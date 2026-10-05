import { cpSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const assets = resolve(root, 'assets');

mkdirSync(assets, { recursive: true });
cpSync(resolve(root, 'dist/assets'), assets, { recursive: true });
copyFileSync(resolve(root, 'dist/index.html'), resolve(root, 'index.html'));
