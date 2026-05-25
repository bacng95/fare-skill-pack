---
name: fare-qa
description: Entry chung cho vai QA — agent route theo việc User nói (viết TC · chạy verify · báo bug · soát coverage TC).
---

# /fare-qa — Entry vai QA Engineer

**Việc:** kích hoạt vai QA; agent đọc ngữ cảnh project và đề xuất bước tiếp theo theo việc User mô tả.
**Cú pháp:** `/fare-qa [mã project] [việc cần làm — mô tả tự do]`
**Agent phụ trách:** `fare-qa-engineer`.

## Luồng
1. Kích hoạt agent `fare-qa-engineer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy `fare-context-discovery` (tầng "Trạng thái QA / TC / campaign") — đọc TC hiện có, campaign, task `type=TEST` đang mở.
4. Agent định tuyến việc User mô tả vào skill phù hợp:
   - "Viết TC cho [spec / function]" → `fare-test-authoring` (gợi ý gõ `/fare-test`)
   - "Chạy verify [doc/campaign/task TEST]" → `fare-test-execution` (gợi ý gõ `/fare-verify`)
   - "Báo bug [hiện tượng]" → `fare-bug-reporting`
   - "Soát coverage TC cho [module]" → `fare-test-authoring` + bàn giao BA `/fare-trace`
   - Không rõ → hỏi User chọn 1 trong các việc trên.

## Khi nào nên gõ workflow khác thay vì /fare-qa
- Đã rõ là **viết TC mới** → gõ thẳng `/fare-test [project] [id spec hoặc task TEST]`.
- Đã rõ là **chạy verify** → gõ thẳng `/fare-verify [project] [scope] [env]`.
- Cần **viết / sửa spec** → KHÔNG dùng `/fare-qa`; dùng `/fare-ba` hoặc `/fare-change`.
- Cần **chia task implement** → KHÔNG dùng `/fare-qa`; dùng `/fare-breakdown`.

## Bàn giao
- Spec mỏng / mâu thuẫn → bàn giao BA `/fare-ba` hoặc `/fare-change`.
- BUG đã tạo → bàn giao PM `/fare-pm` gắn vào sprint (`plan_month_id`).
- Task `type=TEST` đề xuất chuyển trạng thái → bàn giao PM `/fare-groom` để batch.
- TC fail mà root cause là môi trường → bàn giao Dev `/fare-dev` (nếu code fix) hoặc DevOps (ngoài scope skill pack).
- Tạo / quản campaign → User thao tác trên FARE UI (không có MCP tool).
