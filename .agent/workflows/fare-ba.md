---
name: fare-ba
description: Phân tích yêu cầu nghiệp vụ → viết Use Case / User Story lên FARE; hoặc tách & chuẩn hóa một tài liệu yêu cầu nguyên khối.
---

# /fare-ba — Phân tích nghiệp vụ

**Việc:** biến một yêu cầu / tính năng — hoặc một tài liệu yêu cầu nguyên khối — thành đặc tả chuẩn trên FARE.
**Cú pháp:** `/fare-ba [mã project] [tên tính năng | id tài liệu cần tách]`
**Agent phụ trách:** `fare-business-analyst` (chạy theo SOP trong file agent đó).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (Substitute / Assistant — `rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: khám phá ngữ cảnh (skill `fare-context-discovery`) → Socratic Gate → viết đặc tả nghiệp vụ. Nếu là tách / chuẩn hóa tài liệu có sẵn → dùng skill `fare-doc-split`.
4. Đồng bộ FARE (`status="draft"`, gắn `module_id`), trả URI tài liệu cho User.

## Bàn giao
Gợi ý bước kế: `/fare-audit-spec` để soát đặc tả vừa viết.
