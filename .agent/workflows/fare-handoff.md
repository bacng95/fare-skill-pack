---
name: fare-handoff
description: Sau khi dev code xong, self-verify đối chiếu DoD + TC linked, set `VERIFYING` + comment evidence (commit, file đụng, TC chạy tay), bàn giao QA `/fare-verify`. KHÔNG tự đóng DONE.
---

# /fare-handoff — Self-verify & handoff

**Việc:** chốt kết quả phần dev đã code, đẩy task sang `VERIFYING` đúng quy trình (có evidence) để QA / User pickup verify.
**Cú pháp:** `/fare-handoff [mã project] [id task]`
**Agent phụ trách:** `fare-developer` (chạy skill `fare-self-verify`).

## Luồng
1. Kích hoạt agent `fare-developer`.
2. Xác định **chế độ vận hành** (`rules/operating-mode.md`) nếu ngữ cảnh chưa rõ.
3. Agent chạy SOP: đọc lại DoD + TC linked → self-checklist (DoD / TC / impact recheck / spec contract) → gom evidence (commit, branch, file) → trình tóm tắt → **CHỜ User chốt** → `update_task(meta_status="VERIFYING", actual_effort=<giờ>)` + `add_comment` evidence → bàn giao QA.

## Tiền đề CỨNG
- Task đang `IN_PROGRESS` của dev.
- Đã có deliverable (code commit + branch). VERIFYING không có evidence là vi phạm §6.

## Bàn giao
- Task `type=TASK/TEST` có TC → QA `/fare-verify` chạy verify chính thức.
- Task `type=TASK` không TC, deliverable là code → User confirm trực tiếp; PM `/fare-groom` có thể chốt DONE.
- TC fail khi self-verify → giữ IN_PROGRESS, sửa rồi handoff lại.
- Phát hiện bug ngoài scope → hỏi User trước khi tạo BUG (rule §5).
- Spec mơ hồ phát hiện khi code → bàn giao BA `/fare-change`.
