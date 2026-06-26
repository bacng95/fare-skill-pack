---
name: fare-plan-review
description: Chấm / kiểm toán một cây plan item (theme › epic › story) đã có theo rubric chất lượng — story nghiệm thu được, đúng trục giá trị, không tầng giả, đủ 3 tầng. Báo cáo điểm + đề xuất sửa, CHỜ User chốt. Vai BA. Dựng cây mới → /fare-plan.
---

# /fare-plan-review — Chấm cây Theme/Epic/Story

**Việc:** soi một cây plan item đã có, chấm từng story/epic/theme + cấu trúc tổng thể theo rubric, đề xuất sửa.
**Cú pháp:** `/fare-plan-review [mã project] [id theme / phạm vi?]`
**Đầu vào người dùng:** $ARGUMENTS
**Agent phụ trách:** `fare-business-analyst` (chạy skill `fare-plan-review`).

## Luồng
1. Kích hoạt agent `fare-business-analyst`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP `fare-plan-review`: khoanh phạm vi → `list_plan_items` dựng cây → chấm rubric (story/epic/theme/cây) → **báo cáo điểm + chưa-đạt** → đề xuất sửa (rename / di chuyển / tách / gỡ vỏ rỗng) → **CHỜ User chốt** (§2), KHÔNG tự restructure.

## Bàn giao
- Sửa cấu trúc đã chốt → thực thi qua `update_plan_item` / `add_plan_item` / `delete_plan_item` (skill này).
- Dựng cây mới / bổ sung nhánh → `/fare-plan` (`fare-plan-breakdown`).
- Ước effort story/epic sau khi cây sạch → `/fare-pm` (`fare-effort-estimation`).
- Break story thành task → `/fare-breakdown`.
