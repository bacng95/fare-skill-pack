---
name: fare-write-doc
description: Viết tài liệu kỹ thuật (API doc, ERD, diagram, specification...) và đồng bộ lên FARE.
---

# /fare-write-doc — Viết tài liệu kỹ thuật

**Việc:** viết / cập nhật một tài liệu kỹ thuật trên FARE.
**Cú pháp:** `/fare-write-doc [mã project] [loại tài liệu?] [module?]`
**Agent phụ trách:** `fare-technical-writer` (chạy theo SOP trong file agent đó).

## Luồng
1. Kích hoạt agent `fare-technical-writer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: xác nhận loại tài liệu + module đích → khảo sát ngữ cảnh (skill `fare-context-discovery`) → viết đúng format / schema → đồng bộ FARE (`status="draft"`).

## Bàn giao
Gợi ý bước kế: `/fare-audit-spec` để soát tài liệu vừa viết.
