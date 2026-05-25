---
name: fare-epic
description: Quản Epic / initiative cross-module — tạo epic mới, đổi status (planned/in_progress/at_risk/done), gán owner + dates, bulk assign tasks, close khi 100% task DONE. Vai PM. Phân biệt Epic ≠ Module ≠ Campaign.
---

# /fare-epic — Quản Epic

**Việc:** CRUD Epic / initiative — tạo mới, đổi status / owner / dates, bulk assign tasks, đề xuất close khi đủ điều kiện.
**Cú pháp:** `/fare-epic [mã project] [hành động? | id epic?]`
- Không tham số sau project → liệt epic hiện có (`query_epics` LIST), hỏi User muốn làm gì.
- `[hành động?]`: `create` · `status` · `assign-tasks` · `close`.
- `[id epic?]`: làm việc với 1 epic cụ thể.

**Agent phụ trách:** `fare-project-manager` (chạy skill `fare-epic-management`).

## Luồng
1. Kích hoạt agent `fare-project-manager`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP `fare-epic-management`:
   - **Tạo:** Socratic 2 câu (tên + owner + status + dates + color + desc) → trình nháp → CHỜ User chốt → `create_epic`.
   - **Đổi status:** `query_epics(epicId)` lấy state hiện tại → đề xuất status mới + lý do → CHỜ chốt → `update_epic`. Close → kiểm 100% task DONE (rule cứng).
   - **Bulk assign:** `list_tasks` lọc ứng viên → trình + CHỜ chốt → `update_epic(task_ids_to_assign)` ≤ 500 / batch.

## Bàn giao
- Cần spec cấp initiative → BA `/fare-ba` viết BRD/SRS, có thể đề xuất tạo Epic kèm.
- Task chưa tồn tại cần tạo mới + gắn epic → PM `/fare-breakdown` (Bước 0 hỏi epic).
- Grooming epic (at_risk / quá hạn / no owner) → PM `/fare-groom`.
- Quản campaign QA / release (khác epic) → User thao tác trên FARE UI; agent không có MCP tool campaign.
- Archive epic sau done → User thao tác trên UI (agent không tự archive — §7).
