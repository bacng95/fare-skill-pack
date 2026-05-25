---
name: fare-dev
description: Entry chung cho vai Dev — agent route theo việc User nói (pickup task · impact analysis · self-verify handoff · status IN_PROGRESS hiện tại).
---

# /fare-dev — Entry vai Developer

**Việc:** kích hoạt vai Dev (trợ lý quy trình); agent đọc ngữ cảnh task hiện tại của dev và đề xuất bước tiếp theo.
**Cú pháp:** `/fare-dev [mã project] [việc cần làm — mô tả tự do]`
**Agent phụ trách:** `fare-developer`.

## Luồng
1. Kích hoạt agent `fare-developer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy `fare-context-discovery` (tầng task + code) — đọc task IN_PROGRESS của dev, backlog TODO, blocker.
4. Agent định tuyến việc User mô tả vào skill phù hợp:
   - "Pickup task tiếp theo" / không nói gì cụ thể → `fare-task-pickup` (chọn + load + IN_PROGRESS)
   - "Sắp sửa symbol X" → bàn `/fare-impact`
   - "Code xong, handoff" → bàn `/fare-handoff`
   - "Status task của tôi" → liệt kê IN_PROGRESS + VERIFYING + blocker
   - Không rõ → hỏi User chọn.

## Lưu ý CỐT LÕI
**Agent không tự code.** Việc viết / sửa file code là Dev USER tự làm trong IDE (rule §8). Agent đứng ngoài hỗ trợ:
- Chọn task & load bối cảnh.
- Impact analysis qua FARE code intelligence (MCP, không truy cập file).
- Self-checklist DoD + ghi evidence.
- Sync task lifecycle (TODO → IN_PROGRESS → VERIFYING).

## Khi nào nên gõ workflow khác thay vì /fare-dev
- Đã rõ là **impact analysis 1 symbol** → gõ thẳng `/fare-impact [project] [tên symbol]`.
- Đã rõ là **handoff task** → gõ thẳng `/fare-handoff [project] [id task]`.
- Cần **chia task / re-estimate** → KHÔNG dùng `/fare-dev`; bàn PM `/fare-pm` hoặc `/fare-groom`.
- Cần **chạy verify chính thức** → KHÔNG dùng `/fare-dev`; bàn QA `/fare-verify`.

## Bàn giao
- Spec mỏng / mâu thuẫn → bàn BA `/fare-ba` hoặc `/fare-change`.
- Effort lệch ước / cần chia thêm task → bàn PM `/fare-groom`.
- Code xong + handoff → bàn QA `/fare-verify`.
- Phát hiện bug ngoài scope → hỏi User (§5) trước khi tạo BUG; sau đó bàn PM gắn sprint.
