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

## Ranh giới FORM vs NỘI DUNG
- **FORM** (được sửa thoải mái): bảng `<table>`, `data-id`/`style`/`colspan`, `<mark>` màu nền, markup gãy, bậc thụt lề, nhãn "- DONE" trong heading. Script lo phần này.
- **NỘI DUNG** (CẤM đổi): yêu cầu, giá trị, rule, field. KHÔNG thêm/bớt/"sửa cho hợp lý", KHÔNG tự điền field để trống, KHÔNG sửa lỗi nguồn (chỉ ⚠️).
- **Ngữ nghĩa cần BẢO TOÀN** (dễ tưởng là form): `<s>` = nội dung đã bỏ (giữ `~~..~~`, KHÔNG coi còn hiệu lực); `comment-highlight` = chưa chốt; `alt` ảnh = caption AI noise (KHÔNG chép làm nội dung).

Mỗi câu sau khi làm sạch phải **truy ngược 1:1** về bản nháp gốc.

## Quy trình — script lo CÚ PHÁP, agent lo NGỮ NGHĨA
1. **Xác định loại** tài liệu → nạp khuôn `references/{loại}.md` (chưa có khuôn → DỪNG, báo User).
2. **Chạy script cú pháp** (deterministic, đỡ agent làm tay dễ sót):
   ```
   python3 scripts/html_to_md.py <file-nhap>.md > <file-nhap>.clean.md
   ```
   Script là **pure local transform** (chỉ đọc/ghi text local, KHÔNG gọi MCP/DB — `fare-rules §8`). Nó lo trọn phần cú pháp: table→heading+key-value, bullet từ indent đa kiểu, `<img>`/`<s>`/`<mark>`/marker `⟨INDENT⟩`, strip rác, heading function→`#`. Chi tiết: header của script + `references/use-case-spec.md`.
   > Script lỗi / HTML quá dị → fallback làm tay theo `references/{loại}.md`. Báo User.
3. **Agent review + phần JUDGMENT** (script KHÔNG làm — cần hiểu ngữ cảnh):
   - Đối chiếu output với khuôn `references/{loại}.md`: đúng thứ tự mục, nhãn chuẩn. Sửa chỗ script đặt sai mục (vd nhãn section nguồn dị).
   - **Cross-ref**: số mục → `{số} {tên}` (tra checklist heading / `list_documents`); không tra được → giữ `{số}` như nguồn, **báo User** (KHÔNG nhét `⚠️ chưa phân giải` vào doc).
   - **Nhãn "- DONE"** trong heading: bỏ (trạng thái nằm trên FARE).
   - **Markup biên tập & lỗi nội dung nguồn** (comment/highlight/`<s>`; typo, copy-paste sai): **báo User NGOÀI LUỒNG, KHÔNG nhét `⚠️`/ghi chú vào thân doc** (= tự thêm chữ không có ở nguồn → adulterate, vi phạm §7). Script đã gom markup biên tập ra **stderr** — đọc để relay. KHÔNG sửa thầm. `<s>` giữ `~~..~~` (formatting nguồn).
   - Mọi câu truy ngược 1:1 về nguồn — không rơi nội dung.
4. **Ghi đè file** bằng bản sạch. Báo User ngoài luồng: file nào + **danh sách điểm biên tập/nghi vấn** (gộp từ stderr script + rà của agent) — không nằm trong doc.
5. **DỪNG** — chờ User review. Đẩy FARE là bước sau, do User yêu cầu.

## Tự kiểm
- [ ] Đã chạy `scripts/html_to_md.py` cho phần cú pháp (hoặc fallback tay nếu script lỗi, có báo User).
- [ ] Đã chọn đúng loại; output khớp khuôn trong `references/{loại}.md` (heading, thứ tự mục, nhãn).
- [ ] **Trình bày khớp "Quy tắc trình bày" + ví dụ mẫu của khuôn**: field bullet đã `**đậm tên** *(marker)*: spec`; bước có nhiều nhóm field đã **lồng** (nhóm = bullet L1, field = bullet L2 — KHÔNG để nhãn nhóm là paragraph ngang cấp "Bước N").
- [ ] **🔴 MỖI `**Bước N:**` LÀ ĐOẠN RIÊNG, cách nhau DÒNG TRỐNG — KHÔNG dính chung 1 dòng** (lỗi tái phát NHẤT). Sau khi đẩy FARE: `read_document` đọc lại, xác nhận từng Bước tách đoạn; dính → `edit_document` chèn dòng trống. Đúng kể cả khi gõ tay / đẩy MCP-only (đừng ỷ script).
- [ ] Tên file & thư mục đúng **Quy chuẩn đặt tên**; nhãn "- DONE" đã bỏ khỏi heading.
- [ ] Không còn `<table>` / `data-id` / `style` / marker `⟨INDENT⟩` / markup HTML rác.
- [ ] `<img>` → `![](fare://files/..)` giữ ref, KHÔNG chép alt AI; `<s>` giữ `~~..~~`.
- [ ] Mọi câu truy ngược 1:1 về bản gốc — không thêm, không bớt.
- [ ] **Field gộp từ nhiều sub-bullet nguồn → đủ mọi ý con** (đếm sub-bullet nguồn = số mệnh đề `;` trong dòng); KHÔNG rớt rule (vd điều kiện enable "chỉ chọn khi đã chọn …").
- [ ] Field nguồn để trống vẫn để trống (không tự điền).
- [ ] Tham chiếu chéo ở dạng `{số} {tên}` — không còn số mục trần vô nghĩa; số không tra được → giữ `{số}`, báo User (KHÔNG `⚠️` trong doc).
- [ ] **Thân doc SẠCH**: không còn `⚠️`/ghi chú của agent — chỉ nội dung + formatting nguồn (`<s>`→`~~..~~` được giữ). Markup biên tập (comment/highlight) + lỗi nội dung → **báo User ngoài luồng**, KHÔNG nhét vào doc, KHÔNG sửa thầm.
- [ ] **Giữ nguyên dòng provenance** ở đầu file — không xóa khi dọn form.
