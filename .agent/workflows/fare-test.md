---
name: fare-test
description: Viết test case từ spec đã có (US/UC/SRS) — map AC → n TC theo kỹ thuật ISTQB, batch tạo trên FARE.
---

# /fare-test — Viết test case

**Việc:** từ 1 spec (User Story / Use Case / SRS) đã có AC, sinh ra ma trận TC chi tiết và đẩy lên FARE.
**Cú pháp:** `/fare-test [mã project] [id spec hoặc id task type=TEST] [coverage?]`
- `[coverage?]` (tùy chọn): `smoke` · `full` (mặc định) · `regression`.
**Agent phụ trách:** `fare-qa-engineer` (chạy skill `fare-test-authoring`).

## Luồng
1. Kích hoạt agent `fare-qa-engineer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: kiểm spec có AC rõ → đảm bảo doc test_case container → soạn ma trận TC nháp → **CHỜ User chốt** → `create_test_cases` batch.

## Tiền đề CỨNG
- Spec mục tiêu PHẢI có AC (Given-When-Then) hoặc flows chi tiết. Spec mỏng → agent DỪNG, bàn giao BA `/fare-ba` bổ sung.
- Mọi TC gắn vào 1 doc `test_case` thuộc đúng `module_id` của function (rule §1).

## Bàn giao
- TC tạo xong → bàn giao **executor** chạy `/fare-verify`.
- Nếu PM có task `type=TEST` chờ → cung cấp `test_case_ids` cho PM gắn vào task.
- Spec phát hiện mơ hồ trong khi viết TC → bàn giao BA `/fare-change` hoặc `/fare-audit-spec`.
