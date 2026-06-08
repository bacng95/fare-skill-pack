// build-claude — bo chuyen doi DUNG CHUNG: sinh .claude/ tu .agent/
//
// Nguon su that la .agent/ (quy uoc Antigravity / Gemini). Claude Code khong
// doc .agent/ — no kham pha tu .claude/. File nay anh xa:
//
//   .agent/skills/*       -> .claude/skills/*      (copy thang, frontmatter tuong thich)
//   .agent/agents/*.md    -> .claude/agents/*.md   (bo field `skills:` — Antigravity-only)
//   .agent/workflows/*.md -> .claude/commands/*.md (bo `name:`; Claude lay ten lenh tu ten file)
//
// $ARGUMENTS la convention CHUNG ca Antigravity lan Claude Code, nen no nam san
// trong source .agent/workflows/ — converter chi pass-through (co luoi an toan tu chen
// neu lo file nao thieu).
//
// Dung o 2 cho: `init` (nguoi dung cuoi) va `sync-claude` (tac gia test tai cho).
// Zero deps — chi Node stdlib.

import { cp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';

// Ba subdir do build-claude quan ly. KHONG dung toi .claude/settings*.json.
export const CLAUDE_SUBDIRS = ['skills', 'agents', 'commands'];

// ------------------------------------------------------------
// Frontmatter helper — tach `---\n<fm>\n---\n<body>`
// ------------------------------------------------------------

function splitFrontmatter(content) {
    const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { fm: null, body: content };
    return { fm: m[1], body: m[2] };
}

function buildDoc(fmLines, body) {
    return `---\n${fmLines.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`;
}

// ------------------------------------------------------------
// Agent: .agent/agents/*.md -> .claude/agents/*.md
// Claude Code subagent frontmatter: name, description, tools, model.
// KHONG hieu `skills:` (binding agent->skill kieu Antigravity) -> loai bo.
// ------------------------------------------------------------

function transformAgent(content) {
    const { fm, body } = splitFrontmatter(content);
    if (fm === null) return content;

    const out = [];
    let skipping = false;
    for (const line of fm.split('\n')) {
        if (/^skills\s*:/.test(line)) { skipping = true; continue; }
        if (skipping) {
            // Con la child indent hoac dong trong -> tiep tuc bo
            if (/^\s+\S/.test(line) || line.trim() === '') continue;
            skipping = false; // gap top-level key moi -> dung bo
        }
        out.push(line);
    }
    return buildDoc(out, body);
}

// ------------------------------------------------------------
// Workflow: .agent/workflows/*.md -> .claude/commands/*.md
// Claude Code lay ten lenh TU TEN FILE -> bo `name:`. Giu `description:`.
// $ARGUMENTS da co san trong source (dung chung 2 nen tang); chi tu chen neu thieu.
// ------------------------------------------------------------

function transformWorkflow(content) {
    const { fm, body } = splitFrontmatter(content);
    const fmLines = [];
    let argHint = '';

    if (fm !== null) {
        for (const line of fm.split('\n')) {
            if (/^name\s*:/.test(line)) continue; // Claude Code: ten lenh = ten file
            fmLines.push(line);
        }
    }

    // argument-hint best-effort: lay cac nhom [...] tu dong "Cu phap"
    const cuPhap = body.match(/C[uú] ph[aá]p:.*/);
    if (cuPhap) {
        const groups = cuPhap[0].match(/\[[^\]]+\]/g);
        if (groups) {
            argHint = groups.join(' ');
            fmLines.push(`argument-hint: "${argHint.replace(/"/g, '\\"')}"`);
        }
    }

    let newBody = body;
    if (!/\$ARGUMENTS/.test(body)) {
        newBody = `${body.replace(/\s+$/, '')}\n\n---\n**Đầu vào người dùng:** $ARGUMENTS\n`;
    }

    return fmLines.length ? buildDoc(fmLines, newBody) : newBody;
}

// ------------------------------------------------------------
// Build chinh
// ------------------------------------------------------------

async function mapDir(srcDir, dstDir, transform) {
    if (!existsSync(srcDir)) return 0;
    await rm(dstDir, { recursive: true, force: true });
    await mkdir(dstDir, { recursive: true });
    let n = 0;
    for (const entry of await readdir(srcDir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
        const content = await readFile(join(srcDir, entry.name), 'utf8');
        await writeFile(join(dstDir, entry.name), transform(content));
        n++;
    }
    return n;
}

/**
 * Sinh claudeDir tu agentDir. Chi dung toi 3 subdir (skills/agents/commands);
 * KHONG cham .claude/settings*.json.
 * @returns {Promise<{skills:number, agents:number, commands:number}>}
 */
export async function buildClaude({ agentDir, claudeDir }) {
    await mkdir(claudeDir, { recursive: true });

    // skills: copy thang (frontmatter name+description da dung chuan Claude Code)
    const skillsSrc = join(agentDir, 'skills');
    const skillsDst = join(claudeDir, 'skills');
    let skills = 0;
    if (existsSync(skillsSrc)) {
        await rm(skillsDst, { recursive: true, force: true });
        await cp(skillsSrc, skillsDst, { recursive: true });
        for (const e of await readdir(skillsSrc, { withFileTypes: true })) {
            if (e.isDirectory() && existsSync(join(skillsSrc, e.name, 'SKILL.md'))) skills++;
        }
    }

    const agents = await mapDir(
        join(agentDir, 'agents'), join(claudeDir, 'agents'), transformAgent,
    );
    const commands = await mapDir(
        join(agentDir, 'workflows'), join(claudeDir, 'commands'), transformWorkflow,
    );

    return { skills, agents, commands };
}

// Export rieng cho test/tai su dung
export { transformAgent, transformWorkflow, splitFrontmatter };
