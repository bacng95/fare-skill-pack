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
Đọc lướt **HẾT** các trang nguồn (lặp `read_document(page=N)` tới `has_more=false`), liệt kê **toàn bộ heading** (1.1 … 1.N hoặc 3.1 … 3.N). Giữ danh sách này làm checklist để cuối cùng đối chiếu — không sót, không lẫn section nào. Ghi cả nhãn thủ công nếu có (vd "3.1 Thêm mới lớp - DONE") để biết section nào người soạn đánh dấu xong.

## Bước 2 — Xử lý TỪNG PHẦN → ghi nháp LOCAL
KHÔNG đọc rồi giữ cả tài liệu trong đầu — tài liệu người dùng thường rất lớn, gom hết sẽ tràn ngữ cảnh và mất mạch (kể cả model mạnh).

### ⚠️ `read_document` phân trang theo KÝ TỰ, KHÔNG theo section
Đây là bẫy lớn nhất khi tách. `read_document(id, page=N)` (mode markdown) chia tài liệu thành trang ~vài KB **theo số ký tự** — cắt NGANG bất kỳ đâu: giữa một `<table>`, giữa một `<ul>`, giữa một section. Thực tế quan sát: 1 section đặc tả thường trải **1–2 trang**, và **một trang chứa phần cuối section này + phần đầu section kế**. KHÔNG bao giờ giả định "1 page = 1 section".

**Hệ quả nếu làm sai:** đọc page 1, tưởng đó là trọn section 3.1 rồi tách luôn → MẤT phần cuối 3.1 (nằm page 2) HOẶC nuốt nhầm đầu 3.2. Đây là vi phạm §7 (mất nội dung) — lỗi nặng nhất khi tách.

### Vòng lặp đúng: đọc tuần tự + GHÉP theo ranh giới heading
1. Đọc **tuần tự từng page** `read_document(id, page=N, version=V)` — ghim `version` đã chốt ở Bước 0. Đọc tiếp `page=N+1` khi `pagination.has_more=true`.
2. Giữ một **buffer nối**: ghép text các page lại. Ranh giới section = dòng heading section (`### **3.1 …**`, `### **3.2 …**`…). Một section CHỈ được coi là "đọc đủ" khi đã thấy **heading section KẾ TIẾP** (hoặc `has_more=false` = hết doc).
3. Khi đã có trọn 1 section trong buffer → tách section đó ra (Bước 2a–2d dưới). Phần text còn dư sau heading kế tiếp (= đầu section sau) GIỮ trong buffer cho vòng sau, KHÔNG vứt.
4. Lặp tới khi hết doc + buffer rỗng. Cuối cùng đối chiếu số section tách được với checklist Bước 1 — phải khớp đủ, không sót, không lẫn.

> Tài liệu rất lớn (vài chục section): có thể dùng `mode="blocks"` (phân trang theo token, trả block tree có ID ổn định) nếu cần ghim block để `patch_document` sau. Mặc định markdown + ghép như trên là đủ để tách.

### Với mỗi section đã đọc đủ:
- **2a. Chép trung thực** nội dung section. CHƯA làm form đẹp: bảng HTML của nguồn cứ giữ nguyên. Làm sạch form là việc riêng — skill `fare-doc-normalize`, User chạy sau.
- **2b. Ghi ra file nháp `.md` local** — đường dẫn & tên đúng **Quy chuẩn đặt tên**. Mỗi file MỞ ĐẦU bằng dòng provenance: `> Nguồn: fare://documents/{id} · version {N} · tách {ngày}` (`fare-rules §8`).
- **2c. Nhãn trạng thái thủ công trong heading** ("- DONE", "– WIP", gạch ngang heading): là chú thích người soạn, KHÁC `status` hệ thống (xem `fare-context-discovery`). Tên FILE bỏ nhãn (`3.1-them-moi-lop.md`, KHÔNG `..._done`). Trong NỘI DUNG: giữ nguyên nhãn (trung thực) — normalize sẽ quyết bỏ/giữ, không phải split.
- **2d. Tham chiếu chéo** mọi dạng: số trần "1.16", "(Mục 2.8)", "tại 13.4", "Mục 4.5". KHÔNG để số trần / số trong ngoặc đứng một mình. Viết thành `{số} {tên đầy đủ của mục}` (vd `(Mục 2.8 Thêm mới phòng học tại trường)`). Tên lấy từ: cùng doc → checklist heading (Bước 1); khác doc → tra tiêu đề doc đích (`list_documents`). Không tra được tên, hoặc số lạ/nghi typo (vd "13.4" trong doc chỉ có mục 3.x) → giữ số + `⚠️ chưa phân giải`, KHÔNG đoán. Link `fare://...` thật thêm ở Bước 4.
- **2e. Tổng kết ngắn** tiến độ ("đã xong 3.1–3.3 / 3.7") rồi đọc phần kế.

Phần dùng chung (vai trò, quy tắc validate SĐT / email / ngày, danh mục drop-down) → tách thành 1 file riêng.

### 2f. Giữ RAW, ghi sổ ⚠️ — không sửa thầm (§7)
Split chỉ chép trung thực; làm sạch form (table, indent, ảnh, markup) là việc `fare-doc-normalize`. Vì vậy ở split: **giữ nguyên xi** HTML/`<img>`/`<s>`/`<mark>`/marker `⟨INDENT⟩`, KHÔNG xử lý. Chỉ cần **ghi vào sổ ⚠️** (báo User ở Bước 3) hai loại:
- **Lỗi nguồn:** typo, copy-paste sai (Title ≠ heading, description/Post-condition dán nhầm mục khác, "trợ giảng" lẫn trong doc "lớp"), số mục lạ. KHÔNG tự sửa.
- **Markup ngữ nghĩa (≠ form):** `<s>` = nội dung đã bỏ (vd "Khối <s>(Bắt buộc)</s>"); `comment-highlight` = điểm chưa chốt; `<mark>` cụm = điểm cần xác nhận. Đánh dấu vị trí để normalize/User xử đúng — KHÔNG tự coi như còn/hết hiệu lực.

Ảnh nhúng: ghi nhận có ảnh (`<img fare://files/..>`); KHÔNG chép `alt`/`imageSummaries` (caption AI, nhiều noise) làm nội dung.

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
- [ ] Đã đọc HẾT các trang (`has_more=false`); ghép phần bị pagination cắt ngang — KHÔNG coi 1 page = 1 section.
- [ ] Mỗi section chỉ "đóng" khi đã thấy heading section kế tiếp (hoặc hết doc) — không sót đuôi, không lẫn đầu section sau.
- [ ] Số doc tách khớp đủ danh sách heading Bước 1 — không sót, không lẫn.
- [ ] Mọi nội dung truy ngược được về nguồn — không tự chế, không "lỗi" tưởng tượng.
- [ ] `<s>` giữ nguyên (nội dung đã bỏ), `<mark>` / comment-highlight đánh dấu ⚠️ điểm mở.
- [ ] Tên file bỏ nhãn "- DONE"; nội dung heading giữ nhãn (normalize quyết sau).
- [ ] Cross-ref mọi dạng (số trần / "(Mục X.Y)" / số lạ) → `{số} {tên}` hoặc `⚠️ chưa phân giải`.
- [ ] Suy luận / lỗi nguồn / điểm mở đều có `⚠️` trong sổ và đã báo User.
- [ ] Đã nháp local + chờ User duyệt TRƯỚC khi đẩy FARE.
- [ ] Vị trí đẩy lên FARE: đã đọc `knowledge-tree`, đặt theo cách project tổ chức tài liệu tương tự + User chốt — KHÔNG mặc định folder nguồn, cũng không mặc định Module.
- [ ] Không doc nào set `approved`; không tự tạo module / folder.
