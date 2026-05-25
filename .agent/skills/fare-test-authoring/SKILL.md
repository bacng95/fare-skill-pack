---
name: fare-test-authoring
description: Viết test case (TC) trên FARE từ spec đã có — mỗi AC của user_story / mỗi flow của use_case → n TC theo kỹ thuật ISTQB (positive / negative / boundary / equivalence_class / state_transition / error_guessing). Tạo doc `test_case` container và batch `create_test_cases`. Dùng khi QA nhận spec đã ready hoặc khi PM bàn giao task `type=TEST`.
---

# fare-test-authoring — Viết test case từ spec

Dùng khi: spec đã có (UC / US / SRS gắn `module_id`) cần TC chi tiết để chạy verify; hoặc PM bàn giao task `type=TEST` cần QA viết TC trước khi chạy.

KHÔNG thuộc skill này: chạy verify TC (→ `fare-test-execution`); báo bug khi fail (→ `fare-bug-reporting`); sửa spec (→ BA); tạo task TASK/BUG khi không liên quan TC (→ PM).

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết spec mục tiêu, ERD, Figma nếu có.
- Spec mục tiêu **PHẢI có AC rõ ràng** (US có Given-When-Then) hoặc **flows chi tiết** (UC có main/alternative/exception). Spec mỏng (chỉ tiêu đề + 1 câu) → DỪNG, bàn giao BA bổ sung. Viết TC trên spec mơ hồ vi phạm §7 (sẽ phải bịa kết quả kỳ vọng).
- Tuân `rules/fare-rules.md`: §1 (test_case là document, không tự tạo TC ngoài document), §4 (batch `create_test_cases`, ngôn ngữ VN, có URI), §7 (TC truy ngược về AC/flow), §2 Confirmation Gate.

## Bước 0 — Chốt với User & đọc spec

Hỏi & CHỜ:
- **Spec mục tiêu:** id US / UC / SRS cụ thể. Hoặc id task `type=TEST` từ PM → tra ngược URI spec trong description.
- **Phạm vi coverage:** *full* (mọi AC + boundary + negative) · *smoke* (chỉ positive flow chính) · *regression* (chỉ AC bị động bởi change-request). Hỏi User.
- **Doc test_case container:** dùng doc đã có (`list_documents(kind="test_case", module_id=<function>)`) hay tạo mới? Mặc định: 1 doc test_case / 1 function — kiểm trùng trước.

Đọc spec (paginated tới hết):
- `read_document(id)` — US → `stories[].acceptance_criteria[]`; UC → `flows[]` (main/alt/exception); SRS → bảng FR/NFR.
- Đọc cả ERD + Figma nếu có (đối chiếu dữ liệu hợp lệ + UI state).

## Bước 1 — Map spec → TC matrix

**Quy tắc map (1 AC → n TC):**

| Nguồn | TC bắt buộc | TC nên có |
|---|---|---|
| Mỗi AC (Given-When-Then) | 1 TC `positive` cho happy path | 1+ `boundary` (giá trị biên), 1+ `negative` (input không hợp lệ) |
| Mỗi field input có ràng buộc | TC `boundary` (min, max, min-1, max+1) | TC `equivalence_class` (đại diện mỗi lớp tương đương) |
| Mỗi state machine của UC | TC `state_transition` (mỗi cạnh hợp lệ + mỗi cạnh bị cấm) | — |
| Mỗi flow `exception` của UC | TC `negative` cho luồng lỗi đó | TC `error_guessing` cho lỗi không liệt kê |
| NFR (performance / security) | TC `positive` đo ngưỡng | (NFR thường có TC riêng theo nhóm) |

**Coverage tối thiểu (smoke):** mỗi AC ≥ 1 TC positive. **Coverage đầy đủ (full):** mỗi AC ≥ 1 positive + 1 boundary + 1 negative (nếu có input).

**`type` ISTQB enum (FARE):** `positive | negative | boundary | equivalence_class | state_transition | error_guessing`. KHÔNG dùng "edge_case" (đã thay bằng `error_guessing`).

## Bước 2 — Soạn TC theo khuôn

Mỗi TC trên FARE có các field: `title`, `description`, `preconditions`, `expected_result`, `steps[]`, `type`, `priority`, `tags`.

**Quy chuẩn `title`** (rule §4 — VN, ngắn gọn, gợi rõ):
- Dạng: `[<type prefix>] {hành động} — {điều kiện}`. Vd:
  - `[Positive] Đăng nhập — đúng email & mật khẩu`
  - `[Negative] Đăng nhập — mật khẩu sai 3 lần liên tiếp`
  - `[Boundary] Mã NV — đúng 10 ký tự (giới hạn trên)`
- Tránh "Test 1", "TC login OK" — quá mơ hồ.

**Quy chuẩn `steps[]`:**
```json
[
  { "step_number": 1, "action": "Mở màn hình Đăng nhập", "expected_result": "Form Đăng nhập hiển thị" },
  { "step_number": 2, "action": "Nhập email = 'user@x.com', mật khẩu = 'Abc12345!'", "expected_result": "Trường nhập nhận input" },
  { "step_number": 3, "action": "Nhấn nút Đăng nhập", "expected_result": "Chuyển sang trang Dashboard; toast 'Đăng nhập thành công'" }
]
```
- Mỗi step **kiểm chứng được** — không "kiểm tra hệ thống hoạt động đúng".
- `expected_result` mức step là tùy chọn cho step trung gian; bắt buộc cho step kiểm chứng cuối.

**Quy chuẩn `description`:**
```
Mục đích: {1 câu — TC này verify AC nào, kỹ thuật gì}

## Tham chiếu spec
- User Story: fare://documents/{us_id} → AC-3 "Đăng nhập thất bại sau 3 lần"
- (Use Case / Wireframe / ERD nếu có)
```
Description PHẢI có ≥1 URI spec — KHÔNG để rỗng (vi phạm §4).

**`preconditions`** — trạng thái phải có TRƯỚC bước 1 (vd "User đã đăng ký", "DB có 5 employee", "Đang đăng nhập với role admin").

**`expected_result`** (cấp TC) — tổng quan kết quả mong đợi sau khi chạy hết steps; chi tiết per-step ghi trong steps[].

**`priority`** map từ AC priority của spec gốc khi có (`critical | high | medium | low`). TC negative cho lỗi nghiêm trọng (auth bypass, data loss) → `critical`.

**`tags`** — phân loại tái dùng: `smoke`, `regression`, `auth`, `payment`, `validation`... Dùng nhất quán.

**KHÔNG set `status`** khi tạo (mặc định `draft`). `status="ready"` chuyển khi User / QA-lead duyệt — KHÔNG agent tự set (§7).

## Bước 3 — Đảm bảo có doc test_case container

`list_documents(projectCode, kind="test_case", module_id=<function id>)`:
- **Đã có doc test_case cho function này** → dùng `document_id` đó. KHÔNG tạo trùng.
- **Chưa có** → đề xuất + **CHỜ User chốt** (§2):
  ```
  Tạo doc test_case: title="TC - {Tên function}", module_id=<function>, status=draft
  ```
  Sau khi User chốt → `create_document(doc_type="test_case", title=..., module_id=..., content=[])` với content array rỗng (TC thêm sau qua `create_test_cases`).

## Bước 4 — Trình ma trận nháp + CHỜ User chốt

Trình bảng nháp **TRƯỚC khi batch tạo**:
```
| # | type | priority | title | tham chiếu AC |
|---|---|---|---|---|
| 1 | positive | high | [Positive] Đăng nhập — đúng credential | AC-1 |
| 2 | negative | critical | [Negative] Đăng nhập — sai mật khẩu 3 lần khoá tài khoản | AC-2 |
| 3 | boundary | medium | [Boundary] Mật khẩu — đúng 8 ký tự (min) | AC-1 + validation rule |
| ... |
```

User chốt / sửa → mới batch tạo.

## Bước 5 — Batch tạo TC

**Một** lời gọi `create_test_cases(projectCode, test_cases=[<mảng>])` (rule §4 — KHÔNG vòng lặp `create_test_case`):
```json
{
  "projectCode": "FARE",
  "test_cases": [
    {
      "document_id": 245,
      "title": "[Positive] Đăng nhập — đúng credential",
      "description": "Verify AC-1...\n\n## Tham chiếu spec\n- User Story: fare://documents/120 → AC-1",
      "preconditions": "User user@x.com đã đăng ký với mật khẩu Abc12345!",
      "expected_result": "Chuyển sang Dashboard, toast thành công, session token tồn tại",
      "steps": [...],
      "type": "positive",
      "priority": "high",
      "tags": ["smoke", "auth"]
    },
    ...
  ]
}
```

Sau khi batch trả về với `id` từng TC → cung cấp danh sách `id` cho User. Các id này dùng tiếp:
- `task.test_case_ids` (nếu PM cần link task `type=TEST` ↔ TC) — bàn giao PM.
- `verify` round sau (xem `fare-test-execution`).

## Bước 6 — Báo cáo & bàn giao

Báo gọn:
- Đã tạo N TC trong doc test_case id=X.
- Coverage: bao nhiêu AC / flow đã có TC, còn AC nào chưa phủ (nếu User chốt mode smoke / regression — báo rõ TC còn thiếu so với full).
- Bàn giao:
  - **PM:** nếu PM có task `type=TEST` đang chờ TC → cung cấp danh sách TC id để PM `update_task(test_case_ids=[...])` gắn vào task.
  - **Tester / executor:** sẵn sàng chạy `/fare-verify`.

## Anti-patterns

- ❌ Viết TC khi spec không có AC rõ — bịa expected_result vi phạm §7.
- ❌ 1 TC kiểm nhiều AC cùng lúc — khó truy nguồn khi fail.
- ❌ `expected_result` mơ hồ ("hệ thống hoạt động đúng", "OK") — không kiểm chứng được.
- ❌ `steps` chỉ có "test login" — phải chia thành bước thao tác cụ thể.
- ❌ Gọi `create_test_case` (số ít) vòng lặp — phải `create_test_cases` batch (§4).
- ❌ Tự set `status="ready"` khi tạo — mặc định `draft`, ready là quyết định QA-lead / User.
- ❌ TC không URI spec trong description — không truy ngược được AC khi review.
- ❌ Dùng `type="edge_case"` — sai enum, đã đổi thành `error_guessing`.

## Tự kiểm

- [ ] Spec mục tiêu có AC / flow rõ ràng (US.acceptance_criteria hoặc UC.flows).
- [ ] Coverage đã chốt với User (smoke / full / regression).
- [ ] Doc test_case container có sẵn, hoặc đã chốt tạo mới với User (§2).
- [ ] Ma trận TC nháp đã trình + User chốt TRƯỚC khi batch tạo (§2).
- [ ] Mỗi TC có title rõ ràng dạng `[type] hành động — điều kiện`.
- [ ] `steps[]` thao tác cụ thể, có `expected_result` ở step kiểm chứng.
- [ ] `description` có URI `fare://documents/{id}` tới AC gốc (§4).
- [ ] `type` đúng enum ISTQB (positive/negative/boundary/equivalence_class/state_transition/error_guessing — KHÔNG edge_case).
- [ ] Mỗi TC mapping 1-1 về 1 AC / flow / rule cụ thể (§7).
- [ ] `status="draft"` (không tự ready). Dùng `create_test_cases` batch.
