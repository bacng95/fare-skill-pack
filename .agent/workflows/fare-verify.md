---
name: fare-verify
description: Chạy verify cho 1 round test case — ghi verify_history atomic, đối chiếu task `type=TEST` của PM (đề xuất DONE/IN_PROGRESS), khi fail thì handoff bug-reporting.
---

# /fare-verify — Chạy verify TC

**Việc:** chạy 1 round verify cho danh sách TC (1 doc test_case · 1 campaign · 1 task TEST · danh sách id), ghi kết quả + đề xuất chuyển trạng thái task PM.
**Cú pháp:** `/fare-verify [mã project] [scope: doc_id|task_id|campaign_id] [env: dev|staging|prod?]`
**Agent phụ trách:** `fare-qa-engineer` (chạy skill `fare-test-execution`).

## Luồng
1. Kích hoạt agent `fare-qa-engineer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: chốt phạm vi & env → liệt kê TC + stats → trình từng TC + nhận kết quả → tóm tắt round → **CHỜ User chốt** → `update_test_case(verify={...})` tuần tự → đối chiếu task `type=TEST` để đề xuất 4-state.

## Bàn giao
- TC `failed` → hỏi User tạo BUG (rule §5) → bàn giao skill `fare-bug-reporting`.
- TC `blocked` do môi trường → bàn giao Dev `/fare-dev` (nếu code fix) hoặc DevOps (ngoài scope skill pack).
- Task `type=TEST` đề xuất DONE / IN_PROGRESS → bàn giao PM `/fare-groom` xác nhận chuyển trạng thái nếu muốn batch.
