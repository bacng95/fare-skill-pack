---
name: fare-doc-normalize
description: Làm sạch FORM của tài liệu nháp local (bảng HTML lồng rối → markdown sạch) trước khi đẩy lên FARE. Giữ nguyên 100% nội dung. Dùng khi User thấy một bản nháp chưa gọn và muốn tối ưu lại.
---

# fare-doc-normalize — Làm sạch form tài liệu

Dùng khi: có tài liệu nháp `.md` ở `docs/outputs/` còn lộn xộn (bảng HTML lồng nhau, markup rác kế thừa từ nguồn) — User muốn làm gọn **trước khi** đẩy lên FARE.

Skill này **chỉ đổi FORM, không đổi NỘI DUNG** (`rules/fare-rules.md` §7).

## Phạm vi
- **Vào:** một file (hoặc một thư mục) nháp local.
- **Ra:** ghi đè file đó bằng bản markdown sạch theo đúng khuôn của loại tài liệu. **Chỉ local** — không đụng FARE.
- Tên file / thư mục chưa đúng **Quy chuẩn đặt tên** (xem `fare-doc-split`) → đổi tên cho đúng.
- KHÔNG tách thêm, KHÔNG gộp, KHÔNG đổi nội dung. Chỉ trình bày lại cho gọn.

## Chọn khuôn theo loại tài liệu
Mỗi loại tài liệu có khuôn riêng trong `references/`. KHÔNG dùng một khuôn cho mọi loại.

1. **Xác định loại** tài liệu nháp — từ `doc_type` / `purpose` của doc nguồn (tra qua `list_documents`) hoặc hình dạng nội dung.
2. **Đọc khuôn** tương ứng trong `references/` rồi làm theo đúng nó.
3. **Chưa có khuôn cho loại đó** → **DỪNG, báo User** để bổ sung `references/{loại}.md`. TUYỆT ĐỐI không tự chế khuôn.

| Loại tài liệu | File khuôn |
|---|---|
| Đặc tả chức năng trong SRS (dạng use-case: Overview + Basic Flow…) | `references/use-case-spec.md` |
| *(loại khác)* | *chưa có — bổ sung khi gặp* |

## Được phép vs Cấm (áp dụng mọi loại)

| Được phép — FORM | Cấm — NỘI DUNG |
|---|---|
| Bảng `<table>` HTML → heading + bullet / bảng markdown gọn | Thêm / bớt / đổi yêu cầu, giá trị, rule |
| Bỏ rác: `data-id`, `colspan`, style inline, `<mark>` rỗng | Tự điền field nguồn để trống (vd cờ "Bắt buộc") |
| Gom các dòng rời thành mục có heading | "Sửa cho hợp lý", suy luận thêm |
| Sửa markup gãy (thẻ hở) | Tự sửa lỗi nội dung của nguồn |
| Tham chiếu số mục trần ("2.15") → `2.15 {tên đầy đủ}` (tra tên thật) | Đoán tên mục khi không tra được — thay vào đó `⚠️` |
| Bỏ `<mark>` (màu nền), nhãn "- DONE" khỏi heading | Xóa `<s>` (gạch = nội dung đã bỏ) — phải GIỮ (`~~...~~`) + ⚠️; coi `<s>(Bắt buộc)` như còn bắt buộc |

> `<s>` / comment-highlight là **ngữ nghĩa nội dung**, KHÔNG phải form — bảo toàn + đánh dấu ⚠️. Chi tiết: `references/use-case-spec.md` mục "Markup mang ý nghĩa NỘI DUNG".

Mỗi câu sau khi làm sạch phải **truy ngược 1:1** về bản nháp gốc.

## Quy trình
1. Đọc file nháp; xác định loại tài liệu.
2. Nạp khuôn `references/{loại}.md` (chưa có → DỪNG, báo User).
3. Trình bày lại theo đúng khuôn — đối chiếu từng phần với bản gốc, đảm bảo không rơi nội dung.
4. Ghi đè file. Báo User: đã làm sạch file nào; liệt kê `⚠️` (lỗi nguồn / điểm mơ hồ) nếu phát hiện.
5. **DỪNG** — chờ User review. Việc đẩy lên FARE là bước sau, do User yêu cầu.

## Tự kiểm
- [ ] Đã chọn đúng loại; output khớp khuôn trong `references/{loại}.md` (heading, thứ tự mục, nhãn).
- [ ] Tên file & thư mục đúng **Quy chuẩn đặt tên**.
- [ ] Không còn `<table>` / markup HTML rác.
- [ ] Mọi câu truy ngược 1:1 về bản gốc — không thêm, không bớt.
- [ ] Field nguồn để trống vẫn để trống (không tự điền).
- [ ] Tham chiếu chéo ở dạng `{số} {tên}` — không còn số mục trần vô nghĩa; số nào không tra được tên thì có `⚠️`.
- [ ] Lỗi nội dung (nếu có) chỉ được `⚠️` + báo, KHÔNG sửa.
- [ ] **Giữ nguyên dòng provenance** ở đầu file — không xóa khi dọn form.
