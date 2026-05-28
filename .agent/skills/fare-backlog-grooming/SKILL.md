---
name: fare-backlog-grooming
description: Review backlog định kỳ — quét task lệch trạng thái (IN_PROGRESS không activity, DONE chưa verify, TODO không owner / quá hạn), bug triage (sắp xếp severity / assign), phát hiện task mồ côi (không module / không spec). Đề xuất hành động sửa và CHỜ User chốt — KHÔNG tự đổi trạng thái hàng loạt.
---

# fare-backlog-grooming — Grooming backlog

Dùng khi: cuối ngày / cuối tuần / cuối sprint, PM cần kiểm trạng thái thực tế của backlog có khớp metadata không, và bug có được triage hợp lý không.

## Tiền đề
- Bản đồ ngữ cảnh — biết project + sprint hiện hành.
- Tuân `rules/fare-rules.md`: §1 (mọi task có `module_id`), §5 (bug discovery cần xác nhận trước khi tạo BUG task), §6 (4-state lifecycle TODO→IN_PROGRESS→VERIFYING→DONE), §2 Confirmation Gate (mọi `update_task` hàng loạt cần User chốt).

## Bước 0 — Chốt phạm vi

Hỏi & CHỜ:
- **Project + sprint:** mã project; sprint nào (`plan_month_id` cụ thể, hay "tất cả task open").
- **Loại review:** `health-check` (mặc định, snapshot lệch trạng thái) · `bug-triage` (chỉ tập trung BUG) · `sprint-close` (chuẩn bị đóng sprint).
- **Ngưỡng stale:** mặc định IN_PROGRESS quá **3 ngày** không comment = stale. Hỏi nếu team có quy ước khác.

## Bước 1 — Quét dữ liệu

| Truy vấn | Mục đích |
|---|---|
| `list_tasks(projectCode, plan_month_id?, meta_status="IN_PROGRESS")` | Task đang code |
| `list_tasks(projectCode, plan_month_id?, meta_status="VERIFYING")` | Task chờ verify |
| `list_tasks(projectCode, plan_month_id?, meta_status="DONE")` | Task đóng — kiểm verify |
| `list_tasks(projectCode, plan_month_id?, meta_status="TODO", type="TASK")` | Backlog chưa pickup |
| `list_tasks(projectCode, type="BUG")` | Bug list — không lọc status, để thấy mọi bug đang mở |
| `list_tasks(projectCode, type="BUG", bug_origin="INTRINSIC")` | Bug nội sinh đang chặn task cha (xem `linked_task_id` để biết chặn task nào) |
| `list_tasks(projectCode, type="BUG", bug_origin="EXTRINSIC")` | Bug độc lập — triage riêng, không chặn task |
| `query_epics(projectCode, status="live")` | Epic đang chạy (planned + in_progress + at_risk) |
| `query_epics(epicId)` (cho từng epic live) | GET mode kèm `task_stats` (breakdown task status) + progress |
| `list_test_cases(projectCode, ...)` cho mỗi task `type=TEST` `DONE` | Kiểm `verify_history.passed` |

Với mỗi task `IN_PROGRESS`: `list_tasks(id=<id>)` lấy chi tiết + comments để xem `updated_at` của comment cuối.

## Bước 2 — Phân loại lệch

| Loại lệch | Tiêu chí phát hiện | Mức |
|---|---|---|
| **Stale IN_PROGRESS** | `IN_PROGRESS` quá ngưỡng ngày không có comment mới | 🟧 HIGH — dev quên / nghỉ; người khác có thể pickup nhầm |
| **DONE chưa verify** | `DONE` mà `type=TEST` không có `verify_history.passed` cho TC liên quan; HOẶC `DONE` mà không có comment nào về verify | 🟥 BLOCKER — vi phạm §6 hard rule |
| **Skip lifecycle** | Lịch sử nhảy `TODO → DONE` không qua `IN_PROGRESS`/`VERIFYING` | 🟥 BLOCKER — vi phạm §6 |
| **Quá hạn** | `end_at < hôm nay` mà `meta_status ≠ DONE` | 🟧 HIGH |
| **Mồ côi spec** | `description` không có URI `fare://documents/{id}` | 🟨 MEDIUM — vi phạm §4 |
| **Mồ côi module** | `module_id` rỗng / không hợp lệ | 🟥 BLOCKER — vi phạm §1 (nhưng FARE schema cấm, hiếm gặp) |
| **TODO bỏ quên** | `created_at` > 14 ngày mà vẫn `TODO`, không assignee | 🟨 MEDIUM — backlog có khả năng outdated |
| **Bug chưa triage** | `type=BUG` không có `severity` hoặc `priority` | 🟧 HIGH |
| **Bug stuck** | `type=BUG` `severity=blocker` mà `TODO` > 24h | 🟥 BLOCKER |
| **Task chặn bởi bug INTRINSIC** | Task `VERIFYING`/`IN_PROGRESS` có bug INTRINSIC open (`list_tasks(type="BUG", bug_origin="INTRINSIC", linked_task_id=<task>)`) — task không thể DONE đến khi bug đóng | 🟧 HIGH — feature chưa đạt AC, đang treo |
| **Bug INTRINSIC mồ côi** | `type=BUG`, `bug_origin="INTRINSIC"` nhưng `linked_task_id` rỗng/không hợp lệ | 🟨 MEDIUM — không biết chặn task nào, semantic sai |
| **EXTRINSIC bug tồn đọng** | `type=BUG`, `bug_origin="EXTRINSIC"`, `TODO` > 14 ngày | 🟨 MEDIUM — bug độc lập không ai pickup |
| **Epic at_risk** | `query_epics(status="at_risk")` | 🟧 HIGH — initiative đang trễ, cần re-plan |
| **Epic quá hạn** | `due_date < hôm nay` mà `status ∉ {done, archived}` | 🟥 BLOCKER nếu task_count > 0 chưa done; 🟧 HIGH nếu epic gần xong |
| **Epic không owner** | `status ∈ {planned, in_progress, at_risk}` mà `owner_id = null` | 🟨 MEDIUM — không ai chịu trách nhiệm initiative |
| **Task mồ côi epic** | Task active (TODO/IN_PROGRESS) gắn `module_id` của function thuộc 1 initiative đang chạy (xem epic.task_stats để biết function nào nằm trong epic) mà chưa có `epic_id` | 🟨 MEDIUM — mất truy nguồn initiative |

## Bước 3 — Báo cáo (KHÔNG sửa)

Markdown, ưu tiên bảng:

```
## Backlog Grooming — {project} · {sprint hoặc "tất cả"}
Thời điểm: {yyyy-mm-dd HH:mm}
Phạm vi: {tóm tắt}

### Tóm tắt
| Bucket | Count |
|---|---|
| TODO | 12 |
| IN_PROGRESS | 5 (3 stale ⚠) |
| VERIFYING | 2 |
| DONE | 18 (1 chưa verify ⚠) |
| BUG mở | 4 (1 blocker stuck) |

### Lệch trạng thái cần xử lý

🟥 BLOCKER (2):
- TASK-FARE-87 [DONE] — không có verify comment, không có TC pass. Đề xuất: chuyển về VERIFYING + add_comment yêu cầu dev cung cấp evidence.
- BUG-FARE-92 [TODO 3 ngày, blocker] — chưa assign. Đề xuất: priority=critical + assign Dev oncall.

🟧 HIGH (4):
- TASK-FARE-71 [IN_PROGRESS, 5 ngày không comment] — Dev: Nguyễn A. Đề xuất: nudge dev cập nhật, hoặc đổi assignee nếu A đang nghỉ.
- BUG-FARE-88, 90, 91 — chưa có severity. Đề xuất: gán theo impact (xem rule severity bên dưới).

🟨 MEDIUM (3):
- TASK-FARE-65, 66, 67 — description không URI doc. Đề xuất: update_task bổ sung URI spec.

### Bug triage (cho bug-triage mode)
| ID | Title | severity | priority | assignee | Đề xuất |
|---|---|---|---|---|---|
| BUG-92 | Login lỗi 500 khi token expire | (trống) | critical | (trống) | severity=blocker, assign A, link `relates_to` task auth |
```

## Bước 4 — Đề xuất hành động + CHỜ User chốt

Trình **danh sách hành động** rõ ràng:
```
Đề xuất chuyển trạng thái (cần User chốt):
1. update_task(taskId=87, meta_status="VERIFYING") + add_comment "verify evidence missing"
2. update_task(taskId=92, priority="critical", severity="blocker", assignee_id=<A_id>)
3. ...
```

User chốt từng item hoặc nhóm → thực thi tuần tự. KHÔNG batch tất cả vào 1 lệnh rồi xin xác nhận chung (§2 cấm gộp quyết định).

## Quy tắc xử lý theo loại

- **Stale IN_PROGRESS** → KHÔNG tự chuyển về TODO (có thể dev đang làm). `add_comment` nudge + báo User; nếu User xác nhận dev nghỉ → đổi assignee hoặc đổi về TODO.
- **DONE chưa verify** → chuyển về `VERIFYING` (lùi lại) + `add_comment` yêu cầu evidence. KHÔNG xóa task.
- **Bug stuck blocker** → assign + nâng priority. Tuyệt đối KHÔNG tự đóng (set DONE) bug mà chưa có evidence fix.
- **Task chặn bởi bug INTRINSIC** → KHÔNG tự đóng bug để gỡ chặn. Báo User: task X đang treo vì N bug INTRINSIC (liệt id + severity). Đề xuất: ưu tiên fix bug (bàn giao Dev `/fare-dev`), hoặc nếu bug thực ra là EXTRINSIC (gán nhầm) → đề xuất `update_task(bug, bug_origin="EXTRINSIC", linked_task_id=null)` để gỡ chặn (cần User chốt — đây là đổi semantic).
- **Bug INTRINSIC mồ côi** (thiếu linked_task_id) → hỏi User task cha là gì → `update_task(bug, linked_task_id=<task>)`. Nếu thực ra độc lập → `update_task(bug, bug_origin="EXTRINSIC")`.
- **EXTRINSIC bug tồn đọng** → triage như bug thường (assign owner, đẩy sprint, hoặc archive). KHÔNG link task nào.
- **Mồ côi spec (description không URI)** → `update_task(description=<nguyên văn + section "Tài liệu liên quan">)`. Nếu chưa có doc nào, ghi "tài liệu sẽ bổ sung — bàn giao BA" (rule §4).
- **TODO bỏ quên** → đề xuất 1 trong 3: assign owner, đẩy sang sprint sau, hoặc **archive** (cần User chốt). KHÔNG tự `delete_task` (§2 — delete cần User nói rõ).
- **Epic at_risk** (đã ở status `at_risk`) → KHÔNG tự đổi status. Báo cáo cho User + đề xuất 3 hướng: (a) re-plan scope (bàn giao PM `/fare-epic`: split task / defer task / extend due_date qua `update_epic`), (b) bàn giao BA `/fare-change` re-spec nếu lỗi do yêu cầu thay đổi, (c) thêm nhân lực (PM gán thêm assignee qua `/fare-breakdown` mới). Đề xuất hướng phù hợp với root cause (xem `task_stats` của epic để đoán).
- **Epic in_progress mà tiến độ trễ** (epic status còn `in_progress` nhưng `progress < 50%` và đã qua 75% thời gian giữa start_date và due_date) → đề xuất `update_epic(status="at_risk")` để confirm; CHỜ User chốt (§2 — đổi status epic là quyết định quan trọng).
- **Epic quá hạn** (`due_date < hôm nay` mà `status ∉ {done, archived}`) → đề xuất 1 trong 3: (a) extend due_date (`update_epic(due_date=...)`) nếu User chấp nhận trễ, (b) `update_epic(status="done")` NẾU 100% task DONE (rule cứng), (c) `update_epic(status="at_risk")` + bàn giao PM/BA re-plan. KHÔNG mặc định extend.
- **Epic không owner** (`owner_id = null` mà status `∈ {planned, in_progress, at_risk}`) → đề xuất gán owner qua `update_epic(owner_id=<user_id từ list_projects(include_members=true)>)`. Đợi User chốt.
- **Task mồ côi epic** (task active gắn `module_id` của function thuộc epic đang chạy mà chưa có `epic_id`) → đề xuất bulk assign qua `update_epic(epicId, task_ids_to_assign=[...])`. Đợi User chốt; KHÔNG batch >500/call (rule skill `fare-epic-management`).

## Bug discovery khi grooming (≠ tạo bug mới)

Nếu trong khi grooming agent phát hiện vấn đề trên artifact (vd "task X đã DONE nhưng đọc code thấy logic Y vẫn sai") → áp dụng rule §5:
1. KHÔNG tự `create_tasks(type=BUG)`.
2. Báo cáo Markdown: hiện tượng, root cause (nếu suy luận được), file/module liên quan, mức độ.
3. Hỏi User: "muốn tạo BUG task `[tên gợi ý]` để track không?"
4. Chỉ tạo BUG sau khi User xác nhận.

## Anti-patterns

- ❌ Tự chuyển trạng thái hàng loạt mà không trình danh sách chờ User chốt (vi phạm §2).
- ❌ Tự `delete_task` task TODO cũ — phải User nói "xóa" mới được (§2).
- ❌ Đóng bug (set DONE) khi không có evidence fix — vi phạm §6.
- ❌ Tự tạo BUG task khi phát hiện vấn đề mà chưa xin User (§5).
- ❌ Hard-code `status_id` — dùng `meta_status` (§4).
- ❌ Báo cáo dài dòng không sortable — không có bảng + bucket count.

## Tự kiểm

- [ ] Phạm vi (project / sprint) & loại review đã được User chốt.
- [ ] Ngưỡng stale phù hợp team (mặc định 3 ngày, đã xác nhận với User nếu khác).
- [ ] Báo cáo đầy đủ: tóm tắt bucket count + chi tiết lệch theo mức 🟥/🟧/🟨.
- [ ] Mỗi item lệch có **đề xuất hành động cụ thể** (tool + payload tóm tắt).
- [ ] User đã chốt TỪNG hành động (hoặc nhóm rõ ràng) TRƯỚC khi `update_task` (§2).
- [ ] Bug mới phát hiện trong lúc grooming → đã hỏi User trước khi `create_tasks(type=BUG)` (§5).
- [ ] KHÔNG tự `delete_task`.
