#!/usr/bin/env node
// fare-skill — CLI cho fare-skill-pack
// Subcommands: init | update | uninstall | register-mcp | help
//
// Zero deps (chi dung Node stdlib).

import { cp, rm, mkdir, stat, readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

// ============================================================
// Constants
// ============================================================

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_AGENT = resolve(PKG_ROOT, 'template', '.agent');
const VERSION = JSON.parse(
    await readFile(resolve(PKG_ROOT, 'package.json'), 'utf8'),
).version;

// ANSI colors (simple, no deps)
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

// ============================================================
// Helpers
// ============================================================

function log(msg) { stdout.write(`${msg}\n`); }
function info(msg) { log(`${C.cyan}ℹ${C.reset} ${msg}`); }
function ok(msg) { log(`${C.green}✓${C.reset} ${msg}`); }
function warn(msg) { log(`${C.yellow}⚠${C.reset} ${msg}`); }
function err(msg) { log(`${C.red}✗${C.reset} ${msg}`); }
function bold(msg) { return `${C.bold}${msg}${C.reset}`; }
function dim(msg) { return `${C.dim}${msg}${C.reset}`; }

async function prompt(question, defaultVal) {
    const rl = createInterface({ input: stdin, output: stdout });
    const hint = defaultVal ? dim(` [${defaultVal}]`) : '';
    const answer = (await rl.question(`${question}${hint}: `)).trim();
    rl.close();
    return answer || defaultVal || '';
}

async function confirm(question, defaultYes = false) {
    const hint = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await prompt(`${question} ${hint}`);
    if (!answer) return defaultYes;
    return /^y(es)?$/i.test(answer);
}

function bail(msg, code = 1) {
    err(msg);
    exit(code);
}

// ============================================================
// Commands
// ============================================================

async function cmdInit(args) {
    log(bold(`\nfare-skill-pack v${VERSION} — init\n`));

    // 1. Target dir
    const cwd = process.cwd();
    const targetArg = args[0];
    const target = resolve(cwd, targetArg || await prompt('Target directory', cwd));

    if (!existsSync(target)) {
        bail(`Target không tồn tại: ${target}`);
    }
    const targetStat = await stat(target);
    if (!targetStat.isDirectory()) {
        bail(`Target không phải thư mục: ${target}`);
    }

    // 2. Check existing .agent/
    const dstAgent = join(target, '.agent');
    if (existsSync(dstAgent)) {
        warn(`${dstAgent} đã tồn tại.`);
        const yes = await confirm('Ghi đè (mất dữ liệu hiện có)?');
        if (!yes) {
            info('Hủy. Để cập nhật → dùng `npx fare-skill-pack update`.');
            return;
        }
        await rm(dstAgent, { recursive: true, force: true });
    }

    // 3. Copy template
    if (!existsSync(TEMPLATE_AGENT)) {
        bail(`Template không tồn tại trong package: ${TEMPLATE_AGENT}\n(Package có thể bị lỗi cài đặt. Thử cài lại.)`);
    }
    await cp(TEMPLATE_AGENT, dstAgent, { recursive: true });
    ok(`Đã copy bộ skill → ${dstAgent}`);

    log('');
    log(bold('Bước tiếp theo:'));
    log('  1. Đăng ký FARE MCP server (nếu chưa): ' + dim('npx fare-skill-pack register-mcp'));
    log('  2. Restart Claude Code hoặc gõ ' + dim('/mcp reconnect') + ' để load tool.');
    log('  3. Đọc hướng dẫn: ' + dim(`${dstAgent}/USAGE.md`));
}

async function cmdUpdate(args) {
    log(bold(`\nfare-skill-pack v${VERSION} — update\n`));

    const cwd = process.cwd();
    const target = resolve(cwd, args[0] || cwd);
    const dstAgent = join(target, '.agent');

    if (!existsSync(dstAgent)) {
        bail(`Không tìm thấy .agent/ ở ${target}\nDùng \`npx fare-skill-pack init\` để cài lần đầu.`);
    }
    if (!existsSync(TEMPLATE_AGENT)) {
        bail(`Template không tồn tại trong package: ${TEMPLATE_AGENT}`);
    }

    // Backup current
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backup = `${dstAgent}.bak.${ts}`;
    info(`Backup hiện tại → ${backup}`);
    await cp(dstAgent, backup, { recursive: true });

    // Confirm overwrite
    warn('Update sẽ GHI ĐÈ toàn bộ .agent/ với v' + VERSION + '.');
    log('Custom edits của bạn sẽ MẤT (đã backup ở trên).');
    const yes = await confirm('Tiếp tục?', false);
    if (!yes) {
        info('Hủy. Backup vẫn giữ ở ' + backup);
        return;
    }

    await rm(dstAgent, { recursive: true, force: true });
    await cp(TEMPLATE_AGENT, dstAgent, { recursive: true });
    ok(`Đã cập nhật → ${dstAgent}`);
    log('');
    info('Backup giữ ở: ' + backup + ' (xóa khi đã verify).');
    info('Nếu rule MCP đổi → cân nhắc /mcp reconnect.');
}

async function cmdUninstall(args) {
    log(bold(`\nfare-skill-pack v${VERSION} — uninstall\n`));

    const cwd = process.cwd();
    const target = resolve(cwd, args[0] || cwd);
    const dstAgent = join(target, '.agent');

    if (!existsSync(dstAgent)) {
        info(`Không có .agent/ ở ${target}. Không có gì để gỡ.`);
        return;
    }

    warn(`Sẽ xóa ${dstAgent}.`);
    const yes = await confirm('Xác nhận xóa?', false);
    if (!yes) {
        info('Hủy.');
        return;
    }

    await rm(dstAgent, { recursive: true, force: true });
    ok(`Đã xóa ${dstAgent}.`);
    log('');
    info('Để gỡ MCP server: ' + dim('claude mcp remove fare'));
}

async function cmdRegisterMcp() {
    log(bold(`\nfare-skill-pack v${VERSION} — register-mcp\n`));
    info('Tạo lệnh đăng ký FARE MCP server với Claude Code. Lệnh sẽ được IN, KHÔNG tự exec.');
    log('');
    const endpoint = await prompt('FARE MCP endpoint', 'http://localhost:3002/mcp');
    const apiKey = await prompt('FARE API key');
    const scope = await prompt('Scope (local|user|project)', 'user');
    const name = await prompt('Tên MCP server', 'fare');

    if (!apiKey) {
        warn('Không có API key. In lệnh template — bạn thay YOUR_KEY:');
    }
    log('');
    log(bold('Chạy lệnh:'));
    log('');
    log(`  ${C.cyan}claude mcp add --transport http --scope ${scope} ${name} ${endpoint} \\${C.reset}`);
    log(`  ${C.cyan}    --header "Authorization: Bearer ${apiKey || 'YOUR_KEY'}"${C.reset}`);
    log('');
}

function cmdHelp() {
    log(`
${bold('fare-skill-pack')} v${VERSION}
Antigravity / Claude Code skill pack for FARE.

${bold('Cách dùng:')}
  npx fare-skill-pack <command> [args]

${bold('Lệnh:')}
  ${C.cyan}init${C.reset} [target]       Cài .agent/ vào workspace (default: cwd) + in lệnh register MCP.
  ${C.cyan}update${C.reset} [target]     Cập nhật .agent/ lên version mới (backup tự động).
  ${C.cyan}uninstall${C.reset} [target]  Xóa .agent/ khỏi workspace (có confirm).
  ${C.cyan}register-mcp${C.reset}        Chỉ in lệnh đăng ký FARE MCP (cho ai đã có .agent/).
  ${C.cyan}help${C.reset}                Hiện help này.
  ${C.cyan}version${C.reset}             In version.

${bold('Ví dụ:')}
  ${dim('# Lần đầu cài cho workspace hiện tại')}
  npx fare-skill-pack init

  ${dim('# Cài cho workspace khác')}
  npx fare-skill-pack init ~/projects/my-app

  ${dim('# Cập nhật khi có version mới')}
  npx fare-skill-pack update

${bold('Yêu cầu:')}
  - Node >= 18
  - Claude Code CLI (\`claude\` command available)
  - FARE backend đang chạy (mặc định http://localhost:3002/mcp)
  - FARE API key (lấy từ FARE UI → Settings → API Keys)

${bold('Tài liệu:')}
  - README.md (root package)
  - .agent/USAGE.md (sau khi init — hướng dẫn dùng skill)
  - .agent/ARCHITECTURE.md (kiến trúc bộ skill)
`);
}

// ============================================================
// Main dispatch
// ============================================================

const [, , cmd, ...args] = argv;

try {
    switch (cmd) {
        case 'init':
            await cmdInit(args);
            break;
        case 'update':
            await cmdUpdate(args);
            break;
        case 'uninstall':
            await cmdUninstall(args);
            break;
        case 'register-mcp':
            await cmdRegisterMcp();
            break;
        case 'version':
        case '-v':
        case '--version':
            log(VERSION);
            break;
        case 'help':
        case '-h':
        case '--help':
        case undefined:
            cmdHelp();
            break;
        default:
            err(`Lệnh không hợp lệ: ${cmd}`);
            cmdHelp();
            exit(1);
    }
} catch (e) {
    err(`Lỗi: ${e.message}`);
    if (process.env.DEBUG) console.error(e);
    exit(1);
}
