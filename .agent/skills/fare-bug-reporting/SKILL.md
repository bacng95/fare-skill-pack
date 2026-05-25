---
name: fare-bug-reporting
description: Khi TC fail (hoặc QA phát hiện bug ngoài TC), format báo cáo reproducible (steps + expected vs actual + env + evidence), phân biệt `severity` (mức nghiêm trọng kỹ thuật) ↔ `priority` (mức ưu tiên xử lý), HỎI USER trước khi `create_tasks(type=BUG)` (rule §5), gắn `linked_task_id` về TC fail + task feature gốc để truy nguồn.
---

# fare-bug-reporting — Báo cáo & tạo BUG task

Dùng khi: TC vừa fail trong `/fare-verify`, hoặc QA phát hiện vấn đề ngoài TC (vd dạo thử thấy lỗi).

KHÔNG thuộc skill này: tự fix code (→ `fare-developer` `/fare-dev`); sửa TC để khớp behavior thực tế (→ `fare-test-authoring` — nhưng phải xác minh đây là lỗi spec, không phải lỗi sản phẩm).

## Tiền đề
- Đã có **bằng chứng cụ thể**: TC fail với `actual_result` rõ, hoặc reproduction tay có steps + expected.
- Tuân `rules/fare-rules.md`: §5 (Bug Discovery — KHÔNG tự create BUG, phải User chốt), §1 (BUG task vẫn cần `module_id`), §4 (batching, VN, URI doc), §2 Confirmation Gate.

## ⚠️ Rule §5 — KHÔNG được bỏ qua

**Trình tự bắt buộc** khi muốn tạo BUG:
1. Báo cáo Markdown trong chat: hiện tượng + root cause (nếu suy luận được) + file/module liên quan + impact.
2. **HỎI User**: *"Tạo BUG task `[title gợi ý]` trên project [Code] để track không?"*
3. **CHỜ User trả lời.**
4. Chỉ tạo BUG **sau khi User xác nhận**.

KHÔNG được "lùa" bằng cách trình bug + ngay câu sau tạo task. Phải có lượt đối thoại tách biệt.

## Phân biệt `severity` ↔ `priority` (đừng nhầm)

| Trục | Enum | Nghĩa |
|---|---|---|
| **`severity`** | `trivial` · `minor` · `major` · `blocker` | Mức nghiêm trọng **kỹ thuật** — bug làm hỏng gì, mất gì |
| **`priority`** | `low` · `medium` · `high` · `critical` | Mức ưu tiên **xử lý** — fix ngay hay đợi |

Quan hệ: blocker thường priority=critical, nhưng KHÔNG luôn (vd blocker chỉ ảnh hưởng feature chưa go-live → priority có thể là medium).

### Heuristic chọn `severity`
| `severity` | Khi nào | Ví dụ |
|---|---|---|
| `blocker` | Hệ thống không dùng được; mất dữ liệu; auth bypass; crash core flow | Login crash 100% người dùng; payment trừ tiền 2 lần |
| `major` | Feature lớn lỗi, có workaround khó / không có | Filter không hoạt động trên Safari; export sai số liệu |
| `minor` | Feature phụ lỗi, có workaround dễ | Toast hiển thị tiếng Anh thay vì tiếng Việt; nút lùi không hoạt động ở 1 màn |
| `trivial` | Typo, lệch UI nhẹ không ảnh hưởng dùng | Khoảng cách icon không đều; chữ viết hoa nửa câu |

### Heuristic chọn `priority`
| `priority` | Khi nào |
|---|---|
| `critical` | Bug đang ảnh hưởng prod / user thật / release sắp tới + severity ≥ major |
| `high` | Cần fix trong sprint hiện tại |
| `medium` | Fix sprint sau hoặc khi có capacity |
| `low` | Backlog xa, không ai oncall |

## Khuôn `description` BUG task (bắt buộc)

```markdown
{1-2 câu mô tả vấn đề ngắn gọn — what & where}

## Môi trường
- Env: staging
- Browser/OS/Device: Chrome 122 / Ubuntu 22.04
- User test: user@x.com (role admin)
- Build/commit: 5b315b8 (nếu có)

## Steps to reproduce
1. Mở /login
2. Nhập email = "user@x.com", mật khẩu = "Abc12345!"
3. Nhấn Đăng nhập

## Expected
Chuyển sang /dashboard, toast "Đăng nhập thành công"

## Actual
HTTP 500 từ /api/auth/login; toast "Có lỗi xảy ra"; vẫn ở /login

## Evidence
- Screenshot: <upload_image URI nếu có>
- Log/stacktrace: ```...```
- Network: POST /api/auth/login → 500, response body: {...}

## Tham chiếu
- TC fail: fare://documents/{tc_doc_id} → TC-{id}
- Spec: fare://documents/{us_id} → AC-{id}
- Task gốc: fare://tasks/{feature_task_id} (nếu xác định)

## Tác động (nếu suy luận được)
- Số user/feature bị ảnh hưởng
- Có workaround không
```

`description` bắt buộc đủ `Steps + Expected + Actual + Evidence + Tham chiếu` — thiếu một mục = bug khó verify (rule §4 cứng cho BUG).

## Title BUG task

Dạng: `[BUG] {hiện tượng cụ thể} — {nơi xảy ra}`. Ví dụ tốt:
- `[BUG] Login crash HTTP 500 khi đúng credential trên staging`
- `[BUG] Export CSV mất cột "ngày sinh" khi >100 records`

Tránh: `Fix login`, `Bug auth`, `Task 4` — quá mơ hồ (§4).

## Quy trình

1. **Lấy bối cảnh fail.** Từ `/fare-verify`: TC id, `actual_result`, `note` (env). Hoặc QA quan sát tay.
2. **Suy luận sơ bộ** (không quá xa — chỉ trên dữ liệu có):
   - Root cause: hệ thống nào lỗi (BE / FE / DB / 3rd party / config)?
   - Module/function ảnh hưởng: tra qua `list_tasks` / `code_query` nếu có index code.
   - Có bug tương tự đang mở? `list_tasks(projectCode, type="BUG", search=...)` — tránh tạo trùng.
3. **Soạn bản nháp BUG** đầy đủ Steps/Expected/Actual/Evidence/Tham chiếu/Severity/Priority đề xuất.
4. **Báo cáo Markdown + HỎI User** (rule §5):
   ```
   ## Bug phát hiện
   {nháp ở Bước 3}

   → Đề xuất tạo BUG task title "[BUG] ..." trên project FARE
     severity=major, priority=high, module_id=<function id>.

   Tạo không?
   ```
5. **CHỜ User trả lời.**
   - User OK → `create_tasks(tasks=[{...}])` (batch — kể cả 1 BUG, §4). Sau khi có id → `update_test_case(testCaseId=TC fail, verify={..., linked_task_id=<bug_id>})` để TC fail có truy ngược đến BUG.
   - User từ chối / muốn sửa → cập nhật nháp, hỏi lại.
   - User nói "đã có bug trùng id=N" → bàn giao `add_comment` thêm reproduction vào bug N + link TC.

## Khi nào KHÔNG tạo BUG (mà làm việc khác)

| Tình huống | Hành động đúng |
|---|---|
| Behavior thực tế khớp spec, nhưng TC viết sai expected | `add_comment` lên TC + bàn giao `fare-test-authoring` sửa TC (KHÔNG tạo BUG) |
| Spec mâu thuẫn / mơ hồ nên không biết đâu đúng | `add_comment` / `create_suggestion` lên spec + bàn giao BA `/fare-change` (KHÔNG tạo BUG cho "lỗi spec") |
| Bug tương tự đã có (cùng symptom) | `add_comment` reproduction lên bug đó, `update_test_case(verify.linked_task_id=<bug đã có>)` |
| Môi trường lỗi (DB chưa seed, API key sai) | Bàn giao Dev/DevOps; verify mark `blocked` không phải `failed`; chưa tạo BUG |
| Một-lần-không-lặp-lại không reproduce được | KHÔNG tạo BUG. Note vào `verify.note`. Nếu lặp lại → quay lại Bước 1. |

## Anti-patterns

- ❌ Tự `create_tasks(type=BUG)` mà chưa hỏi User (vi phạm §5 CỨNG).
- ❌ Title BUG kiểu "Fix bug login" — không nói được lỗi gì.
- ❌ Description thiếu Steps to reproduce — bug không verify được.
- ❌ Description không có Evidence (screenshot / log / network) — Dev không tin.
- ❌ Description không URI TC fail + spec gốc — mất truy nguồn (§4).
- ❌ Đánh đồng severity với priority.
- ❌ Tạo BUG khi root cause là TC viết sai (phải bàn giao `fare-test-authoring`).
- ❌ Tạo BUG khi behavior chưa lặp lại được — chờ reproduce trước.
- ❌ Gọi `create_task` (số ít) — phải `create_tasks` batch (§4) kể cả 1 bug.

## Tự kiểm

- [ ] Đã có bằng chứng cụ thể (TC fail với actual rõ, hoặc reproduction tay).
- [ ] Đã kiểm bug tương tự không trùng (`list_tasks(type="BUG", search=...)`).
- [ ] Nháp BUG đầy đủ Steps / Expected / Actual / Env / Evidence / Tham chiếu / Severity / Priority đề xuất.
- [ ] Đã trình nháp + HỎI User → chờ User xác nhận TRƯỚC khi `create_tasks` (§5).
- [ ] Title dạng `[BUG] {hiện tượng cụ thể} — {nơi}`.
- [ ] Phân biệt severity ↔ priority — không gán giống nhau cơ học.
- [ ] BUG có `module_id` của function chứa bug (§1).
- [ ] Sau khi tạo BUG → đã cập nhật TC fail với `linked_task_id=<bug id>` (truy nguồn 2 chiều).
- [ ] Trường hợp KHÔNG nên tạo BUG (TC viết sai / spec mơ hồ / không reproduce / trùng) → đã chuyển sang hành động đúng.
