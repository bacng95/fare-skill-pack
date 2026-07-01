---
name: fare-mcp-integration
description: Dùng MCP của FARE đúng & an toàn — HỢP ĐỒNG tool canonical (39 tool server thật expose), mô hình plan-item theme/epic/story, các bẫy không hiển nhiên và pattern bắt buộc. Mọi skill khác trỏ về đây để lấy chữ ký tool.
---

# fare-mcp-integration — Hợp đồng MCP FARE

> **File này là NGUỒN CHÂN LÝ DUY NHẤT về tên & chữ ký tool.** Skill khác chỉ
> nêu *tên tool* làm breadcrumb và trỏ về đây cho chi tiết tham số. Khi server
> FARE đổi API → cập nhật file này + danh sách trong `bin/check-tools.mjs`, rồi
> chạy `npm run check:tools`. KHÔNG rải chữ ký tool ra nhiều file.

## Nguồn canonical: đọc FARE, đừng học theo trí nhớ
FARE tự mô tả chính nó — luôn đúng theo phiên bản hiện tại:
- **Mô tả từng tool** — mỗi MCP tool tự kèm schema/tham số chi tiết. Đọc trước khi gọi.
- **Resource** (đọc trạng thái hệ thống): `fare://projects`, `fare://projects/{code}/knowledge-tree`, `fare://projects/{code}/plan-items`, `fare://documents/{id}`, `fare://documents/{id}/versions`, `fare://system-attributes`, `fare://effort-matrix`. Hướng dẫn soạn tài liệu (đọc khi cần chi tiết, không nhồi vào schema tool): `fare://document-purposes` (catalogue preset `purpose`), `fare://doc-type-schemas` (JSON shape từng doc_type).
- Bảng manifest dưới đây là **bản chụp để định hướng** — khi lệch với mô tả tool sống, tin mô tả sống và sửa file này.

## Manifest 39 tool (gom theo miền)

| Miền | Tool | Ghi chú nhanh |
|---|---|---|
| **Project** | `list_projects` | Bỏ `id` = liệt kê; có `id` = chi tiết 1 project (`include_members`, `include_task_statuses`). |
| **Tài liệu (đọc/ghi)** | `list_documents`, `read_document`, `create_document`, `edit_document`, `update_document`, `delete_document` | `edit_document` = sửa NỘI DUNG (block ops hoặc `replace_all`). `update_document` = sửa METADATA/vị trí (title/status/purpose/move). `delete_document` = xóa mềm. |
| | ~~`patch_document`~~ | ❌ **ĐÃ GỠ** khỏi MCP → dùng `edit_document` (block ops y hệt). | <!-- lint:allow -->
| | `create_suggestion` | Đề xuất sửa 1 block (`node_id`) — không ghi đè. |
| **Folder** | `manage_folder` | `action: create\|update\|delete` — chỉ phân vùng Custom. `delete` cần `confirm=true`. |
| **Diagram** | `read_diagram`, `edit_diagram` | doc_type=`diagram` (drawio). Per-cell, lossless. KHÔNG sửa diagram qua edit_document. |
| **Plan item (WBS)** | `list_plan_items`, `add_plan_item`, `update_plan_item`, `delete_plan_item` | Cây `theme › epic › story` (xem dưới). `delete_plan_item` cần `confirm=true` + chỉ xóa item rỗng. |
| **Plan / Sprint** | `list_plans`, `upsert_plan` | `list_plans(id=..., include=["versions","commits"])` = chi tiết. `upsert_plan` tạo/sửa month plan. KHÔNG có `get_plan`. | <!-- lint:allow -->
| **Task** | `list_tasks`, `create_tasks`, `update_task`, `delete_task` | `create_tasks` luôn batch (mảng). `list_tasks(id=...)` = chi tiết 1 task. KHÔNG có `create_task` số ít. | <!-- lint:allow -->
| **Test case** | `list_test_cases`, `create_test_cases`, `update_test_case` | `create_test_cases` luôn batch. `list_test_cases(id=...)` = chi tiết 1 TC. Ghi verify qua `update_test_case(verify={...})`. KHÔNG có `get_test_case`/`create_test_case` số ít. | <!-- lint:allow -->
| **Comment** | `add_comment`, `get_comments` | `add_comment(projectCode, entityType, entityId, content)` — entityType ∈ `document\|task\|plan\|campaign`; `entityId` = id thực thể; **`content` là HTML** (vd `<p>…</p>`), KHÔNG Markdown. KHÔNG có param `taskId`/`comment`. |
| **RAG / tìm** | `search_rag` | Search NỘI DUNG đã index (`query` HOẶC `entity_name`). Không match tên doc/folder. |
| **Code intelligence** | `code_repos`, `code_query`, `code_context`, `code_impact`, `code_route_map`, `code_read_file` | Chỉ project đã index repo. Nhiều repo/branch → `code_repos` trước. |
| **Ảnh** | `read_image`, `upload_image` | |
| **Figma** | `figma_get_file`, `figma_get_components`, `figma_get_styles`, `figma_export_images` | |

> **Tham chiếu plan item:** các tool gắn việc vào cây WBS dùng param
> `plan_item_id` (số nhiều `plan_item_ids` cho `list_tasks`) — ở
> `create_tasks`/`create_document`/`list_documents`/`list_tasks`/`update_document`.
> Nó nhận **ID của một plan item** (thường là story cấp lá); cây WBS thật là
> **theme/epic/story**. (Tài liệu/đời cũ có thể còn gọi param này là `module_id` —
> nay đã đổi tên thành `plan_item_id`.) Resource `fare://projects/{code}/modules`
> đời cũ đã **không còn** — liệt cây qua tool `list_plan_items` (hoặc resource
> `fare://projects/{code}/plan-items`). Đừng tìm tool `*_module` — không còn nữa.

## Cây WBS = Plan item: `theme › epic › story` (3 cấp cố định)

FARE bản mới gom việc bằng **plan item**, KHÔNG còn "Module → Submodule →
Function" hay "Epic initiative độc lập" của bản cũ.

| Cấp | Là gì | Code | Trường effort được phép | Tạo bằng |
|---|---|---|---|---|
| **theme** | Vùng năng lực lớn (top-level, không parent) | `T#` | (read-only, tổng hợp từ con) | `add_plan_item(type="theme")` |
| **epic** | Nhóm tính năng trong theme | `E#` | **chỉ** `effort_est_level` ∈ L1..L4 | `add_plan_item(type="epic", parent_id=<theme>)` |
| **story** | Hạng mục bàn giao (cấp lá — nơi gắn task & spec) | `S#` | **chỉ** `complexity`+`scope`+`clarity` (ID) | `add_plan_item(type="story", parent_id=<theme\|epic>)` |

- Luôn dùng đủ 3 cấp — **không** đặt story thẳng dưới root.
- Server CHẶN field lệch cấp (vd set `complexity` cho epic → 400). Chỉ truyền field hợp lệ của đúng cấp.
- Lấy ID cấp cha trước khi tạo con: `list_plan_items(projectCode)` (trả `id, code, name, type, parent_id, effort, effort_est, effort_est_level`).
- "epic" giờ chỉ là **cấp giữa của cây** — KHÔNG có status/owner/at_risk/bulk-assign như "Epic initiative" bản cũ. Mọi tool `create_epic`/`update_epic`/`query_epics` đã bị gỡ. <!-- lint:allow -->

## Mô hình effort (Function Point)
- **Story**: gán 3 attribute bằng **ID** (đọc `fare://system-attributes`):
  - `complexity` — ID **1–5** (1=Rất thấp … 5=Rất cao).
  - `scope` (volume) — ID **6–10** (6=Rất nhỏ … 10=Rất lớn). ⚠️ KHÔNG truyền 1–5.
  - `clarity` — ID **11–15** (11=Rõ ràng … 15=Rất mập mờ). ⚠️ KHÔNG truyền 1–5.
  - `effort` (man-day) **tự tính** từ `fare://effort-matrix`: `FP = complexity_value × scope_value × clarity_value` → tra man-day. KHÔNG settable.
- **Epic**: chỉ `effort_est_level` ∈ {L1=7, L2=10, L3=20, L4=30 man-day}. Server suy ra `effort_est`. KHÔNG settable trực tiếp.
- **Theme**: read-only, tổng hợp từ con.
- `effort` và `effort_est` là **dẫn xuất** — không bao giờ truyền tay.

## Link nội bộ giữa tài liệu = chip mention (KHÔNG markdown link)
Hành vi auto-chip **KHÁC nhau theo ngữ cảnh** (đã kiểm round-trip):
- **Trong `description` task / `add_comment`:** ghi **URI trần** `fare://documents/{id}` là đủ → backend auto-convert thành chip bấm được (mô tả tool `update_task`/`add_comment`: "auto-chip-converted").
- **Trong THÂN tài liệu richtext (doc body):** URI trần **KHÔNG** tự thành chip — lưu xong vẫn là **text thuần** (đã kiểm doc 619). PHẢI ghi **chip HTML đầy đủ**: `<a class="fare-mention" data-type="mention" data-id="{id}" data-doc-type="richtext" href="/docs/{id}">{nhãn}</a>` (folder → `data-doc-type="folder"`, `href="/docs?folder={id}"`). ⚠️ **Bắt buộc có `data-type="mention"`** — thiếu nó backend chèn thêm 1 chip resolve → **bị nhân đôi**.
- ⚠️ **KHÔNG** dùng `[{nhãn}](fare://documents/{id})` (markdown link): bị rút còn text trần, không bấm được (đã kiểm).

## Bug INTRINSIC ≠ EXTRINSIC (bug nội sinh vs ngoại lai)

Bug (`type=BUG`) có `bug_origin` quyết định nó có chặn task khác hay không:

| `bug_origin` | Nghĩa | `linked_task_id` | Tác động |
|---|---|---|---|
| **INTRINSIC** | Bug phát sinh trong khi làm 1 task cha (TC verify failed, tester báo từ task drawer) | **BẮT BUỘC** trỏ task cha | **Chặn task cha chuyển DONE** đến khi bug đóng |
| **EXTRINSIC** | Bug độc lập (production, regression, user report) | Không cần | Không chặn task nào |

- `create_tasks(type="BUG", bug_origin="INTRINSIC", linked_task_id=<cha>)` — INTRINSIC thiếu `linked_task_id` → lỗi validation.
- Bỏ `bug_origin` → backend infer: có `linked_task_id` → INTRINSIC, không → EXTRINSIC. Nên truyền **tường minh**.
- **DONE Gate (`422 TASK_DONE_BLOCKED`):** `update_task(meta_status="DONE")` bị chặn khi task còn bug INTRINSIC mở HOẶC TC link `failed`. Payload có `open_intrinsic_bugs[]` + `failed_test_cases[]` — đọc, KHÔNG retry mù.
- Filter bug nội sinh của 1 task: `list_tasks(projectCode, type="BUG", bug_origin="INTRINSIC", linked_task_id=<id>)`.

## Bẫy không hiển nhiên
- **Param sai tên bị REJECT, không bị bỏ qua âm thầm.** Strict validation → key lạ = `-32602 Unrecognized key`. Vd dùng `search=` cho `list_tasks` sai (đúng là `q`). Gặp lỗi: đọc mô tả tool, KHÔNG đoán tên param từ tool khác.
- **Optional param — KHÔNG truyền `null`.** Field không đổi → bỏ hẳn khỏi payload. Truyền `null` cho field số (`folder_id`, `plan_item_id`…) → lỗi `-32602`.
- **Sửa nội dung vs vị trí tài liệu:** `edit_document` cho NỘI DUNG (block ops rẻ token, hoặc `replace_all` ghi đè cả doc). `update_document` chỉ METADATA/move (`title`/`status`/`purpose`/`folder_id`/`scope`/`plan_item_id`). `patch_document` đã bị GỠ khỏi MCP. <!-- lint:allow -->
- **Folder & vị trí tài liệu:** `manage_folder` (create/update/delete, Custom only). `create_document` có `path` cũng mkdir -p (khớp chính xác `(tên, cha, scope)`, lệch → folder trùng; đã có → dùng `folder_id`). Folder chỉ tồn tại ở phân vùng Custom; Project & Module phẳng.
- **`search_rag` chỉ search NỘI DUNG** đã index — không match tên doc/folder. Tra theo tên → `list_documents(query=...)`; duyệt cây → resource `knowledge-tree`.
- **`status`:** agent chỉ set `draft`/`in_review`. `approved`/`archived` là quyết định con người (rule §7).
- **Phiên bản tài liệu:** `read_document(documentId)` = bản hiện tại; `read_document(documentId, version=n)` = version cụ thể; danh sách version = resource `fare://documents/{id}/versions`. KHÔNG tự chế `?version=`.
- **Structured doc** (`user_story`/`api_doc`/`erd`/`glossary`/`test_case`): content là JSON đúng schema. Sửa → `read_document` lấy bản hiện tại → `edit_document(replace_all)` gửi lại FULL JSON.

## Pattern bắt buộc
- **Batching:** `create_tasks` / `create_test_cases` luôn truyền MẢNG — kể cả 1 phần tử. Không có biến thể số ít.
- **Đổi status task:** `update_task(meta_status=...)` với `TODO|IN_PROGRESS|VERIFYING|DONE` — chạy mọi project. Chỉ project có workflow tùy biến mới dùng `status_id` (lấy từ `list_projects(id=, include_task_statuses=true)`). KHÔNG hard-code `status_id`.
- **Lấy ID trước khi tham chiếu:** đừng bịa `projectCode`/`plan_item_id`(plan item)/`task_id`/`document_id` — lấy qua các tool List hoặc `search_rag`.
- **Trùng tên bị chặn:** `create_document` title trùng trong cùng folder/module → bị từ chối. `list_documents(query=...)` kiểm tra trước.

## An toàn
Mọi thao tác thay đổi dữ liệu tuân `rules/fare-rules.md` (Confirmation Gate, Content Fidelity) và `rules/operating-mode.md` (chế độ vận hành quyết định mức tự quyết của agent).
