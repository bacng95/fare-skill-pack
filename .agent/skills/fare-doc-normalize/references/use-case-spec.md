# Khuôn: đặc tả chức năng trong SRS (dạng use-case)

**Dùng khi** tài liệu là một **đặc tả chức năng thuộc tài liệu SRS** (Software Requirements Specification) — mô tả một chức năng / màn hình (hành động: Thêm mới, Cập nhật…; hoặc danh sách), viết theo dạng use-case. Đây là cách chuẩn SRS (IEEE 830 / ISO·IEC·IEEE 29148) đặc tả yêu cầu chức năng. Nguồn thường ghi nhãn tiếng Anh: Overview / Basic Flow / Alternative Flow…

> Khuôn này **phản ánh đúng cấu trúc SRS của tài liệu nguồn**. normalize chỉ làm sạch FORM theo khuôn này — KHÔNG tự tái cấu trúc nội dung sang một chuẩn khác.

## Ánh xạ nhãn nguồn → nhãn chuẩn
Đổi nhãn mục sang nhãn chuẩn tiếng Việt — đây là FORM, bắt buộc làm (`rules/fare-rules.md` §7):

| Nhãn nguồn | Nhãn chuẩn |
|---|---|
| `Overview` (Title / Description / Actors / Preconditions) | `## Tổng quan` |
| `Basic Flow` | `## Luồng chính` |
| `Post condition` | `## Hậu điều kiện` |
| `UI/UX` | `## Giao diện` |
| `Alternative Flow` | `## Luồng phụ & Ngoại lệ` |
| `Precondition` (dialect khác) | mục **Tiền điều kiện** trong `## Tổng quan` |
| `Action` / `Main Flow` | `## Luồng chính` |
| `Expected Result` | gộp vào bước tương ứng / `## Hậu điều kiện` |
| `Business Rules` | `## Quy tắc nghiệp vụ` |

## Khuôn — theo ĐÚNG: cùng thứ tự, cùng nhãn, cùng cấp heading
Mục nào nguồn không có → BỎ (không bịa cho đủ).

> **🔴 BẮT BUỘC dùng đúng bộ nhãn mục chuẩn** (Tổng quan / Luồng chính / Hậu điều kiện / Giao diện / Luồng phụ + Quy tắc nghiệp vụ) **+ tiêu đề `#` (h1) + Mã UC**, bất kể nguồn dùng dialect nào. **TUYỆT ĐỐI không tự chế template khác** (để nguyên "Business Rules / Precondition / Action / Expected Result / Alternate Flows", dùng `###` thay `#`, bỏ Mã UC…). Output ra nhãn/cấu trúc lạ = **SAI khuôn → sửa lại**. (Đã gặp: agent drift sang template tự chế khi nguồn lớn.)

```markdown
> Nguồn: fare://documents/{id} · version {N} · {ngày}

# {số} {Tên chức năng}

## Tổng quan
- **Mô tả:** …
- **Tác nhân:** …
- **Tiền điều kiện:** …

## Luồng chính
**Bước 1:** {mô tả bước — chỉ 1 dòng}

**Bước 2:** {bước nhập liệu có NHIỀU nhóm field → lồng: nhóm = bullet cấp 1, field = bullet cấp 2}
- **{Tên nhóm A}:**
  - **{Tên field}** *(Bắt buộc)*: {spec}
  - **{Tên field}**: {spec — field không bắt buộc thì không có marker}
- **{Tên nhóm B}:**
  - **{Tên field}** *(Không bắt buộc)*: {spec}

**Bước 3:** {bước chỉ có 1 nhóm field → bullet 1 cấp, không cần nhãn nhóm}
- **{Tên field}** *(Bắt buộc)*: {spec}
  - {ràng buộc / chi tiết của field}

**Bước 4:** {bước có nhánh điều kiện}
- **Nếu {điều kiện A}:** …
- **Nếu {điều kiện B}:** …

## Hậu điều kiện
…

## Giao diện
[Figma](…)

## Luồng phụ & Ngoại lệ
**Bước 4.1:** {nhánh thay thế / xử lý lỗi — gắn số với bước chính}
- …
```

## Quy tắc trình bày
- Tiêu đề: `#` (cấp 1) kèm số mục — KHÔNG bôi đậm, KHÔNG `###`.
- Heading mục: `##`, nhãn chuẩn tiếng Việt — không để `Overview` / `Basic Flow`.
- Mỗi bước: `**Bước N:**` in đậm — KHÔNG dùng list đánh số `1.` (đè lên "Bước N" và vỡ khi gặp "Bước 4.1").
- **MỖI `**Bước N:**` LÀ MỘT ĐOẠN RIÊNG, cách nhau bằng DÒNG TRỐNG** (`\n\n`). CommonMark gộp các dòng chỉ ngăn bằng newline đơn thành **một** đoạn → "Bước 1 Bước 2 Bước 3… dính chung 1 dòng" — **đây là lỗi hay tái phát NHẤT**. Đúng kể cả khi **gõ tay / đẩy thẳng qua MCP** — KHÔNG ỷ lại script `html_to_md.py` (agent chạy MCP-only thường bỏ script). **Bắt buộc: sau khi đẩy lên FARE, `read_document` đọc lại — xác nhận từng Bước là một đoạn tách biệt; nếu dính → `edit_document` chèn lại dòng trống.**
- Mục con của bước (trường nhập / cột danh sách / tiêu chí lọc) → bullet; ràng buộc → bullet lồng.
- **Bullet đặc tả field/nhãn** → bôi đậm tên field, *nghiêng* dấu bắt buộc, rồi mới tới spec: `**Tên field** *(Bắt buộc)*: spec…`. Giúp quét nhanh giữa "bức tường" field. (Đây là FORM do agent áp — script không tự đoán đâu là field.) Field bị gạch ở nguồn vẫn giữ `~..~`, KHÔNG nghiêng.
- **Bước nhập nhiều nhóm field** (vd "Thông tin lớp" + "Thông tin GVNC") → **lồng**, KHÔNG để nhãn nhóm thành paragraph đứng ngang cấp với "Bước N". Nhóm = bullet cấp 1 (`- **Tên nhóm:**`), field = bullet cấp 2. Giữ cấp **Bước › nhóm › field** rõ ràng, và nhóm thuộc đúng Bước cha (Bước kế tiếp quay về paragraph flush-left). Nếu bước chỉ có 1 nhóm → bỏ nhãn nhóm, field là bullet 1 cấp.
- **Gộp nhiều sub-bullet của 1 field thành dòng `;`** → phải giữ **ĐỦ mọi ý con**, KHÔNG rớt ý nào. Đây là điểm dễ mất nội dung nhất: vd field "Trường" nguồn có 4 ý (nguồn dropdown · **điều kiện enable "chỉ chọn khi đã chọn Tỉnh/TP + Phường/Xã"** · mặc định · chọn 1) — đã từng rớt ý "điều kiện enable" → mất rule, vi phạm §7. Đếm số sub-bullet nguồn = số mệnh đề trong dòng đã gộp; lệch là sót.
- Nhánh điều kiện trong một bước → bullet `**Nếu …:**`.
- `(Bắt buộc)` chỉ thêm khi nguồn ghi rõ — KHÔNG tự gán.
- Tham chiếu chéo: `{số} {tên đầy đủ}`, không để số trần.
- Nhãn trạng thái thủ công trong heading nguồn ("- DONE", "– WIP"): BỎ khỏi heading khi normalize (trạng thái nằm trên FARE, không trong nội dung) — nhưng đây là quyết định FORM; nếu không chắc, giữ + `⚠️`.

## Tham chiếu cú pháp (script `scripts/html_to_md.py` tự làm; mục này để hiểu output + fallback tay)

**Bậc thụt lề đa kiểu** → bullet `-` theo độ sâu. Tín hiệu bậc (nhận hết): `<ul><li>` lồng · `<p data-indent="N">` / `padding-left:Npx` (~32px = 1 bậc) · marker `⟨INDENT:pl=N⟩` (bỏ marker, bậc = N/32) · dòng mở đầu `+`/`-`. `<ul><li>` rỗng → bỏ. KHÔNG đổi thứ tự / gộp / tách dòng.

**Ảnh** `<img src="fare://files/{key}" alt="...">` → `![Ảnh minh hoạ](fare://files/{key})`: GIỮ ref, **BỎ alt** (caption AI noise). Nội dung yêu cầu nằm ở text quanh ảnh — giữ nguyên.

**Markup biên tập — doc giữ SẠCH, báo User NGOÀI LUỒNG (KHÔNG nhét ⚠️ vào thân doc).**
Comment/highlight ở nguồn là **metadata biên tập**, không phải nội dung. Nhét ⚠️ / ghi chú vào doc = tự thêm chữ không có ở nguồn = **adulterate tài liệu** (vi phạm chính §7 mà nó định bảo vệ). Script gom các điểm này ra **stderr**; agent relay cho User trong chat (không lưu vào doc).
- `<s>...</s>` = nội dung đã BỎ ở nguồn → **giữ `~~...~~`** (đây là FORMATTING của nguồn — tự nó là tín hiệu "đã bỏ", KHÔNG coi còn hiệu lực). KHÔNG kèm ⚠️.
- `<mark>` = highlight (màu nền biên tập) → **bỏ màu, giữ text trơn**; báo User field đó được highlight.
- `comment-highlight` = thảo luận chưa chốt → **giữ text trơn**; báo User field đó có comment chưa chốt.
- Cross-ref chưa phân giải (số mục thuộc tài liệu khác) → giữ `(Mục X.Y)` như nguồn; **KHÔNG** thêm ghi chú "chưa phân giải" vào doc — báo User ngoài luồng.

Strip sạch: `data-id`, `style`, `colspan`, `⟨INDENT⟩`, `&nbsp;`.
