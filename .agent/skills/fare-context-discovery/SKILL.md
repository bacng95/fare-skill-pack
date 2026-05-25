---
name: fare-context-discovery
description: >-
  Khám phá ngữ cảnh đủ sâu cho một artifact FARE (tài liệu, đặc tả/SRS, ERD,
  task, test case, màn hình UI) TRƯỚC KHI phân tích, đánh giá hay tách tài liệu.
  Dùng khi được yêu cầu đọc/phân tích/đánh giá một tài liệu FARE, kiểm tra
  "tài liệu này có vấn đề gì", truy nguồn một yêu cầu, hoặc chuẩn bị tách/chuẩn
  hóa tài liệu. Dạy agent dùng MCP fare tools theo từng tầng và xuất ra Bản đồ
  ngữ cảnh dùng lại được cho các skill phía sau.
---

# FARE — Khám phá ngữ cảnh (Context Discovery)

Skill này dạy cách dùng **MCP `fare` tools** để dựng đủ ngữ cảnh quanh một artifact FARE *trước khi* kết luận. Đầu ra bắt buộc là một **Bản đồ ngữ cảnh** — tài sản dùng lại được cho các skill/agent phía sau (tách tài liệu, viết test case, đánh giá ảnh hưởng). Bổ trợ cho skill `fare-mcp-integration` (skill kia lo cách *gọi* tool; skill này lo *trình tự khám phá*).

## Nguyên tắc

1. **Không phân tích biệt lập.** Mọi artifact FARE nằm trong một mạng: thư mục cha, tài liệu anh em, ERD, plan/module, code, thiết kế Figma. Đọc một mình → kết luận sai (báo "tham chiếu gãy" trong khi nó chỉ trỏ tài liệu anh em; bỏ sót mâu thuẫn đặc tả ↔ ERD).
2. **Khám phá theo tầng, đào sâu theo mục tiêu.** Luôn chạy tầng định hướng 0–3. Tầng 4 rẽ nhánh tùy việc sắp làm. Không đào mọi thứ — đào đúng tầng mục tiêu cần.
3. **Khớp độ sâu với câu hỏi.** Câu hỏi tra cứu nhanh: tầng 0–2. Phân tích / đánh giá / tách tài liệu: chạy đủ 0–5.
4. **Dừng có tiêu chí.** Ngừng mở rộng khi không tham chiếu mới nào còn làm đổi kết luận. Mỗi link/tham chiếu chưa mở là một nút phải phân giải hoặc ghi nhận là "chưa phân giải".
5. **Không tin metadata mù quáng.** `kind`, nhãn heading, link — đều có thể sai. Kiểm chứng bằng nội dung.

## Các tầng khám phá

### Tầng 0 — Định vị
- `list_projects` hoặc resource `fare://projects` → xác định project code + id.
- `list_projects(id=<code>, include_members, include_task_statuses)` khi cần người/vai trò/status (truyền `id` → trả chi tiết 1 project).

### Tầng 1 — Mỏ neo (artifact được giao)
- `read_document(id)` — đọc HẾT các trang (lặp tới khi `pagination.has_more = false`). Ghi lại `kind`, `status`, `version`, `scope`, `location`.
- Phân trang cắt ngang thẻ HTML/bảng → tự ghép lại; cần ID block ổn định để sửa thì dùng `mode="blocks"`.
- Artifact khác: `list_tasks(id=<id>)`, `list_test_cases(id=<id>)` — truyền `id` để lấy chi tiết đầy đủ 1 task / test case. Trang mô tả của folder/module: tìm qua `list_documents`.

### Tầng 2 — Hàng xóm & cấu trúc
- `list_documents(projectCode, scope)` → cây thư mục. Tài liệu anh em cho biết artifact thuộc một *bộ* (vd SRS nhiều module).
- Đọc tài liệu Preamble / Tổng quan / Glossary anh em để lấy domain, vai trò, thuật ngữ chuẩn.
- `list_modules`, `list_plans` (truyền `id` để xem chi tiết 1 plan) → đã có breakdown plan chưa; cấu trúc/tên plan so với tài liệu.

### Tầng 3 — Tham chiếu chéo
Mở mọi tham chiếu trong artifact: link tài liệu, "mục 2.15 / 1.16", nhắc tới ERD, link Figma, ảnh nhúng. Mỗi cái là một nút — phân giải tới đích, hoặc đánh dấu "chưa phân giải / gãy".

### Tầng 4 — Đào sâu theo mục tiêu (rẽ nhánh)

| Mục tiêu kế tiếp | Đào sâu | Tool |
|---|---|---|
| Phân tích / tách / chuẩn hóa đặc tả | Mô hình dữ liệu + plan + test case | `list_documents(kind="erd")` → `read_document`; `list_modules`; `list_test_cases` (truyền `id` để lấy chi tiết 1 TC) |
| Hiểu / đánh giá UI–UX | Thiết kế Figma | `figma_get_file`, `figma_get_components`, `figma_get_styles`, `figma_export_images` → `read_image` |
| Đánh giá ảnh hưởng / liên hệ code / implement | Code | `code_query` (theo concept), `code_context` (360° một symbol), `code_impact` (blast radius), `code_route_map` (luồng route/API) |
| Trạng thái công việc / tiến độ | Plan, module, task, **epic** | `list_plans`, `list_modules`, `list_tasks` — truyền `id` cho `list_plans`/`list_tasks` để lấy chi tiết 1 mục. `query_epics(projectCode, status="live")` để liệt initiative đang chạy; `query_epics(epicId)` GET mode kèm `task_stats` breakdown. Xem `fare-mcp-integration` để phân biệt Epic ≠ Module ≠ Campaign. |
| Hiểu ảnh nhúng trong tài liệu | Ảnh | `read_document` trả sẵn `imageSummaries`; thiếu thì `read_image` |

Tìm theo khái niệm khi chưa biết tên chính xác: `search_rag(query)`. Tra một thực thể đã biết tên: `search_rag(entity_name)`.

### Tầng 5 — Xuất Bản đồ ngữ cảnh
Tổng hợp theo mẫu bên dưới. Đây là đầu ra bắt buộc trước khi chuyển sang phân tích / đánh giá / tách.

## Bẫy đặc thù FARE

- **Đánh số Word ≠ cây FARE.** "2.15", "1.16"… là số mục của file Word gốc trước khi tách lên FARE — KHÔNG map sang document id. Suy ra module tương ứng ("2.x" → tài liệu module 2) rồi tìm; nếu module đó chưa tách tới mục đó → ghi "chưa phân giải", đừng kết luận "gãy".
- **`kind` có thể sai bản chất.** Đặc tả use-case hay bị lưu `kind="notes"`. Đọc nội dung để xác định loại thật.
- **`search_rag` chỉ search nội dung, KHÔNG search tên.** Nó match ngữ nghĩa **nội dung** tài liệu đã index — không match tiêu đề tài liệu, không biết cây thư mục. Tra tài liệu theo tên → `list_documents(query=...)`; duyệt folder → resource `fare://projects/{code}/knowledge-tree`. Trả rỗng có thể là không khớp nội dung HOẶC kho RAG chưa index → luôn fallback `list_documents` + `read_document` trước khi kết luận "không có dữ liệu".
- **Tài liệu trùng tên.** Có thể tồn tại nhiều bản cùng tên (vd 2 ERD) → so `version` / `status` / `scope` để chọn bản chuẩn; không chắc thì nêu rõ trong bản đồ.
- **Link gãy / dán nhầm** (href rỗng kiểu `"q"`, trỏ ra `chatgpt.com`…) — kiểm chứng, không tin mù.
- **`comment-highlight` (`data-comment-id`)** = đoạn có thảo luận chưa chốt mà agent không đọc được nội dung → đánh dấu "điểm mở".
- **Nhãn thủ công** ("– DONE" trong heading, gạch ngang `<s>`) = trạng thái người soạn tự ghi, KHÁC field `status` hệ thống — cần xác nhận.
- **Ảnh chưa xử lý**: `alt` rỗng và không có `imageSummaries` = ảnh chưa được caption; dùng `read_image` nếu nội dung ảnh quan trọng.

## Mẫu Bản đồ ngữ cảnh

```
## Bản đồ ngữ cảnh: <tên artifact>

Mỏ neo:       id <id> · <kind thật> · status <status> · version <v> · <location>
Thuộc bộ:     <vd: SRS Edtech 2.0 — module 1/18>
Domain/vai trò: <rút từ Tổng quan / Glossary>

Tài liệu liên quan đã đọc:
- id <id> <tên> — vai trò: <anh em | ERD | plan | overview | ...>

Tham chiếu chéo:
- <ref> → đã phân giải tới id <id> | CHƯA phân giải | GÃY

Đối chiếu nguồn khác:
- ERD:        <khớp / lệch — nêu cụ thể trường nào>
- Plan/module: <đã có breakdown? khớp tài liệu không?>
- Code/Figma:  <nếu có — phát hiện gì>

Khoảng trống & rủi ro: <placeholder trống, mâu thuẫn, điểm mở do comment>

Độ tin cậy: <cao | vừa | thấp>
Cần người xác nhận: <danh sách câu hỏi mở>
```

## Tự kiểm trước khi kết thúc

1. Đã đọc hết artifact mỏ neo (không bỏ trang)?
2. Đã xem cây thư mục và đọc tài liệu định hướng (Tổng quan/Glossary)?
3. Mọi tham chiếu chéo đều đã phân giải hoặc được đánh dấu rõ?
4. Đã đào đúng tầng 4 mà mục tiêu kế tiếp cần (ERD / code / Figma / plan)?
5. Bản đồ ngữ cảnh đã xuất, kèm độ tin cậy và danh sách cần xác nhận?
