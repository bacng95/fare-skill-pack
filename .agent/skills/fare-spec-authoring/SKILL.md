---
name: fare-spec-authoring
description: Viết MỚI đặc tả nghiệp vụ trên FARE — Use Case, User Story, BRD/SRS/PRD/requirement (richtext) và Glossary — từ một yêu cầu nghiệp vụ. Dùng khi User cần tạo đặc tả từ đầu, KHÔNG phải tách tài liệu có sẵn.
---

# fare-spec-authoring — Viết đặc tả nghiệp vụ

Dùng khi: User đưa một yêu cầu / tính năng và cần **viết mới** đặc tả trên FARE.
(Tách tài liệu nguyên khối có sẵn → `fare-doc-split`. Làm sạch form nháp → `fare-doc-normalize`.)

## Tiền đề
- Đã có Bản đồ ngữ cảnh (`fare-context-discovery`) — KHÔNG phân tích yêu cầu biệt lập.
- Tuân `rules/fare-rules.md`: §5 Socratic Gate, §7 Content Fidelity, §2 Confirmation Gate.

## Chọn loại đặc tả
FARE hỗ trợ nhiều loại tài liệu nghiệp vụ — chọn theo audience & độ chi tiết, hoặc viết nhiều loại nếu User cần:

| Loại (doc_type · purpose) | Khi nào | Khuôn |
|---|---|---|
| `user_story` | Góc nhìn *người dùng & nghiệm thu* — As-a/I-want/So-that + tiêu chí Given-When-Then | `references/user-story.md` |
| `richtext` · `brd` / `srs` / `prd` / `requirement` / `analysis` / `meeting-notes` | Đặc tả dạng văn (BRD/SRS/PRD), nghiên cứu trade-off, biên bản họp | `references/requirement.md` |
| `glossary` | Sổ thuật ngữ domain — chuẩn hoá từ vựng project (1 doc / project) | `references/glossary.md` |

Không tự quyết loại — hỏi User. Cùng một tính năng có thể cần >1 loại (vd BRD ở cấp dự án + đặc tả chức năng dạng `richtext` cho từng chức năng + thêm term vào glossary).

> **Use-case:** mô hình hoá use-case (actor + luồng main/alternative/exception) → viết **`richtext`** (`srs` / `requirement`); cần sơ đồ trực quan → doc_type **`diagram`** (drawio).

## Quy trình
1. **Khám phá ngữ cảnh** (`fare-context-discovery`) — plan item / chức năng liên quan, tài liệu anh em, ERD.
2. **Socratic Gate** (`§5`) — yêu cầu thường thiếu: actor phụ, edge case, ngưỡng/giới hạn, hậu điều kiện lỗi. Hỏi ≥2 câu, **CHỜ** User trả lời. KHÔNG tự suy ra (`§7`).
3. **Soạn nội dung** đúng schema/khuôn loại đã chọn — đọc `references/{loại}.md`. Mọi câu truy được về điều User cung cấp; chỗ thiếu → `⚠️` + hỏi, KHÔNG bịa actor / flow / acceptance criteria / business rule.
4. **Vị trí đẩy** — khảo sát resource `knowledge-tree` + `list_plan_items`; đề xuất vị trí + **CHỜ User chốt** (`§2`). KHÔNG mặc định. Lưu ý: `glossary` thường nằm ở `scope="project"` (1 doc / project); `brd` thường ở `scope="project"`; `srs` / `user_story` thường gắn `plan_item_id` cấp story (rule §1).
5. **Tạo** — `create_document(doc_type=..., purpose=..., content=..., title=...)` — doc mới **mặc định `status=draft`**; `create_document` KHÔNG nhận param `status` (truyền vào → lỗi `-32602`):
   - Structured (`user_story`, `glossary`) → content là JSON; KHÔNG truyền `purpose` / `content_format` (FARE tự set).
   - **`srs` theo chức năng** (case thường gặp, gắn story) → **tự viết `content` Markdown** theo format use-case + **truyền `title` có nghĩa**. KHÔNG để trống (template hệ thống sẽ ghi đè title thành "SRS" + sai format). Khuôn: `references/requirement.md` (ô ⚠️ đầu file) → `../fare-doc-normalize/references/use-case-spec.md`.
   - `brd` / `prd` (hoặc `srs` cấp hệ thống) → có thể để `content` TRỐNG cho FARE inject template, **rồi `update_document(title=...)` đặt lại tên** (template ghi đè title) + `edit_document` điền từng block.
   - Richtext khác (`requirement` / `analysis` / `meeting-notes`) → tự viết Markdown theo khuôn trong `references/requirement.md`.
   Báo cho User: **tiêu đề + breadcrumb vị trí** (`Project {code} › Module: {tên plan item} ({code}) | Project Documents | Custom › {folder}` › tiêu đề) + URI `fare://documents/{id}` — để User định vị được trên UI, KHÔNG trả id trần (rule §4).
6. **Gợi ý xếp chỗ trong cây plan item (nếu spec trải nhiều story/epic)** — sau khi spec đã đẩy: nếu là BRD/SRS/PRD mô tả một mảng giá trị lớn trải nhiều story, agent **đề xuất** với User: "Spec này trải nhiều tính năng — muốn dựng/hoàn thiện nhánh `theme › epic › story` để gắn spec & task đúng chỗ không?" → bàn giao BA `/fare-plan` (`fare-plan-breakdown`). KHÔNG tự dựng cây ở đây. Bỏ qua nếu spec chỉ cấp 1 story đơn lẻ (đã có chỗ gắn `plan_item_id`).

## Tự kiểm
- [ ] Cấu trúc đúng `references/{loại}.md` — đủ field, enum đúng, đúng định dạng (JSON cho structured / Markdown cho richtext).
- [ ] Mọi nội dung truy được về yêu cầu User cung cấp — không bịa actor / flow / AC / business rule / story point / glossary term.
- [ ] Điểm thiếu / mơ hồ đã `⚠️` + hỏi User, không tự điền.
- [ ] Với `glossary`: đã kiểm tra project chưa có doc nào trùng (1 doc / project).
- [ ] Với `srs` theo chức năng: viết content use-case trực tiếp + `title` có nghĩa (KHÔNG để trống → mất title + sai format). Với `brd`/`prd`/`srs` cấp hệ thống dùng template: đã `update_document` đặt lại title sau khi tạo.
- [ ] `title` mọi doc có nghĩa & định vị được — KHÔNG để tên mặc định "SRS"/"BRD"/"PRD" (rule §4).
- [ ] Doc ở `draft` (mặc định — KHÔNG truyền `status` lúc create). Gửi soát thì `update_document(status="review")`; KHÔNG tự `approved`. Vị trí đã được User chốt (không mặc định).
