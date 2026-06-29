---
name: fare-tech-doc-authoring
description: Viết MỚI tài liệu kỹ thuật structured trên FARE — API doc, ERD (và diagram) — đúng JSON schema. Dùng khi technical-writer cần tạo các loại doc này từ ngữ cảnh kỹ thuật, KHÔNG phải richtext văn xuôi.
---

# fare-tech-doc-authoring — Viết tài liệu kỹ thuật structured

Dùng khi: cần **viết mới** một tài liệu kỹ thuật dạng cấu trúc trên FARE — `api_doc`, `erd`, `diagram`.
(Richtext kỹ thuật — `specification` / `guide` / `adr` / `runbook` — viết Markdown thẳng, không cần khuôn JSON; xem mô tả `purpose` của `create_document`.)

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`) — KHÔNG viết biệt lập.
- Tuân `rules/fare-rules.md`: §1 (gắn `plan_item_id` story), §7 Content Fidelity (không bịa endpoint / bảng / cột), §2 Confirmation Gate (chốt vị trí đẩy).

## Chọn loại & khuôn
| doc_type | Khi nào | Khuôn | content_format |
|---|---|---|---|
| `api_doc` | Hợp đồng REST API — group › endpoint › method/path/params/body/response | `references/api-doc.md` | FARE tự set `json` |
| `erd` | Mô hình dữ liệu — entity + field + quan hệ (SQL/NoSQL) | `references/erd.md` | FARE tự set `json` |
| `diagram` | Sơ đồ trực quan (use-case, sequence, flow, kiến trúc) | `references/diagram.md` | `drawio` (mặc định) |

> **Structured = JSON, KHÔNG Markdown.** `api_doc` / `erd` bắt buộc truyền `content` là JSON hợp lệ đúng schema (rule §4). Gửi Markdown cho structured = sai.

## Quy trình (SOP)
1. **Khám phá ngữ cảnh** (`fare-context-discovery`) — story liên quan, ERD/api anh em, tài liệu nguồn. `search_rag` / `list_documents` kiểm tra doc trùng / liên quan.
2. **Soạn JSON** đúng `references/{loại}.md`. Mọi entity/field/endpoint truy được về nguồn User cung cấp hoặc tài liệu đã có; chỗ thiếu → hỏi User, KHÔNG bịa (§7).
3. **Chốt vị trí đẩy** (§2) — `api_doc` / `erd` đặc tả 1 chức năng → gắn `plan_item_id` story (§1); model dữ liệu cấp dự án → `scope="project"`. Đề xuất + **CHỜ User chốt**.
4. **Tạo** — `create_document(doc_type=..., content=<JSON>, title=..., plan_item_id=...)`. Doc mới **mặc định `draft`** — `create_document` KHÔNG nhận param `status` (truyền vào → lỗi `-32602`). KHÔNG truyền `purpose` / `content_format` cho structured (FARE tự set).
   - **Diagram:** theo `references/diagram.md` — `create_document(doc_type="diagram", content=<mxGraphModel XML>)` rồi vẽ qua **`edit_diagram`** (per-cell, lossless). KHÔNG resend XML qua `update_document`/`edit_document`; KHÔNG gửi Mermaid.
5. **Báo cáo** — **tiêu đề + breadcrumb vị trí + URI** (rule §4 — định vị được trên UI), KHÔNG id/URI trần.

## Sửa sau khi tạo
- `api_doc` / `erd` (structured) → `edit_document(ops=[{op:"replace_all", content:<FULL JSON mới>}])`. Structured KHÔNG có block op / patch — luôn gửi FULL JSON.
- `diagram` → `edit_diagram` (KHÔNG `edit_document`).
- Đổi metadata / move / status → `update_document` (status agent set được chỉ `draft|review`; `approved` là việc của người).

## Tự kiểm
- [ ] `content` là JSON hợp lệ đúng `references/{loại}.md` — đủ field bắt buộc, enum đúng (method / type / relation).
- [ ] Mọi endpoint / entity / field / quan hệ truy được về nguồn — KHÔNG bịa.
- [ ] `uid` (api_doc) / `id` (erd) nhất quán nội bộ: `relations.source/target` trỏ đúng `entities.id`; `sourceField/targetField` trỏ đúng `fields.id`.
- [ ] (erd) mỗi entity có `position: {x,y}` **giãn toạ độ** — KHÔNG để trống (mọi entity sẽ đè tại `{0,0}`).
- [ ] Đã gắn `plan_item_id` story (hoặc `scope="project"` nếu model cấp dự án) — User đã chốt vị trí.
- [ ] KHÔNG truyền `status` lúc create (doc mặc định `draft`); KHÔNG `approved`.
- [ ] Báo User tiêu đề + breadcrumb (rule §4), không id trần.
