---
name: fare-plan-review
description: Chấm / kiểm toán một cây plan item (theme › epic › story) ĐÃ CÓ trên FARE theo rubric chất lượng — mỗi story/epic/theme + cấu trúc tổng thể đạt chuẩn chưa (nghiệm thu được, đúng trục giá trị, tầng thật không giả, đủ 3 tầng). Báo cáo điểm + đề xuất sửa, CHỜ User chốt — KHÔNG tự restructure. Dùng trước go-live / handoff PM, hoặc khi nghi cây phân rã sai. Dựng cây mới → `fare-plan-breakdown`.
---

# fare-plan-review — Chấm cây Theme/Epic/Story đã có

Dùng khi: cần soi một cây plan item đã tạo xem có đạt chuẩn phân rã không — trước khi PM break task / lên sprint, hoặc khi nghi cây bị mirror code / có tầng giả.

> Đây là skill **AUDIT** (đọc + chấm + đề xuất), song sinh với skill **TẠO** `fare-plan-breakdown` — giống cặp `fare-spec-authoring` ↔ `fare-audit-spec`. Mặc định **read-only**: mọi sửa cấu trúc phải User chốt (§2). Đọc `fare-plan-breakdown` để nắm chuẩn phân rã (trục giá trị, nhánh nông, tầng giả).

## Tiền đề
- **Bản đồ ngữ cảnh** (`fare-context-discovery`) — biết project + phạm vi cần chấm.
- Tuân `rules/fare-rules.md`: §2 Confirmation Gate (mọi sửa cây cần User chốt), §7 (không bịa).

## Quy trình
1. **Khoanh phạm vi.** Cả project, hay 1 theme/epic? Chốt với User.
2. **Đọc cây.** `list_plan_items(projectCode)` → dựng cây theo `parent_id` (theme `T#` → epic `E#` → story `S#`); ghi nhận `complexity/scope/clarity/effort/effort_est_level` từng node.
3. **Chấm từng phần tử** theo rubric §1–§3 dưới. Một "Không" ở tiêu chí bắt buộc → phần tử **chưa đạt**.
4. **Chấm cấu trúc tổng thể** theo §4.
5. **Báo cáo** (mục "Mẫu báo cáo") — KHÔNG sửa gì ở bước này.
6. **Đề xuất hành động + CHỜ User chốt** (§2) → sửa qua `update_plan_item` (rename / đổi `parent_id` = di chuyển) · `add_plan_item` (tách story / chèn tầng thiếu) · `delete_plan_item(confirm=true)` (gỡ vỏ rỗng, server chặn nếu còn task). Thực thi tuần tự, KHÔNG batch quyết định.

## §1 — Chấm một STORY
| # | Tiêu chí | Đạt nếu |
|---|---|---|
| S1 | Nghiệm thu được độc lập | QA viết được tiêu chí pass/fail cho riêng nó |
| S2 | Là giá trị, không phải bước kỹ thuật | Không phải "tạo bảng X" / "gọi API Y" (đó là task) |
| S3 | Đong được effort | Gán được `complexity` & `scope` mà không "còn tùy" |
| S4 | Tên đúng chuẩn | [động từ]+[đối tượng], không dấu +, không mô tả cơ chế |
| S5 | Một giá trị duy nhất | Không gói nhiều giá trị tách rời được |
| S6 | Đủ cha-ông | Thuộc một Epic, Epic đó thuộc một Theme (không treo thẳng dưới theme/gốc) |

## §2 — Chấm một EPIC
| # | Tiêu chí | Đạt nếu |
|---|---|---|
| E1 | Gom Story cùng mục đích | Các story con phục vụ một nhóm giá trị thống nhất |
| E2 | Tên là nhóm giá trị thật | KHÔNG sao chép tên story con duy nhất; không kiểu "Epic của X" |
| E3 | Đủ tầng dưới | Có ≥1 Story (epic mỏng 1 story OK nếu E2 đạt) |
| E4 | Không quá to | Không phải cả một mảng năng lực (nếu vậy → nó là Theme) |
| E5 | Nằm trong Theme | Có Theme cha hợp lý |
| E6 | Effort đúng cấp | Chỉ dùng `effort_est_level` (L1–L4) nếu có ước; **KHÔNG** gán `complexity/scope/clarity` (đó là story — server reject 400) |

## §3 — Chấm một THEME
| # | Tiêu chí | Đạt nếu |
|---|---|---|
| T1 | Là mảng năng lực | Gom các epic cùng một mảng nghiệp vụ |
| T2 | Đúng tầm | Không quá lớn (mục tiêu chiến lược = Initiative) cũng không phải một epic |
| T3 | Theo giá trị, không theo code | Không phải module kỹ thuật/DDD |
| T4 | Đồng cấp & nhất quán | Cùng độ trừu tượng & hệ ngôn ngữ đặt tên với theme khác |
| T5 | Tên là mảng năng lực thật | KHÔNG sao chép tên epic con duy nhất |
| T6 | Effort không gán tay | Theme read-only — `effort`/`effort_est` roll-up từ con, không set trực tiếp |

## §4 — Chấm cả CÂY
- **Mọi nhánh đủ đúng 3 tầng** theme → epic → story. Không nhánh nông hơn (story/epic treo) hay sâu hơn 3.
- Mọi lá là Story nghiệm thu được; mọi Story ở đúng tầng lá.
- Tầng trung gian mỏng (1 con) được phép, nhưng phải có tên nhóm giá trị/mảng năng lực THẬT (không phải bản sao tên con) → **tầng giả là rủi ro lớn nhất khi bắt buộc 3 tầng**.
- Task KHÔNG xuất hiện ở 3 tầng này (task neo dưới story).

## Mẫu báo cáo
```
## Plan Review — {project} · phạm vi {theme/all}
Thời điểm: {yyyy-mm-dd}
Cây: {n} theme · {n} epic · {n} story

### Tóm tắt
| Phần tử | Đạt | Chưa đạt |
|---|---|---|
| Theme | 3 | 1 |
| Epic | 9 | 2 |
| Story | 41 | 5 |

### Chưa đạt — ưu tiên sửa
🟥 Tầng giả (2):
- T7 "Ghi nhật ký" › E22 "Ghi nhật ký" › S88 "Ghi nhật ký" — cả 3 tầng trùng tên (T5,E2 fail).
  Đề xuất: Theme "Phê duyệt chiến dịch" → Epic "Truy vết phê duyệt" → giữ Story.
🟧 Story = bước kỹ thuật (3):
- S101 "Tạo bảng campaign" (S2 fail) → hạ thành task của story "Tạo chiến dịch & chọn segment".
- S77 "Xử lý duyệt: quay Draft + ghi lý do + báo người tạo" (S4,S5 fail) → tách 3 story + đẩy cơ chế xuống nghiệm thu.
🟨 Story treo thiếu epic (2): S130, S131 nằm thẳng dưới theme T10 (S6 fail) → tạo epic "Hồ sơ Người dùng" bao 2 story.

### Đề xuất hành động (cần User chốt từng mục)
1. update_plan_item(itemId=<T7>, name="Phê duyệt chiến dịch")
2. update_plan_item(itemId=<E22>, name="Truy vết phê duyệt")
3. add_plan_item(type="epic", parent_id=<T10>, name="Hồ sơ Người dùng") → rồi update_plan_item(S130/S131, parent_id=<epic mới>)
```

## Anti-patterns (dấu hiệu SAI thường gặp)
| Dấu hiệu | Vì sao sai | Sửa |
|---|---|---|
| Story = "tạo bảng / gọi API / dựng service" | Task kỹ thuật, không phải giá trị | Hạ thành task của story giá trị tương ứng |
| Tên Story có "+" / liệt kê nhiều việc | Gói nhiều giá trị | Tách nhiều story |
| Tên Story mô tả cơ chế | Đó là tiêu chí nghiệm thu | Đổi [động từ]+[đối tượng], đẩy chi tiết xuống nghiệm thu |
| **Epic trùng tên story con duy nhất** | Tầng trung gian giả | Đặt tên epic theo nhóm giá trị story đó thuộc về |
| **Theme trùng tên epic con duy nhất** | Tầng theme giả | Đặt tên theme theo mảng năng lực thật |
| Story treo thẳng dưới Theme | Vi phạm 3 tầng | Tạo epic nhóm giá trị bao story đó |
| Không gán nổi C/S cho Story | Story chưa đủ rõ ranh giới | Làm rõ yêu cầu hoặc tách nhỏ |
| Theme = mục tiêu chiến lược nhiều quý | Quá lớn | Đó là Initiative; theme nhỏ hơn |
| `complexity/scope/clarity` gán ở Epic | Sai cấp (story mới có) | Epic dùng `effort_est_level`; bỏ C/S/Cl |
| `effort`/`effort_est` set tay ở Theme | Theme read-only, roll-up | Bỏ; chỉ chấm story (C/S/Cl) + epic (level) |
| Epic = một mảng năng lực khổng lồ | Quá to | Nâng thành theme, chia lại epic bên trong |

## Tự kiểm
- [ ] Phạm vi chấm đã chốt với User.
- [ ] Đã `list_plan_items` dựng cây đầy đủ trước khi chấm.
- [ ] Mỗi story/epic/theme chấm theo đúng rubric; mỗi "Chưa đạt" có lý do + đề xuất sửa cụ thể.
- [ ] Phân biệt đúng "tầng mỏng tên thật" (OK) vs "tầng giả" (sai).
- [ ] Báo cáo trước, KHÔNG tự sửa; mọi `update_plan_item`/`add_plan_item`/`delete_plan_item` chờ User chốt (§2).
- [ ] Đề xuất effort đúng cấp: story C/S/Cl, epic effort_est_level, theme roll-up.
