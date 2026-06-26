---
name: fare-epic-management
description: Quản epic ở cấp PLAN ITEM (cây theme › epic › story) trên FARE — tạo epic dưới một theme, đặt effort_est_level (L1-L4), gom/sắp story vào epic, đổi tên/mô tả. Vai PM/BA. LƯU Ý bản FARE mới đã bỏ "Epic initiative độc lập" (status/owner/at_risk/bulk-assign) — epic giờ chỉ là cấp giữa của WBS.
---

# fare-epic-management — Epic ở cấp Plan item

> ⚠️ **Đổi mô hình:** bản FARE mới KHÔNG còn "Epic initiative" độc lập (không
> còn `create_epic`/`update_epic`/`query_epics`, không status/owner/at_risk/ <!-- lint:allow -->
> due_date/bulk-assign). **Epic giờ là cấp GIỮA** của cây plan item
> `theme › epic › story` — quản qua `add_plan_item`/`update_plan_item`/
> `list_plan_items`/`delete_plan_item`. Đọc `fare-mcp-integration` mục "Cây WBS
> = Plan item" trước. Skill này overlap nhiều với `fare-plan-breakdown` — dùng
> nó khi việc tập trung riêng vào tầng epic.

Dùng khi PM/BA cần: thêm một epic dưới theme · đổi tên/mô tả epic · đặt `effort_est_level` cho epic · sắp xếp story vào đúng epic.

KHÔNG thuộc skill này: dựng cả cây từ đầu (→ `fare-plan-breakdown`); ước effort story chi tiết (→ `fare-effort-estimation`); tạo task (→ `fare-task-breakdown`); viết spec (→ BA `fare-spec-authoring`).

## Tiền đề
- **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết project + cây plan item hiện có (`list_plan_items`).
- Tuân `rules/fare-rules.md`: §2 Confirmation Gate (mọi thay đổi cấu trúc cây cần User chốt); §4 (không truyền `null` / field lệch cấp).

## Thao tác

### 1. Thêm epic mới dưới một theme — `add_plan_item(type="epic")`
1. Xác định **theme cha** (epic BẮT BUỘC có `parent_id` là một theme): `list_plan_items(projectCode)` → lấy `id` theme.
2. Đặt tên epic theo **năng lực gắn kết** trong theme (vd theme "Quản lý Người dùng" → epic "Hồ sơ Người dùng", "Phòng ban"). Tránh tên quá chung.
3. Trình nháp + **CHỜ User chốt** (§2):
   ```
   add_plan_item:
     projectCode: FCORE
     type: epic
     parent_id: 257   # theme "Quản lý Người dùng"
     name: "Hồ sơ Người dùng"
     effort_est_level: L2   # tùy chọn — xem fare-effort-estimation
   ```
4. Gọi tool → trả `item.id` (code dạng `E#`). Có thể tiếp Bước 3 gom story.

### 2. Đổi tên / mô tả / effort — `update_plan_item`
- `update_plan_item(itemId, name=..., comment=...)` — đổi tên/mô tả.
- `update_plan_item(itemId, effort_est_level="L3")` — đặt mức effort epic (L1=7, L2=10, L3=20, L4=30 man-day). Epic **KHÔNG** nhận complexity/scope/clarity (đó là story — lỗi 400 nếu truyền nhầm).
- Chỉ truyền field thay đổi — không `null` (§4).

### 3. Sắp story vào đúng epic
- Story nằm sai chỗ → đổi cha: `update_plan_item(storyItemId, ...)` (đổi `parent_id` = di chuyển — coi `add_plan_item` schema để xác nhận field; di chuyển cấu trúc phải User chốt §2).
- Story chưa có → tạo: `add_plan_item(type="story", parent_id=<epicId>, ...)` (xem `fare-plan-breakdown`).

### 4. Xóa epic rỗng — `delete_plan_item(itemId, confirm=true)`
- Server CHẶN xóa item còn task / có lịch sử commit. Chỉ xóa được epic rỗng.
- Chỉ gọi khi User nói rõ "xóa" (§2) + `confirm=true`.

## Phối hợp với skill khác

| Tình huống | Bàn giao |
|---|---|
| Dựng cả cây theme/epic/story từ phạm vi nghiệp vụ | BA `/fare-plan` (`fare-plan-breakdown`) |
| Ước effort story (complexity/scope/clarity) hoặc epic level | `fare-effort-estimation` |
| Tạo task gom dưới một story | PM `/fare-breakdown` (`fare-task-breakdown`) |
| Cần spec cho phạm vi epic | BA `/fare-ba` (`fare-spec-authoring`) |
| Soát task lệch trạng thái trong cây | PM `/fare-groom` (`fare-backlog-grooming`) |

## Anti-patterns
- ❌ Tìm tool `create_epic`/`update_epic`/`query_epics` — đã bị gỡ. Dùng `add_plan_item`/`update_plan_item`/`list_plan_items`. <!-- lint:allow -->
- ❌ Tạo epic không `parent_id` (epic phải nằm dưới theme).
- ❌ Đặt story thẳng dưới theme/root, bỏ qua cấp epic khi nghiệp vụ rõ ràng có nhóm.
- ❌ Truyền `complexity`/`scope`/`clarity` cho epic (sai cấp — lỗi 400).
- ❌ Đổi `parent_id` (di chuyển cây) mà chưa User chốt (§2).
- ❌ `delete_plan_item` khi item còn task / chưa User xác nhận.

## Tự kiểm
- [ ] Đã `list_plan_items` lấy đúng `id` theme cha trước khi `add_plan_item(type="epic")`.
- [ ] Epic có `parent_id` trỏ một theme.
- [ ] `effort_est_level` đúng cho epic; KHÔNG truyền complexity/scope/clarity.
- [ ] Mọi thay đổi cấu trúc cây đã qua Confirmation Gate (§2).
- [ ] `update_plan_item` chỉ truyền field thay đổi — không `null` (§4).
- [ ] Xóa epic chỉ khi rỗng + User xác nhận + `confirm=true`.
