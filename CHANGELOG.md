# Changelog

All notable changes to **fare-skill-pack** will be documented in this file.

Format theo [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/); versioning theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.1] - 2026-06-29

> Rà soát chất lượng skill pack đối chiếu trực tiếp với MCP server FARE thật (probe live từng tool/resource). Sửa loạt bug "im lặng" khiến agent gọi MCP fail hoặc tạo artifact không định vị được — không breaking, an toàn nâng cấp từ 2.0.0.

### Added
- **Skill `fare-tech-doc-authoring`** cho vai `fare-technical-writer` — khuôn JSON cho `api_doc` / `erd` + cách tạo `diagram` (drawio), gồm 3 reference (`api-doc.md` · `erd.md` · `diagram.md`). Trước đây technical-writer không có skill viết tài liệu kỹ thuật nào (chỉ dựa mô tả tool). Wire vào agent + `ARCHITECTURE`.
- **Nhánh greenfield** trong `fare-context-discovery` — xử lý đầu vào là file ngoài (Word/PDF/Excel) cho feature chưa có trên FARE (không có artifact mỏ neo `read_document`), kèm biến thể mẫu Bản đồ ngữ cảnh.
- **Tiền điều kiện "project phải tồn tại"** ở `/fare-plan` + `/fare-ba`.

### Fixed
- **Param `status` lúc `create_document` → lỗi `-32602`** (tool không nhận `status`; doc mặc định `draft`). Bỏ khỏi mọi ví dụ create (spec-authoring, doc-split, test-authoring, technical-writer, business-analyst, workflows). `update_document` status enum đúng là `draft|review` — sửa `in_review` (không tồn tại) ở requirement.md, change-request.
- **`update_task(actual_effort=…)` → lỗi `-32602`** (tool không có field này; giờ thực tế ghi qua worklog UI). Sửa self-verify, developer, effort-estimation, workflow handoff.
- **Chữ ký `add_comment` đã đổi** → `(projectCode, entityType, entityId, content-HTML)`. Sửa các ví dụ `add_comment(taskId, comment=…)` ở self-verify, impact-analysis, task-pickup + làm giàu reference trung tâm.
- **Chip-mention trong THÂN tài liệu richtext:** URI trần `fare://documents/{id}` KHÔNG tự thành chip (lưu thành text thuần — verify round-trip) → bắt buộc chip HTML đầy đủ. Sửa mcp-integration, requirement.md, traceability (phân biệt với `description` task/comment nơi URI trần auto-chip).
- **SRS theo chức năng:** hướng dẫn cũ (`content` trống → template hệ thống) làm mất title (→ "SRS") + sai format (ISO 29148 generic thay vì use-case của team). Đổi sang viết content use-case trực tiếp + title có nghĩa; cảnh báo template ghi đè title.
- **Glossary dedup** dùng `list_documents(query=…, kind=…)` — `query` lọc theo tiêu đề nên trượt glossary đặt tên tiếng Việt → bỏ `query`, chỉ `kind="glossary"`.
- **Thuật ngữ "module"/"Module/Function" đời cũ** còn sót → "plan item (theme/epic/story)" ở traceability, doc-split, backlog-grooming, context-discovery, các workflow (trace/qa/write-doc).
- **`effort_est` (field dẫn xuất) ghi như set được** → `effort_est_level` (project-manager).
- **Tàn dư "(khi vai QA được xây)"** (vai QA đã tồn tại) → bàn giao thẳng `/fare-test` `/fare-verify` (spec-reviewer, trace, groom, change-request, task-breakdown).
- **Ranh giới vai:** Dev được ngụ ý tự cập nhật api_doc/erd (không có tool) → bàn giao technical-writer; `fare-traceability` xếp nhầm vào "skill chính" của QA → bàn giao BA.

### Changed
- **`fare-plan-breakdown`:** thêm cảnh báo "đừng mirror cách gom nhóm của tài liệu nguồn — regroup theo cohesion domain" (nguồn thường phrasing theo value nên dễ tưởng đúng trục).
- **Chuẩn hóa khuôn agent** PM/QA/Dev: thêm header "Nhận đầu vào từ / Bàn giao cho" (đồng bộ với BA/technical-writer/spec-reviewer) để soi handoff dễ.
- **Linter `bin/check-tools.mjs`:** thêm `query_params` (field schema api_doc) vào allowlist `NON_TOOL` — tránh dương tính giả.

## [2.0.0] - 2026-06-26

> **BREAKING:** đồng bộ với API MCP FARE bản mới — bỏ mô hình Module/Epic đời cũ, đổi tên param `module_id` → `plan_item_id`. Skill/prompt pin theo tên tool hoặc param cũ cần cập nhật.

### Changed
- **Đổi tên param `module_id` → `plan_item_id` (đồng bộ với hard rename trên MCP server).** Backend đã rename param đầu vào (`create_tasks`/`create_document`/`update_document`/`list_documents`/`list_tasks`: `module_id`→`plan_item_id`, `module_ids`→`plan_item_ids`) và field trả về (`module_name`→`plan_item_name`, output `module`→`plan_item`); DB column nội bộ vẫn `module_id`. Skill pack cập nhật toàn bộ ví dụ gọi tool + prose sang `plan_item_id`/`plan_item_ids`; ghi chú "di sản đặt tên" trong `fare-mcp-integration` đổi thành "tham chiếu plan item" (nêu rõ tên cũ `module_id` nay đã đổi). Cập nhật `bin/check-tools.mjs`.
- **Đồng bộ với API MCP FARE bản mới — bỏ Module/Epic đời cũ, theo mô hình plan item `theme › epic › story`.** Đối chiếu skill pack với 40 tool server thật expose (`https://fare.kola.vn/mcp`) phát hiện drift diện rộng: skill gọi loạt tool đã bị gỡ (`add_module`/`update_module`/`list_modules`/`delete_module`, `create_epic`/`update_epic`/`query_epics`, `get_plan`, `get_test_case`, `create_task`/`create_test_case` số ít) và bỏ trống tool server có (`add_plan_item`/`update_plan_item`/`list_plan_items`/`delete_plan_item`, `edit_document`, `read_diagram`/`edit_diagram`, `get_comments`). Sửa toàn bộ:
  - **Hợp đồng tool canonical (1 nguồn duy nhất):** viết lại `fare-mcp-integration` thành manifest 40 tool + mô hình WBS plan item (theme/epic/story), mô hình effort (story: complexity 1-5 / scope 6-10 / clarity 11-15 → effort auto; epic: `effort_est_level` L1-L4; theme read-only), ghi rõ di sản param `module_id` = id plan item. Mọi skill khác trỏ về đây cho chữ ký tool.
  - **Linter chống tái drift:** `bin/check-tools.mjs` đối chiếu mọi tên-giống-tool trong `.agent/` với hợp đồng; phân biệt *gọi* tool đã gỡ (lỗi, fail build) vs *nhắc tên* (cảnh báo) + directive `lint:allow` cho tài liệu cố ý. Wire vào `sync:claude` + `prepack` (gate npm publish) + script `check:tools`.
  - **Viết lại theo mô hình mới:** `fare-plan-breakdown` (Module/Submodule/Function → theme/epic/story), `fare-effort-estimation` (story attrs ↔ epic level đúng cấp), `fare-epic-management` + `/fare-epic` (Epic initiative độc lập đã bị gỡ → thao tác epic ở cấp plan item, bỏ status/owner/at_risk/bulk-assign), `fare-backlog-grooming` (bỏ bucket epic at_risk/overdue/no-owner → "nhánh WBS rỗng"); cập nhật agents (BA/PM/QA/Dev/technical-writer), `fare-rules`, `USAGE`, `ARCHITECTURE`, và các skill liên quan (context-discovery, traceability, task-breakdown, task-pickup, test-execution, change-request, self-verify, spec-authoring, test-authoring, doc-split, doc-normalize, plan-versioning) + `patch_document` → `edit_document`.

### Fixed
- **Link nội bộ giữa tài liệu** — chốt cơ chế đúng = **chip mention**, không phải markdown link. `fare://documents/{id}` (URI trần) tự thành chip bấm được; muốn nhãn riêng → `<a class="fare-mention" data-type="mention" data-id="{id}" data-doc-type="richtext" href="/docs/{id}">{nhãn}</a>` — **phải đủ `data-type="mention"`**, thiếu nó backend nhân đôi chip. Markdown `[{nhãn}](fare://documents/{id})` thiếu `class="fare-mention"` → frontend bỏ qua, KHÔNG bấm được (đã verify trên FARE). Sửa guidance sai ở `fare-doc-split` (Bước 4 nối link), `fare-traceability` (ma trận truy vết), `fare-spec-authoring/requirement.md`, `fare-mcp-integration`.
- **Sơ đồ use-case dùng `diagram` (drawio), KHÔNG `use_case` doc_type**: doc_type `use_case` render lỗi (chỉ hiện actor + connection, không hiện node) — verify trên FARE. `diagram` (mxGraph/drawio) vẽ use-case OK. Khuyến nghị: đặc tả văn bản (richtext) là nguồn-sự-thật; sơ đồ use-case = `diagram` overview tuỳ chọn, link spec↔diagram qua chip mention.
- **Ép quy tắc "mỗi Bước là đoạn riêng (dòng trống)"** sau khi dogfood vùng 4 lộ lại lỗi "Bước dính 1 dòng" khi agent đẩy MCP-only (không chạy script): nâng rule thành prominent + **verify bắt buộc sau đẩy** (`read_document` đọc lại, dính → patch) ở `use-case-spec.md` + self-check `fare-doc-normalize` + `fare-doc-split` (Bước 6). Không còn ỷ lại script.
- **Thêm bước đề xuất vẽ sơ đồ use-case**: `fare-doc-split` Bước 7 — sau khi đẩy bộ spec có Mã UC, agent CHỦ ĐỘNG hỏi User có vẽ `diagram` use-case không (§5), không tự tạo. Vá gap "sinh Mã UC nhưng không hỏi vẽ sơ đồ".
- **Xử lý nguồn RẤT LỚN** (sau dogfood doc 49 trang lộ: agent lẫn field giữa các section + drift sang template tự chế "Business Rules/Action/…" + bỏ Mã UC): `fare-doc-split` (Bước 2 box "nguồn lớn → chia mẻ ~3–5 mục/lần + chốt từng mẻ + đối chiếu mỗi spec 1:1 đúng section nguồn") + self-check; `use-case-spec.md` (BẮT BUỘC dùng đúng bộ nhãn chuẩn + h1 + Mã UC, cấm tự chế template; thêm map dialect Precondition/Action/Expected Result/Business Rules → nhãn chuẩn); `/fare-srs` Bước 3.
- **Chống đẩy bản RAW lên FARE** (dogfood redo doc 167: agent chạy split — vốn GIỮ raw — rồi đẩy thẳng, BỎ normalize → doc trên FARE là bảng HTML nguồn nguyên xi, nhãn English, Bước dính, bullet `*`/`+` literal): `fare-doc-split` (làm rõ "raw chỉ cho standalone; đẩy thẳng / orchestrator → normalize TRƯỚC create, cấm đẩy raw" + self-check); `/fare-srs` Bước 3 ("đẩy = bản ĐÃ normalize, cấm raw") + Bước 4 verify phát hiện raw (`<table>` nguồn / nhãn Overview-Basic Flow / bullet literal).
- **Nguồn lớn TRÀN CONTEXT → file local làm bộ nhớ ngoài** (dogfood doc 7 = 49 trang: tràn context → runtime nén phiên → giao giữa 2 phiên mất mạch → lẫn/bịa/drift): `fare-doc-split` Bước 2 — **hút nguồn xuống file → script → tách thành file/section (`docs/outputs/`) làm checkpoint bền → chuẩn hóa + đẩy TỪNG file** (mỗi lúc chỉ 1 section trong context, resume được khi đổi phiên); `/fare-srs` Bước 3 trỏ theo. Không cố tiêu hóa cả tài liệu trong context.
- **Phát hiện cỡ nguồn (biết khi nào cần flow file-checkpoint):** backend `read_document` markdown mode nay **LUÔN trả `pagination`** (`page`/`total_pages`/`has_more`, kể cả 1 trang) + **`size_note`** khi ≥6 trang (gợi ý xử file-checkpoint); mô tả tool khai rõ. Skill: `fare-doc-split` Bước 1 + `/fare-srs` Bước 1 — **check `total_pages`/`size_note` ngay lần đọc đầu → chọn flow** (nhỏ = thường; lớn = file-checkpoint). [Cần backend FARE đi kèm.]

### Added
- **Skill `fare-plan-review` + workflow `/fare-plan-review`** (vai BA) — **chấm / kiểm toán** một cây plan item `theme › epic › story` đã có theo rubric chất lượng: mỗi story (nghiệm thu được · là giá trị không phải task · đong được effort · tên chuẩn · một giá trị · đủ cha-ông), epic (gom story cùng mục đích · tên nhóm giá trị thật không sao tên con · effort đúng cấp), theme (mảng năng lực · đúng tầm · theo giá trị không theo code · read-only effort), và cấu trúc cây (đủ 3 tầng · không **tầng giả**). Báo cáo điểm + đề xuất sửa (rename / di chuyển `parent_id` / tách story / gỡ vỏ rỗng), **CHỜ User chốt** — read-only mặc định. Song sinh với skill TẠO `fare-plan-breakdown` (giống cặp `fare-spec-authoring` ↔ `fare-audit-spec`). Lấp khoảng trống: trước đây không skill nào audit chất lượng cây WBS.
- **Làm giàu `fare-plan-breakdown`** với triết lý phân rã trục-giá-trị: định nghĩa theme/epic/story (mảng năng lực · nhóm giá trị · đơn vị nghiệm thu), phép thử từng tầng (story hay task?), xử lý **nhánh nông** (tầng mỏng tên thật, không tầng giả), tiêu chí **tách story**, anti-pattern (story=task · tên có dấu + · tên mô tả cơ chế · tầng giả). Reconcile effort khớp FARE: epic dùng `effort_est_level` (L1–L4), theme roll-up, chỉ story dùng C/S/Cl.
- **Workflow `/fare-srs`** (orchestrator) — chuẩn hóa 1 tài liệu nguyên khối thành 1 **vùng SRS hoàn chỉnh**: điều phối end-to-end (discover → lập doc-set + chốt → tách/normalize → verify sau đẩy → wire index → đề xuất diagram use-case → nối link chéo → báo cáo). Vá gap "agent làm xong từng doc nhưng không ráp lại" (index/diagram/link). Khác `/fare-ba` (chỉ per-doc). **Chặn phạm vi cứng: đúng 1 tài liệu nguồn/lần, xong là DỪNG + báo cáo, KHÔNG tự sang vùng khác; tạo folder/di chuyển doc = duyệt riêng (§2). Diagram-offer = cổng bắt buộc.** (Sau dogfood lộ agent tự chạy tiếp vùng kế + bỏ hỏi diagram → siết lại.)
- `fare-mcp-integration`: pattern chuẩn "Link nội bộ giữa tài liệu = chip mention" (URI trần auto / chip HTML có nhãn — **bắt buộc `data-type="mention"`** kẻo nhân đôi / cấm markdown link).

### Removed
- **Gỡ `use_case` doc_type khỏi skill pack** (giữ "use-case" dạng KHÁI NIỆM — đặc tả văn bản richtext + sơ đồ `diagram` drawio). Xoá `fare-spec-authoring/references/use-case.md`; gỡ khỏi list doc_type ở `fare-spec-authoring`, `fare-mcp-integration`, `fare-rules §4`, `fare-technical-writer`, `fare-change-request`, `fare-plan-breakdown`, `ARCHITECTURE`. Lý do: render lỗi + trùng đặc tả văn bản. (Gỡ ở **product code** backend/FE/DB là task eng riêng, cần build-verified — chưa làm.)

---

## [1.1.0] — 2026-05-28

### Added
- Hỗ trợ khái niệm **bug INTRINSIC (nội sinh) vs EXTRINSIC (ngoại lai)** của FARE:
  - `fare-mcp-integration`: mục mới giải thích `bug_origin`, `linked_task_id` bắt buộc cho INTRINSIC, và lỗi `422 TASK_DONE_BLOCKED`.
  - `fare-rules.md` §6: DONE Gate cứng — task không thể chuyển DONE khi còn bug INTRINSIC chưa đóng hoặc TC `failed` chưa re-verify (backend enforce).
  - `fare-bug-reporting`: bước xác định `bug_origin`; TC fail → mặc định INTRINSIC + `linked_task_id` task gốc; bug độc lập → EXTRINSIC.
  - `fare-test-execution`: TC fail tạo bug INTRINSIC chặn task gốc; đối chiếu bug INTRINSIC open khi đề xuất task TEST → DONE.
  - `fare-self-verify`: Dev check bug INTRINSIC open trước khi handoff/DONE.
  - `fare-backlog-grooming`: bucket mới — task chặn bởi bug INTRINSIC, bug INTRINSIC mồ côi, EXTRINSIC tồn đọng.
- `fare-mcp-integration`: note về **strict param validation** — param sai tên bị reject (`Unrecognized key`) thay vì bỏ qua âm thầm; gặp lỗi thì đọc lại mô tả tool, không tự đoán tên param.

### Fixed
- `fare-doc-split`: sửa mô hình đọc — `read_document` phân trang theo KÝ TỰ (cắt ngang section/table), KHÔNG theo section. Bước 2 nay hướng dẫn đọc tuần tự + ghép theo ranh giới heading (đóng section chỉ khi gặp heading kế tiếp) → chống mất đuôi / lẫn đầu section. Bổ sung: nhãn "- DONE" (bỏ ở tên file, giữ ở nội dung), cross-ref đa dạng ("(Mục X.Y)", số lạ), xử lý `<s>`/`<mark>`/comment-highlight + sổ ⚠️ lỗi nguồn; ảnh nhúng (giữ ref `fare://files`, bỏ alt AI noise); indent đa kiểu + marker `⟨INDENT:pl=N⟩`.
- `fare-doc-normalize`: `<s>` (gạch = nội dung đã bỏ) phải giữ (`~~...~~`) + ⚠️, KHÔNG xóa/coi như còn hiệu lực; `<mark>`/comment-highlight bảo toàn ngữ nghĩa. Phân định rõ form (làm sạch) vs ngữ nghĩa (bảo toàn).

### Added (doc-split/normalize)
- **Script `scripts/html_to_md.py`** (Python stdlib, zero-dep) cho `fare-doc-normalize` — biến đổi cú pháp deterministic: table→heading+key-value, bullet từ indent đa kiểu (`<ul><li>`/`data-indent`/`padding-left`/`⟨INDENT:pl=N⟩`/`+`), `<img fare://files>`→markdown (bỏ alt AI), `<s>`→`~~..~~`, `<mark>`→bỏ thẻ, comment-highlight→⚠️, heading function→`#`. Script **pure local transform** — không gọi MCP/DB. Skill nay phân vai: script lo cú pháp lặp-lại, agent lo ngữ nghĩa (ranh giới section, cross-ref, sổ ⚠️, đặt tên). Render chèn **dòng trống giữa các paragraph** (giữ bullet liền) để tránh lỗi CommonMark gộp "Bước 1/Bước 2…" vào chung một đoạn; `use-case-spec.md` ghi rõ quy tắc dòng trống cho trường hợp gõ tay.
- `fare-rules.md §8`: làm gọn về nguyên tắc (MCP là kênh DUY NHẤT đọc/ghi FARE) + 1 dòng carve-out cho script biến đổi text local; chi tiết vận hành nằm ở skill, không nhồi vào rule chung.
- **Markup biên tập KHÔNG nhét `⚠️` vào thân doc** — comment/highlight/`<s>`/cross-ref-chưa-phân-giải là metadata, báo User NGOÀI LUỒNG (script gom ra stderr; split + normalize ghi "sổ phát hiện" báo ở bước report, không vào thân). Trước đây split nhét `⚠️` vào nháp → bị đẩy lên FARE làm sai bản chất tài liệu; nay cả `fare-doc-split` và `fare-doc-normalize` giữ thân SẠCH (chỉ nội dung + formatting nguồn như `<s>`→`~~..~~`).
- **Convention trình bày use-case** (`use-case-spec.md` + self-check, kèm ví dụ mẫu "gold"): field bullet `**Tên field** *(Bắt buộc)*: spec`; bước nhiều nhóm field → **lồng** (nhóm = bullet L1, field = bullet L2, không để nhãn nhóm ngang cấp "Bước N"); paragraph cách nhau dòng trống. Đây là phần phán đoán (script không tự suy) → khóa bằng ví dụ mẫu + self-check.
- **Cảnh báo fidelity khi gộp sub-bullet**: gộp nhiều ý con của 1 field thành dòng `;` phải giữ ĐỦ mọi ý (đếm sub-bullet nguồn = số mệnh đề) — chống rớt rule (vd điều kiện enable field).

> Verified thực tế trên doc "Quản lý lớp" (id 163, 7 trang) + "Quản lý trường/doanh nghiệp" (id 162, 19 trang, có ảnh nhúng + indent đa kiểu + marker) — HTML table export từ Word.

### Notes
- Yêu cầu FARE backend có: migration `tasks.bug_origin` + MCP tool contract expose `bug_origin` / `linked_task_id` (CREATE/UPDATE/LIST task) + strict tool input validation. Skill pack v1.1.0 đi kèm backend tương thích.

---

## [1.0.2] — 2026-05-26

### Changed
- `init` không còn prompt MCP endpoint / API key / scope. Trách nhiệm đăng ký MCP tách sang `register-mcp` command riêng. `init` giờ chỉ sao chép `.agent/` vào target và in next-steps hint.
- README rewrite theo văn phong factual, lược bỏ phrasing mang tính marketing / tự sự.

---

## [1.0.1] — 2026-05-26

### Fixed
- `npx fare-skill-pack init` thất bại với `fare-skill: not found` vì bin name khác package name. Thêm bin alias `fare-skill-pack` (trùng tên package) bên cạnh `fare-skill` cũ. Cả hai lệnh đều khả dụng.

### Notes
- Trên v1.0.0, workaround cho bin alias: `npx -p fare-skill-pack fare-skill init`.
- Trên v1.0.1+, `npx fare-skill-pack init` chạy native.

---

## [1.0.0] — 2026-05-25

Initial release — bộ skill Antigravity / Claude Code đầu tiên vận hành FARE qua MCP. Phủ trọn vòng đời `requirements → design → dev → testing` với 4 vai chính + 2 vai phụ trợ.

### Added

**6 Agent**
- `fare-business-analyst` — phân tích yêu cầu, viết & tách spec, chia cây module, traceability, change request.
- `fare-project-manager` — chia function thành task, FP effort analysis, plan versioning, backlog grooming, epic management.
- `fare-qa-engineer` — viết test case từ AC (ISTQB), verify_history atomic, bug reporting theo §5.
- `fare-developer` — pickup task, impact analysis qua code intelligence, self-verify & handoff. KHÔNG tự code (rule §8).
- `fare-technical-writer` — viết tài liệu kỹ thuật (api_doc, erd, diagram, specification).
- `fare-spec-reviewer` — soát spec 6 lăng kính (Data Integrity, Unhappy Paths, Security, Usability, Testability, UI/UX vs Figma).

**22 Skill** — chia thành 4 nhóm:
- **Chung (2):** `fare-context-discovery`, `fare-mcp-integration`.
- **BA (6):** `fare-spec-authoring`, `fare-doc-split`, `fare-doc-normalize`, `fare-plan-breakdown`, `fare-traceability`, `fare-change-request`.
- **PM (5):** `fare-task-breakdown`, `fare-effort-estimation`, `fare-plan-versioning`, `fare-backlog-grooming`, `fare-epic-management`.
- **QA (3):** `fare-test-authoring`, `fare-test-execution`, `fare-bug-reporting`.
- **Dev (3):** `fare-task-pickup`, `fare-impact-analysis`, `fare-self-verify`.
- **Tiện ích (3):** `docx`, `pdf`, `xlsx` (đọc file đầu vào).

**16 Workflow** (slash-command)
- BA: `/fare-ba`, `/fare-plan`, `/fare-trace`, `/fare-change`.
- PM: `/fare-pm`, `/fare-breakdown`, `/fare-groom`, `/fare-epic`.
- QA: `/fare-qa`, `/fare-test`, `/fare-verify`.
- Dev: `/fare-dev`, `/fare-impact`, `/fare-handoff`.
- Khác: `/fare-write-doc`, `/fare-audit-spec`.

**3 Rule always-on**
- `fare-rules.md` — 9 quy tắc bất khả xâm phạm khi gọi MCP (Hierarchy Strictness, Confirmation Gate, Context First, Tool Optimization, Socratic Gate, Task Lifecycle 4-state, Content Fidelity, MCP-only, Brief Response).
- `operating-mode.md` — 2 chế độ vận hành (Substitute / Assistant).
- `GEMINI.md` — entry point thứ tự đọc đầu phiên.

**Đặc tính nổi bật**
- **Bottom-up `est_effort`** — ước task theo bản chất task (2 chiều: AI level × Dev level), KHÔNG chia từ function. Ceiling check 6-tier theo `sum / (function.effort_est × hours_per_day)`.
- **Epic dimension** — initiative cross-module gom task qua `epic_id`. Phân biệt rõ Epic ≠ Module ≠ Campaign ≠ Plan.
- **Confirmation Gate (§2)** — mọi action thay đổi dữ liệu trên FARE đều phải User chốt trước. Cấm gộp nhiều quyết định quan trọng vào 1 lệnh.
- **Bug discovery §5** — agent KHÔNG tự `create_tasks(type=BUG)`. Phải báo Markdown + hỏi User + chờ chốt.
- **Task lifecycle §6** — 4-state cứng `TODO → IN_PROGRESS → VERIFYING → DONE`. KHÔNG skip; DONE cần evidence verify.
- **Content Fidelity §7** — KHÔNG bịa, KHÔNG tự duyệt (`approved`/`archived`), KHÔNG tự publish plan version.
- **MCP-only §8** — agent chỉ thao tác qua MCP, không truy cập file ngoài workspace `.agent/`.

**CLI tool `fare-skill`** (zero deps, Node stdlib)
- `init [target]` — copy `.agent/` vào workspace + in lệnh `claude mcp add` (KHÔNG tự exec để giữ secret an toàn).
- `update [target]` — backup `.agent/` hiện tại + overwrite với version mới.
- `uninstall [target]` — confirm + xóa `.agent/`.
- `register-mcp` — chỉ in lệnh đăng ký MCP (cho workspace đã có `.agent/`).
- `help`, `version`.

**Yêu cầu FARE backend** (đi kèm với v1.0.0 của skill pack — cần FARE backend tương thích):
- Resource `fare://projects/{code}` trả thêm field `hours_per_day` (đọc qua `configurations` table, key `working_hours_config` global hoặc per-project `working_hours_config:project:{id}`, default 8).
- Resource mới `fare://modules/{id}/task-effort-summary` — sum est/actual, breakdown by type + meta_status, ratio_actual_est_done.
- Resource mới `fare://projects/{code}/velocity` — median(actual/est) cho task DONE qua 3 cửa sổ 30/60/90d, breakdown by type, dùng Postgres `PERCENTILE_CONT`.

### Installation

```bash
# Cách 1 — qua npm registry (sau khi publish)
npx fare-skill-pack init

# Cách 2 — install thẳng từ GitHub (không cần npm publish)
npx github:bacng95/fare-skill-pack init

# Pin theo tag
npx github:bacng95/fare-skill-pack#v1.0.0 init
```

### Notes

- Bộ skill thiết kế cho **dev đỡ vai** các chuyên gia (Substitute mode mặc định). Nếu workspace có BA/PM/QA/Dev thật → chế độ Assistant.
- Không phụ thuộc external npm package nào ngoài Node stdlib.
- Tương thích Antigravity và Claude Code.

[Unreleased]: https://github.com/bacng95/fare-skill-pack/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.1.0
[1.0.2]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.0.2
[1.0.1]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.0.1
[1.0.0]: https://github.com/bacng95/fare-skill-pack/releases/tag/v1.0.0
