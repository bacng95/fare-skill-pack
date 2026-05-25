# fare-skill-pack

Antigravity / Claude Code skill pack cho **FARE** — bộ 6 agent + 22 skill + 16 workflow giúp dev đỡ vai BA · PM · QA · Dev khi vận hành FARE qua MCP.

> FARE = hệ quản lý quy trình phát triển phần mềm. Bộ skill này thao tác với FARE thông qua MCP tool — KHÔNG truy cập database / source code FARE trực tiếp.

---

## Cài đặt 1 phút

```bash
# Cách 1 — qua npm registry (nhanh, ngắn gọn)
npx fare-skill-pack init

# Cách 2 — install thẳng từ GitHub (không cần npm publish, dùng được cho version chưa release)
npx github:bacng95/fare-skill-pack init
```

CLI sẽ:
1. Copy `.agent/` vào workspace của bạn.
2. Hỏi FARE MCP endpoint + API key + scope.
3. In sẵn lệnh `claude mcp add ...` để bạn copy-paste (KHÔNG tự chạy — an toàn cho secret).
4. In bước tiếp theo (restart Claude Code → `/mcp reconnect` → thử workflow).

---

## Bạn nhận được gì

| Vai | Agent | Workflow chính |
|---|---|---|
| **BA** Business Analyst | `fare-business-analyst` | `/fare-ba`, `/fare-plan`, `/fare-trace`, `/fare-change` |
| **PM** Project Manager | `fare-project-manager` | `/fare-pm`, `/fare-breakdown`, `/fare-groom`, `/fare-epic` |
| **QA** Engineer | `fare-qa-engineer` | `/fare-qa`, `/fare-test`, `/fare-verify` |
| **Dev** Developer | `fare-developer` | `/fare-dev`, `/fare-impact`, `/fare-handoff` |
| **Technical Writer** | `fare-technical-writer` | `/fare-write-doc` |
| **Spec Reviewer** | `fare-spec-reviewer` | `/fare-audit-spec` |

Phủ trọn vòng đời: yêu cầu → thiết kế → code → test → grooming, với 3 rule always-on (Content Fidelity, Confirmation Gate, MCP-only).

Đọc chi tiết sau khi cài: `.agent/USAGE.md` (cách dùng) · `.agent/ARCHITECTURE.md` (kiến trúc).

---

## Yêu cầu

| Cái gì | Tối thiểu | Lấy ở đâu |
|---|---|---|
| Node | ≥ 18 | https://nodejs.org |
| Claude Code CLI | latest | `npm i -g @anthropic-ai/claude-code` |
| FARE backend đang chạy | endpoint MCP có thể tiếp cận | mặc định `http://localhost:3002/mcp` |
| FARE API key | Bearer token | FARE UI → Settings → API Keys |

> Bộ skill này thiết kế cho **dev đỡ vai** các chuyên gia chưa có trong team (chế độ Substitute). Nếu workspace có BA/PM/QA thật, agent chuyển sang chế độ Assistant (trợ lý) — xem `.agent/rules/operating-mode.md`.

---

## CLI

```bash
npx fare-skill-pack init [target]         # Cài lần đầu
npx fare-skill-pack update [target]       # Cập nhật version mới (backup tự động)
npx fare-skill-pack uninstall [target]    # Gỡ
npx fare-skill-pack register-mcp          # Chỉ in lệnh register MCP
npx fare-skill-pack help                  # Trợ giúp
npx fare-skill-pack version               # Phiên bản
```

`target` mặc định là thư mục hiện tại (`cwd`). Pass đường dẫn khác nếu cần cài cho workspace khác.

---

## Sau khi cài — quick start

1. **Restart Claude Code** hoặc gõ `/mcp reconnect` để load FARE MCP tools.
2. Mở project FARE, ghi nhớ **mã project** (vd `FCORE`, `LMS`).
3. Thử workflow đầu tiên:
   ```
   /fare-ba FCORE Đăng nhập bằng mật khẩu
   ```
   Agent sẽ khám phá ngữ cảnh → hỏi 2 câu để làm rõ → đề xuất loại đặc tả + vị trí đẩy → CHỜ bạn chốt → tạo trên FARE.

Đọc `.agent/USAGE.md` để hiểu cú pháp tham số, 3 cách dùng (slash command / lời thường / ép agent), và bảng định tuyến đầy đủ.

---

## Bảo mật

- CLI **không tự exec** lệnh `claude mcp add` — chỉ in để bạn copy-paste. API key KHÔNG bị log vào process tree / npm cache.
- Bộ skill **không truy cập file ngoài workspace `.agent/`** (rule §8 trong `.agent/rules/fare-rules.md`).
- Agent **không tự** publish version, set `approved` doc, hay tạo BUG task — đó là quyết định của con người (rule §7, §5).

---

## Cập nhật

```bash
npx fare-skill-pack update
```

Sẽ backup `.agent/` hiện tại thành `.agent.bak.YYYY-MM-DDTHH-MM-SS/` rồi overwrite với template mới. Nếu bạn đã edit `.agent/` riêng, diff với backup sau update.

---

## Đóng góp

PR welcome. Quy ước:
- Skill mới → thư mục `.agent/skills/{name}/SKILL.md` với frontmatter chuẩn (`name`, `description`).
- Workflow mới → file `.agent/workflows/{name}.md` với frontmatter (`name`, `description`).
- Cập nhật `.agent/ARCHITECTURE.md` + `.agent/USAGE.md` cho mỗi thay đổi.
- Rule mới phải qua thảo luận trước khi merge.

---

## License

MIT — xem `LICENSE`.
