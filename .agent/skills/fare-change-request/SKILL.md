---
name: fare-change-request
description: Xử lý yêu cầu thay đổi (change request) trên một spec đã có. Đọc bản đã duyệt, đánh giá impact (UC/US/test/task liên quan), sửa nội dung trên draft (KHÔNG ghi đè bản approved), log change, đề xuất submit cho duyệt. Dùng khi User báo "khách đổi yêu cầu", "yêu cầu mới phát sinh trên spec A", hoặc khi cần re-version một tài liệu đã chốt.
---

# fare-change-request — Yêu cầu thay đổi & re-versioning

Dùng khi: spec đã có (thường đã `approved` ≥1 lần) bị yêu cầu sửa giữa chừng. Mục đích: sửa đúng nơi, KHÔNG mất truy vết bản cũ, đánh giá đúng tác động lên artifact downstream.

KHÔNG thuộc skill này: viết spec mới (→ `fare-spec-authoring`); soát blind spot (→ `fare-spec-reviewer`).

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`).
- Tuân `rules/fare-rules.md`: §2 Confirmation Gate (mọi `update_document`/`patch_document` đều phải xác nhận), §7 Content Fidelity (không tự suy diễn yêu cầu mới), §8 (đọc TƯƠI từ FARE, không dùng file scratch phiên cũ).

## Mô hình version FARE
- Doc có **lịch sử version**: `fare://documents/{id}/versions` → metadata (ai publish, khi nào, status).
- Bản hiện tại = bản đang sửa (thường là draft mới nhất).
- `read_document(id)` = bản hiện tại. `read_document(id, version=N)` = nội dung version N (đã đóng băng).
- Khi User "publish / approve" → một snapshot `approved` được ghi vào `document_versions`; doc tiếp tục có thể là draft mới.
- Agent KHÔNG bao giờ set `status="approved"` (rule §7).

## Quy trình (5 bước)

### Bước 1 — Chốt với User
- **Spec mục tiêu:** id / URI cụ thể.
- **Bản nguồn của thay đổi:** áp dụng trên bản nào? Mặc định là bản `approved` mới nhất (so sánh để biết đổi gì).
- **Yêu cầu thay đổi:** mô tả ngắn của User (nguyên văn — không tự diễn giải lại).
- **Lý do / nguồn yêu cầu:** ai đề xuất (khách hàng / sponsor / dev phát hiện lỗ hổng), bằng chứng (email, biên bản họp, ticket). Lưu vào change log.

**CHỜ User trả lời** (§5). KHÔNG bắt đầu khi thiếu lý do — change không nguồn = spec bị thao túng.

### Bước 2 — Đọc bản hiện tại + bản đã duyệt
- `read_document(id)` — bản hiện tại (paginated, đọc hết).
- Xem `fare://documents/{id}/versions` → tìm version `approved` mới nhất. `read_document(id, version=N)` để có baseline đối chiếu.
- Với structured (`use_case` / `user_story` / `glossary`): so sánh JSON. Với richtext: dùng `mode="blocks"` để có ID block ổn định cho patch sau.

### Bước 3 — Đánh giá tác động (downstream)
Trước khi sửa, liệt kê những gì có thể bị ảnh hưởng — User cần thấy để chốt scope:

| Artifact downstream | Cách quét |
|---|---|
| Use case / user story liên quan | `search_rag(<FR id hoặc tên function>)` + `list_documents(query=...)` |
| Test case phủ AC bị đổi | `list_test_cases(projectCode, document_id=<spec id>)` |
| Task đã / đang code spec này | `list_tasks(projectCode, module_id=<của spec>)` — quét `description` cho URI |
| Epic chứa task của spec | Đối chiếu `task.epic_id` của các task ở dòng trên → `query_epics(epicId)` từng cái. Báo: epic nào bị ảnh hưởng (có thể trễ due, cần đổi status `at_risk`, owner cần biết). |
| Doc kỹ thuật (api_doc / erd) tham chiếu | `search_rag(<tên thực thể/endpoint>)` |
| Code (nếu repo có index code) | `code_query(<concept>)`, `code_impact(<symbol>)` |

Báo cáo `## Impact Assessment` — nhóm theo mức rủi ro 🟥/🟧/🟨 (theo schema `fare-traceability`).

### Bước 4 — Đề xuất diff + CHỜ User chốt
- Trình bày **diff cụ thể** (block/JSON-path nào đổi, từ "X" thành "Y"). KHÔNG ghi "cải thiện thêm cho gọn".
- Mỗi điểm đổi truy ngược về câu User cung cấp ở Bước 1.
- User chốt → mới chuyển sang Bước 5. Cấm gộp impact + diff + execute trong cùng 1 lượt (§2 cấm "gộp quyết định").

### Bước 5 — Thực thi sửa
- **Richtext (`brd`/`srs`/`prd`/`requirement`/...):** ưu tiên `patch_document(id, ops=[...])` block-level. Tránh `update_document` ghi đè cả tài liệu (rule §4 Patch thay vì Rewrite + tránh phá CRDT khi có người collab).
- **Structured (`use_case`/`user_story`/`glossary`):** `read_document` → sửa JSON → `update_document(id, content=<FULL JSON>)`. KHÔNG patch.
- **Ghi change log** vào doc:
  - Richtext: thêm 1 block "Change Log" cuối doc, format:
    ```
    | Date       | Version | Change                                  | Source / Reason       |
    |------------|---------|------------------------------------------|------------------------|
    | yyyy-mm-dd | vN→vN+1 | {tóm tắt diff theo bullet}              | {nguồn ở Bước 1}      |
    ```
  - Structured: nếu schema không có chỗ → ghi log vào 1 `add_comment` của doc (description gắn URI yêu cầu thay đổi).
- **Status:** giữ `draft` (hoặc `in_review` nếu User yêu cầu gửi soát). **KHÔNG `approved`** (§7).
- **Publish / bump version:** việc của User — KHÔNG tự gọi tool publish.

### Sau Bước 5 — Bàn giao downstream
- UC/US bị đổi flows/AC → đề xuất `fare-spec-reviewer` soát lại blind spot.
- Test case bị ảnh hưởng → đề xuất bàn giao QA cập nhật (khi vai QA có).
- Task downstream `DONE` mà spec đổi sau khi code → đề xuất tạo task BUG / re-verify (NHƯNG theo rule §5: chỉ tạo BUG sau khi User xác nhận).
- **Epic bị ảnh hưởng** → bàn giao PM `/fare-epic`: cân nhắc đổi `status="at_risk"` nếu deadline epic bị đe dọa; thông báo owner epic; cập nhật due_date nếu cần.

## Anti-patterns
- ❌ Sửa nội dung không có source/lý do trong description.
- ❌ `update_document` ghi đè cả richtext khi chỉ đổi 1 block.
- ❌ Tự diễn giải yêu cầu "cho hợp lý hơn" — vi phạm §7. Khách nói gì thì sửa đúng vậy + ⚠️ nếu cần làm rõ.
- ❌ Bỏ qua impact assessment, sửa thẳng spec.
- ❌ Tự set `status="approved"` sau khi sửa — agent không duyệt.
- ❌ Dùng file scratch phiên cũ làm baseline (vi phạm §8) — luôn đọc tươi từ FARE.

## Tự kiểm
- [ ] Lý do & nguồn yêu cầu thay đổi đã được User cung cấp & ghi vào change log.
- [ ] Đã đọc cả bản hiện tại VÀ bản `approved` mới nhất từ FARE (đọc tươi, không file local).
- [ ] Impact assessment đã liệt kê đầy đủ downstream theo 6 nhóm (UC/US, test, task, doc kỹ thuật, code, **epic**), có mức rủi ro.
- [ ] Diff đã được User chốt TRƯỚC khi `patch_document` / `update_document` (§2).
- [ ] Richtext dùng `patch_document`; structured gửi FULL JSON qua `update_document`.
- [ ] Change log đã ghi (block hoặc comment) — không sửa "lặng".
- [ ] `status="draft"` hoặc `in_review` — KHÔNG `approved`. Việc publish dành cho User.
