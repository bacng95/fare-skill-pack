---
name: fare-effort-estimation
description: Ước lượng effort cho Module/Submodule/Function (Function Point analysis) bằng cách gán đúng ID attribute (complexity 1-5, scope 6-10, clarity 11-15) và đối chiếu effort-matrix. Phân biệt rõ `module.effort_est` (man-days) ↔ `task.est_effort` (giờ). Dùng khi PM cần ước lượng để xếp sprint, hoặc khi BA chia cây module có dữ liệu effort từ nguồn.
---

# fare-effort-estimation — Ước lượng effort (FP analysis)

Dùng khi: cần gán hoặc cập nhật `complexity` / `scope` / `clarity` / `effort_est` cho module hoặc function trong FARE.

> ⚠️ **Phạm vi: CHỈ cấp Module/Function** (FP analysis). KHÔNG được dùng để ước task — task ước **bottom-up** theo bản chất task (xem `fare-task-breakdown` Bước 3). Cấm chia `function.effort_est` theo tỷ trọng layer rồi gán xuống task; function effort chỉ là **ceiling sanity-check** sau khi tổng hợp task est bottom-up.

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** + cây module hiện tại (xem `fare-plan-breakdown`).
- Tuân `rules/fare-rules.md`: §4 (Attribute IDs theo dải đúng — không hard-code), §2 Confirmation Gate, §7 (không bịa con số).

## ⚠️ ID có dải KHÁC NHAU — sai dải = lỗi cứng

| Category | Field trên `add_module`/`update_module` | Dải ID | Ý nghĩa scale |
|---|---|---|---|
| **Complexity** | `complexity` | **1–5** | 1 = "Rất thấp" (CRUD đơn) → 5 = "Rất cao" (AI / async / phức tạp logic) |
| **Volume (Scope)** | `scope` | **6–10** | 6 = "Rất nhỏ" (1 màn / 1 API) → 10 = "Rất lớn" (≥10 màn, nhiều bảng) |
| **Clarity** | `clarity` | **11–15** | 11 = "Rõ ràng" (spec đầy đủ, prototype có) → 15 = "Rất mập mờ" (chưa rõ yêu cầu) |

**Sai phổ biến:** truyền `scope=3` (3 là ID complexity, không phải volume!). **Đúng:** `scope=8` (8 là volume ID có value=3 = "Vừa").

**Luôn đọc** `fare://system-attributes` trước khi truyền — KHÔNG nhớ ID theo trí nhớ.

## Đơn vị — KHÔNG nhầm

| Trường | Đơn vị | Trên artifact | Auto / Manual |
|---|---|---|---|
| `module.effort` | **Man-days** | Module/Function | **Auto** — FARE tính từ FP_score qua `fare://effort-matrix`. KHÔNG set tay. |
| `module.effort_est` | **Man-days** | Module/Function | **Manual** — PM tự đánh giá; so với `effort` auto để sanity-check. |
| `task.est_effort` | **GIỜ** (decimal, 0.5 = 30 phút, 8 = 1 ngày công) | Task | Manual — PM hoặc Dev tự điền. |
| `task.actual_effort` | **GIỜ** | Task | Manual — Dev điền sau khi làm xong, dùng để đối chiếu est. |

Nhầm man-days ↔ giờ trên cùng project = số liệu effort vô nghĩa. Mỗi lần truyền số → tự hỏi: "đây là task hay module?"

## Công thức FP (auto, agent chỉ truyền ID)

```
complexity_VALUE = giá trị của attribute id (vd id=3 → value=3)
scope_VALUE      = giá trị của attribute id (vd id=8 → value=3 = "Vừa")
clarity_VALUE    = giá trị của attribute id (vd id=12 → value=2)

FP_score = complexity_VALUE × scope_VALUE × clarity_VALUE
effort (man-days) = lookup FP_score trong fare://effort-matrix
```

Vd: `complexity=3 (value=3), scope=8 (value=3), clarity=12 (value=2)` → FP = 18 → effort_matrix[16-18] = **6 man-days**.

Agent KHÔNG tự tính — chỉ truyền ID; FARE tính `effort` và lưu trên module. Agent có thể truyền `effort_est` riêng (manual judgment).

## Heuristic chọn ID

| Chiều | Khi nào value cao (4–5) | Khi nào value thấp (1–2) |
|---|---|---|
| **Complexity** | Async, state machine, integration ngoài, validate phức tạp, AI, real-time | CRUD thuần, form đơn, list lọc đơn |
| **Volume** | ≥10 màn / ≥10 API / ≥5 bảng / ≥50 test case | 1 màn / 1 API / 1 bảng / ≤5 test case |
| **Clarity** | Yêu cầu chưa rõ, chưa có prototype, nhiều unknown | Spec chốt, wireframe có, BA đã trả lời mọi Socratic |

Quy đổi value → ID dải:
- value 1–5 trong dải complexity → ID 1–5
- value 1–5 trong dải volume → ID 6–10
- value 1–5 trong dải clarity → ID 11–15

(Ánh xạ chính xác: đọc `fare://system-attributes/complexity` etc. — KHÔNG đoán.)

## Quy trình

1. **Đọc state.** `fare://system-attributes` (lấy ID đúng dải) + `fare://effort-matrix` (lookup) + `fare://projects/{code}/modules` (cây hiện có, các function nào đã có / chưa có attribute).
2. **Xác định phạm vi.** Function nào / module nào cần estimate? Hỏi User nếu mơ hồ.
3. **Đề xuất bộ 3 ID + `effort_est`.** Bảng nháp:
   ```
   | Function id | Tên | complexity (id, value) | scope (id, value) | clarity (id, value) | FP | effort auto | effort_est PM |
   |---|---|---|---|---|---|---|---|
   | 120 | Thêm nhân viên | 2 (=2) | 8 (=3) | 11 (=1) | 6 | 2 md | 2 md |
   | 121 | Cập nhật nhân viên | 2 (=2) | 7 (=2) | 12 (=2) | 8 | 3 md | 3 md |
   ```
   Cột "effort auto" tính trước bằng tay để User thấy con số trước khi commit.
4. **CHỜ User chốt** (§2). Sửa theo phản hồi (vd User cho rằng complexity nên 3 thay vì 2 vì có validate phức tạp).
5. **Cập nhật.** `update_module(moduleId, complexity=<id>, scope=<id>, clarity=<id>, effort_est=<man-days>)` cho từng function. Chỉ truyền field thay đổi (§4 — không truyền `null` cho field giữ nguyên).
6. **Verify.** Đọc lại `fare://projects/{code}/modules` confirm `effort` auto đã khớp lookup.

## Sanity check trước khi commit

- `effort_est` (PM judgment) lệch quá 2× so với `effort` auto → dừng, hỏi User. Lệch nhiều = một bên sai (FP gán sai hoặc PM ước nhầm). Đừng commit lệch không giải thích.
- Function CRUD đơn ra effort > 10 man-days → kiểm lại complexity/clarity có inflate không.
- Function có integration với ≥3 hệ thống ngoài ra effort < 5 → kiểm lại complexity có deflate không.

## Anti-patterns

- ❌ Truyền `scope=3` (sai dải — 3 là complexity ID).
- ❌ Hard-code ID kiểu 1, 5, 10, 15 mà chưa đọc `fare://system-attributes` (ID có thể đổi theo project).
- ❌ Set `effort` trực tiếp (đó là field auto — FARE tính).
- ❌ Đánh đồng man-days với giờ.
- ❌ Estimate khi spec chưa có (clarity 14–15 + complexity đoán = số rác).
- ❌ Truyền `null` để "giữ nguyên" attribute hiện tại — phải BỎ HẲN field khỏi payload (§4).

## Tự kiểm

- [ ] Đã đọc `fare://system-attributes` lấy ID đúng dải cho project này.
- [ ] Dải ID đúng: complexity 1–5, scope 6–10, clarity 11–15.
- [ ] Trình bảng nháp với cả ID, value, FP, effort auto, effort_est TRƯỚC khi commit.
- [ ] User đã chốt (§2).
- [ ] `update_module` chỉ truyền field thay đổi — không truyền `null` (§4).
- [ ] Đơn vị nhất quán: module = man-days, task = giờ. Không nhầm.
- [ ] `effort_est` lệch quá 2× `effort` auto → đã giải thích / điều chỉnh.
