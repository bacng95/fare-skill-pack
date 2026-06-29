---
name: fare-ba
description: Phân tích yêu cầu nghiệp vụ → viết Use Case / User Story lên FARE; hoặc tách & chuẩn hóa một tài liệu yêu cầu nguyên khối.
---

# /fare-ba — Phân tích nghiệp vụ

**Việc:** biến một yêu cầu / tính năng — hoặc một tài liệu yêu cầu nguyên khối — thành đặc tả chuẩn trên FARE.
**Cú pháp:** `/fare-ba [mã project] [tên tính năng | id tài liệu cần tách]`
**Đầu vào người dùng:** $ARGUMENTS
**Agent phụ trách:** `fare-business-analyst` (chạy theo SOP trong file agent đó).

## Tiền điều kiện
- **Project phải tồn tại** (có project code, `list_projects` thấy). Tạo project là việc người (UI FARE) → chưa có thì **DỪNG**, đề nghị User tạo rồi đưa code. KHÔNG tự khởi tạo project.
- **Spec cần chỗ gắn:** nếu tính năng chưa có nhánh `plan_item_id` (story) trong cây → chạy `/fare-plan` dựng cây trước (rule §1, không doc mồ côi). Có thể nháp local trong `docs/outputs/` trước khi có chỗ gắn.

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (Substitute / Assistant — `rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: khám phá ngữ cảnh (skill `fare-context-discovery`) → Socratic Gate → viết đặc tả nghiệp vụ. Nếu là tách / chuẩn hóa tài liệu có sẵn → dùng skill `fare-doc-split`.
4. Đồng bộ FARE (doc mặc định `draft`, gắn `plan_item_id`), báo User **tiêu đề + breadcrumb vị trí** (rule §4), KHÔNG trả URI trần.

## Bàn giao
Gợi ý bước kế: `/fare-audit-spec` để soát đặc tả vừa viết.
