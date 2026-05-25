---
name: fare-task-pickup
description: Pickup 1 task từ backlog đúng quy trình — chọn task hợp lý (priority, blocker, assignee), đọc HẾT spec/ERD/API doc/Figma trỏ tới trong description, set `meta_status="IN_PROGRESS"` + `add_comment` mô tả phạm vi sắp làm. Dùng đầu mỗi phiên dev. KHÔNG tự code; chỉ chuẩn bị bối cảnh.
---

# fare-task-pickup — Pickup task đầu phiên

Dùng khi: dev bắt đầu phiên làm việc, cần chọn task tiếp theo và load đủ bối cảnh trước khi sửa code.

KHÔNG thuộc skill này: phân tích blast radius khi sửa (→ `fare-impact-analysis`); set VERIFYING / handoff (→ `fare-self-verify`); tự code (Dev USER tự code trong IDE).

## Tiền đề
- Bản đồ ngữ cảnh project — biết project code, sprint hiện hành.
- Tuân `rules/fare-rules.md`: §6 (4-state — chỉ chuyển TODO → IN_PROGRESS khi thực sự bắt đầu), §3 (đọc trước khi làm — `list_tasks(id=...)` lấy chi tiết + đọc URI doc).

## Bước 0 — Chốt với User

Hỏi & CHỜ (nếu chưa rõ):
- **Project:** mã (vd `FARE`).
- **Lọc:** assignee = tôi · hay tự chọn từ backlog · hay task cụ thể (id)?
- **Filter:** chỉ `TODO` · hay cả `IN_PROGRESS` đang dở của mình?
- **Sprint:** sprint hiện hành (`plan_month_id`) hay toàn project?

## Bước 1 — Lấy danh sách & xếp ưu tiên

`list_tasks(projectCode, meta_status="TODO", plan_month_id?, type="TASK")`:
- KHÔNG mặc định filter `assignee_id` — backlog có thể có task chưa assign mà dev pickup được.

Xếp danh sách theo heuristic (trừ khi User chỉ đích danh):

| Cấp ưu tiên | Tiêu chí |
|---|---|
| 1️⃣ Cao nhất | `priority="critical"` HOẶC task `blocks` task khác đã IN_PROGRESS |
| 2️⃣ Cao | `priority="high"` + assignee=tôi + không có `blocks` đang mở |
| 3️⃣ Vừa | `priority="medium"` + đã có spec đầy đủ (URI doc trong description) |
| 4️⃣ Thấp | `priority="low"` HOẶC task có `end_at` xa |
| ⛔ Skip | Task có `blocks` chưa DONE (chưa thông) HOẶC spec mỏng (không có URI doc) |

Skip task spec mỏng — bàn giao BA `/fare-ba` bổ sung trước; không pickup để rồi bịa code.

## Bước 2 — Đọc chi tiết task được chọn

1. `list_tasks(id=<id>)` — lấy full description, links (blocks/relates_to), test_case_ids, **epic_id**.
2. **Scan description** lấy mọi URI `fare://documents/{id}` — đọc HẾT từng cái (paginated):
   - User Story / Use Case → biết AC + flow.
   - ERD → biết bảng + cột (nếu DB task).
   - API doc → biết endpoint + req/resp (nếu BE task).
   - Wireframe / Figma → biết UI/state (nếu FE task).
3. **Nếu task có `test_case_ids`** → `get_test_case(testCaseId)` cho từng TC — biết acceptance trước khi code, code thẳng để pass TC.
4. **Đọc cả task `blocks`** (xem id trong `links`): nắm cái mình đang chặn cái gì — quan trọng để biết deadline.
5. **Nếu task có `epic_id`** → `query_epics(epicId)` GET mode lấy initiative context: name, owner, status, due_date, progress, task_stats. Biết task nằm trong initiative lớn nào → hiểu big picture + deadline tổng + ảnh hưởng nếu trễ. Xem `fare-mcp-integration` để phân biệt Epic ≠ Module.

## Bước 3 — Báo cáo bối cảnh + chốt phạm vi

Trình bảng tóm tắt:
```
## Task pickup: TASK-FARE-87
Title: [BE] Endpoint POST /employees
Priority: high · Sprint: Tháng 5/2026 · Effort est: 8h
Module: Quản lý nhân viên → Hồ sơ → Thêm nhân viên (id=120)
Epic: "Onboarding Q2 2026" (id=5, owner: Bac Nguyen, due 2026-06-30, progress 40%)

## Spec
- US fare://documents/45 → AC-1, AC-2, AC-3
- ERD fare://documents/68 → bảng `employees`
- API doc fare://documents/72 → POST /employees (req schema, resp 200/400/409)

## Test case linked (3)
- TC-101 [Positive] valid input → 200 + insert row
- TC-102 [Negative] thiếu field required → 400 với chi tiết field
- TC-103 [Boundary] tên 100 ký tự (max)

## Links
- blocks: TASK-FARE-88 [FE] Form thêm nhân viên (đang chờ)
- blocked by: TASK-FARE-86 [DB] Tạo bảng employees (DONE ✓)

## Phạm vi dự kiến (theo DoD trong description)
- Tạo endpoint POST /employees với validate Joi/Zod
- Trả 200 + entity / 400 validation / 409 duplicate code
- Cập nhật API doc nếu contract đổi
- TC-101..103 phải pass

## Câu hỏi mở (nếu có)
- ⚠️ AC-2 không nói rõ "duplicate" check theo code hay theo email — kiểm spec hay hỏi BA?
```

**CHỜ User xác nhận** pickup task này + đồng ý phạm vi (rule §2). User có thể đổi task khác, mở rộng / thu hẹp scope, hoặc bàn giao BA làm rõ trước.

## Bước 4 — Chuyển trạng thái IN_PROGRESS

User đồng ý → `update_task(taskId, meta_status="IN_PROGRESS", assignee_id=<dev id> nếu chưa assign)`.

Ngay sau đó `add_comment(taskId, comment=<scope>)`:
```
[Pickup] Đang chuẩn bị làm phạm vi:
- Tạo POST /employees endpoint
- Validate: code unique, email format, name max 100
- Trả 200/400/409 theo spec

Dự kiến hoàn thành: 1-2 ngày. Sẽ push VERIFYING khi xong + có evidence test pass.

Tham chiếu: fare://documents/45 (US AC-1..3) · TC-101..103.
```

Comment scope là bắt buộc (rule §6 — IN_PROGRESS không có comment = người khác không biết đang làm gì, dễ pickup nhầm).

## Bước 5 — Báo cáo + bàn giao sang impact analysis

Báo gọn:
- Đã pickup TASK-FARE-87, IN_PROGRESS.
- Spec đã load. Câu hỏi mở: {danh sách}.
- Đề xuất bước kế: nếu task động vào symbol/module phức tạp → `/fare-impact [project] [tên symbol]` TRƯỚC khi sửa code (xem `fare-impact-analysis`).
- Nếu có câu hỏi mở → bàn giao BA `/fare-change` hoặc `/fare-audit-spec` xử lý spec trước.

## Anti-patterns

- ❌ Pickup task spec mỏng (không có URI doc) — bịa code khi không biết AC.
- ❌ Pickup task đang `blocked by` task khác chưa DONE — sẽ bị chặn.
- ❌ Set `IN_PROGRESS` mà không `add_comment` scope (vi phạm §6).
- ❌ Pickup nhiều task cùng lúc (>2 IN_PROGRESS) — chuyển ngữ cảnh tốn kém, dễ quên.
- ❌ Tự reassign task của người khác sang mình mà chưa hỏi.
- ❌ Bỏ qua TC linked — code không pass TC = sẽ failed verify, lùi lại.
- ❌ Đọc lướt spec — bỏ qua flow alternative / exception, dẫn đến code thiếu case.

## Tự kiểm

- [ ] Phạm vi chọn task đã chốt với User (assignee / status / sprint).
- [ ] Heuristic xếp ưu tiên đã áp dụng — không pickup random.
- [ ] Mọi URI doc trong task.description đã đọc HẾT (paginated).
- [ ] TC linked đã `get_test_case` đọc — biết acceptance trước khi code.
- [ ] Câu hỏi mở (spec mơ hồ) đã liệt kê + báo User TRƯỚC khi IN_PROGRESS.
- [ ] User đã xác nhận pickup + scope (§2).
- [ ] `update_task(meta_status="IN_PROGRESS")` + `add_comment` scope đã chạy (§6).
- [ ] Số task IN_PROGRESS của dev ≤ 2 (tránh context switch).
