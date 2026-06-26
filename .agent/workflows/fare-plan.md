---
name: fare-plan
description: Dựng / hoàn thiện cây plan item theme › epic › story (3 cấp) cho một phạm vi nghiệp vụ, đủ để gắn spec & task (`plan_item_id` = id story cấp lá). Phiên bản BA-light — không sa đà ước lượng effort.
---

# /fare-plan — Chia cây plan item (BA-light)

**Việc:** đề xuất + tạo theme/epic/story thiếu, để spec & task có chỗ gắn (rule §1).
**Cú pháp:** `/fare-plan [mã project] [phạm vi nghiệp vụ | id plan item gốc?]`
**Đầu vào người dùng:** $ARGUMENTS
**Agent phụ trách:** `fare-business-analyst` (chạy skill `fare-plan-breakdown`).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: đọc cây hiện có (`list_plan_items`) → đối chiếu yêu cầu nghiệp vụ → đề xuất bổ sung → **CHỜ User chốt** → `add_plan_item` lần lượt cha→con (theme → epic → story).

## Bàn giao
- Gợi ý bước kế: `/fare-ba` để viết spec gắn vào Story vừa tạo.
- Ước lượng effort chi tiết + lên plan/version → vai **PM** (`fare-project-manager` `/fare-pm`).
