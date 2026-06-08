---
name: fare-self-verify
description: Sau khi dev code xong, TỰ kiểm trước khi push & handoff sang QA — đối chiếu DoD trong task description, đối chiếu TC linked, set `meta_status="VERIFYING"` + `add_comment` evidence (commit hash, file đụng, TC nào đã pass tay, link branch/PR). KHÔNG tự set DONE — đó là sau khi QA verify hoặc User confirm. KHÔNG tự code; chỉ xác minh & sync metadata.
---

# fare-self-verify — Self-verify & handoff task

Dùng khi: dev đã code xong 1 task `IN_PROGRESS`, cần chuyển sang `VERIFYING` đúng cách để QA hoặc User pickup verify.

KHÔNG thuộc skill này: tự code (Dev USER); chạy verify chính thức (→ QA `fare-test-execution`); đóng task DONE (chỉ QA / User sau khi pass).

## Tiền đề
- Task đang `IN_PROGRESS`, dev tự nhận đã code xong (cả unit test nếu có).
- Tuân `rules/fare-rules.md`: §6 (4-state — chỉ vào VERIFYING khi đã có deliverable; KHÔNG nhảy thẳng DONE), §2 Confirmation Gate, §5 (nếu phát hiện bug khác trong khi self-verify → hỏi User trước).

## ⚠️ Rule cứng từ §6

> VERIFYING = Code đã hoàn thành + push (nếu cần) → chờ verify (TC pass, user confirm, hoặc QA test).
> KHÔNG chuyển sang DONE chỉ vì "code đã commit/push" hoặc "build pass" — đó là điều kiện ĐỦ cho VERIFYING, không phải DONE.
> Task `type=TEST` chỉ vào DONE khi mọi TC liên quan có `update_test_case(verify={verify_status:"passed"})` ghi trong `verify_history`.

## Quy trình

### Bước 1 — Đọc lại DoD & TC

1. `list_tasks(id=<task id>)` lấy lại description (có Definition of Done).
2. Liệt kê `test_case_ids` linked → `get_test_case` từng cái nếu nhiều, hoặc `list_test_cases(document_id=...)` nếu cùng doc.
3. Đọc lại comment scope đã viết khi `IN_PROGRESS` (Bước 4 của `fare-task-pickup`).

### Bước 2 — Self-checklist đối chiếu

Hỏi dev (CHỜ trả lời từng câu):

**A. DoD trong task description**
- [ ] Mỗi gạch DoD đã tick? (vd "Code merge vào branch chính", "Test pass", "Document API update")
- [ ] Mục nào CHƯA tick → ghi rõ lý do (vd "doc API chưa update vì contract không đổi") — nếu là lý do hợp lệ → vẫn handoff được; nếu chưa làm → quay lại code.

**B. TC linked (nếu có)**
- [ ] Đã chạy tay từng TC chưa? Step nào fail → quay lại sửa.
- [ ] Note `actual_result` cho mỗi TC để QA dùng khi `update_test_case(verify={...})` (không bắt buộc, nhưng giúp QA verify nhanh).
- [ ] TC nào dev không chạy tay được (cần data thật / quyền admin / môi trường staging) → ghi rõ — QA sẽ chạy.

**C. Code intelligence**
- [ ] Sau khi sửa, đã chạy lại `code_impact(<symbol>, "upstream")` xem caller d=1 có break không? (nếu impact-analysis trước báo HIGH)
- [ ] File đụng có khớp với scope đã commit trong comment IN_PROGRESS không? Lệch nhiều → giải thích.

**D. Spec / contract**
- [ ] Nếu task đổi API contract → đã `update_document(api_doc id, ...)` chưa? Quên = phá hợp đồng (bàn giao BA hoặc tự update qua `fare-technical-writer`).
- [ ] Nếu sửa schema DB → ERD đã update? (tương tự).

**E. Bug nội sinh (INTRINSIC) — gate DONE**
- [ ] `list_tasks(projectCode, type="BUG", bug_origin="INTRINSIC", linked_task_id=<task này>)` — còn bug INTRINSIC nào chưa `DONE` không?
- [ ] Còn bug INTRINSIC open → task này **KHÔNG thể DONE** (backend chặn `422 TASK_DONE_BLOCKED`). Phải fix + đóng bug trước. Handoff VERIFYING vẫn được (bug sẽ được QA/dev xử trong vòng verify), nhưng báo rõ trong comment: "còn N bug INTRINSIC chặn DONE".
- [ ] Còn TC link `failed` chưa re-verify → cũng chặn DONE. Báo QA re-verify.

### Bước 3 — Gom evidence

Cần thu thập **TRƯỚC** khi chuyển VERIFYING (rule §6 — VERIFYING cần evidence):

| Trường | Lấy ở đâu | Bắt buộc? |
|---|---|---|
| **Commit hash** | `git log -1 --format=%h` | ✅ |
| **Branch / PR URL** | git branch hiện tại / link PR | ✅ nếu workflow team có review |
| **File đụng** | `git diff --name-only main...HEAD` | ✅ |
| **TC dev đã chạy tay** | Note kết quả cho mỗi TC | ✅ nếu có TC linked |
| **Effort thực tế (giờ)** | Ước thật | Khuyến nghị |
| **Câu hỏi cho QA** | "kiểm thêm case X dùm" | Nếu có |

### Bước 4 — Báo cáo + chốt với User

Trình tóm tắt:
```
## Self-verify — TASK-FARE-87
DoD check: 4/4 ✅
TC chạy tay: TC-101 pass · TC-102 pass · TC-103 chưa chạy (cần data 100 ký tự — bàn QA)

Evidence:
- Commit: 5b315b8 "feat(employees): POST endpoint với validate code/email"
- Branch: feature/employees-create-api (PR #142)
- File đụng: src/employees/{employees.controller.ts, employees.service.ts, dto/create-employee.dto.ts}
- Effort thực tế: 6h (est 8h)

Re-check impact (validateUser HIGH): caller d=1 LoginController + SsoController test pass.

Câu hỏi cho QA:
- TC-103 cần data tên 100 ký tự — chuẩn bị giúp.

→ Chuyển VERIFYING + add_comment evidence trên + bàn giao QA `/fare-verify`. OK?
```

**CHỜ User chốt** (§2).

### Bước 5 — Update lifecycle

User OK → 2 gọi tuần tự:
1. `update_task(taskId, meta_status="VERIFYING", actual_effort=6)` (actual_effort là giờ — không nhầm man-days của module).
2. `add_comment(taskId, comment=<evidence ở Bước 4>)`.

KHÔNG gộp evidence vào field khác — comment là log chính của task lifecycle.

### Bước 6 — Bàn giao QA

Báo User:
- Task đã VERIFYING. Bàn giao QA `/fare-verify [project] <task id> [env]` để chạy verify chính thức.
- Nếu task `type=TEST` → QA `/fare-verify` sẽ chạy TC + ghi `verify_history`. Sau khi tất cả TC pass, **QA hoặc PM `/fare-groom`** đề xuất `update_task(meta_status="DONE")` — Dev không tự đóng.
- Nếu task `type=TASK` (BE/FE/DB) không có TC, deliverable là code → User confirm thay QA: "ok đóng đi" → User hoặc PM chốt DONE.

## Khi self-verify phát hiện vấn đề

| Tình huống | Hành động |
|---|---|
| TC chạy tay fail | Quay lại code (giữ IN_PROGRESS). Sửa rồi self-verify lại. KHÔNG handoff VERIFYING khi biết TC fail. |
| Phát hiện bug TRONG khi làm chính task này (lỗi của feature đang code) | Đây là bug INTRINSIC. Rule §5: báo User → chờ chốt → nếu tạo thì `bug_origin="INTRINSIC"`, `linked_task_id=<task này>`. Bug sẽ chặn task này DONE đến khi fix xong. |
| Phát hiện bug ở phần KHÔNG thuộc scope task này (vd dạo file thấy lỗi cũ) | Bug EXTRINSIC (độc lập). Rule §5: KHÔNG tự `create_tasks(type=BUG)`. Báo User → chờ chốt. KHÔNG link task này (không nên chặn task không liên quan). |
| Sửa mở rộng scope so với khi pickup (vd phải fix thêm 2 file ngoài plan) | `add_comment` ghi lý do mở rộng + báo PM (để PM cập nhật effort / chia task nếu cần). |
| Spec mơ hồ phát hiện khi code | Bàn giao BA `/fare-change`. Có thể vẫn handoff phần đã làm, ghi rõ phần spec mơ hồ không động. |
| API contract đổi nhưng api_doc chưa update | Update api_doc qua `/fare-write-doc` HOẶC nhờ technical-writer agent trước khi VERIFYING. |

## Anti-patterns

- ❌ Set `meta_status="DONE"` tự — vi phạm §6 (chỉ VERIFYING).
- ❌ Cố `DONE` khi còn bug INTRINSIC open hoặc TC `failed` — backend chặn `422 TASK_DONE_BLOCKED`; đọc payload thay vì retry.
- ❌ Set `VERIFYING` không có evidence (commit hash, file đụng) — vi phạm §6.
- ❌ Set `VERIFYING` khi biết có TC fail — gian lận quy trình.
- ❌ Tự tạo BUG khi phát hiện lỗi khác trong scope (vi phạm §5).
- ❌ Bỏ qua re-impact analysis khi impact ban đầu là HIGH — caller có thể break sau khi sửa.
- ❌ Sửa scope nhiều mà không `add_comment` lý do — PM/QA không hiểu vì sao file đụng khác plan.
- ❌ Quên cập nhật `api_doc` / `erd` khi đổi contract — phá hợp đồng cho FE / QA.
- ❌ Truyền `actual_effort` man-days vào task (task là GIỜ).

## Tự kiểm

- [ ] DoD trong task description đã rà từng mục.
- [ ] TC linked đã liệt kê + chạy tay (hoặc note rõ TC nào để QA chạy).
- [ ] Evidence đầy đủ: commit hash, branch/PR, file đụng (§6).
- [ ] Impact analysis re-check nếu ban đầu HIGH/CRITICAL — caller d=1 không break.
- [ ] api_doc / erd cập nhật nếu contract đổi (hoặc bàn giao writer).
- [ ] User chốt handoff TRƯỚC khi `update_task` + `add_comment` (§2).
- [ ] `actual_effort` là GIỜ (không nhầm man-days của module).
- [ ] KHÔNG tự `DONE` (§6).
- [ ] Đã check bug INTRINSIC open (`list_tasks(type="BUG", bug_origin="INTRINSIC", linked_task_id=<task>)`) + TC `failed` — báo rõ nếu còn chặn DONE.
- [ ] Bug phát hiện khi làm task này → INTRINSIC + link task này; bug ngoài scope → EXTRINSIC, không link. Cả hai đều qua §5 (hỏi User).
