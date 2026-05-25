---
name: fare-impact-analysis
description: TRƯỚC khi sửa 1 symbol (function/class/method), quét blast radius qua FARE code intelligence — `code_query` (tìm theo concept), `code_context` (360° symbol), `code_impact` (upstream/downstream), `code_route_map` (luồng API). Phân loại rủi ro d=1/2/3; HIGH/CRITICAL → báo User & chờ chốt trước khi sửa. Chỉ dành cho project đã có code index trên FARE.
---

# fare-impact-analysis — Phân tích blast radius trước khi sửa code

Dùng khi: dev sắp sửa / rename / xóa 1 symbol (function, class, method) trong project, cần biết "đụng đến cái này thì gãy cái gì".

KHÔNG thuộc skill này: tự sửa code (Dev USER tự làm trong IDE); chia task (PM); viết TC mới (QA).

## Tiền đề
- **Project đã có code index trên FARE.** Nếu chưa có (`code_query` trả rỗng cho mọi query) → DỪNG, báo User. Skill này yêu cầu code intelligence tools hoạt động.
- Đã có task `IN_PROGRESS` (từ `fare-task-pickup`) với phạm vi rõ — biết symbol nào sắp đụng.
- Tuân `rules/fare-rules.md`: §2 (HIGH/CRITICAL → chờ User chốt trước khi User sửa), §3 (đọc trước khi làm — quét impact là bắt buộc).

## ⚠️ Rule cứng: KHÔNG sửa khi chưa quét impact

Dev không được sửa symbol mà chưa biết blast radius. Skill này là **gate bắt buộc** trước khi User mở IDE chỉnh.

## 4 tool & vai trò

| Tool | Khi nào | Trả về |
|---|---|---|
| `code_query(project_id, query, limit?)` | Tìm code "xử lý X ở đâu" — query bằng concept tiếng Anh hoặc gần với identifier | Danh sách execution flow / process liên quan |
| `code_context(project_id, symbol, file?)` | 360° một symbol đã biết tên — callers / callees / execution flows tham gia | View chi tiết về vai trò symbol |
| `code_impact(project_id, target, direction?)` | Blast radius — upstream (ai phụ thuộc nó) hay downstream (nó phụ thuộc gì) | Cây dependency với depth d=1/2/3 |
| `code_route_map(project_id)` | Map API routes → handler file | Bảng route ↔ handler |

**Quy tắc tra tên:** `code_query` dùng tiếng Anh / identifier; ngoài FARE-MCP, search nội dung doc dùng `search_rag`. KHÔNG nhầm.

## Quy trình

### Bước 1 — Xác định symbol mục tiêu
Lấy từ phạm vi task (Bước 5 của `fare-task-pickup`). Liệt kê:
- Symbol chính sắp đổi (vd `validateUser`, `EmployeeService.create`).
- Loại thay đổi: **add field** / **rename** / **change signature** / **change behavior** / **delete**.

Loại thay đổi quyết định hướng quét:
- Thêm field optional → ít rủi ro (chỉ check downstream để biết callers nào nên dùng).
- Rename / change signature / delete → cao rủi ro (upstream BẮT BUỘC).
- Change behavior (cùng signature) → upstream + tests downstream.

### Bước 2 — `code_context` xem 360°
`code_context(project_id, symbol, file?)`:
- Có nhiều caller không? Tham gia bao nhiêu execution flow?
- Có symbol trùng tên ở file khác? → cần `file` để phân biệt.

Ghi nhận: symbol nằm trong process / luồng nghiệp vụ nào.

### Bước 3 — `code_impact` blast radius

```
code_impact(project_id, target=<symbol>, direction="upstream")
```

Phân loại depth (xem rule `CLAUDE.md` của project):

| Depth | Nghĩa | Hành động |
|---|---|---|
| **d=1** | **WILL BREAK** — caller/importer trực tiếp | **PHẢI cập nhật** tất cả; nếu là rename → search & replace có chủ đích |
| **d=2** | **LIKELY AFFECTED** — phụ thuộc gián tiếp | **Cần test** sau khi sửa |
| **d=3** | **MAY NEED TESTING** — phụ thuộc transitive | Test nếu thuộc critical path |

### Bước 4 — Đánh giá rủi ro tổng

| Mức | Tiêu chí | Hành động |
|---|---|---|
| 🟥 **CRITICAL** | d=1 ≥ 10 caller, HOẶC symbol nằm trên route public, HOẶC dùng trong execution flow xử lý payment / auth / data write | **DỪNG. Báo User chi tiết. Chờ User chốt** có sửa hay refactor approach khác (vd thêm method mới giữ method cũ). |
| 🟧 **HIGH** | d=1 từ 3–9 caller, HOẶC dùng trong ≥2 execution flow | Báo User. Đề xuất chiến lược (rename qua deprecation, thêm overload, viết migration). Chờ User OK. |
| 🟨 **MEDIUM** | d=1 từ 1–2 caller, không trong critical flow | Liệt kê caller. User tự quyết. |
| 🟩 **LOW** | d=1 = 0 (private / chỉ self-test) | Sửa tự do, vẫn note vào comment task. |

### Bước 5 — Báo cáo Markdown

```
## Impact analysis — symbol: `validateUser` (file: src/auth/validator.ts)
Loại thay đổi: change signature (thêm tham số `roles`)

### Context (code_context)
Function gọi bởi 4 nơi, tham gia 2 execution flow: "user-login", "admin-create-user".

### Blast radius (upstream, d=1)
| Depth | File | Symbol | Loại |
|---|---|---|---|
| d=1 | src/auth/login.controller.ts | LoginController.handle | caller trực tiếp |
| d=1 | src/auth/sso.controller.ts | SsoController.callback | caller trực tiếp |
| d=1 | src/admin/user.service.ts | UserService.create | caller trực tiếp |
| d=2 | src/admin/user.controller.ts | UserController.create | transitive |

### Mức rủi ro: 🟧 HIGH
Lý do: signature đổi → 3 caller d=1 phải sửa; 1 trên route `/api/login` public.

### Đề xuất chiến lược
1. **Backward-compatible:** thêm overload `validateUser(payload, roles?)` — `roles` default `[]`, caller cũ không break. (Khuyến nghị)
2. **Force migration:** đổi signature cứng, sửa luôn 3 caller d=1 + chạy test full. Chấp nhận rủi ro.
3. **Refactor:** rename `validateUser` → `validateUserBasic` (giữ), tạo mới `validateUserWithRoles`. Caller nâng cấp dần.

**Đợi User chốt phương án TRƯỚC khi mở IDE.**

### Test nào phải chạy sau khi sửa (depth coverage)
- d=1 → unit test của LoginController, SsoController, UserService (3 file).
- d=2 → integration test UserController.
- Cộng: TC liên quan trong task (TC-101..103).
```

### Bước 6 — Cập nhật task

`add_comment(taskId, comment=<impact report tóm tắt>)` — để mọi người (cả PM/QA) thấy mức rủi ro & phương án dev chọn:
```
[Impact] validateUser — HIGH (3 d=1 callers, 2 flows).
Phương án chốt: (1) backward-compatible overload — không break caller cũ.
Sau sửa: chạy unit của login/sso/user-service + integration UserController + TC-101..103.
```

## Kết hợp với BA / PM / QA

| Phát hiện trong impact | Bàn giao |
|---|---|
| Symbol đụng đến nhiều flow nghiệp vụ → spec có thể đa nghĩa | BA `/fare-audit-spec` soát lại |
| d=1 rộng → effort thực tế > est_effort của task | PM `/fare-groom` cập nhật effort, có thể chia task |
| Cần test diện rộng (regression) | QA `/fare-test` viết thêm TC regression cho d=1/d=2 |

## Khi `code_*` tools không có dữ liệu

- `code_query` trả rỗng cho query rõ ràng → project chưa index code, HOẶC index outdated. **DỪNG**, báo User: "Code index chưa có / cũ, không thể impact analysis. User cần re-index trên FARE UI trước."
- `code_context` báo "symbol không tìm thấy" → kiểm tra `file` param, hoặc symbol đặt khác (vd alias).
- `code_route_map` rỗng → project không phải web service, bỏ qua bước này.

KHÔNG bịa impact khi tool không trả dữ liệu — vi phạm §7.

## Anti-patterns

- ❌ Dev mở IDE sửa code KHÔNG quét impact trước — rule cứng cấm.
- ❌ HIGH/CRITICAL mà tự đề xuất phương án rồi sửa luôn — phải chờ User chốt phương án (§2).
- ❌ Bỏ qua `code_route_map` khi sửa BE — không biết symbol có nằm trên route public hay không.
- ❌ Phán "không ảnh hưởng gì" mà chỉ chạy `code_context` (không `code_impact`) — chưa biết upstream đầy đủ.
- ❌ Sửa rồi mới quét impact để "thuyết minh" — sai trình tự, không phòng được lỗi.
- ❌ Quét impact rồi không `add_comment` lên task — mất truy nguồn quyết định.

## Tự kiểm

- [ ] Project có code index hoạt động (đã verify trước khi chạy skill).
- [ ] Symbol mục tiêu + loại thay đổi đã rõ.
- [ ] Đã chạy đủ `code_context` + `code_impact(upstream)` (+ `code_route_map` nếu BE).
- [ ] Mức rủi ro phân loại đúng (CRITICAL/HIGH/MEDIUM/LOW) theo tiêu chí.
- [ ] HIGH/CRITICAL → đã đề xuất ≥2 phương án + chờ User chốt TRƯỚC khi User mở IDE (§2).
- [ ] Báo cáo có liệt kê depth coverage cho test sau sửa.
- [ ] `add_comment` lên task đã ghi tóm tắt impact + phương án chốt.
- [ ] KHÔNG bịa impact khi tool trả rỗng.
