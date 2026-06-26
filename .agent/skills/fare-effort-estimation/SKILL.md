---
name: fare-effort-estimation
description: Ước lượng effort cho plan item (Function Point analysis). Story → gán ID complexity (1-5) + scope (6-10) + clarity (11-15) → effort tự tính qua effort-matrix. Epic → đặt effort_est_level (L1-L4). Theme read-only. Phân biệt rõ effort man-days (plan item) ↔ task.est_effort (giờ). Dùng khi PM cần ước lượng để xếp sprint, hoặc khi BA chia cây có dữ liệu effort từ nguồn.
---

# fare-effort-estimation — Ước lượng effort (FP analysis)

Dùng khi: cần gán/cập nhật effort cho **plan item** (cây `theme › epic › story`) trong FARE — story bằng bộ 3 attribute, epic bằng `effort_est_level`.

> ⚠️ **Phạm vi: CHỈ cấp plan item** (story/epic). KHÔNG dùng để ước task — task ước **bottom-up** theo bản chất task (xem `fare-task-breakdown` Bước 3). Cấm chia effort của story theo tỷ trọng layer rồi gán xuống task; story effort chỉ là **ceiling sanity-check** sau khi tổng hợp task est bottom-up.

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** + cây plan item hiện tại (xem `fare-plan-breakdown`).
- Đọc `fare-mcp-integration` mục "Cây WBS = Plan item" + "Mô hình effort" để nắm cấp nào nhận field nào.
- Tuân `rules/fare-rules.md`: §4 (Attribute ID theo dải đúng — không hard-code), §2 Confirmation Gate, §7 (không bịa con số).

## Effort gắn theo CẤP — sai cấp = lỗi 400

| Cấp | Field effort được phép | Cơ chế |
|---|---|---|
| **theme** | (không) | read-only — `effort`/`effort_est` tổng hợp từ con. |
| **epic** | `effort_est_level` ∈ {L1, L2, L3, L4} | Server suy ra `effort_est`: L1=7, L2=10, L3=20, L4=30 man-day. KHÔNG nhận complexity/scope/clarity. |
| **story** | `complexity` + `scope` + `clarity` (ID) | `effort` (man-day) tự tính qua `fare://effort-matrix`. KHÔNG nhận `effort_est_level`. |

Truyền field lệch cấp (vd `complexity` cho epic, hay `effort_est_level` cho story) → server **reject 400**.

## ⚠️ Story: ID có dải KHÁC NHAU — sai dải = lỗi cứng

| Category | Field trên `add_plan_item`/`update_plan_item` | Dải ID | Ý nghĩa scale |
|---|---|---|---|
| **Complexity** | `complexity` | **1–5** | 1 = "Rất thấp" (CRUD đơn) → 5 = "Rất cao" (AI / async / logic phức tạp) |
| **Volume (Scope)** | `scope` | **6–10** | 6 = "Rất nhỏ" (1 màn / 1 API) → 10 = "Rất lớn" (≥10 màn, nhiều bảng) |
| **Clarity** | `clarity` | **11–15** | 11 = "Rõ ràng" (spec đầy đủ) → 15 = "Rất mập mờ" (chưa rõ yêu cầu) |

**Sai phổ biến:** truyền `scope=3` (3 là ID complexity, không phải volume!). **Đúng:** `scope=8` (volume ID có value=3 = "Vừa").

**Luôn đọc** `fare://system-attributes` trước khi truyền — KHÔNG nhớ ID theo trí nhớ.

## Đơn vị — KHÔNG nhầm

| Trường | Đơn vị | Trên artifact | Auto / Manual |
|---|---|---|---|
| story `effort` | **Man-days** | Story | **Auto** — FARE tính từ FP_score qua `fare://effort-matrix`. KHÔNG set tay. |
| epic `effort_est` | **Man-days** | Epic | **Dẫn xuất** từ `effort_est_level` (L1-L4). KHÔNG set trực tiếp. |
| `task.est_effort` | **GIỜ** (decimal, 0.5 = 30 phút, 8 = 1 ngày công) | Task | Manual — PM hoặc Dev điền. |
| `task.actual_effort` | **GIỜ** | Task | Manual — Dev điền sau khi làm xong, đối chiếu est. |

Nhầm man-days ↔ giờ trên cùng project = số liệu effort vô nghĩa. Mỗi lần truyền số → tự hỏi: "đây là task hay plan item?"

## Công thức FP cho story (auto, agent chỉ truyền ID)

```
complexity_VALUE = giá trị của attribute id (vd id=3 → value=3)
scope_VALUE      = giá trị của attribute id (vd id=8 → value=3 = "Vừa")
clarity_VALUE    = giá trị của attribute id (vd id=12 → value=2)

FP_score = complexity_VALUE × scope_VALUE × clarity_VALUE
effort (man-days) = lookup FP_score trong fare://effort-matrix
```

Vd: `complexity=3 (value=3), scope=8 (value=3), clarity=12 (value=2)` → FP = 18 → effort_matrix[16-18] = **6 man-days**.

Agent KHÔNG tự tính — chỉ truyền ID; FARE tính `effort` và lưu trên story.

## Heuristic chọn ID (story)

| Chiều | Khi nào value cao (4–5) | Khi nào value thấp (1–2) |
|---|---|---|
| **Complexity** | Async, state machine, integration ngoài, validate phức tạp, AI, real-time | CRUD thuần, form đơn, list lọc đơn |
| **Volume** | ≥10 màn / ≥10 API / ≥5 bảng / ≥50 test case | 1 màn / 1 API / 1 bảng / ≤5 test case |
| **Clarity** | Yêu cầu chưa rõ, chưa có prototype, nhiều unknown | Spec chốt, wireframe có, BA đã trả lời mọi Socratic |

Quy đổi value → ID dải:
- value 1–5 trong dải complexity → ID 1–5
- value 1–5 trong dải volume → ID 6–10
- value 1–5 trong dải clarity → ID 11–15

(Ánh xạ chính xác: đọc `fare://system-attributes` — KHÔNG đoán.)

## Epic: chọn `effort_est_level`
Khi cần ước nhanh ở cấp epic (chưa vỡ story chi tiết): đặt `effort_est_level` theo quy mô tổng — L1=7 md (nhỏ, 1-2 story), L2=10 md, L3=20 md, L4=30 md (lớn, nhiều story phức tạp). Khi story con đã có effort đầy đủ, ưu tiên để tổng hợp tự nhiên thay vì ép level epic.

## Quy trình

1. **Đọc state.** `fare://system-attributes` (ID đúng dải) + `fare://effort-matrix` (lookup) + `list_plan_items(projectCode)` (cây hiện có — story nào đã / chưa có attribute, epic nào chưa có level).
2. **Xác định phạm vi.** Story nào / epic nào cần estimate? Hỏi User nếu mơ hồ.
3. **Đề xuất.** Bảng nháp cho story:
   ```
   | Story id | Tên | complexity (id, value) | scope (id, value) | clarity (id, value) | FP | effort auto |
   |---|---|---|---|---|---|---|
   | 340 | Đăng nhập email/mật khẩu | 3 (=3) | 8 (=3) | 12 (=2) | 18 | 6 md |
   ```
   Cột "effort auto" tính trước bằng tay để User thấy con số trước khi commit. Với epic: trình `effort_est_level` đề xuất + man-day tương ứng.
4. **CHỜ User chốt** (§2). Sửa theo phản hồi.
5. **Cập nhật.**
   - Story: `update_plan_item(itemId, complexity=<id>, scope=<id>, clarity=<id>)` — chỉ truyền field thay đổi (§4 — không truyền `null`).
   - Epic: `update_plan_item(itemId, effort_est_level="L2")`.
6. **Verify.** Đọc lại `list_plan_items` confirm `effort` auto (story) / `effort_est` (epic) đã khớp.

## Sanity check trước khi commit

- Story `effort` auto ra số bất thường so với cảm nhận → kiểm lại bộ 3 ID có inflate/deflate không.
- Story CRUD đơn ra effort > 10 man-days → kiểm lại complexity/clarity có inflate không.
- Story có integration với ≥3 hệ thống ngoài ra effort < 5 → kiểm complexity có deflate không.

## Anti-patterns

- ❌ Truyền `scope=3` (sai dải — 3 là complexity ID).
- ❌ Truyền `complexity`/`scope`/`clarity` cho **epic** hoặc `effort_est_level` cho **story** (lỗi 400 — sai cấp).
- ❌ Hard-code ID kiểu 1, 5, 10, 15 mà chưa đọc `fare://system-attributes`.
- ❌ Set `effort` / `effort_est` trực tiếp (field dẫn xuất — FARE tính).
- ❌ Đánh đồng man-days (plan item) với giờ (task).
- ❌ Estimate khi spec chưa có (clarity 14–15 + complexity đoán = số rác).
- ❌ Truyền `null` để "giữ nguyên" attribute — phải BỎ HẲN field khỏi payload (§4).

## Tự kiểm

- [ ] Đã đọc `fare://system-attributes` lấy ID đúng dải cho project này.
- [ ] Đúng cấp: story nhận complexity/scope/clarity; epic nhận effort_est_level; theme read-only.
- [ ] Dải ID đúng: complexity 1–5, scope 6–10, clarity 11–15.
- [ ] Trình bảng nháp với ID, value, FP, effort auto TRƯỚC khi commit.
- [ ] User đã chốt (§2).
- [ ] `update_plan_item` chỉ truyền field thay đổi — không truyền `null` (§4).
- [ ] Đơn vị nhất quán: plan item = man-days, task = giờ. Không nhầm.
