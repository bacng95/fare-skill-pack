# fare-skill-pack

Skill pack cho Antigravity / Claude Code, thao tác với hệ quản trị quy trình phát triển phần mềm **FARE** qua MCP. Cung cấp sáu agent (BA, PM, QA, Dev, technical-writer, spec-reviewer), 22 skill và 16 workflow slash-command.

## Cài đặt

```bash
# Từ npm registry
npx fare-skill-pack init

# Hoặc từ GitHub
npx github:bacng95/fare-skill-pack init
```

CLI sao chép thư mục `.agent/` vào workspace, prompt MCP endpoint + API key, rồi in lệnh `claude mcp add` để chạy thủ công. Secret không được truyền vào subprocess.

## Yêu cầu

- Node 18 trở lên.
- Claude Code CLI (`npm i -g @anthropic-ai/claude-code`).
- FARE backend chạy ở endpoint có thể tiếp cận (mặc định `http://localhost:3002/mcp`).
- FARE API key (lấy từ FARE UI → Settings → API Keys).

## Quick start

Sau khi cài, restart Claude Code hoặc `/mcp reconnect` để load tool, sau đó:

```
/fare-ba FCORE Đăng nhập bằng mật khẩu
```

Agent khám phá ngữ cảnh, hỏi để làm rõ yêu cầu, đề xuất loại đặc tả và vị trí đẩy lên FARE, chờ xác nhận trước khi tạo. Xem `.agent/USAGE.md` cho hướng dẫn cú pháp tham số đầy đủ.

## CLI

```
fare-skill-pack <command> [target]
```

| Command | Mô tả |
|---|---|
| `init` | Sao chép `.agent/` vào target (mặc định `cwd`); in lệnh đăng ký MCP. |
| `update` | Backup `.agent/` hiện tại sang `.agent.bak.<timestamp>/`, ghi đè với version mới. |
| `uninstall` | Xóa `.agent/` (có confirm). |
| `register-mcp` | In lệnh `claude mcp add` (không sao chép file). |
| `help` | Hiển thị help. |
| `version` | In version. |

Cả `fare-skill` và `fare-skill-pack` đều khả dụng làm bin name.

## Agents và workflows

| Vai | Agent | Workflows |
|---|---|---|
| BA | `fare-business-analyst` | `/fare-ba`, `/fare-plan`, `/fare-trace`, `/fare-change` |
| PM | `fare-project-manager` | `/fare-pm`, `/fare-breakdown`, `/fare-groom`, `/fare-epic` |
| QA | `fare-qa-engineer` | `/fare-qa`, `/fare-test`, `/fare-verify` |
| Dev | `fare-developer` | `/fare-dev`, `/fare-impact`, `/fare-handoff` |
| Technical Writer | `fare-technical-writer` | `/fare-write-doc` |
| Spec Reviewer | `fare-spec-reviewer` | `/fare-audit-spec` |

Ba rule always-on: Content Fidelity, Confirmation Gate, MCP-only. Chi tiết trong `.agent/rules/`.

## Documentation

- `.agent/ARCHITECTURE.md` — danh mục agent / skill / workflow / rule.
- `.agent/USAGE.md` — hướng dẫn cú pháp slash-command và bảng định tuyến.
- `.agent/rules/fare-rules.md` — chín quy tắc bất khả xâm phạm khi gọi MCP.
- `.agent/rules/operating-mode.md` — hai chế độ vận hành (Substitute, Assistant).
- `CHANGELOG.md` — lịch sử phiên bản.

## Operating mode

Mặc định là **Substitute**: agent đảm nhận vai trò chuyên môn cho user. Khi workspace có chuyên gia BA/PM/QA/Dev thật, chuyển sang **Assistant**: agent trợ giúp soạn nháp, chuyên gia là người ra quyết định.

## Security

- CLI không exec lệnh `claude mcp add`. Token được in ra để user chạy thủ công.
- Agent chỉ thao tác với FARE qua MCP. Không đọc database, source code FARE backend, hoặc file ngoài workspace `.agent/` (rule §8).
- Các action không thể đảo ngược (xóa, ghi đè, đổi status, tạo BUG) cần xác nhận trực tiếp từ user (rule §2, §5).

## Contributing

Đóng góp qua pull request. Quy ước:
- Skill mới: thư mục `.agent/skills/<name>/SKILL.md` với frontmatter `name`, `description`.
- Workflow mới: file `.agent/workflows/<name>.md` với frontmatter tương tự.
- Cập nhật `ARCHITECTURE.md` và `USAGE.md` cho mỗi thay đổi.
- Thay đổi rule cần thảo luận trước qua issue.

## License

MIT. Xem `LICENSE`.
