---
name: fare-impact
description: TRƯỚC khi sửa 1 symbol — quét blast radius qua FARE code intelligence (code_query/context/impact/route_map), phân loại rủi ro d=1/2/3, đề xuất phương án sửa. HIGH/CRITICAL phải chờ User chốt trước khi User mở IDE.
---

# /fare-impact — Impact analysis trước khi sửa code

**Việc:** quét blast radius của 1 symbol (function/class/method) trước khi dev sửa; phòng tránh "sửa 1 chỗ gãy 10 chỗ".
**Cú pháp:** `/fare-impact [mã project] [tên symbol] [loại thay đổi?]`
- `[loại thay đổi?]` (tùy chọn): `signature-change` · `rename` · `behavior-change` · `add-field` · `delete`.
**Agent phụ trách:** `fare-developer` (chạy skill `fare-impact-analysis`).

## Luồng
1. Kích hoạt agent `fare-developer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: `code_context` → `code_impact(upstream)` (+ `code_route_map` nếu BE) → phân loại rủi ro CRITICAL/HIGH/MEDIUM/LOW → báo cáo + đề xuất phương án → **CHỜ User chốt phương án** TRƯỚC khi sửa.

## Tiền đề CỨNG
- Project đã có code index trên FARE. Tools `code_*` phải trả dữ liệu thật. Chưa có index → agent DỪNG, báo User re-index trước.
- Đang có task `IN_PROGRESS` (từ `/fare-dev` pickup) — biết phạm vi sắp đụng symbol nào.

## Bàn giao
- d=1 rộng → effort thực tế lệch est → bàn giao PM `/fare-groom` cập nhật effort hoặc chia task.
- Spec đa nghĩa do đụng nhiều flow → bàn giao BA `/fare-audit-spec`.
- Cần regression test cho d=1/d=2 → bàn giao QA `/fare-test` viết thêm TC.
