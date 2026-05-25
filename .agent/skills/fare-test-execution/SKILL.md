---
name: fare-test-execution
description: Chạy verify cho test cases trên FARE — ghi `verify_history` atomic qua `update_test_case(verify={...})`, cập nhật `verify_status` (passed/failed/blocked/skipped); đối chiếu task `type=TEST` của PM (đủ điều kiện DONE khi mọi TC linked passed). KHÔNG tự fix code khi fail (Dev), KHÔNG tự sửa TC khi thấy sai (QA-author).
---

# fare-test-execution — Chạy & verify test case

Dùng khi: TC đã có (status `draft` / `ready`), cần chạy thật và ghi nhận kết quả; hoặc PM bàn giao task `type=TEST` ở trạng thái `VERIFYING` cần QA verify.

KHÔNG thuộc skill này: viết TC mới (→ `fare-test-authoring`); tạo BUG khi fail (→ `fare-bug-reporting`); fix code (→ `fare-developer` `/fare-dev`); đổi nội dung TC (→ `fare-test-authoring` hoặc `add_comment` đề xuất sửa).

## Tiền đề
- Bản đồ ngữ cảnh — biết doc test_case / module / campaign mục tiêu.
- TC đã ở trạng thái `ready` hoặc `draft` đã được User chốt chạy.
- Tuân `rules/fare-rules.md`: §2 Confirmation Gate (mỗi round verify nhiều TC = batch quyết định, cần User xác nhận), §6 (task 4-state — VERIFYING → DONE chỉ khi evidence pass), §5 (bug discovery — không tự `create_tasks(type=BUG)`).

## Mô hình verify_status trên FARE

| `verify_status` | Khi nào dùng |
|---|---|
| `pending` | TC chưa được chạy lần nào trong round này (mặc định) |
| `passed` | Chạy hết steps, actual khớp expected |
| `failed` | Chạy hết steps, actual KHÔNG khớp expected (hoặc một step lỗi) |
| `blocked` | Không chạy được vì điều kiện ngoài (môi trường down, prerequisite fail) |
| `skipped` | Cố ý bỏ qua (vd platform không hỗ trợ, đã defer) |

**`verify_history`** = mảng append-only mọi round verify. Mỗi entry có `verify_status`, `actual_result`, `note`, `linked_task_id`, `verified_by`, `verified_at` (FARE tự stamp).

Ghi: **`update_test_case(testCaseId, verify={...})`** — đây là cách DUY NHẤT đúng. Không sửa trực tiếp `verify_history` qua `update_test_case` field khác.

## Bước 0 — Chốt phạm vi round

Hỏi & CHỜ:
- **Round verify trên TC nào:** 1 doc test_case (`list_test_cases(document_id=...)`), 1 campaign (xem `fare://projects/{code}/campaigns`), 1 task `type=TEST` (tra `test_case_ids`), hay 1 danh sách id cụ thể.
- **Filter:** chỉ TC `verify_status="pending"`, hay rerun cả `failed`/`blocked`? Mặc định chỉ `pending` + `failed` round trước.
- **Môi trường chạy:** dev / staging / prod — ghi vào `note` để truy nguồn.
- **Cách verify:** chạy tay (User chạy, agent ghi kết quả), hay tự động (CI cited)?

## Bước 1 — Lấy danh sách TC + đọc chi tiết

`list_test_cases(projectCode, document_id?, verify_status="pending", limit=50, include_stats=true)`:
- Có thống kê tổng (total/passed/failed/pending) trước khi chạy → User thấy quy mô.
- Lấy từng TC chi tiết: `get_test_case(testCaseId)` để có `steps[]`, `preconditions`, `expected_result`.

## Bước 2 — Verify từng TC (hoặc batch theo round)

Với mỗi TC, agent **trình** ra:
```
TC-101 [Positive] Đăng nhập — đúng credential
Preconditions: User user@x.com đã đăng ký
Steps:
  1. Mở /login → Form hiển thị
  2. Nhập email + mật khẩu → field nhận input
  3. Nhấn Đăng nhập → chuyển Dashboard, toast OK
Expected: Dashboard hiển thị, session token tồn tại
```

Sau đó hỏi User (hoặc nhận output CI):
- Pass / Fail / Blocked / Skipped?
- Nếu fail → `actual_result` thực tế là gì?
- Note bổ sung (env, browser, data...)?

## Bước 3 — Ghi verify atomic

**Mỗi TC một lời gọi `update_test_case`** (KHÔNG có batch verify — gọi tuần tự, nhưng cần User xác nhận round chứ không phải từng TC):
```json
{
  "testCaseId": 101,
  "verify": {
    "verify_status": "passed",
    "actual_result": "Đã chuyển Dashboard sau 1.2s, token tồn tại trong cookie",
    "note": "Chrome 122, staging env",
    "linked_task_id": 87
  }
}
```

`linked_task_id` (optional): id task gốc mà TC này verify (task `type=TEST` của PM, hoặc task feature gốc). Khi fail → sẽ nối thêm id BUG task mới tạo (xem `fare-bug-reporting`).

**Confirmation Gate (§2):** trước khi gọi `update_test_case` hàng loạt, trình tóm tắt round:
```
Round verify — Doc test_case 245 — staging:
| TC | Kết quả | Note |
|---|---|---|
| TC-101 | passed | — |
| TC-102 | failed | actual: 500 thay vì 200 |
| TC-103 | blocked | DB seed lỗi |

Sẽ gọi 3 update_test_case. OK?
```

User chốt → thực thi tuần tự. Mỗi fail dừng lại hỏi: "tạo BUG task để track không?" (xem `fare-bug-reporting`).

## Bước 4 — Đối chiếu với task `type=TEST` của PM

Task `type=TEST` chỉ vào `DONE` khi **mọi TC linked có verify_history.passed** (rule §6 cứng).

Sau round verify:
1. `list_tasks(projectCode, type="TEST")` lọc task có `test_case_ids` chứa TC vừa verify.
2. Với mỗi task: tổng hợp `verify_status` của tất cả TC linked.
   - **Tất cả `passed`** → đề xuất `update_task(taskId, meta_status="DONE")` + `add_comment` chứa kết quả tóm tắt (round, env, link evidence).
   - **Có ≥1 `failed`** → đề xuất `update_task(meta_status="IN_PROGRESS")` (lùi về để dev fix) + `add_comment` chỉ rõ TC fail nào.
   - **Có `blocked`/`pending`** → giữ `VERIFYING`, thêm comment báo trạng thái.
3. **CHỜ User chốt** trước khi đổi trạng thái task (§2).

KHÔNG tự chuyển task sang DONE chỉ vì "round này pass" — phải đếm CẢ TC linked. Sót 1 TC chưa verify = không đủ điều kiện DONE.

## Bước 5 — Báo cáo & bàn giao

Báo cáo round (kèm breakdown theo epic nếu task verify có `epic_id`):
```
## Round verify — {phạm vi} — {yyyy-mm-dd HH:mm}
Tổng: 12 TC | passed 9 | failed 2 | blocked 1

### Theo Epic (nếu task có epic_id — tra qua `task.epic_id` → `query_epics(epicId)`)
| Epic | Pass | Fail | Block | Trạng thái |
|---|---|---|---|---|
| "Onboarding Q2 2026" (id=5) | 6 | 1 | 0 | 🟧 — 1 TC fail cần fix trước due 2026-06-30 |
| "Payment v3" (id=8) | 3 | 1 | 1 | 🟧 — fix + clear blocker môi trường |
| (không epic) | 0 | 0 | 0 | — |

### Failed (2)
- TC-102 [Negative] ... → actual "...". Đề xuất tạo BUG (xem fare-bug-reporting).
- TC-105 [Boundary] ... → actual "...". Đã có BUG-FARE-200 trùng (linked).

### Blocked (1)
- TC-103 — DB seed lỗi. Bàn giao Dev kiểm môi trường staging.

### Task type=TEST ảnh hưởng
- TASK-FARE-87 (TEST module Login): 5/5 TC linked passed → đề xuất chuyển DONE.
- TASK-FARE-88 (TEST module Auth): 3/5 passed, 2 failed → đề xuất lùi IN_PROGRESS, comment liệt kê fail.
```

Bàn giao:
- **Failed TC** → hỏi User tạo BUG → bàn skill `fare-bug-reporting`.
- **Blocked do môi trường** → bàn giao Dev `/fare-dev` (nếu cần code fix) hoặc DevOps (ngoài scope skill pack — User xử lý tay).
- **Task TEST chuyển trạng thái** → đề xuất + chờ User chốt; nếu PM đang dùng `/fare-groom` → có thể gộp.

## Anti-patterns

- ❌ Tự sửa nội dung TC khi thấy sai trong lúc verify — phải `add_comment` đề xuất sửa hoặc bàn giao `fare-test-authoring`. Sửa TC để "ép pass" = gian lận §7.
- ❌ Tự đóng task `type=TEST` → DONE khi không tổng hợp đủ verify của TẤT CẢ TC linked (§6).
- ❌ Tự tạo BUG khi TC fail (vi phạm §5) — phải hỏi User trước.
- ❌ Bỏ qua `actual_result` khi fail — không có evidence, lần sau review không hiểu.
- ❌ Verify hàng loạt mà chưa trình tóm tắt round + User chốt (§2).
- ❌ Quên truyền `linked_task_id` khi verify TC nằm trong task `type=TEST` của PM — mất truy nguồn ngược.
- ❌ Sửa `verify_history` field bằng `update_test_case(content=...)` — phải qua `verify={...}` atomic.

## Tự kiểm

- [ ] Phạm vi round (TC nào, môi trường, mode) đã chốt với User.
- [ ] Đã `include_stats=true` để biết quy mô trước khi chạy.
- [ ] Mỗi TC trình ra steps + expected TRƯỚC khi hỏi kết quả (User không cần mở FARE).
- [ ] Tóm tắt round đã trình + User chốt TRƯỚC khi `update_test_case` hàng loạt (§2).
- [ ] Mỗi `verify` có `actual_result` khi fail; `note` ghi env / browser / dataset.
- [ ] `linked_task_id` truyền khi TC nằm trong task `type=TEST`.
- [ ] Task `type=TEST` chỉ đề xuất DONE khi MỌI TC linked passed (§6).
- [ ] Fail → bàn giao `fare-bug-reporting` (hỏi User trước create BUG, §5).
- [ ] KHÔNG tự sửa nội dung TC để ép pass.
