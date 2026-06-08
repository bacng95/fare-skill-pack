#!/usr/bin/env node
// sync-claude — DEV tool cho TAC GIA: sinh .claude/ tai repo root tu .agent/
//
// Dung khi ban vua sua .agent/ va muon test skill/agent/command tren Claude Code
// (Claude Code khong doc .agent/). Chay xong: restart Claude Code hoac /mcp
// reconnect de no nap lai.
//
//   node bin/sync-claude.mjs            # build mot lan
//   node bin/sync-claude.mjs --watch    # build lai moi khi .agent/ doi
//
// Nguoi dung cuoi KHONG can lenh nay — `init` da goi cung bo chuyen doi.

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, watch } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { buildClaude } from './lib/build-claude.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENT = join(ROOT, '.agent');
const CLAUDE = join(ROOT, '.claude');

const C = { reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', dim: '\x1b[2m', yellow: '\x1b[33m' };

async function run() {
    if (!existsSync(AGENT)) {
        process.stderr.write(`✗ Khong tim thay ${AGENT}\n`);
        process.exit(1);
    }
    const r = await buildClaude({ agentDir: AGENT, claudeDir: CLAUDE });
    const stamp = new Date().toISOString().slice(11, 19);
    process.stdout.write(
        `${C.green}✓${C.reset} ${C.dim}[${stamp}]${C.reset} .claude/ ← .agent/  `
        + `${C.cyan}${r.skills}${C.reset} skills · `
        + `${C.cyan}${r.agents}${C.reset} agents · `
        + `${C.cyan}${r.commands}${C.reset} commands\n`,
    );
}

// fs.watch {recursive:true} khong on dinh tren Linux/Node<20 → tu gan watcher
// cho moi thu muc con (walk mot lan luc khoi dong).
async function watchDirs(dir, onChange) {
    const watchers = [];
    async function attach(d) {
        try { watchers.push(watch(d, onChange)); } catch { /* bo qua dir bi xoa */ }
        for (const e of await readdir(d, { withFileTypes: true })) {
            if (e.isDirectory()) await attach(join(d, e.name));
        }
    }
    await attach(dir);
    return watchers;
}

await run();

if (process.argv.includes('--watch')) {
    process.stdout.write(`${C.yellow}watch${C.reset} theo dõi ${C.dim}.agent/${C.reset} — Ctrl-C để dừng\n`);
    let timer = null;
    await watchDirs(AGENT, () => {
        clearTimeout(timer);
        timer = setTimeout(() => { run().catch((e) => process.stderr.write(`✗ ${e.message}\n`)); }, 150);
    });
}
