---
name: fare-plan
description: Dựng / hoàn thiện cây Module → Submodule → Function (3 cấp) cho một phạm vi nghiệp vụ, đủ để gắn `module_id` cho spec. Phiên bản BA-light — không sa đà ước lượng effort.
---

# /fare-plan — Chia cây module (BA-light)

**Việc:** đề xuất + tạo Module/Submodule/Function thiếu, để spec có chỗ gắn `module_id` (rule §1).
**Cú pháp:** `/fare-plan [mã project] [phạm vi nghiệp vụ | id module gốc?]`
**Agent phụ trách:** `fare-business-analyst` (chạy skill `fare-plan-breakdown`).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: đọc cây module hiện có → đối chiếu yêu cầu nghiệp vụ → đề xuất bổ sung → **CHỜ User chốt** → `add_module` lần lượt cha→con.

## Bàn giao
- Gợi ý bước kế: `/fare-ba` để viết spec gắn vào Function vừa tạo.
- Ước lượng effort chi tiết + lên plan/version → vai **PM** (`fare-project-manager` `/fare-pm`).
