---
name: fare-trace
description: Xây ma trận truy vết requirement ↔ use_case ↔ user_story ↔ test_case ↔ module ↔ task; phát hiện gap trước khi go-live / bàn giao QA.
---

# /fare-trace — Ma trận truy vết & gap

**Việc:** quét phạm vi User chọn (project / module / 1 doc), xâu chuỗi từ yêu cầu nghiệp vụ tới task/test, liệt kê chỗ thiếu phủ.
**Cú pháp:** `/fare-trace [mã project] [module|doc id?] [forward|backward?]`
**Agent phụ trách:** `fare-business-analyst` (chạy skill `fare-traceability`).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (Substitute / Assistant — `rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP `fare-traceability`: khoanh phạm vi → quét yêu cầu nguồn & artifact phủ → dựng ma trận → liệt kê gap theo mức rủi ro 🟥/🟧/🟨/🟩 → đề xuất hành động.

## Bàn giao
- Gap loại spec thiếu (🟥/🟧): chuyển `/fare-ba` để bổ sung use_case / user_story.
- Gap loại test thiếu (🟧): bàn giao QA (khi vai QA được xây).
- Gap loại task/link thiếu (🟨): bàn giao PM hoặc dev chạy `update_task`.
