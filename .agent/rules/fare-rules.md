---
trigger: always_on
name: fare-global-rules
description: Các quy tắc tối thượng (Global Rules) bắt buộc áp dụng cho toàn bộ ecosystem fare-* (Agents & Workflows) khi tương tác với FARE MCP.
---

# FARE Pipeline Global Rules

File này định nghĩa các quy tắc **bất khả xâm phạm** (Non-negotiable Rules) dành cho tất cả các Agents có tiền tố `fare-*` (Business Analyst, Software Manager, QA, Developer, Spec Reviewer).

> [!CRITICAL]
> **THỰC THI BẮT BUỘC:** Nếu bạn đang load một agent thuộc hệ sinh thái FARE, bạn PHẢI tuân thủ các quy tắc dưới đây trước khi thực hiện bất kỳ lệnh MCP (`*`) nào làm thay đổi dữ liệu.

## 1. 🏗️ Hierarchy Strictness (Quy tắc Phân cấp)
Hệ thống FARE yêu cầu phân cấp dữ liệu chặt chẽ.
- **Quy tắc 3 cấp độ:** Luôn duy trì kiến trúc `Root Module` > `Submodule` > `Function`. Tuyệt đối không tạo Function nằm trực tiếp dưới Root.
- **Không có dữ liệu mồ côi:** 
  - MỌI `Task` phải có `module_id`.
  - MỌI `Test Case` phải thuộc về một `document_id` (loại test_case).
  - MỌI `Document` kỹ thuật (API, ERD, Use Case, User Story) phải gắn với `module_id` của cấp Function.

## 2. 🛡️ Cổng xác nhận & Thay đổi An toàn (Confirmation Gate)

Agent KHÔNG được tự ý thực thi hành động quan trọng / khó hoàn tác khi User chưa ra lệnh trực tiếp cho **chính hành động đó**. Quy trình bắt buộc trước mỗi hành động loại này:
1. Nêu rõ: định làm gì, tool nào, payload tóm tắt, tác động dự kiến.
2. **DỪNG lại**, chờ User trả lời đồng ý ("ok" / "đúng rồi" / "làm đi").
3. Cấm gộp nhiều quyết định quan trọng vào một lượt rồi thực thi luôn — mỗi quyết định một xác nhận.

**Các hành động BẮT BUỘC xác nhận trước:**
- **Xóa:** `delete_task`, `delete_document`, `delete_module` — tuyệt đối không gọi nếu User chưa nói rõ "xóa …".
- **Ghi đè nội dung** tài liệu / test case đã có: `update_document`, `patch_document`, `update_test_case` (khi sửa nội dung). Phát hiện sai sót → ưu tiên `add_comment` / `create_suggestion` báo cáo, KHÔNG âm thầm sửa.
- **Di chuyển tài liệu** sang folder / scope / module khác — đây là quyết định vị trí, KHÔNG tự đoán đích (xem skill `fare-mcp-integration`).
- **Đổi trạng thái task**, đặc biệt khi chuyển sang `DONE` — xem mục 6.
- **Tạo dữ liệu hàng loạt** lên FARE: `create_tasks`, `create_test_cases`, hoặc nhiều `create_document` liên tiếp.
- **Tạo mới Feature / Requirement** — phải qua Socratic Gate (mục 5).
- **Đổi cấu trúc module:** `add_module` / `update_module` thay đổi cây phân cấp hoặc attribute.

Ngoại lệ: nếu User đã phát lệnh trực tiếp đúng hành động đó ("xóa task FCORE-12 đi") thì lệnh đó CHÍNH LÀ xác nhận — không cần hỏi lại.

## 3. 🧠 Context First (Ngữ cảnh đi đầu)
- **Không suy đoán (No Guessing):** Không bao giờ tự bịa ra `projectCode`, `module_id`, `task_id`, `status_id` hay `document_id`. Phải luôn dùng các công cụ List (`list_projects`, `list_modules`, `list_tasks`, `list_documents`) hoặc `search_rag` (cho tìm kiếm ngữ nghĩa) để lấy ID chính xác từ cơ sở dữ liệu.
- **Đọc trước khi làm:** Khi được giao một Task ID, việc đầu tiên là phải gọi `list_tasks(id=<task id hoặc code>)` để lấy chi tiết task, đọc description để lấy URI các tài liệu liên quan, sau đó dùng `read_document` để nạp kiến thức trước khi bắt đầu viết code hoặc test.
- **Đọc trạng thái hiện tại trước khi GHI:** trước khi `create_document` / `update_document` / tạo folder, phải đọc `fare://projects/{code}/knowledge-tree` để biết cấu trúc folder + tài liệu đang có. Tái dùng folder đã tồn tại (lấy đúng `id`) — KHÔNG tạo folder trùng tên/trùng mục đích. Tuyệt đối không create/update "mù" khi chưa nắm trạng thái đích.

## 4. 🚀 Tool Optimization (Tối ưu hóa Công cụ)
- **Batching là bắt buộc:** LUÔN sử dụng `create_tasks` (truyền mảng `tasks`) — kể cả khi chỉ tạo 1 task. Tương tự, dùng `create_test_cases` (số nhiều) cho mọi tình huống tạo test case.
- **Đổi status — `meta_status` trước:** mặc định dùng `update_task(meta_status=...)` với `meta_status ∈ {TODO, IN_PROGRESS, VERIFYING, DONE}` — chạy được mọi project, KHÔNG cần lookup. Chỉ khi project có workflow tùy biến (gọi `list_projects(id=<code>, include_task_statuses=true)` thấy mảng `task_statuses` non-empty) mới dùng `status_id` lấy ID từ mảng đó. Tuyệt đối KHÔNG hard-code số `status_id`.
- **Tìm document:** dùng `list_documents` với tham số `query` để lọc theo từ khóa tiêu đề; dùng `search_rag` cho tìm kiếm ngữ nghĩa theo nội dung.
- **Không truyền `null` cho optional param:** field không đổi thì **BỎ HẲN** khỏi payload. Schema MCP từ chối `null` / `""` / `0` cho field số (`folder_id`, `module_id`, `parent_id`…) → lỗi `-32602 Input validation error`. Bỏ field = giữ nguyên giá trị cũ; truyền `null` để "giữ nguyên" là SAI và sẽ fail.
- **Tuân thủ Format JSON:** Khi tạo Document dạng cấu trúc (`api_doc`, `erd`, `use_case`, `user_story`, `diagram`, `test_case`), bắt buộc truyền Content dưới định dạng JSON hợp lệ theo đúng Document Schema (xem mô tả tool). Markdown chỉ dành cho `doc_type="richtext"`.
- **Patch thay vì Rewrite:** Với richtext, ưu tiên `patch_document` (block-level ops) thay vì `update_document` để không ghi đè cả tài liệu và bảo toàn keystroke đồng thời (CRDT).
- **Attribute IDs:** Khi thêm/sửa Module, không truyền giá trị 1-5 bừa bãi cho `complexity`, `scope`, `clarity`. Bắt buộc phải truyền **ID thực tế** của Attribute (Complexity IDs 1-5, Volume IDs 6-10, Clarity IDs 11-15).
- **Ngôn ngữ & nội dung Task/Doc:** Mọi `title` và `description` của Task, BUG, Test Case và Document do agent tạo ra phải:
  - Viết bằng **tiếng Việt**, ngắn gọn, dễ hiểu, gợi rõ chức năng/nhiệm vụ liên quan (ví dụ tốt: `"Sửa luồng đăng nhập SSO khi token hết hạn"`; ví dụ kém: `"Fix bug auth"` hoặc `"Task 1"`).
  - `description` phải đủ chi tiết: bối cảnh, hành vi mong đợi, Acceptance Criteria (nếu là task feature) hoặc Steps to Reproduce + Expected vs Actual (nếu là BUG).
  - **Đính kèm URI tài liệu liên quan** trong description theo định dạng `fare://documents/{id}` (User Story, API Doc, ERD, Use Case, audit doc...). Nếu chưa có document, ghi rõ "tài liệu sẽ bổ sung sau" — không để trống reference.

## 5. 🤝 Socratic Gate & Bug Discovery (Chốt chặn Socratic & Khi phát hiện bug)
- Bất kỳ yêu cầu tạo mới Tính năng / Requirement nào cũng phải đi qua **Socratic Gate**.
- Agent (đặc biệt là BA và PM) phải hỏi ít nhất 2 câu hỏi (về Edge Cases, User Roles, Limit/Threshold) để xác nhận yêu cầu của User trước khi tiến hành đẩy dữ liệu lên FARE.
- **Bug Discovery (khi agent phát hiện bug/issue trong lúc làm việc):**
  - KHÔNG tự ý gọi `create_tasks(type=BUG)` để publish lên FARE.
  - Trước hết, **báo cáo cho User** bằng Markdown trong chat: hiện tượng, root cause (nếu suy luận được), file/module liên quan, mức độ ảnh hưởng.
  - **Hỏi User** có muốn đẩy bug này lên FARE để theo dõi không (vd: *"Bạn có muốn tôi tạo BUG task `[tên gợi ý]` trên project [Code] để track không?"*).
  - Chỉ tạo BUG task **sau khi User xác nhận** — và title/description phải theo rule mục 4 ở trên.

## 6. ✅ Task Lifecycle 4-state (Quản lý trạng thái task)

Mỗi task chạy qua 4 trạng thái cố định — chuyển theo timing thực tế, không skip:

| Trạng thái | Khi nào dùng | Hành động đi kèm |
|---|---|---|
| **TODO** | Task vừa tạo, chưa có ai bắt tay làm | (mặc định khi `create_tasks`) |
| **IN_PROGRESS** | Agent/dev *đang chuẩn bị* hoặc *đang code/audit/test*, chưa có deliverable | `update_task(meta_status="IN_PROGRESS")` + `add_comment` mô tả phạm vi đang làm |
| **VERIFYING** | Code/work đã hoàn thành + push (nếu cần) → chờ verify (TC pass, user confirm, hoặc QA test) | `update_task(meta_status="VERIFYING")` + `add_comment` chứa commit hash, checklist verify (steps cụ thể), file đụng |
| **DONE** | Đã verify pass (TC `verify_history.passed`, user "verified rồi đóng đi", hoặc CI cited pass) | `update_task(meta_status="DONE")` + comment kết quả verify |

**Quy tắc cứng:**
- KHÔNG chuyển TODO → DONE trực tiếp; luôn phải qua IN_PROGRESS + VERIFYING.
- KHÔNG chuyển sang DONE chỉ vì "code đã commit/push" hoặc "build pass" — đó là điều kiện ĐỦ cho VERIFYING, không phải DONE.
- KHÔNG để task `IN_PROGRESS` mà không có comment giải thích đang làm gì (giúp người khác không pickup nhầm).
- Task `type=TEST` chỉ vào DONE khi mọi TC liên quan có `update_test_case(verify={verify_status:"passed"})` ghi trong `verify_history`.

**🔒 DONE Gate — FARE backend ENFORCE (không né được):**
`update_task(meta_status="DONE")` bị backend chặn (lỗi `422` code `TASK_DONE_BLOCKED`) khi task còn:
1. **Bug nội sinh (INTRINSIC) chưa đóng** — bug `type=BUG`, `bug_origin="INTRINSIC"`, `linked_task_id=<task này>`, `meta_status≠DONE`. Đây là bug phát sinh TRONG quá trình làm chính task này (TC verify failed, tester báo từ task drawer).
2. **Test case status `failed` chưa re-verify** — TC link với task còn `failed`.

Error payload kèm `open_intrinsic_bugs[]` + `failed_test_cases[]`. Agent gặp lỗi này:
- KHÔNG retry mù. Đọc payload → báo User: task còn bug/TC nào chặn.
- Đề xuất xử lý: đóng từng bug INTRINSIC (sau khi fix) hoặc re-verify TC failed → pass, RỒI mới DONE task gốc.
- Phân biệt **bug INTRINSIC** (chặn task cha) ↔ **bug EXTRINSIC** (độc lập, production/regression/user report — KHÔNG chặn task nào). Xem `fare-mcp-integration`.

**Đổi status — `meta_status` trước, `status_id` chỉ khi cần:**
Mặc định: `update_task(meta_status="TODO"|"IN_PROGRESS"|"VERIFYING"|"DONE")` — không cần lookup gì. Chỉ khi project có workflow tùy biến (gọi `list_projects(id=<code>, include_task_statuses=true)` thấy `task_statuses` non-empty) mới dùng `status_id` lấy từ mảng đó. KHÔNG hard-code số `status_id`.

**Nhắc nhở batch:** khi review backlog (vd cuối ngày, end-of-sprint), quét toàn bộ task, đối chiếu trạng thái thực tế với metadata; mọi task lệch (vd đã code xong nhưng vẫn TODO) phải sửa cho đồng bộ.

## 7. ✍️ Trung thực nội dung tài liệu (Content Fidelity)

Áp dụng khi agent **viết / tách / chuẩn hóa / chuyển đổi** tài liệu.

**§7 bảo vệ NỘI DUNG — KHÔNG bảo vệ FORM.**
- **Nội dung** = yêu cầu, luồng xử lý, giá trị, ràng buộc, business rule, thông báo lỗi → **bất khả xâm phạm**.
- **Form** = cách trình bày (bảng HTML, layout, markup) → **được phép & nên làm sạch**. Giữ nguyên một bảng HTML lồng rối "cho an toàn" là **HIỂU SAI §7** — chuẩn hóa mà không làm sạch form thì coi như chưa làm.

Quy tắc:
- **Làm sạch form** (bảng HTML rối → markdown sạch, đổi `kind` đúng bản chất) là tái cấu trúc hợp lệ. Sau khi sạch, mỗi câu vẫn phải **truy ngược 1:1** về nguồn.
- **KHÔNG động vào nội dung:** không thêm / bớt / đổi yêu cầu, giá trị, precondition, edge case, business rule. Không "sửa cho hợp lý". Không "phát hiện lỗi" không có thật.
- **Thông tin không có trong nguồn** → bỏ, hoặc đánh dấu `⚠️ [Suy luận — cần xác nhận]` tại chỗ + nêu cho User. Không trộn ngầm.
- **Lỗi / mâu thuẫn trong nguồn** (typo, copy-paste sai, default vô lý) → KHÔNG tự sửa thầm; ghi `⚠️` + báo User để User quyết.
- **Agent KHÔNG duyệt tài liệu:** không set `status="approved"` / `"archived"`. Nhãn "DONE" trong nguồn chỉ là chú thích cũ — giữ `draft`. Duyệt / lưu trữ là việc của con người.
- Vi phạm = **bịa đặc tả** → Dev code sai, QA test sai. Lỗi nghiêm trọng nhất khi làm tài liệu.

## 8. 🚫 MCP là kênh DUY NHẤT — cấm đi đường vòng

Agent thao tác với hệ thống FARE **chỉ** qua MCP tool / resource của FARE. TUYỆT ĐỐI KHÔNG:
- Truy cập source code hay thư mục backend của FARE (vd `/fare/backend`, hay bất kỳ đường dẫn nào ngoài workspace `fare_skill`).
- Đọc file cấu hình, `.env`, secret, connection string, khóa API.
- Kết nối trực tiếp tới database; chạy SQL hay script tay.
- Gọi API nội bộ, dò cổng, hay bất kỳ cách "đi đường vòng" nào khác để lấy / đổi dữ liệu FARE.
- Tự viết script / chương trình (Python, shell…) để gọi MCP server, hoặc để fetch / parse / "xử lý hàng loạt" dữ liệu FARE. **MCP tool là giao diện DUY NHẤT** — đọc tài liệu = tool `read_document` / resource, tạo tài liệu = `create_document`… Công việc = lời gọi MCP tool + suy luận của chính agent, KHÔNG phải một pipeline script tự dựng.
- Lấy file local / file scratch / kết quả của một phiên chạy TRƯỚC làm "nguồn sự thật". Tài liệu sống trên FARE thì nguồn LUÔN là FARE — đọc **tươi** qua `read_document` (ghim đúng `version`) mỗi lần làm việc. File local có thể đã hỏng hoặc lệch phiên bản.

**Provenance — file local phải tự khai xuất xứ:** mọi file `docs/outputs/` agent sinh ra từ một tài liệu FARE phải mở đầu bằng một dòng ghi rõ: nguồn (`fare://documents/{id}`), `version`, thời điểm tạo. Để bất kỳ ai (người / agent) cũng biết nháp dựa trên bản FARE nào, và kiểm được FARE đã đổi chưa.

**Khi một MCP tool / resource lỗi:** báo cáo lỗi cho User (nguyên văn) rồi **DỪNG**. KHÔNG tự chế giải pháp thay thế, KHÔNG đi đường vòng để "lấy bằng được" dữ liệu. Lỗi của MCP / FARE là việc của người bảo trì FARE — agent chỉ báo, KHÔNG tự vá.

Đi vòng qua DB / backend = bỏ qua toàn bộ kiểm soát truy cập, validation, audit của FARE, và là hành vi thu thập credential. Gặp lỗi MCP, agent **chỉ báo và dừng** — KHÔNG tự đề xuất hay gợi ý hướng đi vòng.

## 9. ✂️ Trả lời ngắn gọn, đúng trọng tâm

Phản hồi cho User chỉ chứa thứ cần để User hiểu kết quả hoặc ra quyết định. Cắt mọi thứ ngoài luồng.

- **Không thuật lại quy trình nội bộ:** KHÔNG kể đã đọc skill / file nào, đang ở chế độ gì, đang tuân rule số mấy (vd *"Theo Confirmation Gate §2…"*, *"Tôi đang vận hành ở chế độ Substitute…"*). Tuân quy tắc là việc ngầm — không phải nội dung báo cáo.
- **Không rào đón, không tự khen** (*"đã rà soát cực kỳ cẩn thận"*, *"đảm bảo 100% trung thực"*, *"một cách chuyên nghiệp"*). Nêu việc đã làm + kết quả, hết.
- **Đi thẳng vào việc:** cần User quyết → phương án gọn + câu hỏi. KHÔNG kèm "kế hoạch các bước sẽ làm sau" khi chưa được hỏi.
- Ưu tiên **bảng / bullet ngắn**; không văn xuôi dài; không lặp ý.

Vẫn giữ phần thực chất (vd bảng ánh xạ cần User duyệt) — chỉ cắt phần thừa bao quanh nó.
