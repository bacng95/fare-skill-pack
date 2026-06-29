#!/usr/bin/env node
// check-tools — LINTER hợp đồng tool MCP FARE.
//
// Đối chiếu MỌI tên-giống-tool xuất hiện trong tài liệu skill (.agent/) với
// danh sách tool MCP mà server FARE THẬT expose (CANONICAL bên dưới).
// Mục tiêu: biến "drift âm thầm rải rác nhiều file" thành 1 lỗi build.
//
//   node bin/check-tools.mjs          # fail (exit 1) nếu có tool lạ
//   node bin/check-tools.mjs --json   # in báo cáo JSON
//
// Quy ước: KHI server FARE đổi API → cập nhật DUY NHẤT 3 hằng số dưới đây
// (CANONICAL / DEPRECATED / REMOVED) cho khớp tool list mới, rồi chạy lại.

import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir, readFile } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENT = join(ROOT, '.agent');

// ── Hợp đồng: 40 tool server FARE thật expose (mcp__fare__*, bỏ prefix) ──────
const CANONICAL = new Set([
  'add_comment', 'add_plan_item', 'code_context', 'code_impact', 'code_query',
  'code_read_file', 'code_repos', 'code_route_map', 'create_document',
  'create_suggestion', 'create_tasks', 'create_test_cases', 'delete_document',
  'delete_plan_item', 'delete_task', 'edit_diagram', 'edit_document',
  'figma_export_images', 'figma_get_components', 'figma_get_file',
  'figma_get_styles', 'get_comments', 'list_documents', 'list_plan_items',
  'list_plans', 'list_projects', 'list_tasks', 'list_test_cases',
  'manage_folder', 'read_diagram', 'read_document', 'read_image', 'search_rag',
  'update_document', 'update_plan_item', 'update_task', 'update_test_case',
  'upsert_plan', 'upload_image',
]);

// Tồn tại nhưng KHÔNG nên dùng nữa → cảnh báo, không fail.
const DEPRECATED = {
  patch_document: 'edit_document (block ops y hệt, patch_document chỉ giữ tương thích ngược)',
};

// Tool ĐỜI CŨ đã bị server FARE gỡ bỏ → fail kèm gợi ý thay thế.
const REMOVED = {
  add_module: 'add_plan_item (type=theme|epic|story)',
  update_module: 'update_plan_item',
  list_modules: 'list_plan_items',
  delete_module: 'delete_plan_item',
  create_module: 'add_plan_item',
  create_epic: 'add_plan_item (type="epic", parent_id=<theme>)',
  update_epic: 'update_plan_item',
  query_epics: 'list_plan_items / list_tasks(plan_item_ids=[...])',
  get_plan: 'list_plans(id=<planId>)',
  get_test_case: 'list_test_cases(id=<tcId>)',
  get_document: 'read_document(documentId)',
  create_task: 'create_tasks (luôn batch — không có biến thể số ít)',
  create_test_case: 'create_test_cases (luôn batch — không có biến thể số ít)',
  search_documents: 'list_documents(query=...) hoặc search_rag(query=...)',
};

// Tiền tố động từ đặc trưng cho tên tool FARE → để bắt token "giống tool" mà
// không quét nhầm field/param (plan_item_id, meta_status, bug_origin, effort_est…
// đều KHÔNG bắt đầu bằng các động từ này).
const VERB = '(?:add|create|update|delete|list|get|read|edit|patch|search|upsert|query|manage|upload)';
const TOKEN_RE = new RegExp(`\\b${VERB}_[a-z][a-z0-9_]+`, 'g');

// Field / param / mảng-con (KHÔNG phải tool) khớp dạng động từ → bỏ qua để
// tránh dương tính giả. add_links/remove_test_case_ids là param của update_task…
const NON_TOOL = new Set([
  'add_links', 'remove_test_case_ids', 'update_at', 'create_at', 'list_view',
  'query_params',  // field của schema api_doc (create_document), không phải tool
]);

// Chỉ quét tài liệu FARE — bỏ qua skill office (docx/pdf/xlsx) vốn có tên hàm
// trùng dạng (add_page, read_excel, get_text…) không liên quan MCP FARE.
const SKIP_DIRS = new Set(['docx', 'pdf', 'xlsx']);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(join(dir, e.name));
    } else if (e.name.endsWith('.md')) {
      yield join(dir, e.name);
    }
  }
}

const errors = [];   // tool đã bị gỡ / không tồn tại
const warnings = []; // deprecated hoặc token lạ chưa rõ

for await (const file of walk(AGENT)) {
  const rel = relative(ROOT, file);
  const text = await readFile(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    // Directive: dòng có `lint:allow` được bỏ qua (dùng cho tài liệu CỐ Ý nêu
    // tên tool đã gỡ để cảnh báo "đừng dùng").
    if (line.includes('lint:allow')) return;
    const seen = new Set();
    for (const m of line.matchAll(TOKEN_RE)) {
      const name = m[0];
      if (seen.has(name)) continue;
      seen.add(name);
      const where = `${rel}:${i + 1}`;
      if (CANONICAL.has(name) || NON_TOOL.has(name)) continue;
      // Có phải GỌI tool không? `name(` = lệnh gọi (nghiêm trọng);
      // tên trần trong backtick/câu văn = chỉ NHẮC tên (nhẹ hơn).
      const called = new RegExp(`\\b${name}\\s*\\(`).test(line);
      if (name in REMOVED) {
        const rec = { where, name, hint: REMOVED[name], line: line.trim() };
        (called ? errors : warnings).push(rec);
      } else if (name in DEPRECATED) {
        const rec = { where, name, hint: DEPRECATED[name], line: line.trim() };
        (called ? errors : warnings).push(rec);
      } else {
        warnings.push({ where, name, hint: 'token giống tool nhưng KHÔNG có trong hợp đồng — kiểm tra lại', line: line.trim() });
      }
    }
  });
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ errors, warnings }, null, 2) + '\n');
} else {
  const C = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', reset: '\x1b[0m' };
  for (const e of errors) {
    process.stdout.write(`${C.red}✗ REMOVED${C.reset} ${e.where}  ${C.red}${e.name}${C.reset} → ${e.hint}\n${C.dim}   ${e.line}${C.reset}\n`);
  }
  for (const w of warnings) {
    const tag = w.name in DEPRECATED ? 'DEPRECATED' : 'UNKNOWN';
    process.stdout.write(`${C.yellow}⚠ ${tag}${C.reset} ${w.where}  ${C.yellow}${w.name}${C.reset} → ${w.hint}\n`);
  }
  const n = errors.length, m = warnings.length;
  if (n === 0) {
    process.stdout.write(`${C.green}✓${C.reset} Không có tool đã-gỡ-bỏ. ${m} cảnh báo.\n`);
  } else {
    process.stdout.write(`\n${C.red}✗ ${n} tham chiếu tool đã bị gỡ${C.reset} · ${m} cảnh báo. Sửa cho khớp hợp đồng MCP FARE.\n`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
