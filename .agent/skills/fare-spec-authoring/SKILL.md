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
| `use_case` | Mô hình hoá *hệ thống hành xử thế nào* — actor + luồng (main/alternative/exception) | `references/use-case.md` |
| `user_story` | Góc nhìn *người dùng & nghiệm thu* — As-a/I-want/So-that + tiêu chí Given-When-Then | `references/user-story.md` |
| `richtext` · `brd` / `srs` / `prd` / `requirement` / `analysis` / `meeting-notes` | Đặc tả dạng văn (BRD/SRS/PRD), nghiên cứu trade-off, biên bản họp | `references/requirement.md` |
| `glossary` | Sổ thuật ngữ domain — chuẩn hoá từ vựng project (1 doc / project) | `references/glossary.md` |

Không tự quyết loại — hỏi User. Cùng một tính năng có thể cần >1 loại (vd BRD ở cấp dự án + use_case cho từng chức năng + thêm term vào glossary).

## Quy trình
1. **Khám phá ngữ cảnh** (`fare-context-discovery`) — module / chức năng liên quan, tài liệu anh em, ERD.
2. **Socratic Gate** (`§5`) — yêu cầu thường thiếu: actor phụ, edge case, ngưỡng/giới hạn, hậu điều kiện lỗi. Hỏi ≥2 câu, **CHỜ** User trả lời. KHÔNG tự suy ra (`§7`).
3. **Soạn nội dung** đúng schema/khuôn loại đã chọn — đọc `references/{loại}.md`. Mọi câu truy được về điều User cung cấp; chỗ thiếu → `⚠️` + hỏi, KHÔNG bịa actor / flow / acceptance criteria / business rule.
4. **Vị trí đẩy** — khảo sát resource `knowledge-tree` + `list_modules`; đề xuất vị trí + **CHỜ User chốt** (`§2`). KHÔNG mặc định. Lưu ý: `glossary` thường nằm ở `scope="project"` (1 doc / project); `brd` thường ở `scope="project"`; `srs` / `use_case` / `user_story` thường gắn `module_id` cấp Function (rule §1).
5. **Tạo** — `create_document(doc_type=..., purpose=..., content=..., status="draft")`:
   - Structured (`use_case`, `user_story`, `glossary`) → content là JSON; KHÔNG truyền `purpose` / `content_format` (FARE tự set).
   - Richtext (`brd` / `srs` / `prd`) → để `content` TRỐNG cho FARE inject template hệ thống; sau đó `patch_document` điền từng block.
   - Richtext khác (`requirement` / `analysis` / `meeting-notes`) → tự viết Markdown theo khuôn trong `references/requirement.md`.
   Trả URI `fare://documents/{id}` cho User.
6. **Gợi ý tạo Epic kèm (nếu spec cấp initiative)** — sau khi spec đã đẩy: nếu là BRD/SRS/PRD mô tả 1 initiative cross-module (vd "Mobile Redesign v2", "Payment v3"), agent **đề xuất** với User: "Spec này có vẻ thuộc 1 initiative lớn. Muốn tạo Epic kèm để gom UC/US/task sau này không?" → bàn giao PM `/fare-epic create`. KHÔNG tự tạo epic (đó là PM scope `fare-epic-management`). Bỏ qua bước này nếu spec chỉ cấp 1 chức năng đơn lẻ (use_case / user_story cho 1 function).

## Tự kiểm
- [ ] Cấu trúc đúng `references/{loại}.md` — đủ field, enum đúng, đúng định dạng (JSON cho structured / Markdown cho richtext).
- [ ] Mọi nội dung truy được về yêu cầu User cung cấp — không bịa actor / flow / AC / business rule / story point / glossary term.
- [ ] Điểm thiếu / mơ hồ đã `⚠️` + hỏi User, không tự điền.
- [ ] Với `glossary`: đã kiểm tra project chưa có doc nào trùng (1 doc / project).
- [ ] Với `brd`/`srs`/`prd`: đã dùng template hệ thống (content trống khi create) thay vì gõ tay từ đầu.
- [ ] `status="draft"` — KHÔNG `approved`. Vị trí đã được User chốt (không mặc định).
