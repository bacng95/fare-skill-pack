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
| Dựng bullet từ indent đa kiểu (`data-indent`/`padding-left`/`⟨INDENT:pl=N⟩`/`+`); bỏ marker `⟨INDENT⟩`; bỏ `<ul><li>` rỗng | Đổi thứ tự / gộp / tách dòng khi chuẩn hóa bậc |
| Ảnh `<img fare://files/{key}>` → `![Ảnh minh hoạ](fare://files/{key})`, GIỮ ref | Chép alt caption AI ("LightRAG Schema"...) làm nội dung spec |

> `<s>` / comment-highlight là **ngữ nghĩa nội dung**, KHÔNG phải form — bảo toàn + đánh dấu ⚠️. Indent đa kiểu, marker `⟨INDENT⟩`, ảnh nhúng: xem `references/use-case-spec.md` mục "Dựng bậc bullet" + "Ảnh nhúng".

Mỗi câu sau khi làm sạch phải **truy ngược 1:1** về bản nháp gốc.

## Quy trình — script lo CÚ PHÁP, agent lo NGỮ NGHĨA
Biến đổi cú pháp (HTML table→markdown, bullet từ indent đa kiểu, `<img>`/`<s>`/`<mark>`/marker `⟨INDENT⟩`, strip `data-id`/`style`) là **deterministic** → giao cho script, KHÔNG mô tả dài rồi để agent làm tay (dễ bỏ sót). Agent chỉ làm phần cần *hiểu*.

1. **Xác định loại** tài liệu → nạp khuôn `references/{loại}.md` (chưa có khuôn → DỪNG, báo User).
2. **Chạy script cú pháp** trên file nháp (chứa HTML thô):
   ```
   python3 scripts/html_to_md.py <file-nhap>.md > <file-nhap>.clean.md
   ```
   Script là **pure local transform** — chỉ đọc/ghi text local, KHÔNG gọi MCP/API/DB/network (thoả ngoại lệ `rules/fare-rules.md §8`). Nó xử: table→heading chuẩn + key-value; bullet từ `<ul><li>` / `data-indent` / `padding-left` / `⟨INDENT:pl=N⟩` / `+`; `<img fare://files/K>`→`![Ảnh minh hoạ](fare://files/K)` (bỏ alt AI noise); `<s>`→`~~..~~`; `<mark>`→bỏ thẻ; comment-highlight→`⚠️(comment chưa chốt)`; heading function→`#`. KHÔNG thêm/bớt chữ nghĩa.
   > Script lỗi / HTML quá dị → fallback làm tay theo `references/{loại}.md` + mục "Dựng bậc bullet". Báo User script không xử được.
3. **Agent review + phần JUDGMENT** (script KHÔNG làm — cần hiểu ngữ cảnh):
   - Đối chiếu output với khuôn `references/{loại}.md`: đúng thứ tự mục, nhãn chuẩn. Sửa chỗ script đặt sai mục (vd nhãn section nguồn dị).
   - **Cross-ref**: số mục → `{số} {tên}` (tra checklist heading / `list_documents`); không tra được → `⚠️ chưa phân giải`.
   - **Nhãn "- DONE"** trong heading: bỏ (trạng thái nằm trên FARE).
   - **Lỗi nội dung nguồn** (typo, copy-paste sai, `<s>` field bị bỏ, `<mark>` chưa chốt): ghi `⚠️` vào sổ, KHÔNG sửa thầm (§7).
   - Mọi câu truy ngược 1:1 về nguồn — không rơi nội dung.
4. **Ghi đè file** bằng bản sạch. Báo User: file nào, sổ `⚠️`.
5. **DỪNG** — chờ User review. Đẩy FARE là bước sau, do User yêu cầu.

## Tự kiểm
- [ ] Đã chạy `scripts/html_to_md.py` cho phần cú pháp (hoặc fallback tay nếu script lỗi, có báo User).
- [ ] Đã chọn đúng loại; output khớp khuôn trong `references/{loại}.md` (heading, thứ tự mục, nhãn).
- [ ] Tên file & thư mục đúng **Quy chuẩn đặt tên**; nhãn "- DONE" đã bỏ khỏi heading.
- [ ] Không còn `<table>` / `data-id` / `style` / marker `⟨INDENT⟩` / markup HTML rác.
- [ ] `<img>` → `![](fare://files/..)` giữ ref, KHÔNG chép alt AI; `<s>` giữ `~~..~~`.
- [ ] Mọi câu truy ngược 1:1 về bản gốc — không thêm, không bớt.
- [ ] Field nguồn để trống vẫn để trống (không tự điền).
- [ ] Tham chiếu chéo ở dạng `{số} {tên}` — không còn số mục trần vô nghĩa; số nào không tra được tên thì có `⚠️`.
- [ ] Lỗi nội dung (nếu có) chỉ được `⚠️` + báo, KHÔNG sửa.
- [ ] **Giữ nguyên dòng provenance** ở đầu file — không xóa khi dọn form.
