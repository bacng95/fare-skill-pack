---
name: fare-doc-split
description: Tách một tài liệu nguyên khối thành nhiều tài liệu FARE — xử lý từng phần, nháp local trước khi đẩy, trung thực với nguồn.
---

# fare-doc-split — Tách tài liệu FARE

Dùng khi có một tài liệu nguồn nguyên khối (nhiều mục đánh số 1.1, 1.2…) cần tách thành nhiều tài liệu FARE.

## Tiền đề
- Đã có **Bản đồ ngữ cảnh** (folder / module hiện có, ERD, tài liệu anh em). Nếu đã chạy `fare-context-discovery` ở bước trước trong phiên → dùng lại, KHÔNG chạy lại.
- Tuân `rules/fare-rules.md` — đặc biệt §7 Content Fidelity, §2 Confirmation Gate, §8, §9.

## ⚠️ Nguyên tắc tối cao: TRUNG THỰC (§7)
Tách / chuẩn hóa = **tái cấu trúc, KHÔNG sáng tác**:
- Không thêm / đổi / suy luận yêu cầu mà nguồn không viết.
- Lỗi nguồn (typo, HTML gãy, mâu thuẫn) → ghi `⚠️` + báo User; KHÔNG sửa thầm, KHÔNG "phát hiện lỗi" không có thật.
- Không set `status=approved`.

Mỗi câu trong doc tách phải truy ngược được về nguồn.

## Phạm vi: CHỈ tách tài liệu
Không tạo Module / Submodule / Function mới, không sắp xếp lại cây plan. Thấy plan nên đổi → báo User như một đề xuất RIÊNG.

## Bước 0 — Chốt với User
Hỏi gọn và CHỜ trả lời:
- **Phiên bản nguồn:** bản đã duyệt (`fare://documents/{id}`) hay draft hiện tại? Đọc TƯƠI từ FARE, không dùng file scratch của phiên cũ (`fare-rules §8`).
- **Độ mịn:** mỗi heading một doc, hay gộp nhóm?
KHÔNG hỏi quy ước đặt tên — đã CỐ ĐỊNH (xem **Quy chuẩn đặt tên** bên dưới). KHÔNG hỏi vị trí trên FARE lúc này — việc đẩy lên FARE diễn ra ở Bước 4.

## Quy chuẩn đặt tên (CỐ ĐỊNH — không hỏi, không tự chế)
- **Thư mục:** `docs/outputs/{slug}/` — `{slug}` = slug tiêu đề doc nguồn: bỏ số thứ tự đầu, lowercase, bỏ dấu tiếng Việt, mọi khoảng trắng / ký tự lạ → `-`. Vd "1. Quản lý nhân viên" → `quan-ly-nhan-vien`.
- **Tên file:** `{số mục}-{slug tên mục}.md`. Vd "1.1 Thêm mới nhân viên" → `1.1-them-moi-nhan-vien.md`. lowercase, không dấu, không khoảng trắng, dùng `-`.
- KHÔNG hậu tố trạng thái (`_done`, `_final`…) — trạng thái nằm trên FARE, không ở tên file.
- KHÔNG tạo file `combined` / `merged` / `full_doc` — đọc nguồn trực tiếp từ FARE từng phần.

## Bước 1 — Lập danh sách section (checklist chống sót)
Đọc lướt nguồn, liệt kê **toàn bộ heading** (1.1 … 1.N). Giữ danh sách này làm checklist để cuối cùng đối chiếu — không sót section nào.

## Bước 2 — Xử lý TỪNG PHẦN → ghi nháp LOCAL
KHÔNG đọc rồi giữ cả tài liệu trong đầu — tài liệu người dùng thường rất lớn, gom hết sẽ tràn ngữ cảnh và mất mạch (kể cả model mạnh).

Lặp cho tới hết:
1. Đọc **một phần** nguồn (1–2 section) **trực tiếp từ FARE** — `read_document(id, version=N)`, ghim đúng `version` đã chốt ở Bước 0. KHÔNG clone cả doc nguồn về local.
2. Tách phần đó ra — chép **trung thực** nội dung của section. CHƯA làm form đẹp ở bước này: bảng HTML của nguồn cứ giữ nguyên. Làm sạch form là việc riêng — skill `fare-doc-normalize`, User chạy sau.
3. **Ghi ra file nháp `.md` local** — đường dẫn & tên đúng **Quy chuẩn đặt tên** (ở trên). Mỗi file MỞ ĐẦU bằng dòng provenance: `> Nguồn: fare://documents/{id} · version {N} · tách {ngày}` (`fare-rules §8`).
4. **Tham chiếu chéo** ("1.16", "2.15"…): KHÔNG để số trần. Viết thành `{số} {tên đầy đủ của mục}` (vd `2.15 Thêm mới trường ĐH/Cao đẳng của trợ giảng`). Tên lấy từ: cùng doc → danh sách heading (Bước 1); khác doc → tra tiêu đề doc đích (`list_documents`). Không tra được tên → giữ số + `⚠️ chưa phân giải`, KHÔNG đoán. Link `fare://...` thật sẽ thêm ở Bước 4.
5. Tổng kết ngắn tiến độ ("đã xong 1.1–1.4 / 1.20") rồi đọc phần kế.

Phần dùng chung (vai trò, quy tắc validate SĐT / email / ngày, danh mục drop-down) → tách thành 1 file riêng.

## Bước 3 — Báo cáo & DỪNG chờ duyệt
Xong toàn bộ nháp local → báo User gọn: số file, đường dẫn `docs/outputs/...`, và sổ `⚠️` lỗi nguồn / điểm suy luận (nếu có).

Nháp lúc này còn **form thô** (bảng HTML từ nguồn) — bình thường, KHÔNG phải lỗi. Trước khi đẩy FARE, User nên chạy skill `fare-doc-normalize` để làm sạch form.

**DỪNG.** Chờ User review nháp local. TUYỆT ĐỐI không tự đẩy lên FARE.

## Bước 4 — Sync lên FARE (chỉ khi User ra lệnh đẩy)
Chỉ làm khi User đã duyệt nháp VÀ ra lệnh đẩy.

1. **Xem cấu trúc FARE hiện có.** Đọc resource `fare://projects/{code}/knowledge-tree` — trả cây đầy đủ: `custom_documents` (các folder kèm `id`/`parent_id`/`documents`), `project_documents`, `module_documents` (cây module). FARE KHÔNG có tool riêng liệt kê folder — cấu trúc nằm trong resource này.
2. **Đặt theo cách project ĐÃ tổ chức tài liệu tương tự — KHÔNG mặc định.** Soi cây: một bộ tách trước đó (vd các mục "2.x") đang nằm đâu, gom theo kiểu gì → làm theo đúng kiểu đó. Tài liệu FARE có thể ở folder Custom / Project / gắn Module — chọn theo cấu trúc sẵn có; KHÔNG mặc định folder của tài liệu nguồn, cũng KHÔNG mặc định Module.
3. **Đề xuất + CHỜ User chốt** (`fare-rules §2`): trình bày cấu trúc liên quan (rút gọn) + đề xuất vị trí cho cả bộ doc (kể cả tạo folder Custom mới nếu mô phỏng bộ tách trước) + lý do. KHÔNG `create_document` khi User chưa chốt. KHÔNG tự tạo Module / Function (xem Phạm vi).
4. **Tạo.** `create_document` từng file, `status="draft"`, đặt đúng vị trí đã chốt — cơ chế `folder_id` / `module_id` / `path`: xem `fare-mcp-integration`.
5. **Nối link.** Sau khi mọi doc có ID, nâng tham chiếu `{số} {tên}` → `[{số} {tên}](fare://documents/{id})`. Ref không có doc đích trên FARE → giữ `{số} {tên}` + `⚠️`.

## Tool ghi
`create_document` · `patch_document` (richtext) · `update_document` (structured JSON). Không `delete_document` / ghi đè khi chưa có lệnh trực tiếp.

## Tự kiểm
- [ ] Số doc tách khớp đủ danh sách heading Bước 1 — không sót section.
- [ ] Mọi nội dung truy ngược được về nguồn — không tự chế, không "lỗi" tưởng tượng.
- [ ] Suy luận / lỗi nguồn đều có `⚠️` và đã báo User.
- [ ] Đã nháp local + chờ User duyệt TRƯỚC khi đẩy FARE.
- [ ] Vị trí đẩy lên FARE: đã đọc `knowledge-tree`, đặt theo cách project tổ chức tài liệu tương tự + User chốt — KHÔNG mặc định folder nguồn, cũng không mặc định Module.
- [ ] Không doc nào set `approved`; không tự tạo module / folder.
