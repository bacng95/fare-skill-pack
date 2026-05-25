---
name: fare-plan-breakdown
description: Dựng / hoàn thiện cây Module → Submodule → Function 3 cấp cho một phạm vi nghiệp vụ. Mục đích BA-light là có chỗ để gắn spec (`module_id` cấp Function) — KHÔNG sa đà ước lượng effort chi tiết (đó là vai PM). Dùng khi spec chưa có `module_id` để gắn, hoặc cần xếp lại cây module cho khớp nghiệp vụ.
---

# fare-plan-breakdown — Chia cây Module/Submodule/Function (BA-light)

Dùng khi: BA cần đẩy spec lên FARE nhưng cây module chưa đủ chỗ — phải tạo / sửa cây 3 cấp trước.

KHÔNG thuộc skill này: ước lượng effort sâu (complexity/scope/clarity + effort_est) — đó là vai PM. Skill này chỉ làm phần *cấu trúc cây* để rule §1 (không có mồ côi) được thỏa.

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết project & yêu cầu nghiệp vụ.
- Tuân `rules/fare-rules.md`: §1 (3 cấp cứng), §2 (Confirmation Gate), §3 (đọc trước khi tạo), §7 (không bịa scope).

## 3 cấp CỨNG — không vi phạm
```
Module (type="module", no parent_id)
└── Submodule (type="submodule", parent_id=module.id)
    └── Function (type="function", parent_id=submodule.id) ← spec gắn vào đây
```

- Function **luôn là leaf** — spec (use_case / user_story / requirement / api_doc / erd) và task gắn vào Function, KHÔNG gắn vào Module / Submodule.
- KHÔNG tạo Function trực tiếp dưới Module (vi phạm §1).
- Aim 2–5 submodule / module; 2–5 function / submodule (theo FARE prompt `plan-breakdown`).

## Quy trình
1. **Đọc cây hiện có.** Resource `fare://projects/{code}/modules` — KHÔNG bỏ bước này (§3). Ghi nhận ID Module / Submodule / Function đã có.
2. **Đối chiếu yêu cầu nghiệp vụ với cây.** Mỗi yêu cầu của User → tìm Function khớp:
   - **Có Function khớp** → reuse `id` đó, KHÔNG tạo trùng.
   - **Có Module/Submodule cha hợp lý nhưng thiếu Function** → đề xuất `add_module(type="function", parent_id=<submodule>)`.
   - **Thiếu cả Submodule** → đề xuất bổ sung Submodule rồi Function.
   - **Thiếu cả Module** → đề xuất Module + Submodule + Function.
3. **Đề xuất + CHỜ User chốt** (§2). Trình bày dưới dạng:
   ```
   Cây hiện tại (rút gọn các nhánh liên quan):
   M1 Quản lý nhân viên (id=100)
   ├── S1.1 Hồ sơ nhân viên (id=110)
   │   ├── F1.1.1 Thêm nhân viên (id=120) ← reuse
   │   └── F1.1.2 Cập nhật nhân viên (id=121) ← reuse
   └── S1.2 ⚠️ chưa có — đề xuất tạo "Hợp đồng lao động"
       ├── F (mới) "Thêm HĐLĐ"
       └── F (mới) "Cập nhật HĐLĐ"

   Hành động đề xuất (3):
   1. add_module(name="Hợp đồng lao động", type="submodule", parent_id=100) → S1.2
   2. add_module(name="Thêm HĐLĐ", type="function", parent_id=<S1.2.id>)
   3. add_module(name="Cập nhật HĐLĐ", type="function", parent_id=<S1.2.id>)
   ```
4. **User chốt → thực thi.** Tạo theo đúng thứ tự cha→con. Sau mỗi `add_module` ghi lại ID trả về để dùng cho bước kế. KHÔNG batch trước rồi mới chốt.
5. **Khi cần đổi cây có sẵn (rename / di chuyển):** `update_module(moduleId, ...)`. Đổi `parent_id` = di chuyển — phải User xác nhận (rule §2, vì cấu trúc).

## Ước lượng effort — BA chỉ làm tối thiểu
BA-light **KHÔNG bắt buộc** điền `complexity`, `scope`, `clarity`, `effort_est`. Chỉ chạm khi:
- User yêu cầu rõ.
- Tài liệu nguồn (BRD/SRS) đã ghi rõ con số.

Khi cần: dùng đúng ID hệ thống theo dải (rule §4):
- complexity: 1–5
- scope (volume): 6–10
- clarity: 11–15

Sai dải = lỗi nghiêm trọng. Đọc `fare://system-attributes` trước khi truyền.

Bàn giao chi tiết effort + lên plan/version → vai PM (`fare-project-manager` `/fare-pm`).

## Quy ước đặt tên
- **Module / Submodule:** tiếng Việt, danh từ chung (vd "Quản lý nhân viên", "Hợp đồng lao động"). KHÔNG đánh số tiền tố — FARE tự render thứ tự.
- **Function:** tiếng Việt, **động từ + tân ngữ** ngắn gọn nêu đúng 1 hành động (vd "Thêm nhân viên", "Cập nhật hợp đồng", "Danh sách giấy phép"). Khớp với cách doc nguồn đặt mục.
- Tránh tên trùng giữa các function khác submodule — sau này khó tra (vd 2 function tên "Danh sách" ở 2 submodule khác nhau).

## Anti-patterns
- ❌ Tạo Function trực tiếp dưới Module (vi phạm §1).
- ❌ Tạo Module / Submodule trùng tên với cái đã có (không đọc cây trước).
- ❌ Hard-code `status_id` hay attribute ID kiểu 1–5 cho `scope` (phải 6–10).
- ❌ Tự đẩy `add_module` hàng loạt khi User chưa chốt cây.
- ❌ Sa đà điền effort chi tiết khi không có dữ liệu nguồn — đó là việc PM, không phải BA-light.

## Tự kiểm
- [ ] Đã `Read fare://projects/{code}/modules` trước khi tạo bất cứ thứ gì.
- [ ] Mọi Function đề xuất đều có Submodule cha hợp lệ, mọi Submodule có Module cha hợp lệ.
- [ ] Cây đề xuất đã được User chốt trước khi `add_module` (§2).
- [ ] Tên Function dạng "động từ + tân ngữ", không trùng tên trong cùng submodule.
- [ ] Không tự gán attribute ID nếu nguồn không nêu.
