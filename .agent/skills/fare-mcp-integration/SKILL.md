---
name: fare-mcp-integration
description: Dùng MCP của FARE đúng & an toàn — bản đồ tới tài liệu canonical của FARE, các bẫy không hiển nhiên và pattern bắt buộc.
---

# fare-mcp-integration — Dùng MCP FARE

## Nguồn canonical: đọc FARE, đừng học theo trí nhớ
FARE tự mô tả chính nó. KHÔNG ghi nhớ cách dùng FARE qua skill này — tra nguồn sống, luôn đúng theo phiên bản FARE hiện tại:
- **Mô tả từng tool** — mỗi MCP tool tự kèm mô tả schema / tham số chi tiết. Đọc trước khi gọi. (Luôn có sẵn trong danh sách tool.)
- **Resource** (đọc trạng thái hệ thống): `fare://projects`, `fare://projects/{code}/knowledge-tree`, `.../modules`, `fare://documents/{id}`, `fare://system-attributes`...
- **MCP prompt** của FARE (nếu Antigravity hiển thị): `fare-overview`, `project-setup`, `upload-documents` (doc_type ↔ purpose, folder), `plan-breakdown` (module 3 tầng, function point).

Skill này KHÔNG chép lại các nội dung đó — chỉ bổ sung **bẫy** và **pattern** không nằm trong mô tả tool.

## Epic ≠ Module ≠ Campaign ≠ Plan (KHÁI NIỆM CỐT LÕI — đọc trước)

FARE có 4 khái niệm gom việc lại với nhau, dễ nhầm. Mỗi cái có scope riêng:

| Khái niệm | Bản chất | Schema | Tools chính |
|---|---|---|---|
| **Module** | **WBS kỹ thuật** — cây 3 cấp `Module → Submodule → Function`; Function là nơi spec gắn `module_id` | `modules.parent_id`, `type ∈ {module, submodule, function}` | `add_module`, `update_module`, `list_modules`, resource `fare://projects/{code}/modules` |
| **Epic** | **Initiative / theme business**, cross-module, có lifecycle riêng (planned/in_progress/at_risk/done/archived), có owner + dates. Task gom vào epic qua `epic_id` | `epics.status`, `epics.owner_id`, `epics.start_date`, `epics.due_date`. UNIQUE name per project | `create_epic`, `update_epic` (`task_ids_to_assign` bulk max 500), `query_epics` (LIST mode hoặc GET mode kèm `task_stats`) |
| **Campaign** | **Release / QA testing cycle** — gom function + test cho 1 lần go-live | (read-only qua MCP) | resource `fare://projects/{code}/campaigns`; tạo qua FARE UI |
| **Plan / Sprint** | **Time container** — master plan (year, singleton, auto), month plan (sprint cycle) | `plans.type ∈ {master, month, standard}`, version DRAFT / PUBLIC | `list_plans`, `get_plan`, `upsert_plan` |

**Quan hệ thực tế:**
- Một **Function** có nhiều task; mỗi task có `module_id` (function) + optional `epic_id` + optional `plan_month_id` (sprint).
- Một **Epic** kéo dài nhiều sprint; tasks của epic có thể nằm nhiều function khác nhau.
- **Campaign** quản test cho 1 release, độc lập với epic/sprint (vd 1 campaign test nhiều epic cùng go-live).

**Khi nào tạo Epic** (vs chỉ dùng Module/Sprint):
- Tính năng cross-module có business owner + deadline riêng — vd "Mobile Redesign v2", "Payment v3", "GDPR Compliance Q2".
- Task phân tán ở nhiều function nhưng cùng một initiative — gom epic để track progress + risk.
- KHÔNG cần epic cho: bug fix lẻ tẻ, refactor nội bộ 1 module, task hotfix.

**Đóng epic = quyết định người thật** — agent đề xuất `status="done"` chỉ khi MỌI task gắn epic đã `meta_status="DONE"` (xem `fare-epic-management` Bước close).

## Bẫy không hiển nhiên
- **Optional param — KHÔNG truyền `null`.** Field không đổi → bỏ hẳn khỏi payload. Truyền `null` cho field số (`folder_id`, `module_id`...) → lỗi `-32602 Input validation error`.
- **Folder & vị trí tài liệu:**
  - *Quản lý folder:* tool `manage_folder` — `action: create | update | delete` (tạo / đổi tên + di chuyển / xóa folder Custom). `action="delete"` cần `confirm=true` — xóa kéo theo nội dung bên trong (xóa mềm, khôi phục được từ Trash).
  - *Tạo folder khi tạo doc:* `create_document` có `path` cũng sinh folder (mkdir -p) — `path` khớp CHÍNH XÁC `(tên, cha, scope)`, lệch một dấu cách → folder trùng; folder đã có → dùng `folder_id`.
  - *Chuyển một tài liệu:* `update_document` → `folder_id` / `scope:"custom"` / `scope:"project"` / `module_id`. Chỉ truyền field thật đổi. (`update_document` KHÔNG có `path`.)
  - Folder chỉ tồn tại ở phân vùng **Custom** — Project & Module phẳng (không có folder).
- **`search_rag` chỉ search NỘI DUNG** đã index — không match tên tài liệu / tên folder. Tra theo tên → `list_documents(query=...)`; duyệt cây thư mục → resource `knowledge-tree`.
- **`status`:** agent chỉ set `draft` / `review`. `approved` / `archived` là quyết định của con người (xem `rules/fare-rules.md` §7).
- **Phiên bản tài liệu:** đọc nội dung qua tool `read_document` — nó **phân trang** (bắt buộc với tài liệu lớn):
  - `read_document(documentId)` — bản hiện tại (draft mới nhất).
  - `read_document(documentId, version=n)` — content của **version `n` cụ thể**, cũng phân trang.
  - Danh sách phiên bản (số version, ai duyệt, khi nào) = resource `fare://documents/{id}/versions`.
  User chỉ định phiên bản ("v1 đã duyệt", "không lấy ver2") → `read_document(documentId, version=<n>)`. KHÔNG tự chế URI `?version=`.

## Pattern bắt buộc
- **Batching:** `create_tasks` / `create_test_cases` luôn truyền MẢNG — kể cả khi chỉ 1 phần tử.
- **Đổi status task:** `update_task(meta_status=...)` với `TODO|IN_PROGRESS|VERIFYING|DONE` — chạy mọi project, không cần lookup. Chỉ project có workflow tùy biến mới dùng `status_id` (lấy từ `list_projects(id=, include_task_statuses=true)`). KHÔNG hard-code số `status_id`.
- **Sửa richtext:** ưu tiên `patch_document` (block-level ops) thay vì `update_document` (ghi đè cả tài liệu).
- **Structured doc** (`use_case` / `user_story` / `api_doc` / `erd` / `diagram` / `test_case`): content là JSON đúng schema. Trước khi `update_document` → `read_document` lấy bản hiện tại, sửa, gửi lại FULL JSON.
- **Trùng tên bị chặn:** `create_document` với title đã tồn tại trong cùng folder / module → bị từ chối. `list_documents(query=...)` kiểm tra trước cho chủ động.

## An toàn
Mọi thao tác thay đổi dữ liệu tuân `rules/fare-rules.md` (Confirmation Gate, Content Fidelity) và `rules/operating-mode.md` (chế độ vận hành quyết định mức tự quyết của agent).
