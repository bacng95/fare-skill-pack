---
name: fare-pm
description: Entry chung cho vai PM — agent route theo việc User nói (status snapshot · tạo/cập nhật month plan · ước effort · breakdown · grooming · triage).
---

# /fare-pm — Entry vai Project Manager

**Việc:** kích hoạt vai PM; agent đọc ngữ cảnh project và đề xuất bước tiếp theo theo việc User mô tả.
**Cú pháp:** `/fare-pm [mã project] [việc cần làm — mô tả tự do]`
**Agent phụ trách:** `fare-project-manager`.

## Luồng
1. Kích hoạt agent `fare-project-manager`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy `fare-context-discovery` tầng "Trạng thái công việc / tiến độ" — đọc plan + module + task hiện có.
4. Agent định tuyến việc User mô tả vào skill phù hợp:
   - "Tạo sprint mới / month plan tháng X" → `fare-plan-versioning`
   - "Ước effort cho module/function Y" → `fare-effort-estimation`
   - "Chia task cho function Z" → `fare-task-breakdown` (gợi ý gõ `/fare-breakdown` cho rõ)
   - "Cho tôi status sprint / health-check / grooming" → `fare-backlog-grooming` (gợi ý gõ `/fare-groom`)
   - Không rõ → hỏi User chọn 1 trong các việc trên.

## Khi nào nên gõ workflow khác thay vì /fare-pm
- Đã rõ việc là **breakdown function cụ thể** → gõ thẳng `/fare-breakdown [project] [function id]` — đỡ 1 round-trip route.
- Đã rõ việc là **grooming cuối sprint** → gõ thẳng `/fare-groom [project]`.
- Cần **viết / sửa spec** → KHÔNG dùng `/fare-pm`; dùng `/fare-ba` hoặc `/fare-change` (vai BA).

## Bàn giao
- Spec thiếu / mơ hồ phát hiện trong khi PM làm việc → bàn giao BA `/fare-ba` hoặc `/fare-trace`.
- Task `type=TEST` cần TC chi tiết → bàn giao **QA** `/fare-test` (`fare-qa-engineer`).
- Task BE/FE cần pickup & code → bàn giao **Dev** `/fare-dev` (`fare-developer`).
- Publish DRAFT → PUBLIC plan version → User thao tác trên FARE UI (agent không tự publish).
