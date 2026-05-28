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

## Khuôn — theo ĐÚNG: cùng thứ tự, cùng nhãn, cùng cấp heading
Mục nào nguồn không có → BỎ (không bịa cho đủ).

```markdown
> Nguồn: fare://documents/{id} · version {N} · {ngày}

# {số} {Tên chức năng}

## Tổng quan
- **Mô tả:** …
- **Tác nhân:** …
- **Tiền điều kiện:** …

## Luồng chính
**Bước 1:** {mô tả bước}
- {mục con — trường nhập / cột hiển thị / tiêu chí lọc, tùy bản chất bước}
  - {ràng buộc / chi tiết của mục con}

**Bước 2:** {mô tả bước — có thể có nhánh điều kiện}
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
- Mục con của bước (trường nhập / cột danh sách / tiêu chí lọc) → bullet; ràng buộc → bullet lồng.
- Nhánh điều kiện trong một bước → bullet `**Nếu …:**`.
- `(Bắt buộc)` chỉ thêm khi nguồn ghi rõ — KHÔNG tự gán.
- Tham chiếu chéo: `{số} {tên đầy đủ}`, không để số trần.
- Nhãn trạng thái thủ công trong heading nguồn ("- DONE", "– WIP"): BỎ khỏi heading khi normalize (trạng thái nằm trên FARE, không trong nội dung) — nhưng đây là quyết định FORM; nếu không chắc, giữ + `⚠️`.

## Markup mang ý nghĩa NỘI DUNG — KHÔNG được tự xử như form
`<s>`, `<mark>`, comment-highlight KHÔNG phải markup trang trí — chúng mang ngữ nghĩa. normalize chỉ đổi FORM, nên:
- **`<s>...</s>` (gạch ngang)** = nội dung người soạn đã BỎ. Vd `Khối <s>(Bắt buộc)</s>` = khối không còn bắt buộc; `<s>Tên riêng (Bắt buộc)</s>` + con gạch hết = field bị loại.
  - Markdown: giữ bằng `~~...~~` (strikethrough) HOẶC ghi rõ `(đã bỏ)` — chọn 1, nhất quán. KHÔNG xóa hẳn (mất dấu vết quyết định), KHÔNG coi như còn hiệu lực (vd KHÔNG ghi "Khối (Bắt buộc)").
  - Nếu cả field bị gạch → giữ field dưới dạng `~~Tên riêng (Bắt buộc)~~` + `⚠️ field này nguồn đã gạch bỏ — xác nhận có loại không`.
- **`<mark>...</mark>` (highlight)** = điểm người soạn nhấn / chưa chốt. Bỏ thẻ `<mark>` (đó là màu nền — form) NHƯNG nếu nhiều mark cụm lại ở 1 field → ghi `⚠️ điểm nhấn/chưa chốt` 1 lần cho cụm.
- **`comment-highlight` (`data-comment-id`)** = có thảo luận chưa chốt mà agent không đọc được → giữ text, thêm `⚠️ điểm mở (có comment chưa chốt)`.

Tóm: form (bảng HTML, `<strong>`, `<mark>` màu nền, data-id) → làm sạch thoải mái. Ngữ nghĩa (`<s>` = đã bỏ, comment = chưa chốt) → BẢO TOÀN + ⚠️.
