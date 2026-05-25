#!/usr/bin/env node
// prepack — copy .agent/ → template/.agent/ truoc khi npm pack/publish
// Dam bao template luon fresh tu source.

import { cp, rm, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, '.agent');
const dst = resolve(root, 'template', '.agent');

try {
    await stat(src);
} catch {
    console.error(`[prepack] FAIL: source ${src} not found.`);
    process.exit(1);
}

if (existsSync(resolve(root, 'template'))) {
    await rm(resolve(root, 'template'), { recursive: true, force: true });
}

await mkdir(dirname(dst), { recursive: true });
await cp(src, dst, { recursive: true });
console.log(`[prepack] Copied ${src} → ${dst}`);
