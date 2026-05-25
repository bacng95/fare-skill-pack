---
name: fare-breakdown
description: Chia 1 Function (đã có spec đầy đủ) thành n task implementable cho dev pickup — theo layer BE/FE/DB/test/infra, batch tạo qua MCP.
---

# /fare-breakdown — Chia function thành task

**Việc:** đẩy task chi tiết lên backlog cho 1 function đã có spec.
**Cú pháp:** `/fare-breakdown [mã project] [id function] [chiến lược?]`
- `[chiến lược?]` (tùy chọn): `layer` (mặc định) · `slice` (vertical theo feature) · `dependency`.
**Agent phụ trách:** `fare-project-manager` (chạy skill `fare-task-breakdown`).

## Luồng
1. Kích hoạt agent `fare-project-manager`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: kiểm spec function đã đủ chưa → nháp danh sách task (5 layer) → trình bảng + **CHỜ User chốt** → `create_tasks` batch → gắn `links` blocks/relates_to.

## Tiền đề CỨNG
Function mục tiêu phải có spec (UC/US/SRS/api_doc/erd) gắn `module_id`. Spec mỏng → agent DỪNG và bàn giao `/fare-ba` trước. KHÔNG break task khi spec trống.

## Bàn giao
- Task `type=TASK` (BE/FE/DB) → sẵn cho **Dev** pickup qua `/fare-dev` (`fare-developer`).
- Task `type=TEST` → bàn giao **QA** viết TC chi tiết qua `/fare-test` (`fare-qa-engineer`).
- Sau breakdown, định kỳ chạy `/fare-groom` để kiểm trạng thái.
