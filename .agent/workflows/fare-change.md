---
name: fare-change
description: Xử lý yêu cầu thay đổi (change request) trên một spec đã có — đánh giá impact, sửa nội dung trên draft, log change. KHÔNG tự duyệt.
---

# /fare-change — Yêu cầu thay đổi

**Việc:** sửa một spec đã có theo yêu cầu thay đổi của khách / stakeholder; không mất truy vết bản cũ; báo cáo impact lên artifact downstream.
**Cú pháp:** `/fare-change [mã project] [id spec] ["mô tả thay đổi"]`
**Agent phụ trách:** `fare-business-analyst` (chạy skill `fare-change-request`).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP `fare-change-request`: chốt nguồn yêu cầu → đọc bản hiện tại + bản `approved` mới nhất → **báo cáo impact** → đề xuất diff → **CHỜ User chốt** → `patch_document` / `update_document` + ghi change log.

## Bàn giao
- Sau khi sửa: gợi ý `/fare-audit-spec` để soát lại spec đã thay đổi.
- Test case / task downstream bị ảnh hưởng → bàn giao QA `/fare-qa` (regression test) / PM `/fare-groom` (re-status task).
