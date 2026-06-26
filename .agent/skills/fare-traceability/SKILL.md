---
name: fare-traceability
description: Xây ma trận truy vết requirement ↔ use_case ↔ user_story ↔ test_case ↔ plan item (theme/epic/story) ↔ task cho một phạm vi (project / plan item / 1 doc). Phát hiện gap (yêu cầu không có UC, UC không có AC, story không có test, task không có doc). Dùng khi User muốn biết "yêu cầu nào chưa được phủ", trước khi go-live / bàn giao QA.
---

# fare-traceability — Ma trận truy vết & phát hiện gap

Dùng khi User muốn kiểm: **mọi yêu cầu nghiệp vụ đã có use case / user story / test case / module phủ chưa**, hoặc ngược lại — code/test có đang phục vụ yêu cầu nào không.

KHÔNG dùng để: viết spec mới (→ `fare-spec-authoring`); soát blind spot trong 1 spec (→ `fare-spec-reviewer`).

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết project / module / artifact mỏ neo.
- Tuân `rules/fare-rules.md`: §3 Context First (không bịa ID), §7 Content Fidelity (không bịa link trace), §9 (trình bày gọn).

## Phạm vi truy vết — User chọn
Hỏi & CHỜ User chốt (§2):
- **Phạm vi:** toàn project · 1 plan item (gồm epic + story bên dưới) · 1 doc (chỉ tài liệu này + những thứ trực tiếp liên quan).
- **Hướng:** *Forward* (yêu cầu → có gì phủ nó) — phổ biến cho BA tiền go-live. *Backward* (test/task → phục vụ yêu cầu nào) — phổ biến khi review code/PR.

## Mô hình truy vết
7 lớp, đi tuần tự:

```
richtext(brd/srs/prd/requirement) ──FR/BR──► use_case ──flows──► user_story ──AC──► test_case ──TC run──► task
                                       │                                                                      │
                                       └────────── plan item: theme › epic › story (plan_item_id) ◄──────────────┘
                                                   task gắn vào story (lá); epic = cấp giữa của cây
```

Quy tắc liên kết:
- Một **FR** (mã `FR-NNN`) trong richtext requirement phải có ≥1 `use_case` hoặc `user_story` triển khai.
- Một `use_case` phải có ≥1 `user_story` hoặc `test_case` (kiểu `functional`) phủ.
- Một `user_story` phải có ≥1 `acceptance_criteria` (Given-When-Then), và mỗi AC phải có ≥1 `test_case` (kiểu `acceptance`) tương ứng.
- Mọi spec (`use_case` / `user_story` / `srs` ...) phải gắn `plan_item_id` = id một plan item (thường story cấp lá) — rule §1 không có dữ liệu mồ côi.
- Mọi `task` thuộc một `plan_item_id` (story), và `description` phải có URI `fare://documents/{id}` tới spec gốc (rule §4). Story nằm dưới 1 epic trong cây → task tự thuộc epic đó qua cấu trúc, không có field epic riêng. Xem `fare-mcp-integration` cho cây plan item.

## Quy trình
1. **Khoanh phạm vi.** Hỏi & chốt với User. Lấy `plan_item_id` (plan item) / `document_id` cụ thể qua `list_plan_items` / `list_documents`.
2. **Quét yêu cầu nguồn:**
   - Richtext `brd/srs/prd/requirement`: `read_document(id)` (paginated), regex / scan các bảng `FR-NNN`, `BR-NNN`, `NFR-NNN`.
   - `use_case`: `read_document(id)` → liệt kê `actors`, `use_cases[].uid`, `flows[]`.
   - `user_story`: `read_document(id)` → liệt kê `stories[].uid` + số `acceptance_criteria`.
3. **Quét artifact phủ:**
   - `list_test_cases(projectCode, plan_item_id|document_id)` → ánh xạ theo `linked_uc_uid` / `linked_story_uid` / `linked_ac_uid` (đọc field tham chiếu thực tế qua mô tả tool).
   - `list_tasks(projectCode, plan_item_id)` → quét `description` cho URI `fare://documents/{id}` để xâu task ↔ spec.
   - `list_plan_items(projectCode)` (lọc `type="epic"`) → biết cây theme/epic/story; muốn gom task theo epic: `list_tasks(projectCode, plan_item_ids=[<epicId>], include_descendants=true)`.
   - `search_rag(query="FR-001")` / `search_rag(query="<uc uid>")` — fallback khi link không tường minh.
4. **Dựng ma trận.** Một bảng cho mỗi cặp lớp; cell ghi ID + URI (hoặc `⚠️ MISSING`).
5. **Liệt kê gap** ngay dưới ma trận — phân loại theo mức rủi ro (xem dưới).
6. **Đề xuất hành động** cho mỗi gap (KHÔNG tự thực thi — chờ User chốt, §2; nhiều việc bàn giao vai khác):
   - Yêu cầu thiếu UC/US → đề xuất `create_document(doc_type="use_case"|"user_story")` (qua `fare-spec-authoring`).
   - UC/US thiếu test → bàn giao **QA** `/fare-test` viết TC. Nếu PM cần task chứa TC → bàn giao PM `/fare-breakdown` tạo task `type=TEST` trước.
   - Story thiếu task implement → bàn giao **PM** `/fare-breakdown` (KHÔNG tự `create_tasks` — đó là vai PM).
   - Spec không gắn module → đề xuất `update_document(plan_item_id=...)`.
   - Task không trỏ doc → bàn giao **PM** `/fare-groom` (PM dùng skill `fare-backlog-grooming` xử lý mồ côi spec).

## Mức rủi ro gap

| Mức | Loại gap | Vì sao nguy |
|---|---|---|
| 🟥 BLOCKER | FR không có UC/US nào, hoặc UC không có test | Yêu cầu sẽ không được code / verify — sót feature |
| 🟧 HIGH | Story không có AC, hoặc AC không có test_case | Không có tiêu chí pass — QA phán đoán chủ quan |
| 🟨 MEDIUM | Spec không `plan_item_id` (vi phạm rule §1), hoặc task không URI doc | Khó truy nguồn khi bảo trì |
| 🟨 MEDIUM | Epic (cấp giữa) không có story/task nào bên dưới — nhánh cây rỗng, hoặc story không nằm dưới epic/theme nào | Cây WBS dở dang / cấu trúc sai |
| 🟩 LOW | Glossary thiếu term xuất hiện ≥3 lần trong spec | Tăng risk ngôn ngữ mơ hồ về sau |

## Mẫu báo cáo (Markdown)

```
## Ma trận truy vết — {phạm vi} ({hướng})

### 1. Requirement → Use Case / User Story
| FR ID | Mô tả ngắn | Use Case | User Story | Module |
|---|---|---|---|---|
| FR-001 | ... | `fare://documents/12` | `fare://documents/45` | M1.1 |
| FR-002 | ... | ⚠️ MISSING | ⚠️ MISSING | — |

> Ô trỏ tài liệu = **chip mention**: ghi URI trần `fare://documents/{id}` (tự thành chip bấm được), hoặc chip HTML có nhãn riêng — xem `fare-mcp-integration`. KHÔNG dùng markdown link `[..](fare://..)` (không bấm được).

### 2. Use Case / Story → Test Case
| Spec | AC count | Test cases | Phủ |
|---|---|---|---|
| UC-1 | 3 | TC-101, TC-102 | 2/3 ⚠️ thiếu test cho AC-3 |

### 3. Story → Task
| Story | Tasks | Trạng thái |
|---|---|---|
| S-1.1.1 Thêm nhân viên | TASK-FARE-12 (DONE), TASK-FARE-13 (IN_PROGRESS) | OK |
| S-1.1.2 Cập nhật nhân viên | ⚠️ chưa có task | BLOCKER |

### 4. Story → Epic / Theme (vị trí cây WBS)
| Story | Epic cha | Theme | Trạng thái |
|---|---|---|---|
| S-1.1.1 Thêm nhân viên | E1.1 "Hồ sơ nhân viên" | T1 "Quản lý nhân viên" | OK |
| S-1.1.2 Cập nhật nhân viên | ⚠️ chưa nằm dưới epic/theme nào | — | MEDIUM (đề xuất sắp lại cây qua `fare-plan-breakdown`) |

## Gap phát hiện
🟥 BLOCKER (2):
- FR-002 không có UC/US — đề xuất tạo use_case "{tên}" trong story S1.1.
- S-1.1.2 chưa có task — đề xuất tạo task "Implement cập nhật nhân viên".

🟧 HIGH (1):
- UC-1 thiếu test cho AC-3 — đề xuất create_test_cases (acceptance, linked_ac_uid="ac-3").

## Đề xuất hành động — chờ User chốt
1. {hành động cụ thể} → tool {tên} với payload {tóm tắt}
2. ...
```

## Tự kiểm
- [ ] Phạm vi & hướng đã chốt với User trước khi quét.
- [ ] Mọi ID trong ma trận đến từ FARE thật (qua `list_*` / `read_document`), KHÔNG đoán.
- [ ] Mỗi gap có mức rủi ro + đề xuất khắc phục cụ thể.
- [ ] KHÔNG tự `create_document` / `create_test_cases` / `update_*` để vá gap — chỉ đề xuất, chờ User chốt (§2).
- [ ] Trả báo cáo gọn (§9) — bảng + bullet, không văn xuôi.
