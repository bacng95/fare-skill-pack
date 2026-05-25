# fare_skill — Kiến trúc bộ skill

> Bộ skill Antigravity vận hành **FARE** (hệ quản lý quy trình phát triển phần mềm) qua MCP — đầy đủ 4 vai chính: **BA · PM · QA · Dev** + 2 vai phụ trợ (technical-writer, spec-reviewer).
>
> 👉 **Người mới?** Đọc `USAGE.md` trước — chỉ cách gọi workflow / mô tả việc bằng lời, không cần thuộc tên skill.

## Tổng quan
- **6 Agent** — vai chuyên trách (persona + SOP)
- **22 Skill** — 19 năng lực FARE + 3 tiện ích đọc file
- **16 Workflow** — slash-command mỏng
- **3 Rule** — always-on, mọi agent tuân thủ

## Cấu trúc thư mục
```plaintext
.agent/
├── ARCHITECTURE.md     # File này — danh bạ điều hướng
├── USAGE.md            # Hướng dẫn cho người mới
├── agents/             # 6 agent
├── skills/             # 22 skill (mỗi skill 1 thư mục có SKILL.md)
├── workflows/          # 16 slash-command
└── rules/              # 3 rule always-on
```

## Chế độ vận hành
> Mặc định **Substitute** — agent đỡ vai (BA / PM / QA / Dev) cho dev đơn lẻ. Đổi sang **Assistant** khi workspace có chuyên gia thật. Chi tiết: `rules/operating-mode.md`.

## Agents (6)

| Agent | Vai trò | Skills dùng |
|---|---|---|
| `fare-business-analyst` | Phân tích yêu cầu; viết & tách đặc tả; chia cây module; truy vết phủ; xử lý change request | context-discovery, mcp-integration, spec-authoring, doc-split, doc-normalize, traceability, plan-breakdown, change-request |
| `fare-project-manager` | Chia function thành task; ước effort (FP); tạo & cập nhật month plan; grooming backlog; triage bug | context-discovery, mcp-integration, task-breakdown, effort-estimation, plan-versioning, backlog-grooming |
| `fare-qa-engineer` | Viết test case từ AC; chạy verify atomic; báo bug reproducible (qua §5) | context-discovery, mcp-integration, test-authoring, test-execution, bug-reporting |
| `fare-developer` | Pickup task; impact analysis qua code intelligence; self-verify & handoff với evidence. KHÔNG tự code (§8) | context-discovery, mcp-integration, task-pickup, impact-analysis, self-verify |
| `fare-technical-writer` | Viết tài liệu kỹ thuật (api_doc, erd, diagram, specification) | context-discovery, mcp-integration |
| `fare-spec-reviewer` | Soát spec đã có — 6 lăng kính (gồm UI/UX vs Figma) | context-discovery, mcp-integration |

## Skills (21)

**Năng lực FARE — chung**
| Skill | Việc |
|---|---|
| `fare-context-discovery` | Khám phá ngữ cảnh đủ sâu trước khi phân tích / lập kế hoạch |
| `fare-mcp-integration` | Dùng MCP FARE đúng & an toàn — bẫy + pattern |

**Vai BA**
| Skill | Việc |
|---|---|
| `fare-spec-authoring` | Viết MỚI đặc tả — use_case · user_story · richtext (BRD/SRS/PRD/requirement/analysis/meeting-notes) · glossary |
| `fare-doc-split` | Tách tài liệu nguyên khối thành nhiều doc (trung thực) |
| `fare-doc-normalize` | Làm sạch form bản nháp local trước khi đẩy FARE |
| `fare-plan-breakdown` | Chia cây Module → Submodule → Function 3 cấp (BA-light) |
| `fare-traceability` | Ma trận requirement ↔ UC ↔ US ↔ test ↔ task ↔ module + phát hiện gap |
| `fare-change-request` | Xử lý yêu cầu thay đổi spec đã có (impact + diff + log) |

**Vai PM**
| Skill | Việc |
|---|---|
| `fare-task-breakdown` | Chia 1 function (đã có spec) thành n task BE/FE/DB/test/infra; batch create |
| `fare-effort-estimation` | Function Point analysis: complexity (1-5) × scope (6-10) × clarity (11-15) → effort matrix |
| `fare-plan-versioning` | Master vs month plan; DRAFT vs PUBLIC; tạo / cập nhật month plan an toàn |
| `fare-backlog-grooming` | Quét task lệch trạng thái, bug triage, epic at_risk/quá hạn, đề xuất sửa + handoff |
| `fare-epic-management` | CRUD Epic (initiative cross-module): tạo, đổi status, bulk assign tasks, close 100% DONE |

**Vai QA**
| Skill | Việc |
|---|---|
| `fare-test-authoring` | Map AC → n TC theo kỹ thuật ISTQB; batch `create_test_cases` |
| `fare-test-execution` | Chạy verify atomic (`update_test_case(verify={...})`); đối chiếu task TEST của PM |
| `fare-bug-reporting` | Format BUG reproducible (severity ↔ priority); §5 xác nhận User trước create |

**Vai Dev**
| Skill | Việc |
|---|---|
| `fare-task-pickup` | Chọn task hợp lý + load spec + IN_PROGRESS với comment scope |
| `fare-impact-analysis` | Blast radius qua `code_query/context/impact/route_map`; HIGH/CRITICAL chờ User chốt phương án |
| `fare-self-verify` | DoD checklist + evidence (commit, file đụng, TC chạy tay) + VERIFYING |

**Tiện ích đọc file đầu vào**
| Skill | Việc |
|---|---|
| `docx` · `pdf` · `xlsx` | Đọc file Word / PDF / Excel người dùng cung cấp |

## Workflows (15)

| Command | Việc | Agent | Skill chính |
|---|---|---|---|
| `/fare-ba` | Phân tích yêu cầu / viết spec / tách tài liệu | `fare-business-analyst` | `fare-spec-authoring` hoặc `fare-doc-split` |
| `/fare-plan` | Chia cây module 3 cấp (BA-light) | `fare-business-analyst` | `fare-plan-breakdown` |
| `/fare-trace` | Ma trận truy vết & phát hiện gap | `fare-business-analyst` | `fare-traceability` |
| `/fare-change` | Yêu cầu thay đổi spec đã có | `fare-business-analyst` | `fare-change-request` |
| `/fare-write-doc` | Viết tài liệu kỹ thuật | `fare-technical-writer` | — |
| `/fare-audit-spec` | Soát / kiểm toán spec (6 lăng kính) | `fare-spec-reviewer` | — |
| `/fare-pm` | Entry vai PM — route theo việc | `fare-project-manager` | (tự chọn) |
| `/fare-breakdown` | Chia function → tasks (BE/FE/DB/test/infra) | `fare-project-manager` | `fare-task-breakdown` |
| `/fare-groom` | Grooming backlog + bug triage + epic risk scan | `fare-project-manager` | `fare-backlog-grooming` |
| `/fare-epic` | CRUD Epic / initiative cross-module | `fare-project-manager` | `fare-epic-management` |
| `/fare-qa` | Entry vai QA — route theo việc | `fare-qa-engineer` | (tự chọn) |
| `/fare-test` | Viết TC từ AC (ISTQB) | `fare-qa-engineer` | `fare-test-authoring` |
| `/fare-verify` | Chạy verify round TC, đề xuất chuyển task TEST | `fare-qa-engineer` | `fare-test-execution` (+ `bug-reporting` khi fail) |
| `/fare-dev` | Entry vai Dev — route theo việc (default = pickup) | `fare-developer` | (tự chọn) |
| `/fare-impact` | Blast radius trước khi sửa symbol | `fare-developer` | `fare-impact-analysis` |
| `/fare-handoff` | Self-verify + set VERIFYING + bàn QA | `fare-developer` | `fare-self-verify` |

## Rules (always-on)
| Rule | Nội dung |
|---|---|
| `GEMINI.md` | Entry point — thứ tự đọc đầu phiên |
| `fare-rules.md` | Quy tắc bất khả xâm phạm khi gọi MCP (§1–9) |
| `operating-mode.md` | 2 chế độ Substitute / Assistant |

## Luồng tài liệu
```
File đầu vào (docs/inputs/)
   → fare-doc-split      → nháp docs/outputs/   (trung thực, form thô)
   → fare-doc-normalize  → nháp sạch            (User chủ động gọi)
   → User duyệt
   → đẩy FARE qua MCP (create_document...)
```

## Vòng đời đầy đủ trên FARE (BA → PM → Dev + QA song song)

```
   BA: /fare-plan       → có cây Module/Submodule/Function (chỗ để gắn spec)
         ↓
   BA: /fare-ba         → viết spec (use_case / user_story / richtext / glossary)
         ↓
   /fare-audit-spec     → soát blind spot (6 lăng kính, gồm Figma)
         ↓
   BA: /fare-trace      → kiểm phủ spec; bàn giao gap (UC/US thiếu? task thiếu? TC thiếu?)
         ↓
   PM: /fare-breakdown  → chia function thành task implementable (BE/FE/DB + task type=TEST)
         ↓                  (FP analysis nếu cần — fare-effort-estimation)
   PM: /fare-pm (plan-versioning)  → đẩy task vào month plan / sprint
         ↓
   ┌───────────────────────────────┬──────────────────────────────────┐
   ↓                                ↓                                  ↓
   Dev: /fare-dev → pickup          QA: /fare-test                    QA: /fare-verify (sau Dev xong)
       /fare-impact → blast radius  viết TC từ AC, gắn task TEST      chạy verify_history atomic
       (User code trong IDE)                                          → passed / failed / blocked
       /fare-handoff → VERIFYING                                      → fail → /fare-qa → §5 → BUG task
                       (commit, file đụng,                            → all passed → đề xuất task TEST DONE
                        TC chạy tay)
         ↓
   PM: /fare-groom      → grooming định kỳ (cuối ngày / cuối sprint)
                         (lệch trạng thái, bug triage, đóng task DONE)
         ↓
   BA: /fare-change     → khi khách / stakeholder đổi yêu cầu giữa chừng
                         → impact lan tỏa xuống PM (re-breakdown) + QA (regression test) + Dev (re-impact)
```

## Định tuyến nhanh
| User muốn… | Dùng |
|---|---|
| Phân tích yêu cầu mới → Use Case / User Story | `/fare-ba` |
| Viết BRD / SRS / PRD / requirement dạng văn | `/fare-ba` |
| Thêm / sửa term trong glossary | `/fare-ba` |
| Tách tài liệu nguyên khối | `/fare-ba` + skill `fare-doc-split` |
| Làm sạch form bản nháp local | skill `fare-doc-normalize` |
| Chia / hoàn thiện cây module 3 cấp | `/fare-plan` |
| Kiểm "yêu cầu này đã có test/task phủ chưa" | `/fare-trace` |
| Khách đổi yêu cầu, cần sửa spec đã có | `/fare-change` |
| Viết API doc / ERD / diagram | `/fare-write-doc` |
| Soát spec đã có (gồm đối chiếu Figma) | `/fare-audit-spec` |
| Chia function (đã có spec) thành task | `/fare-breakdown` |
| Tạo sprint mới / month plan mới | `/fare-pm` |
| Ước effort cho module/function | `/fare-pm` (sẽ chạy `fare-effort-estimation`) |
| Grooming backlog / triage bug / epic risk scan | `/fare-groom` |
| Tạo / quản Epic (initiative cross-module) | `/fare-epic` |
| Status snapshot project | `/fare-pm` (default) |
| Viết test case cho 1 spec / function | `/fare-test` |
| Chạy verify 1 round TC, ghi pass/fail | `/fare-verify` |
| Báo bug khi test fail | `/fare-verify` (inline) hoặc `/fare-qa` |
| Pickup task tiếp theo / hỏi "tôi nên làm gì" | `/fare-dev` |
| Impact analysis 1 symbol trước khi sửa | `/fare-impact` |
| Code xong, handoff sang QA | `/fare-handoff` |

## Đã đầy đủ 4 vai chính

Bộ skill nay phủ trọn vòng đời FARE: **req → design → dev → testing**. Các vai phụ trợ (`technical-writer`, `spec-reviewer`) hỗ trợ ngang lúc cần.

Phần *không thuộc agent* (User tự thao tác trên FARE UI):
- Tạo project mới.
- Publish DRAFT plan version → PUBLIC.
- Approve spec (status `approved` / `archived`).
- Tạo / quản campaign QA.

Đây là quyết định người thật — rule §7 cấm agent tự duyệt.
