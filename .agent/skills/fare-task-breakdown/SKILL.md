---
name: fare-task-breakdown
description: Chia 1 Function (đã có spec) thành n task implementable cho dev pickup. Dùng khi PM nhận một function có spec đầy đủ (UC/US/SRS gắn `module_id`) và cần tạo task BE/FE/DB/test/infra sẵn sàng cho dev. KHÔNG tự code, KHÔNG tự verify.
---

# fare-task-breakdown — Chia function thành task

Dùng khi: 1 Function đã có spec đầy đủ trên FARE, cần đẩy task lên backlog để dev pickup.

KHÔNG thuộc skill này: viết spec (→ BA `fare-spec-authoring`); chia cây module (→ BA `fare-plan-breakdown`); ước effort cấp module/function (→ `fare-effort-estimation`); pickup & code (→ Dev `fare-task-pickup`); chạy verify TC (→ QA `fare-test-execution`).

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`).
- Function mục tiêu **PHẢI có spec gắn `module_id` của nó** (UC / US / SRS / api_doc / erd / wireframe Figma). Spec chưa có → DỪNG, bàn giao BA chạy `/fare-ba` trước. KHÔNG break task khi spec trống — vi phạm §7 (sẽ phải bịa task content).
- Tuân `rules/fare-rules.md`: §1 (mọi task có `module_id`), §4 (batching `create_tasks`, ngôn ngữ VN, đính URI doc), §2 Confirmation Gate.

## Bước 0 — Chốt với User & quét spec hiện có

Hỏi & CHỜ:
- **Function mục tiêu:** ID (lấy từ `list_modules`).
- **Chiến lược chia:** mặc định *theo layer* (BE/FE/DB/test/infra); chọn *theo feature slice* (vertical) hoặc *theo dependency* nếu function lớn / cần ship sớm 1 phần. Hỏi User.
- **Sprint / plan đích:** task gắn vào month plan nào? (xem `fare-plan-versioning`). Nếu chưa có month plan đang mở → task vẫn tạo (gắn `module_id`) nhưng KHÔNG có `plan_month_id` — báo User.
- **Epic / initiative:** task có thuộc 1 epic đang chạy không? Quét `query_epics(projectCode, status="live")` (trả các epic `planned + in_progress + at_risk`), trình danh sách rút gọn (id, name, owner, due) + hỏi User chọn 1 epic hoặc bỏ qua. Function thuộc 1 initiative cross-module (vd "Mobile Redesign v2") → nên gắn epic; bug hotfix / refactor lẻ → bỏ qua. Xem `fare-mcp-integration` để phân biệt Epic ≠ Module. KHÔNG tự tạo epic mới ở đây (đó là `fare-epic-management`).

Quét spec đã có cho function:
- `list_documents(projectCode, module_id=<function id>)` → liệt kê UC/US/SRS/api_doc/erd/diagram/test_case-as-doc.
- `read_document(id)` từng cái — KHÔNG bỏ. Ghi nhận: actor, flow, AC, schema DB, endpoint, wireframe.
- Spec mỏng (không có AC / không có flow chi tiết) → DỪNG, bàn giao BA `/fare-ba` bổ sung. KHÔNG break task trên spec mơ hồ.

## Bước 1 — Lập danh sách task (NHÁP, chưa tạo)

Theo chiến lược User chốt — 5 layer phổ biến cho 1 function CRUD/feature:

| Layer | Thường gồm | `type` |
|---|---|---|
| **DB / Migration** | tạo bảng, thêm cột, index, seed dữ liệu | `TASK` |
| **BE (API + service)** | endpoint, validation, business rule, integration ngoài | `TASK` |
| **FE (UI + state)** | màn hình, form, list, state management, gọi API | `TASK` |
| **Test** | test case + tự động hoá (unit/integration/e2e) tham chiếu AC của US | `TEST` |
| **Infra / vận hành** (nếu cần) | env vars, secrets, deploy config, dashboard / alert | `TASK` |

Không phải mọi function đều cần đủ 5 layer. Cắt theo phạm vi thực tế của function.

**Quy chuẩn title task** (rule §4):
- Tiếng Việt, dạng **động từ + tân ngữ** ngắn gọn, ≤ 70 ký tự.
- Có prefix layer khi cùng function có nhiều task: `"[BE] Thêm endpoint POST /employees"`, `"[FE] Màn hình danh sách nhân viên"`. Prefix giúp scan backlog.
- KHÔNG dùng "Task 1", "Fix bug", "Update X" — quá mơ hồ.

**Quy chuẩn description** (rule §4):
```
{1-2 câu mô tả mục tiêu task}

## Phạm vi
- ...
- ...

## Acceptance criteria
- AC-1: ...
- AC-2: ...

## Tài liệu liên quan
- Spec: fare://documents/{us_id} (User Story X)
- ERD: fare://documents/{erd_id}
- API: fare://documents/{api_doc_id}
- Wireframe: <Figma URL hoặc fare://documents/{design_id}>

## Định nghĩa Done (DoD)
- Code đã merge vào branch chính
- Test pass (gắn TC: TC-101, TC-102)
- Document API/spec đã update (nếu thay đổi contract)
```

Description PHẢI có ≥1 URI `fare://documents/{id}` trỏ tới spec — KHÔNG để rỗng (vi phạm §4). Không có doc → ghi rõ "tài liệu sẽ bổ sung — bàn giao BA".

## Bước 2 — Suy luận `links` (blocks / relates_to)

Quan hệ thứ tự cho ai phải làm trước:
- DB migration → blocks → BE endpoint (BE cần bảng tồn tại).
- BE endpoint → blocks → FE màn hình (FE cần API contract chạy được).
- BE + FE → blocks → Test e2e (test cần cả 2).

Khai báo qua `links: [{ target_task_id, link_type: "blocks" }]` — NHƯNG `target_task_id` cần có sau khi tạo. 2 cách:
1. **Tạo 1 đợt, sau đó `update_task(add_links=[...])`** — đơn giản hơn, ưu tiên cách này.
2. Tạo tuần tự theo thứ tự dependency, ghi nhận id để task sau gắn `links`.

## Bước 3 — Effort BOTTOM-UP (ước từng task theo bản chất task)

### Nguyên tắc
- `task.est_effort` đơn vị **GIỜ** (decimal: 0.5 = 30 phút, 8 = 1 ngày công). KHÁC `module.effort_est` đơn vị MAN-DAYS.
- **Bottom-up:** ước MỖI task từ đặc điểm task đó (lượng code thật, validate, integration, test). KHÔNG chia function effort theo tỷ trọng layer (sai phương pháp — function.effort_est là *judgment cấp cao*, không phản ánh task chi tiết).
- **Function.effort_est là CEILING SANITY-CHECK** (Bước 3.3), KHÔNG phải input để chia.
- User là người chốt số cuối — agent đề xuất *khoảng* dựa heuristic, KHÔNG gán cứng.

### 3.0 — Lấy 3 mẩu data ngữ cảnh từ FARE (đọc TRƯỚC khi nháp)

| Cần | Resource | Dùng làm gì |
|---|---|---|
| `hours_per_day` của project | `fare://projects/{code}` → field `hours_per_day` | Quy đổi `function.effort_est` (man-days) → giờ ở Bước 3.3 |
| Task hiện có trong function này | `fare://modules/{function_id}/task-effort-summary` → `total.sum_est_hours` + `total.count` | Biết function đã có bao nhiêu task + effort đang chiếm → chỉ ước phần *còn lại*, không double-count |
| Velocity team (auto-calibrate factor) | `fare://projects/{code}/velocity` → `window_90d.median` (ưu tiên) hoặc `window_30d.median` (current) | Hiệu chỉnh factor heuristic theo lịch sử team: nếu median > 1.0 → team thường ước thấp → nhân `est_effort` thêm factor `velocity_median` |

**Đọc tươi** mỗi lần breakdown (không cache cross-session).

**Khi resource trả null / n=0:**
- `velocity` n=0 (project mới, chưa task nào DONE có est+actual) → bỏ qua calibration, dùng pure heuristic.
- `task-effort-summary` total.count=0 → function trống, không cần lo double-count.
- `hours_per_day` không có (FARE phiên cũ chưa có field) → mặc định **8**.

### 3.1 — Hỏi context dev/AI cho từng task

Effort thực phụ thuộc 2 chiều: **mức apply AI** của dev (Antigravity / Copilot) × **level dev**. Agent hỏi 2 câu cho mỗi task (hoặc 1 lần đầu phiên nếu cả batch task cùng người làm):

| Câu hỏi | Lựa chọn |
|---|---|
| Mức apply AI cho task này | `0%` (không AI) · `25%` (autocomplete) · `50%` (gen boilerplate) · `75%` (gen + review) · `100%` (gen + tinh chỉnh) |
| Level dev nhận task | `Junior` · `Mid` · `Senior` |

Nếu User chỉ định cố định cho cả team → ghi lại làm default cho cả batch.

### 3.2 — Bảng heuristic 2 chiều

**Bước 1: lấy `base` từ bảng base** (giả định *Mid + AI 75%*):

| Task type | Đặc điểm | `base` (giờ) |
|---|---|---|
| **BE — endpoint** | CRUD đơn (1 entity, validate cơ bản) | **0.5–1.5** |
| | CRUD + validate phức tạp (≥3 rule, async / unique check) | **2–4** |
| | + Integration ngoài (3rd-party API / queue / webhook) | **4–8** |
| **FE — màn hình** | Form đơn (≤5 field, validate cơ bản, 1 API call) | **1–2** |
| | List + filter + paginate + sort | **3–6** |
| | Workflow đa bước / realtime / state phức tạp | **6–12** |
| **DB — migration** | Migration thuần (CREATE TABLE / ALTER cột) | **0.3–1** |
| | + Backfill data | **1–3** |
| | + Zero-downtime strategy | **4–8** |
| **TEST** | Viết 5 TC structured (TC doc) | **0.5–1.5** |
| | Implement test code (unit/integration cho 5 TC) | **1–3** |
| | + Setup mock / fixture phức tạp | **3–6** |
| **Infra** | Env var + deploy config nhỏ | **0.5–2** |
| | Pipeline mới / monitoring / alert | **4–8** |

**Bước 2: nhân `factor` 2 chiều** (AI level × Dev level):

| Apply AI \ Level | Junior | Mid | Senior |
|---|---|---|---|
| **0%** (không AI) | × **4.25** | × **2.5** | × **1.75** |
| **25%** (autocomplete) | × **3.0** | × **1.8** | × **1.25** |
| **50%** (gen boilerplate) | × **2.2** | × **1.3** | × **0.9** |
| **75%** (gen + review) | × **1.7** | × **1.0** | × **0.7** |
| **100%** (gen + tinh chỉnh) | × **1.2** | × **0.7** | × **0.49** |

**Công thức cơ bản:** `est_effort = base × factor[ai_level][dev_level]`.

**Bước 3 (mới): nhân `velocity_factor`** (nếu có data từ Bước 3.0):
```
est_effort = base × factor[ai_level][dev_level] × velocity_factor
```
trong đó:
- `velocity_factor = window_90d.median` (ưu tiên — stable baseline, n đủ lớn ≥ 10)
- Nếu `window_90d.n < 10` → dùng `window_30d.median` (current velocity)
- Nếu cả hai n < 5 → bỏ qua (`velocity_factor = 1.0`)
- Cap ở `[0.6, 2.0]` để tránh nhiễu khi sample nhỏ làm méo

**Ví dụ:**
- BE CRUD đơn (base 0.5–1.5h) × Mid + AI 50% (×1.3) × velocity 1.0 → **0.65–2h**
- BE CRUD đơn (base 0.5–1.5h) × Mid + AI 50% (×1.3) × velocity 1.4 (team thường slip 40%) → **0.91–2.73h**
- FE workflow phức tạp (base 6–12h) × Junior + AI 0% (×4.25) → **25.5–51h** (báo động — task quá lớn cho Junior, đề xuất split hoặc đổi assignee Mid+)
- DB migration backfill (base 1–3h) × Senior + AI 75% (×0.7) × velocity 0.85 (team conservative) → **0.6–1.78h**

Agent trình cả `base`, `factor`, `velocity_factor`, và `est` cuối cho User soi:
```
[BE] POST /employees: base 0.5–1.5h × Mid+AI50% (×1.3) × velocity 1.4 (n=23, 90d) → est 0.91–2.73h. Chốt: 2h
```

User có thể chỉnh thủ công bất kỳ task nào — nếu chỉnh > 2× khoảng heuristic, agent hỏi lý do để ghi vào description.

### 3.3 — Ceiling check (sau khi mỗi task có est)

Sum `task.est_effort` (mọi task vừa nháp) **cộng với task đã có** từ Bước 3.0 (`task-effort-summary.total.sum_est_hours`) → đối chiếu với `function.effort_est` quy hours.

**Quy đổi man-days → hours:**
- `hours_per_day` đã đọc ở Bước 3.0 từ `fare://projects/{code}`. Default 8 nếu null.

**Tính ratio:**
```
ratio = (sum_new_task_est + summary.total.sum_est_hours) / (function.effort_est × hours_per_day)
```
Nếu `function.effort_est = 0` (chưa estimate) → bỏ ceiling check, báo PM chạy `fare-effort-estimation` ngược sau breakdown (input sum tasks làm sanity).

**Thang mức vượt → số phương án đề xuất:**

| Ratio | Mức | Phương án đề xuất (đính kèm đánh giá phương án tốt nhất theo tình hình) |
|---|---|---|
| **< 0.8** | 🟩 Dư buffer | (a) Chấp nhận, giữ buffer · (b) Thêm 1 task buffer (refactor / doc / monitoring) tận dụng capacity sprint |
| **0.8 – 1.1** | 🟩 Khớp tốt | Báo OK, không cần đề xuất gì. |
| **1.1 – 1.25** | 🟨 Vượt nhẹ | (a) Chấp nhận overrun + note lý do · (b) Trim scope nhẹ 1 task không critical |
| **1.25 – 1.5** | 🟧 Vượt trung | + (c) Re-estimate function effort_est (BA/PM `/fare-pm`) · (d) Defer 1 task qua sprint sau |
| **1.5 – 2.0** | 🟥 Vượt nhiều | + (e) Chia thêm task để parallel (gán nhiều assignee) · (f) Split function thành 2 (BA reassess scope qua `/fare-change`) |
| **> 2.0** | 🟥🟥 NGHIÊM TRỌNG | Cảnh báo: spec / scope có vấn đề. DỪNG breakdown. Bàn giao BA `/fare-change` re-spec hoặc `/fare-audit-spec`; PM `/fare-pm` re-plan toàn function. KHÔNG batch task. |

**Mẫu báo cáo cho tier > 0.8 ceiling:**
```
## Ceiling check
Function "Thêm nhân viên" (id=120): effort_est = 5 md × hours_per_day=8 = 40h
Task hiện có trong function (từ task-effort-summary): 2 task, sum_est = 8h
Sum task mới (5 task): 44h
Tổng sau breakdown: 52h
Ratio: 52 / 40 = 1.30 → 🟧 Vượt trung (25–50%)

Phương án đề xuất:
(a) Chấp nhận overrun 12h, note "validate phức tạp hơn ước ban đầu" vào description.
(b) Trim TASK-5 [Infra] (4h, không critical sprint này) → còn 48h, ratio 1.20.
(c) Re-estimate function effort_est từ 5 md lên 7 md (BA/PM /fare-pm).
(d) Defer TASK-5 qua sprint sau.

Đánh giá theo tình hình:
Validate phức tạp là phát hiện chính đáng khi đọc spec sâu. (c) hợp lý nhất —
ước ban đầu quá lạc quan, sửa effort_est sẽ giúp velocity team chính xác hơn về sau.
(b) nguy hiểm vì infra cuối cùng cũng phải làm. (a)/(d) chỉ giấu vấn đề.
Đề xuất chính: (c). User chốt?
```

**Khi function CHƯA có `effort_est`** (BA-light không estimate): bỏ ceiling check, vẫn bottom-up từng task. Báo PM: sau breakdown có thể chạy `fare-effort-estimation` ngược (input sum_task_est làm sanity-check cho function).

### 3.5 — Sau khi User chốt batch task

Khi `actual_effort` của task được Dev điền (sau `/fare-handoff`) → resource `fare://projects/{code}/velocity` tự cập nhật trong các round breakdown tương lai. Velocity càng nhiều sample (≥30 task DONE có est+actual trong 90d) → factor calibration càng chính xác. PM không cần làm gì thêm — flywheel tự chạy.

Nếu sprint cuối có `actual / est` lệch hệ thống (vd median 1.8 cho 30d gần nhất), agent breakdown lần sau sẽ tự inflate `est_effort` 80% — User nên xem xét: spec quá lạc quan? team velocity giảm? cần re-onboard? — không phải lỗi của ước.

### 3.4 — Trường hợp đặc biệt
- **Task BUG hotfix giữa sprint** (không thuộc function nào trong plan): không có function ceiling. Estimate bottom-up + đánh dấu là "outside sprint estimate" trong description.
- **User không yêu cầu effort**: bỏ trống `est_effort` (mặc định 0). KHÔNG đoán bừa. Báo "effort không ước — `actual_effort` sẽ điền sau".

## Bước 4 — Trình User chốt + batch tạo

Trình bảng nháp:
```
| # | type | title | est_effort (h) | links | doc refs |
|---|---|---|---|---|---|
| 1 | TASK | [DB] Tạo bảng employees | 2 | — | erd/45 |
| 2 | TASK | [BE] Endpoint POST /employees | 8 | blocks: 1 | us/120, api_doc/200 |
| 3 | TASK | [FE] Form thêm nhân viên | 6 | blocks: 2 | us/120, figma |
| 4 | TEST | [TEST] Test cases AC-1..AC-5 | 4 | blocks: 2,3 | us/120 |
```

**CHỜ User chốt** (rule §2 — đặc biệt với batch create). Sửa theo phản hồi.

Sau khi User OK → **một** lời gọi `create_tasks(tasks=[<mảng>])` (rule §4: BẮT BUỘC batch). Mỗi item:
- `module_id` = function id (bắt buộc)
- `title`, `description` (markdown, có URI doc)
- `type` (`TASK | BUG | TEST`)
- `priority` (`low|medium|high|critical`, mặc định `medium`)
- `est_effort` (giờ, optional)
- `epic_id` (optional) — từ Bước 0, nếu User chọn epic
- `type=TEST` → kèm `test_case_ids` nếu có (từ doc test_case → `list_test_cases` lấy row id; KHÔNG dùng task id)

Sau khi batch trả về với id của từng task → gọi `update_task(add_links=[...])` để gắn `blocks` / `relates_to` theo nháp Bước 2.

## Bước 5 — Báo cáo & bàn giao

Báo gọn:
- Đã tạo N task — liệt kê id + title + URL.
- Task nào chưa có spec đầy đủ → đánh dấu cần BA bổ sung.
- Task type=TEST → bàn giao QA (khi vai QA có) viết TC chi tiết.
- Task BE/FE → sẵn cho Dev pickup. Trạng thái mặc định `TODO`.

KHÔNG tự assign owner trừ khi User chỉ định rõ — assignee thường do team tự pickup.

## Anti-patterns

- ❌ Break task khi function chưa có spec (vi phạm §7).
- ❌ Tạo task không có `module_id` (vi phạm §1) — dữ liệu mồ côi.
- ❌ Title "Task 1", "Fix bug", "Implement feature X" — quá mơ hồ.
- ❌ Description không URI doc — dev không biết tham chiếu spec nào.
- ❌ Gọi `create_task` (số ít) trong vòng lặp — phải `create_tasks` batch (§4).
- ❌ Tự set `meta_status="DONE"` ngay khi tạo — task mới luôn TODO (§6).
- ❌ Truyền nhầm `est_effort` man-days vào task (task là GIỜ, module là MAN-DAYS).
- ❌ **Chia `function.effort_est` theo tỷ trọng layer** rồi gán xuống task (top-down). Phải bottom-up từng task theo bản chất task; function effort chỉ là ceiling sanity-check.
- ❌ Gán `est_effort` cứng từ bảng base mà KHÔNG nhân factor AI level × Dev level.
- ❌ Ép sum tasks khớp ceiling (giảm task effort xuống chỉ để khớp function effort) — giấu vấn đề, sẽ overrun thật trong sprint.
- ❌ Bỏ qua ceiling check (>0.8 ratio) — không báo User để chốt phương án xử lý.
- ❌ Khi ratio >2.0 vẫn cố batch task — phải DỪNG, bàn giao BA re-spec.
- ❌ Quên cộng task hiện có (`task-effort-summary.total.sum_est_hours`) vào ceiling check — sẽ under-count khi function đã có task từ sprint trước.
- ❌ Áp velocity_factor mà sample size < 5 — nhiễu cao, phải bỏ qua (factor 1.0).
- ❌ Không cap velocity_factor — vd team mới có 2 task, median lệch sẽ inflate / deflate quá đà.
- ❌ Cache `hours_per_day` / `velocity` qua nhiều phiên — phải đọc tươi mỗi lần breakdown.
- ❌ Hard-code `status_id` — dùng `meta_status` (§4).

## Tự kiểm

- [ ] Function mục tiêu có spec đầy đủ (UC/US/SRS đã đọc).
- [ ] Mỗi task có `module_id` của function (§1).
- [ ] Title VN, dạng động từ + tân ngữ, có prefix layer nếu nhiều task cùng function.
- [ ] Description có ≥1 URI `fare://documents/{id}` (§4).
- [ ] DoD ghi rõ điều kiện chuyển VERIFYING / DONE.
- [ ] `links` (`blocks` / `relates_to`) gắn đúng thứ tự dependency.
- [ ] Bước 3.0 đã đọc 3 resource: `fare://projects/{code}` (hours_per_day) + `fare://modules/{id}/task-effort-summary` (task hiện có) + `fare://projects/{code}/velocity` (factor calibration).
- [ ] Effort: BOTTOM-UP từng task; đã hỏi AI level + Dev level; áp factor + velocity_factor đúng (velocity cap [0.6, 2.0], bỏ qua khi n<5).
- [ ] Ceiling check đã CỘNG cả task hiện có (`sum_new + summary.sum_est`) trước khi chia ceiling — không quên double-count.
- [ ] Ratio > 0.8 → đã trình phương án theo tier + đánh giá đề xuất chính + User chốt.
- [ ] Đơn vị nhất quán: task = giờ, module = man-days. `hours_per_day` đọc từ FARE (default 8).
- [ ] Dùng `create_tasks` batch (số nhiều) — KHÔNG vòng lặp `create_task`.
- [ ] Mọi task tạo với mặc định `TODO`; KHÔNG tự assign owner / set status xa hơn.
- [ ] User đã chốt bảng nháp TRƯỚC khi batch (§2).
- [ ] Epic check: nếu function thuộc 1 initiative đang chạy → đã `query_epics(status="live")` + hỏi User chọn epic, truyền `epic_id` khi create_tasks. Bỏ qua hợp lệ khi User confirm "không thuộc epic nào".
