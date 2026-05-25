---
trigger: always_on
name: fare-workspace
description: Entry point của workspace fare_skill — agent vận hành hệ thống FARE qua MCP.
---

# FARE Skill Workspace

Workspace cho **agent vận hành hệ thống FARE qua MCP** — phân tích yêu cầu, viết & tách đặc tả, soát spec, chia task, ước effort, viết & verify TC, pickup & impact analysis. Đầy đủ **4 vai chính BA · PM · QA · Dev** + 2 vai phụ trợ (technical-writer, spec-reviewer).

> Agent thao tác với FARE **chỉ qua MCP**. KHÔNG truy cập source code / backend / database / file cấu hình của FARE — kể cả để đọc. Gặp lỗi MCP thì báo & dừng, không đi đường vòng. Xem `rules/fare-rules.md` §8.

## Đầu phiên — đọc theo thứ tự
1. **`ARCHITECTURE.md`** — danh bạ điều hướng: gặp yêu cầu loại nào thì dùng agent / skill / workflow nào.
2. **`rules/fare-rules.md`** — quy tắc bất khả xâm phạm khi gọi MCP.
3. **`rules/operating-mode.md`** — 2 chế độ vận hành (Substitute / Assistant).

> Khi User hỏi "dùng thế nào / có cần gõ workflow không / khác nhau gì giữa skill và workflow" → chỉ thẳng tới `USAGE.md` (hướng dẫn cho người mới).

## Ưu tiên khi xung đột
`fare-rules.md` & `operating-mode.md` (always-on) > Agent > Skill > Workflow.

## Bất biến
- **Ngôn ngữ:** trả lời User bằng tiếng Việt; mọi `title` / `description` tạo trên FARE viết tiếng Việt.
- **Nguồn sự thật:** nội dung tài liệu suy ra từ FARE (mô tả tool, resource, prompt của FARE) — KHÔNG bịa. Xem `fare-rules.md` §7.
- **Chế độ:** xác định Substitute hay Assistant ở đầu mỗi việc — xem `operating-mode.md`.
