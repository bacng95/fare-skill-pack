---
name: fare-epic
description: Quản epic ở cấp PLAN ITEM (cây theme › epic › story) — thêm epic dưới một theme, đổi tên/mô tả, đặt effort_est_level, gom story. Vai PM/BA. LƯU Ý bản FARE mới đã bỏ "Epic initiative độc lập" (status/owner/at_risk/bulk-assign).
---

# /fare-epic — Epic ở cấp Plan item

**Việc:** thao tác epic trong cây plan item — thêm epic dưới theme, đổi tên/mô tả, đặt `effort_est_level`, sắp story.
**Cú pháp:** `/fare-epic [mã project] [hành động? | id epic?]`
**Đầu vào người dùng:** $ARGUMENTS
- Không tham số sau project → liệt epic hiện có (`list_plan_items` lọc `type="epic"`), hỏi User muốn làm gì.
- `[hành động?]`: `add` · `rename` · `effort` · `organize`.
- `[id epic?]`: làm việc với 1 epic cụ thể.

**Agent phụ trách:** `fare-project-manager` (chạy skill `fare-epic-management`).

> ⚠️ Bản FARE mới KHÔNG còn `create_epic`/`update_epic`/`query_epics`, không status/owner/at_risk/due_date/bulk-assign của epic. Epic giờ là **cấp giữa** của cây WBS — thao tác qua `add_plan_item`/`update_plan_item`/`list_plan_items`. <!-- lint:allow -->

## Luồng
1. Kích hoạt agent `fare-project-manager`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP `fare-epic-management`:
   - **Thêm epic:** `list_plan_items` lấy `id` theme cha → trình nháp → CHỜ User chốt → `add_plan_item(type="epic", parent_id=<theme>)`.
   - **Đổi tên/mô tả/effort:** `update_plan_item(itemId, name=…/comment=…/effort_est_level="L2")`. Epic KHÔNG nhận complexity/scope/clarity (đó là story).
   - **Sắp story:** tạo `add_plan_item(type="story", parent_id=<epicId>)` hoặc đổi `parent_id` story (di chuyển — §2).

## Bàn giao
- Dựng cả cây từ phạm vi nghiệp vụ → BA `/fare-plan` (`fare-plan-breakdown`).
- Ước effort story (complexity/scope/clarity) → `fare-effort-estimation`.
- Task mới gom dưới story → PM `/fare-breakdown`.
- Spec cho phạm vi epic → BA `/fare-ba`.
- Soát task lệch trạng thái → PM `/fare-groom`.
- Quản campaign QA / release (khác plan item) → User thao tác trên FARE UI; agent không có MCP tool campaign.
