---
name: fare-epic-management
description: Quản Epic (initiative cross-module) trên FARE — tạo Epic mới, đổi status (planned/in_progress/at_risk/done/archived), gán owner + dates, bulk assign tasks (max 500), close khi 100% task DONE (rule cứng). Vai PM. Phân biệt Epic ≠ Module ≠ Campaign (xem `fare-mcp-integration`).
---

# fare-epic-management — Quản Epic / Initiative

Dùng khi PM cần: tạo initiative mới gom task cross-module · đổi status epic (planned → in_progress → at_risk / done) · bulk gán task cũ vào epic · đổi owner / due date · close epic.

KHÔNG thuộc skill này: tạo task (→ `fare-task-breakdown`); chia cây module (→ BA `fare-plan-breakdown`); viết spec cho epic (→ BA `fare-spec-authoring`); test (→ QA).

## Tiền đề
- **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết project + epic hiện có.
- Đọc `fare-mcp-integration` mục "Epic ≠ Module ≠ Campaign" nếu chưa rõ khái niệm.
- Tuân `rules/fare-rules.md`: §2 Confirmation Gate (mọi `create_epic` / `update_epic` cần xác nhận); §7 KHÔNG tự `status="archived"`.

## ⚠️ Rule cứng: Close epic = 100% task DONE

`update_epic(status="done")` CHỈ được đề xuất khi:
- `query_epics(epicId)` GET mode trả `task_stats` với **TẤT CẢ task** ở `meta_status="DONE"` (progress=100%).
- HOẶC User ra lệnh trực tiếp ép close + chấp nhận hậu quả + ghi lý do vào description epic (vd "defer 2 task remaining sang epic v3").

Trường hợp 2 = ngoại lệ, agent phải báo cảnh báo Markdown trước khi gọi tool. KHÔNG tự ép close.

## 5 thao tác chính

### 1. Tạo Epic mới — `create_epic`

**Khi nào tạo:**
- Tính năng cross-module có business owner + deadline riêng (vd "Mobile Redesign v2", "Payment v3", "GDPR Compliance Q2").
- Task phân tán nhiều function nhưng cùng initiative.
- KHÔNG cho: bug fix lẻ, refactor 1 module, hotfix.

**Quy chuẩn naming (gợi ý — không cứng):**
- Format `"{Initiative} {version?}"`. Vd: `"Mobile Redesign v2"`, `"Payment v3"`, `"Onboarding Q2 2026"`.
- Tiếng Việt OK: `"Tái thiết kế Mobile v2"`. Mix EN cũng OK nếu team quen.
- KHÔNG dùng tên quá chung (`"Improvements"`, `"Phase 1"`) — không phân biệt được khi nhiều epic.
- **UNIQUE per project** — trùng → lỗi 409. `query_epics(projectCode)` kiểm trùng trước.

**Quy trình:**
1. Hỏi User & CHỜ (`§5` Socratic Gate cho create initiative — tối thiểu 2 câu):
   - **Tên epic** (gợi ý format trên — agent gợi ý 1-2 tên, User chọn / sửa).
   - **Owner** (user id, phải là project member — kiểm qua `list_projects(id=<code>, include_members=true)` nếu cần).
   - **Status khởi đầu** (mặc định `planned`; `in_progress` nếu work đã bắt đầu).
   - **Dates** (`start_date`, `due_date` — YYYY-MM-DD, due ≥ start).
   - **Color** (hex, mặc định `#6B7280` xám; có thể đề xuất theo theme: `#3B82F6` xanh feature / `#EF4444` đỏ compliance / `#10B981` xanh GTM).
   - **Description** (1-3 câu mô tả initiative + link spec gốc nếu có dạng `fare://documents/{id}`).
2. Trình nháp + **CHỜ User chốt** (§2):
   ```
   create_epic:
     name: "Mobile Redesign v2"
     owner_id: 5 (Bac Nguyen)
     status: planned
     start_date: 2026-06-01, due_date: 2026-08-31
     color: #3B82F6
     description: "Tái thiết kế mobile UX — flow onboard + payment. Ref: fare://documents/245"
   ```
3. `create_epic(projectCode, name, owner_id, status, start_date, due_date, color, description)`.
4. Trả `epic.id` cho User → có thể tiếp Bước "Bulk assign tasks" gom task cũ.

### 2. Đổi status — `update_epic(epicId, status)`

Lifecycle:
```
planned ──► in_progress ──► (at_risk) ──► done ──► (archived)
```

- **`planned → in_progress`**: khi task đầu tiên của epic được pickup. Trigger có thể là grooming (xem `fare-backlog-grooming`).
- **`in_progress → at_risk`**: epic trễ tiến độ (vd progress chậm + due_date sắp tới). Agent đề xuất khi grooming.
- **`at_risk → in_progress`**: sau khi PM re-plan / thêm capacity / cắt scope.
- **`* → done`**: ⚠️ rule cứng — 100% task DONE (xem trên).
- **`done → archived`**: dài hạn cleanup — **KHÔNG** agent tự set (rule §7); User thao tác trên UI.

Mỗi đổi status PHẢI confirm với User (§2) + `add_comment` lý do nếu là `at_risk` / `done` / `archived`.

### 3. Đổi owner / dates / metadata — `update_epic`

- `owner_id`: phải là project member. `null` = bỏ owner (cảnh báo: epic không owner = rủi ro).
- `due_date`: phải ≥ `start_date`. Đổi due_date trễ hơn = signal scope creep → bàn giao PM `/fare-groom`.
- `name` / `color` / `description`: thay đổi nhẹ, User chốt là OK.

### 4. Bulk assign tasks — `update_epic(epicId, task_ids_to_assign=[...])`

Khi nào dùng:
- Epic mới tạo cần gom task cũ đã có (vd 50 task scattered → gom 1 epic).
- Sprint cũ chuyển task vào epic ra mắt.

Quy trình:
1. Liệt kê task ứng viên: `list_tasks(projectCode, module_id?, type?, meta_status?)` lọc theo function liên quan.
2. Trình danh sách task + `epic_id` đề xuất → **CHỜ User chốt** (§2).
3. `update_epic(epicId, task_ids_to_assign=[id1, id2, ...])` — max 500 id / call. >500 → chia batch.
4. Verify response — task khác project sẽ trong `response.skipped`. Báo User.

### 5. Đề xuất close epic — sau khi 100% task DONE

Quy trình:
1. `query_epics(epicId)` GET mode → `task_stats` + progress.
2. Nếu **progress=100** + **TẤT CẢ task `meta_status=DONE`** → trình User:
   ```
   Epic "Mobile Redesign v2" đủ điều kiện close:
   - Task: 23/23 DONE (BE 8, FE 10, TEST 5)
   - Due: 2026-08-31 (close trước hạn 12 ngày)
   - Action: update_epic(epicId=12, status="done")
   ```
3. User chốt → gọi tool + `add_comment` (qua task hoặc trong description epic) ghi outcome.
4. **Nếu progress < 100**: KHÔNG đề xuất close tự động. Liệt task chưa DONE, hỏi User: defer sang epic mới? hay tiếp tục?

## Phối hợp với skill khác

| Tình huống | Bàn giao |
|---|---|
| Cần spec cấp initiative cho epic (BRD/SRS) | BA `/fare-ba` (`fare-spec-authoring` có hint tạo epic kèm spec) |
| Task mới cần tạo gom vào epic | PM `/fare-breakdown` (Bước 0 hỏi epic) |
| Task cũ scattered cần gom epic | Skill này — Bước 4 bulk assign |
| Grooming: epic at_risk / overdue / no owner | PM `/fare-groom` (`fare-backlog-grooming` Bước 2 có bucket epic) |
| Pickup task gắn epic | Dev `/fare-dev` đọc epic info qua `fare-task-pickup` |
| Verify TC của task thuộc epic | QA `/fare-verify` báo theo epic (qua `fare-test-execution`) |

## Anti-patterns

- ❌ Tạo epic mà KHÔNG có owner — initiative không người chịu trách nhiệm.
- ❌ Tạo epic quá rộng (vd "Improvements 2026") — không track được. Hẹp lại: "Mobile UX Q1 2026".
- ❌ Tạo epic name trùng project khác — phải UNIQUE per project (sẽ lỗi 409, nhưng đừng thử).
- ❌ Đề xuất `status="done"` khi progress < 100% mà không qua ngoại lệ + cảnh báo (§6 rule cứng cho close).
- ❌ Tự `status="archived"` — đó là quyết định User trên UI (§7).
- ❌ Bulk assign quá 500 task / call — chia batch.
- ❌ Đổi `due_date` xa hơn lặp lại — signal scope creep, bàn giao PM groom thay vì giấu.
- ❌ Tự tạo task task `type=BUG` cho "vấn đề epic" mà không qua §5.

## Tự kiểm

- [ ] Đã `query_epics(projectCode)` kiểm trùng tên TRƯỚC khi `create_epic`.
- [ ] Mọi `create_epic` / `update_epic` đổi status đã qua Confirmation Gate (§2) + User chốt.
- [ ] Owner là project member thật (không bịa user_id).
- [ ] `due_date >= start_date` (nếu cả hai set).
- [ ] Close epic CHỈ khi 100% task DONE (`query_epics(epicId)` xác nhận); ngoại lệ phải có lý do User ghi vào description.
- [ ] Bulk assign chia batch ≤ 500; check `response.skipped` cho task cross-project.
- [ ] KHÔNG tự `status="archived"` (§7).
- [ ] Đổi due_date xa hơn → đã báo User về scope creep risk.
