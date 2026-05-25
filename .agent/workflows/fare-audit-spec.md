---
name: fare-audit-spec
description: Kiểm toán một tài liệu đặc tả đã có — tìm điểm mù, edge case, lỗ hổng logic.
---

# /fare-audit-spec — Soát đặc tả

**Việc:** soi một spec đã có trên FARE, tìm điểm mù & edge case trước khi nó được dùng để code / test.
**Cú pháp:** `/fare-audit-spec [mã project] [id hoặc tên tài liệu]`
**Agent phụ trách:** `fare-spec-reviewer` (chạy theo SOP trong file agent đó).

## Luồng
1. Kích hoạt agent `fare-spec-reviewer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: khám phá ngữ cảnh (skill `fare-context-discovery`) → soi 5 lăng kính → báo cáo "Blind Spots & Edge Cases" → đề xuất khắc phục.

## Bàn giao
Khắc phục qua `add_comment` / `create_suggestion` / `create_test_cases` — theo phương án User chọn.
