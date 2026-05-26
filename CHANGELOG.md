# Changelog

All notable changes to **fare-skill-pack** will be documented in this file.

Format theo [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/); versioning theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

— *Chưa có thay đổi nào.*

---

## [1.0.1] — 2026-05-26

### Fixed
- `npx fare-skill-pack init` thất bại với `fare-skill: not found` vì bin name khác package name. Thêm bin alias `fare-skill-pack` (trùng tên package) bên cạnh `fare-skill` cũ. Cả hai lệnh đều khả dụng.

### Changed
- `init` không còn prompt MCP endpoint / API key / scope. Trách nhiệm đăng ký MCP tách sang `register-mcp` command riêng. `init` giờ chỉ sao chép `.agent/` vào target.

### Notes
- Trên v1.0.0, workaround cho bin alias: `npx -p fare-skill-pack fare-skill init`.
- Trên v1.0.1+, `npx fare-skill-pack init` chạy native.

---

## [1.0.0] — 2026-05-25

Initial release — bộ skill Antigravity / Claude Code đầu tiên vận hành FARE qua MCP. Phủ trọn vòng đời `requirements → design → dev → testing` với 4 vai chính + 2 vai phụ trợ.

### Added

**6 Agent**
- `fare-business-analyst` — phân tích yêu cầu, viết & tách spec, chia cây module, traceability, change request.
- `fare-project-manager` — chia function thành task, FP effort analysis, plan versioning, backlog grooming, epic management.
- `fare-qa-engineer` — viết test case từ AC (ISTQB), verify_history atomic, bug reporting theo §5.
- `fare-developer` — pickup task, impact analysis qua code intelligence, self-verify & handoff. KHÔNG tự code (rule §8).
- `fare-technical-writer` — viết tài liệu kỹ thuật (api_doc, erd, diagram, specification).
- `fare-spec-reviewer` — soát spec 6 lăng kính (Data Integrity, Unhappy Paths, Security, Usability, Testability, UI/UX vs Figma).

**22 Skill** — chia thành 4 nhóm:
- **Chung (2):** `fare-context-discovery`, `fare-mcp-integration`.
- **BA (6):** `fare-spec-authoring`, `fare-doc-split`, `fare-doc-normalize`, `fare-plan-breakdown`, `fare-traceability`, `fare-change-request`.
- **PM (5):** `fare-task-breakdown`, `fare-effort-estimation`, `fare-plan-versioning`, `fare-backlog-grooming`, `fare-epic-management`.
- **QA (3):** `fare-test-authoring`, `fare-test-execution`, `fare-bug-reporting`.
- **Dev (3):** `fare-task-pickup`, `fare-impact-analysis`, `fare-self-verify`.
- **Tiện ích (3):** `docx`, `pdf`, `xlsx` (đọc file đầu vào).

**16 Workflow** (slash-command)
- BA: `/fare-ba`, `/fare-plan`, `/fare-trace`, `/fare-change`.
- PM: `/fare-pm`, `/fare-breakdown`, `/fare-groom`, `/fare-epic`.
- QA: `/fare-qa`, `/fare-test`, `/fare-verify`.
- Dev: `/fare-dev`, `/fare-impact`, `/fare-handoff`.
- Khác: `/fare-write-doc`, `/fare-audit-spec`.

**3 Rule always-on**
- `fare-rules.md` — 9 quy tắc bất khả xâm phạm khi gọi MCP (Hierarchy Strictness, Confirmation Gate, Context First, Tool Optimization, Socratic Gate, Task Lifecycle 4-state, Content Fidelity, MCP-only, Brief Response).
- `operating-mode.md` — 2 chế độ vận hành (Substitute / Assistant).
- `GEMINI.md` — entry point thứ tự đọc đầu phiên.

**Đặc tính nổi bật**
- **Bottom-up `est_effort`** — ước task theo bản chất task (2 chiều: AI level × Dev level), KHÔNG chia từ function. Ceiling check 6-tier theo `sum / (function.effort_est × hours_per_day)`.
- **Epic dimension** — initiative cross-module gom task qua `epic_id`. Phân biệt rõ Epic ≠ Module ≠ Campaign ≠ Plan.
- **Confirmation Gate (§2)** — mọi action thay đổi dữ liệu trên FARE đều phải User chốt trước. Cấm gộp nhiều quyết định quan trọng vào 1 lệnh.
- **Bug discovery §5** — agent KHÔNG tự `create_tasks(type=BUG)`. Phải báo Markdown + hỏi User + chờ chốt.
- **Task lifecycle §6** — 4-state cứng `TODO → IN_PROGRESS → VERIFYING → DONE`. KHÔNG skip; DONE cần evidence verify.
- **Content Fidelity §7** — KHÔNG bịa, KHÔNG tự duyệt (`approved`/`archived`), KHÔNG tự publish plan version.
- **MCP-only §8** — agent chỉ thao tác qua MCP, không truy cập file ngoài workspace `.agent/`.

**CLI tool `fare-skill`** (zero deps, Node stdlib)
- `init [target]` — copy `.agent/` vào workspace + in lệnh `claude mcp add` (KHÔNG tự exec để giữ secret an toàn).
- `update [target]` — backup `.agent/` hiện tại + overwrite với version mới.
- `uninstall [target]` — confirm + xóa `.agent/`.
- `register-mcp` — chỉ in lệnh đăng ký MCP (cho workspace đã có `.agent/`).
- `help`, `version`.

**Yêu cầu FARE backend** (đi kèm với v1.0.0 của skill pack — cần FARE backend tương thích):
- Resource `fare://projects/{code}` trả thêm field `hours_per_day` (đọc qua `configurations` table, key `working_hours_config` global hoặc per-project `working_hours_config:project:{id}`, default 8).
- Resource mới `fare://modules/{id}/task-effort-summary` — sum est/actual, breakdown by type + meta_status, ratio_actual_est_done.
- Resource mới `fare://projects/{code}/velocity` — median(actual/est) cho task DONE qua 3 cửa sổ 30/60/90d, breakdown by type, dùng Postgres `PERCENTILE_CONT`.

### Installation

```bash
# Cách 1 — qua npm registry (sau khi publish)
npx fare-skill-pack init

# Cách 2 — install thẳng từ GitHub (không cần npm publish)
npx github:bacng95/fare-skill-pack init

# Pin theo tag
npx github:bacng95/fare-skill-pack#v1.0.0 init
```

### Notes

- Bộ skill thiết kế cho **dev đỡ vai** các chuyên gia (Substitute mode mặc định). Nếu workspace có BA/PM/QA/Dev thật → chế độ Assistant.
- Không phụ thuộc external npm package nào ngoài Node stdlib.
- Tương thích Antigravity và Claude Code.

[Unreleased]: https://github.com/bacng95/fare-skill-pack/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.0.1
[1.0.0]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.0.0
