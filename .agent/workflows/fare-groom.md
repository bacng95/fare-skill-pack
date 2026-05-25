---
name: fare-groom
description: Grooming backlog — quét task lệch trạng thái, bug chưa triage, task mồ côi; báo cáo + đề xuất hành động sửa. KHÔNG tự đổi trạng thái hàng loạt.
---

# /fare-groom — Grooming backlog

**Việc:** review backlog định kỳ (cuối ngày / cuối tuần / cuối sprint), phát hiện task lệch trạng thái và bug chưa triage.
**Cú pháp:** `/fare-groom [mã project] [plan_month_id?] [health-check|bug-triage|sprint-close?]`
- `[plan_month_id?]` (tùy chọn): ID month plan cụ thể; bỏ trống = quét toàn project.
- Loại review mặc định: `health-check`.
**Agent phụ trách:** `fare-project-manager` (chạy skill `fare-backlog-grooming`).

## Luồng
1. Kích hoạt agent `fare-project-manager`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: chốt phạm vi + ngưỡng stale → quét task/bug → báo cáo theo bucket + mức rủi ro 🟥/🟧/🟨 → đề xuất hành động → **CHỜ User chốt từng item** → `update_task` / `add_comment` tuần tự.

## Bàn giao
- Bug mới phát hiện cần track → hỏi User trước khi tạo BUG task (rule §5).
- Stale IN_PROGRESS do dev nghỉ → bàn giao team lead reassign.
- DONE chưa verify (BLOCKER) → bàn giao QA (khi vai QA có) hoặc dev cung cấp evidence.
