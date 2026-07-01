---
name: fare-plan-breakdown
description: Dựng / hoàn thiện cây plan item theme › epic › story (3 cấp) cho một phạm vi nghiệp vụ — phân rã theo TRỤC GIÁ TRỊ (sản phẩm mang lại gì), không theo trục code. Story là tầng lá nghiệm thu được & mang effort; nơi gắn spec & task (`plan_item_id` = id story). Dùng khi spec chưa có chỗ gắn, hoặc cần xếp lại cây cho khớp nghiệp vụ. Chấm chất lượng cây đã có → `fare-plan-review`.
---

# fare-plan-breakdown — Chia cây plan item theme/epic/story

Dùng khi: BA cần đẩy spec lên FARE nhưng cây plan item chưa đủ chỗ — phải tạo / sửa cây 3 cấp trước.

> Bản FARE mới gom việc bằng **plan item** (`add_plan_item`/`update_plan_item`/`list_plan_items`/`delete_plan_item`), KHÔNG còn "Module → Submodule → Function". Đọc `fare-mcp-integration` mục "Cây WBS = Plan item" trước.

KHÔNG thuộc skill này: chấm điểm / kiểm toán cây đã có (→ `fare-plan-review`); ước lượng effort sâu (→ PM `fare-effort-estimation`); break story thành task (→ PM `fare-task-breakdown`). Skill này dựng *cấu trúc cây* để rule §1 (không có mồ côi) được thỏa.

## Trục GIÁ TRỊ, không phải trục code
Cây WBS trả lời "sản phẩm mang lại GIÁ TRỊ gì", KHÔNG phải "code tổ chức thế nào". Đừng mirror module kỹ thuật/DDD thành cây này.

| Cấp | Là gì (một câu) | Trả lời | Ví dụ |
|---|---|---|---|
| **theme** | **Mảng năng lực** của sản phẩm — gom nhiều epic cùng phục vụ một mảng nghiệp vụ; sống cùng vòng đời sản phẩm | "sản phẩm gồm những mảng nào" | Dữ liệu thí sinh · Phê duyệt chiến dịch · Vận hành chiến dịch |
| **epic** | **Nhóm giá trị giao được** trong một theme — gom các story cùng mục đích | "trong mảng này giao được nhóm tính năng nào" | Cấu hình luồng duyệt · Chạy phê duyệt · Sửa đổi & từ chối |
| **story** | **Đơn vị nghiệm thu nhỏ nhất** — một việc người dùng/hệ thống làm trọn vẹn, QA nghiệm thu độc lập; **mang effort**; nơi **task neo vào** | "cụ thể làm được gì" | "Đăng nhập bằng Google" · "Bỏ qua email không hợp lệ" |

- **Theme ≠ Initiative** (mục tiêu chiến lược nhiều quý — quá lớn) và **≠ module kỹ thuật** (nhầm trục).
- **Task nằm NGOÀI 3 tầng** — task neo vào đúng 1 story (cha = story). Một story đẻ nhiều task ([BE]/[FE]/[QA]…). KHÔNG break task lúc lập plan (xem Quy trình).

## Đừng bê nguyên cách gom nhóm của TÀI LIỆU NGUỒN
Cấu trúc epic/chương/phần trong BRD/SRS/Excel nguồn thường là **góc trình bày / PM** (theo thứ tự soạn, theo phòng ban, theo màn hình) — KHÔNG phải cấu trúc domain gắn kết. Bê nguyên 9 "epic" của file nguồn ra 9 nhánh = mirror cấu trúc nguồn, phân tích hời hợt.
- ⚠️ **Bẫy:** nguồn cũng hay đặt tên theo "tính năng/value" → dễ tưởng đã đúng trục giá trị. Phép thử THẬT là **cohesion** (cùng trả lời một câu hỏi nghiệp vụ), KHÔNG phải "nghe giống value".
- **Re-derive theo cohesion:** 2 yêu cầu cùng trả lời MỘT câu hỏi nghiệp vụ → cùng một nhánh, **dù nằm khác chương nguồn**. (Vd thực tế: Suppression + Preference + Scoring + Hygiene rải 3 epic nguồn nhưng cùng là "sức khỏe danh sách" → gom về 1 epic.)
- **Chủ động soi chéo:** quét TOÀN BỘ yêu cầu, gom theo *danh từ domain* (đối tượng nhận / nội dung / chiến dịch / theo dõi / quản trị…), rồi đối chiếu với cách nguồn gom — chỗ lệch chính là nơi nguồn gom theo góc PM, cần cắt lại.

## 3 cấp CỨNG — không vi phạm
```
theme  (type="theme", không parent_id)
└── epic  (type="epic", parent_id=theme.id)
    └── story  (type="story", parent_id=epic.id) ← spec & task gắn vào đây
```
Mọi đường gốc→lá dài **đúng 3**: không story treo thẳng dưới theme, không epic ngoài theme.

## Phép thử từng tầng (đi từ DƯỚI lên — xác định lá trước)

**Đây có phải Story (lá) không?** — "Người dùng/hệ thống thực hiện nó như một hành động trọn vẹn, QA nghiệm thu độc lập được không?"
- Có → là Story. Đặt vào một Epic phù hợp (chưa có → mục "Nhánh nông").
- Còn mơ hồ ("quản lý X") → chưa tới lá, **chia tiếp**.
- Đã là bước kỹ thuật ("gọi API token", "tạo bảng users") → **quá sâu, đó là Task**, không phải Story.

**Epic gom Story thế nào?** — gom các story **cùng một nhóm giá trị**; đặt tên theo nhóm giá trị, KHÔNG lặp tên story con, KHÔNG kiểu "Epic của X".

**Theme gom Epic thế nào?** — gom các epic cùng một **mảng năng lực**; các theme đồng cấp (cùng độ trừu tượng, cùng hệ ngôn ngữ đặt tên).

## Nhánh nông — tầng mỏng nhưng tên THẬT (KHÔNG tầng giả)
Khi một giá trị nhỏ tự nó đã nghiệm thu được mà chưa có gì chia thêm, **KHÔNG bỏ tầng**:
- Vẫn đặt story vào một epic, epic vào một theme.
- Epic/theme **tạm thời chỉ 1 con là CHẤP NHẬN ĐƯỢC**, miễn:
  - Mang **tên một nhóm giá trị / mảng năng lực THẬT** (mà con thuộc về), KHÔNG phải bản sao tên con duy nhất.
  - Có khả năng **nở thêm con** về sau (là nhóm có nghĩa, không phải vỏ rỗng).

> "Epic mỏng có tên nhóm giá trị thật" = ĐÚNG. "Epic là bản sao tên story con duy nhất" = **tầng giả, SAI**. Khi bắt buộc 3 tầng, rủi ro lớn nhất KHÔNG còn là thiếu tầng mà là **tầng trung gian giả**.

## Khi nào TÁCH một Story
Tách khi nó gói **nhiều giá trị nghiệm thu RIÊNG được**:
- "Queue gửi + xử lý skip" → "Đưa email vào hàng đợi" · "Bỏ qua email không hợp lệ".
- "Tracking open + click" → "Theo dõi tỷ lệ mở" · "Theo dõi tỷ lệ click".
KHÔNG tách khi các phần chỉ là bước kỹ thuật của cùng một giá trị (đó là task của một story).

## Quy trình
1. **Đọc cây hiện có.** `list_plan_items(projectCode)` (hoặc resource `fare://projects/{code}/plan-items`) — KHÔNG bỏ bước này (§3). Ghi nhận `id` theme / epic / story đã có.
2. **Đối chiếu yêu cầu nghiệp vụ với cây.** Mỗi yêu cầu của User → tìm Story khớp:
   - **Có Story khớp** → reuse `id`, KHÔNG tạo trùng.
   - **Có theme/epic cha hợp lý nhưng thiếu Story** → đề xuất `add_plan_item(type="story", parent_id=<epic>)`.
   - **Thiếu cả Epic** → đề xuất bổ sung Epic rồi Story.
   - **Thiếu cả Theme** → đề xuất Theme + Epic + Story.
3. **Đề xuất + CHỜ User chốt** (§2). Trình bày dưới dạng:
   ```
   Cây hiện tại (rút gọn các nhánh liên quan):
   T5 Quản lý Dự án (id=252)
   ├── E16 Vòng đời Dự án (id=277)
   │   ├── S43 Tạo & Cập nhật Project (id=352) ← reuse
   │   └── S46 Trang Project Detail (id=355) ← reuse
   └── E (mới) ⚠️ chưa có — đề xuất "Phân quyền Dự án"
       ├── S (mới) "Gán role thành viên"
       └── S (mới) "Thu hồi quyền thành viên"

   Hành động đề xuất (3):
   1. add_plan_item(name="Phân quyền Dự án", type="epic", parent_id=252) → epic mới
   2. add_plan_item(name="Gán role thành viên", type="story", parent_id=<epic.id>)
   3. add_plan_item(name="Thu hồi quyền thành viên", type="story", parent_id=<epic.id>)
   ```
4. **User chốt → thực thi.** Tạo theo đúng thứ tự cha→con. Sau mỗi `add_plan_item` ghi lại ID trả về để dùng cho bước kế. KHÔNG batch trước rồi mới chốt.
5. **(Sau khi có tài liệu/phân tích) break Story thành Task** — KHÔNG làm lúc lập plan (task cần tài liệu; plan mà đẻ task = task mù). Đó là vai PM `fare-task-breakdown`.
6. **Khi cần đổi cây có sẵn (rename / di chuyển):** `update_plan_item(itemId, ...)`. Đổi `parent_id` = di chuyển — phải User xác nhận (§2). Xóa nhánh rỗng → `delete_plan_item(itemId, confirm=true)` (server chặn nếu còn task).

## Quy ước đặt tên
- **Story:** **[động từ] + [đối tượng]** ngắn gọn, nêu đúng 1 hành động bàn giao (vd "Bỏ qua email không hợp lệ", "Gán role thành viên"). KHÔNG mô tả cơ chế trong tên (cơ chế là tiêu chí nghiệm thu). KHÔNG dùng dấu **+** gộp nhiều việc (dấu hiệu story ôm nhiều giá trị → tách).
- **Theme / Epic:** danh từ nhóm giá trị / mảng năng lực (vd "Quản lý Dự án", "Phân quyền Dự án"). KHÔNG trùng tên với con duy nhất của nó. KHÔNG đánh số tiền tố — FARE tự render code T#/E#/S#.

## Ước lượng effort — BA chỉ làm tối thiểu
BA-light **KHÔNG bắt buộc** điền effort. Lúc plan, story chỉ cần **gán được C/S/Cl** (không gán được = chưa đủ rõ ranh giới → làm rõ hoặc tách). Chỉ chạm số khi User yêu cầu rõ, hoặc nguồn (BRD/SRS) đã ghi. Khi cần, theo đúng cấp (rule §4):
- **Story:** `complexity` (ID 1–5) + `scope` (ID 6–10) + `clarity` (ID 11–15) → `effort` auto.
- **Epic:** `effort_est_level` (L1–L4) — ước nhanh tùy chọn khi chưa vỡ story.
- **Theme:** read-only, roll-up từ con.

Sai dải / sai cấp = lỗi. Đọc `fare://system-attributes` trước khi truyền. Chi tiết → PM `fare-effort-estimation`.

## Anti-patterns
- ❌ Tìm tool `add_module`/`update_module`/`list_modules` — đã bị gỡ. Dùng `add_plan_item`/`update_plan_item`/`list_plan_items`. <!-- lint:allow -->
- ❌ Chia cây theo **trục code** (module kỹ thuật/DDD) thay vì trục giá trị.
- ❌ **Mirror y nguyên cách gom nhóm (epic/chương) của tài liệu nguồn** — đó là góc PM/trình bày, không phải cohesion domain. Re-derive lại.
- ❌ **Story là bước kỹ thuật** ("tạo bảng X", "gọi API Y") — đó là task của một story giá trị.
- ❌ **Story gói nhiều giá trị** (tên có dấu "+" / liệt kê nhiều việc) — tách.
- ❌ **Tên story mô tả cơ chế** ("quay Draft + báo người tạo") — đổi thành [động từ]+[đối tượng], đẩy chi tiết xuống nghiệm thu.
- ❌ **Tầng giả:** epic trùng tên story con duy nhất / theme trùng tên epic con duy nhất.
- ❌ Tạo Story trực tiếp dưới theme (thiếu epic — vi phạm §1).
- ❌ Tạo Theme / Epic trùng tên cái đã có (không đọc cây trước).
- ❌ Gán effort tay ở **theme** (theme roll-up) hoặc nhầm dải ID story.
- ❌ Tự đẩy `add_plan_item` hàng loạt khi User chưa chốt cây.
- ❌ Break task lúc lập plan (task cần tài liệu — đó là vai PM).

## Tự kiểm
- [ ] Đã `list_plan_items(projectCode)` trước khi tạo bất cứ thứ gì (§3).
- [ ] Chia theo trục giá trị, không mirror module code.
- [ ] Khung nhánh derive theo cohesion domain, KHÔNG copy cách gom của tài liệu nguồn; đã soi FR cùng bản chất nằm rải khác chương.
- [ ] Mọi Story là đơn vị nghiệm thu được (không phải task); gán được C/S/Cl.
- [ ] Mọi Story có Epic cha hợp lệ, mọi Epic có Theme cha hợp lệ (đủ đúng 3 tầng).
- [ ] Nhánh nông: tầng mỏng có tên nhóm giá trị/mảng năng lực THẬT (không tầng giả).
- [ ] Tên Story dạng "động từ + tân ngữ", không dấu +, không mô tả cơ chế.
- [ ] Cây đề xuất đã được User chốt trước khi `add_plan_item` (§2).
