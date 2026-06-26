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
- Lỗi nguồn (typo, HTML gãy, mâu thuẫn) → ghi vào **sổ phát hiện** (báo User ở Bước 3), KHÔNG sửa thầm, KHÔNG "phát hiện lỗi" không có thật.
- Không set `status=approved`.

**Thân nháp giữ SẠCH — KHÔNG nhét `⚠️`/ghi chú của agent vào nội dung.** Comment/highlight/cross-ref-chưa-phân-giải/lỗi-nguồn là metadata, không phải nội dung; nhét vào thân = tự thêm chữ không có ở nguồn, và nháp sẽ bị đẩy lên FARE mang theo `⚠️` → sai bản chất tài liệu (đây đúng là lỗi đã xảy ra). Mọi cờ/ghi chú nằm ở **sổ phát hiện** ngoài luồng (báo User ở Bước 3). Thân chỉ chứa nội dung + formatting CỦA nguồn (vd `<s>` giữ nguyên).

Mỗi câu trong doc tách phải truy ngược được về nguồn.

## Phạm vi: CHỈ tách tài liệu
Không tạo theme / epic / story mới, không sắp xếp lại cây plan. Thấy plan nên đổi → báo User như một đề xuất RIÊNG.

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
**Phát hiện cỡ nguồn TRƯỚC TIÊN:** `read_document(id)` (page 1) → xem `pagination`: không có pagination / `total_pages` nhỏ = nguồn nhỏ; **`total_pages` ≥ 6, hoặc `has_more=true`, hoặc có `size_note` = nguồn LỚN → chuyển NGAY sang flow file-checkpoint** (Bước 2, box "Nguồn RẤT LỚN") — đọc-hết + liệt-kê-heading làm QUA FILE, KHÔNG nuốt cả tài liệu vào context.

Nguồn nhỏ: đọc **HẾT** các trang (lặp `read_document(page=N)` tới `has_more=false`), liệt kê **toàn bộ heading** (1.1 … 1.N hoặc 3.1 … 3.N). Giữ danh sách này làm checklist để cuối cùng đối chiếu — không sót, không lẫn section nào. Ghi cả nhãn thủ công nếu có (vd "3.1 Thêm mới lớp - DONE") để biết section nào người soạn đánh dấu xong.

## Bước 2 — Xử lý TỪNG PHẦN → ghi nháp LOCAL
KHÔNG đọc rồi giữ cả tài liệu trong đầu — tài liệu người dùng thường rất lớn, gom hết sẽ tràn ngữ cảnh và mất mạch (kể cả model mạnh).

### 🔴 Nguồn RẤT LỚN (hàng chục mục / hàng chục trang) → DÙNG FILE LOCAL LÀM BỘ NHỚ NGOÀI
Nguồn lớn (vd 49 trang) **tràn context** → runtime nén phiên rồi làm tiếp → **giao giữa 2 phiên = mất mạch → lẫn field giữa các section / bịa / drift template** (đã gặp ở doc 7). **TUYỆT ĐỐI không cố "tiêu hóa" cả tài liệu trong context.** Dùng đĩa làm bộ nhớ ngoài + checkpoint, xử TỪNG file:

1. **Hút nguồn xuống file** (không giữ trong đầu): đọc `read_document(page=N)` tuần tự, **mỗi trang ghi nối NGAY vào 1 file local** rồi sang trang kế — KHÔNG gom tất cả trang trong context.
2. **Chạy script** `fare-doc-normalize/scripts/html_to_md.py` trên file đó — transform off-context (không tốn context của agent).
3. **Tách thành file nhỏ:** mỗi section → 1 file `.md` trong `docs/outputs/{slug}/` (theo **Quy chuẩn đặt tên**). Đây là **checkpoint BỀN**: tràn context / đổi phiên vẫn resume được từ file, không dựa trí nhớ đã nén.
4. **Chuẩn hóa + đẩy TỪNG FILE:** đọc **1 file** → hoàn thiện theo khuôn (section boundary, cross-ref, Mã UC) → đẩy → sang file kế. Mỗi lúc chỉ giữ **1 section** trong context.

Kèm:
- **Chốt từng mẻ** (~3–5 file/lần) với User.
- **Mỗi spec đối chiếu 1:1 với ĐÚNG file/section nguồn của nó:** field/bước phải đến từ chính section đó — KHÔNG lẫn section lân cận. Đếm field nguồn = field spec.

### ⚠️ `read_document` phân trang theo KÝ TỰ, KHÔNG theo section
Đây là bẫy lớn nhất khi tách. `read_document(id, page=N)` (mode markdown) chia tài liệu thành trang ~vài KB **theo số ký tự** — cắt NGANG bất kỳ đâu: giữa một `<table>`, giữa một `<ul>`, giữa một section. Thực tế quan sát: 1 section đặc tả thường trải **1–2 trang**, và **một trang chứa phần cuối section này + phần đầu section kế**. KHÔNG bao giờ giả định "1 page = 1 section".

**Hệ quả nếu làm sai:** đọc page 1, tưởng đó là trọn section 3.1 rồi tách luôn → MẤT phần cuối 3.1 (nằm page 2) HOẶC nuốt nhầm đầu 3.2. Đây là vi phạm §7 (mất nội dung) — lỗi nặng nhất khi tách.

### Vòng lặp đúng: đọc tuần tự + GHÉP theo ranh giới heading
1. Đọc **tuần tự từng page** `read_document(id, page=N, version=V)` — ghim `version` đã chốt ở Bước 0. Đọc tiếp `page=N+1` khi `pagination.has_more=true`.
2. Giữ một **buffer nối**: ghép text các page lại. Ranh giới section = dòng heading section (`### **3.1 …**`, `### **3.2 …**`…). Một section CHỈ được coi là "đọc đủ" khi đã thấy **heading section KẾ TIẾP** (hoặc `has_more=false` = hết doc).
3. Khi đã có trọn 1 section trong buffer → tách section đó ra (Bước 2a–2d dưới). Phần text còn dư sau heading kế tiếp (= đầu section sau) GIỮ trong buffer cho vòng sau, KHÔNG vứt.
4. Lặp tới khi hết doc + buffer rỗng. Cuối cùng đối chiếu số section tách được với checklist Bước 1 — phải khớp đủ, không sót, không lẫn.

> Tài liệu rất lớn (vài chục section): có thể dùng `mode="blocks"` (phân trang theo token, trả block tree có ID ổn định) nếu cần ghim block để `edit_document` sau. Mặc định markdown + ghép như trên là đủ để tách.

### Với mỗi section đã đọc đủ:
- **2a. Chép trung thực** nội dung section. CHƯA làm form đẹp: bảng HTML của nguồn cứ giữ nguyên. Làm sạch form là việc riêng — skill `fare-doc-normalize`, User chạy sau.
- **2b. Ghi ra file nháp `.md` local** — đường dẫn & tên đúng **Quy chuẩn đặt tên**. Mỗi file MỞ ĐẦU bằng dòng provenance: `> Nguồn: fare://documents/{id} · version {N} · tách {ngày}` (`fare-rules §8`).
- **2c. Nhãn trạng thái thủ công trong heading** ("- DONE", "– WIP", gạch ngang heading): là chú thích người soạn, KHÁC `status` hệ thống (xem `fare-context-discovery`). Tên FILE bỏ nhãn (`3.1-them-moi-lop.md`, KHÔNG `..._done`). Trong NỘI DUNG: giữ nguyên nhãn (trung thực) — normalize sẽ quyết bỏ/giữ, không phải split.
- **2d. Tham chiếu chéo** mọi dạng: số trần "1.16", "(Mục 2.8)", "tại 13.4", "Mục 4.5". KHÔNG để số trần / số trong ngoặc đứng một mình. Viết thành `{số} {tên đầy đủ của mục}` (vd `(Mục 2.8 Thêm mới phòng học tại trường)`). Tên lấy từ: cùng doc → checklist heading (Bước 1); khác doc → tra tiêu đề doc đích (`list_documents`). Không tra được tên, hoặc số lạ/nghi typo (vd "13.4" trong doc chỉ có mục 3.x) → giữ `{số}` như nguồn trong thân + ghi **sổ phát hiện** (KHÔNG nhét `⚠️ chưa phân giải` vào thân), KHÔNG đoán. Link `fare://...` thật thêm ở Bước 4.
- **2e. Tổng kết ngắn** tiến độ ("đã xong 3.1–3.3 / 3.7") rồi đọc phần kế.

Phần dùng chung (vai trò, quy tắc validate SĐT / email / ngày, danh mục drop-down) → tách thành 1 file riêng.

### 2f. Giữ RAW, ghi SỔ phát hiện ngoài luồng — không sửa thầm (§7)
Split chỉ chép trung thực; làm sạch form (table, indent, ảnh, markup) là việc `fare-doc-normalize`. Vì vậy ở split: **giữ nguyên xi** HTML/`<img>`/`<s>`/`<mark>`/marker `⟨INDENT⟩` trong thân, KHÔNG xử lý. Các điểm sau **chỉ ghi vào sổ phát hiện** (báo User ở Bước 3), **KHÔNG nhét vào thân nháp**:
- **Lỗi nguồn:** typo, copy-paste sai (Title ≠ heading, description/Post-condition dán nhầm mục khác, "trợ giảng" lẫn trong doc "lớp"), số mục lạ. KHÔNG tự sửa.
- **Markup ngữ nghĩa (≠ form):** `<s>` = nội dung đã bỏ (vd "Khối <s>(Bắt buộc)</s>") — giữ trong thân; `comment-highlight` = điểm chưa chốt; `<mark>` cụm = điểm cần xác nhận. Ghi VỊ TRÍ vào sổ để normalize/User xử đúng — KHÔNG tự coi như còn/hết hiệu lực.

Ảnh nhúng: ghi nhận có ảnh (`<img fare://files/..>`); KHÔNG chép `alt`/`imageSummaries` (caption AI, nhiều noise) làm nội dung.

## Bước 3 — Báo cáo & DỪNG chờ duyệt
Xong toàn bộ nháp local → báo User gọn: số file, đường dẫn `docs/outputs/...`, và **sổ phát hiện** (lỗi nguồn / cross-ref chưa phân giải / markup biên tập / điểm suy luận) — sổ này nằm trong báo cáo, KHÔNG trong thân nháp.

Nháp lúc này còn **form thô** (bảng HTML từ nguồn) — bình thường, KHÔNG phải lỗi. Trước khi đẩy FARE, **PHẢI** chạy `fare-doc-normalize` để làm sạch form (Việt hóa nhãn, bỏ `<table>` nguồn, Bước tách dòng, field đậm, Mã UC).

> **🔴 RAW KHÔNG được lên FARE.** Mô hình 2 pha "split raw → normalize" ở trên là cho chế độ **standalone** (nháp local → User review → normalize). Khi **đẩy thẳng lên FARE** (vd trong `/fare-srs`): **normalize TRƯỚC, `create_document` SAU** — TUYỆT ĐỐI không đẩy bản raw (còn `<table>` nguồn / nhãn "Overview/Basic Flow" / bullet `*`·`+` literal / Bước dính chùm). Đã gặp: đẩy thẳng bản split thô → doc trên FARE là bảng HTML nguồn nguyên xi.

**DỪNG.** Chờ User review nháp local. TUYỆT ĐỐI không tự đẩy lên FARE.

## Bước 4 — Sync lên FARE (chỉ khi User ra lệnh đẩy)
Chỉ làm khi User đã duyệt nháp VÀ ra lệnh đẩy.

1. **Xem cấu trúc FARE hiện có.** Đọc resource `fare://projects/{code}/knowledge-tree` — trả cây đầy đủ: `custom_documents` (các folder kèm `id`/`parent_id`/`documents`), `project_documents`, `module_documents` (doc gắn plan item). FARE KHÔNG có tool riêng liệt kê folder — cấu trúc nằm trong resource này.
2. **Đặt theo cách project ĐÃ tổ chức tài liệu tương tự — KHÔNG mặc định.** Soi cây: một bộ tách trước đó (vd các mục "2.x") đang nằm đâu, gom theo kiểu gì → làm theo đúng kiểu đó. Tài liệu FARE có thể ở folder Custom / Project / gắn Module — chọn theo cấu trúc sẵn có; KHÔNG mặc định folder của tài liệu nguồn, cũng KHÔNG mặc định Module.
3. **Đề xuất + CHỜ User chốt** (`fare-rules §2`): trình bày cấu trúc liên quan (rút gọn) + đề xuất vị trí cho cả bộ doc (kể cả tạo folder Custom mới nếu mô phỏng bộ tách trước) + lý do. KHÔNG `create_document` khi User chưa chốt. KHÔNG tự tạo Module / Function (xem Phạm vi).
4. **Tạo.** `create_document` từng file, `status="draft"`, đặt đúng vị trí đã chốt — cơ chế `folder_id` / `plan_item_id` / `path`: xem `fare-mcp-integration`.
5. **Nối link** = **chip mention**, KHÔNG dùng markdown link. Sau khi mọi doc có ID, nâng `{số} {tên}` →
   ```html
   <a class="fare-mention" data-type="mention" data-id="{id}" data-doc-type="richtext" href="/docs/{id}">{số} {tên}</a>
   ```
   FARE nhận diện chip qua `class="fare-mention"` + `data-type="mention"` + `data-id`; `href` được render-lại theo project nên **bấm được** (SPA-navigate). ⚠️ Phải đủ `data-type="mention"` — thiếu nó backend **nhân đôi chip** (chèn thêm 1 chip resolve). ⚠️ Markdown `[{số} {tên}](fare://documents/{id})` **KHÔNG** thành link bấm được (thiếu `class="fare-mention"` → frontend bỏ qua) — đừng dùng. Doc đích là folder → `data-doc-type="folder"`, `href="/docs?folder={id}"`. Ref không có doc đích → giữ `{số} {tên}` + ghi **sổ phát hiện** (không `⚠️` trong thân).
6. **Verify sau đẩy (BẮT BUỘC).** `read_document` đọc lại từng doc vừa tạo, xác nhận: **mỗi `**Bước N:**` là MỘT đoạn riêng** (KHÔNG dính chung 1 dòng — lỗi hay tái phát khi đẩy MCP-only, không qua script); chip link hiện **1 cái** (không nhân đôi). Sai → `edit_document` sửa ngay.
7. **Đề xuất sơ đồ use-case (nếu bộ spec có Mã UC).** Sau khi đẩy xong cả bộ, nếu các spec đã gắn Mã UC (UC-XXX-01..0N) → **CHỦ ĐỘNG hỏi User** (`§5`): "Vẽ sơ đồ use-case tổng hợp cho bộ này không?" — KHÔNG tự tạo khi chưa chốt. User đồng ý → tạo 1 doc `doc_type="diagram"` (drawio mxGraph: `shape=umlActor` cho actor · `ellipse` cho từng use-case trong 1 boundary · edge `association` actor→UC, nét đứt «include»/«extend» giữa UC), đặt cùng folder, rồi nối Mã UC ↔ diagram bằng chip mention. (FARE đã bỏ doc_type `use_case` — sơ đồ dùng `diagram`.)

## Tool ghi
`create_document` · `edit_document` (richtext) · `update_document` (structured JSON). Không `delete_document` / ghi đè khi chưa có lệnh trực tiếp.

## Tự kiểm
- [ ] Đã đọc HẾT các trang (`has_more=false`); ghép phần bị pagination cắt ngang — KHÔNG coi 1 page = 1 section.
- [ ] Mỗi section chỉ "đóng" khi đã thấy heading section kế tiếp (hoặc hết doc) — không sót đuôi, không lẫn đầu section sau.
- [ ] Số doc tách khớp đủ danh sách heading Bước 1 — không sót, không lẫn.
- [ ] Mọi nội dung truy ngược được về nguồn — không tự chế, không "lỗi" tưởng tượng.
- [ ] **Mỗi spec khớp 1:1 ĐÚNG section nguồn** (field/bước KHÔNG lẫn từ section khác) — kiểm kỹ khi nguồn lớn; output **đúng khuôn nhãn chuẩn**, không drift template tự chế.
- [ ] Nguồn lớn (hàng chục mục) → đã **chia mẻ + chốt từng mẻ** với User, không nuốt một mạch.
- [ ] **(Đẩy thẳng FARE) content đã NORMALIZE, KHÔNG raw**: không còn `<table>` nguồn / nhãn English (Overview/Basic Flow) / bullet `*`·`+` literal; đã Việt hóa nhãn + Mã UC + field đậm.
- [ ] **Sau đẩy, đọc lại trên FARE**: mỗi `**Bước N:**` là đoạn riêng (cách dòng trống), KHÔNG dính 1 dòng; chip link hiện 1 cái (không nhân đôi).
- [ ] Bộ spec có Mã UC → đã **đề xuất vẽ sơ đồ use-case** (`diagram` drawio) cho User (không tự tạo khi chưa chốt).
- [ ] **Thân nháp SẠCH** — không `⚠️`/ghi chú agent; chỉ nội dung + formatting nguồn (`<s>` giữ nguyên = nội dung đã bỏ).
- [ ] Tên file bỏ nhãn "- DONE"; nội dung heading giữ nhãn (normalize quyết sau).
- [ ] Cross-ref mọi dạng (số trần / "(Mục X.Y)" / số lạ) → `{số} {tên}`; không phân giải được → giữ `{số}` + ghi **sổ phát hiện** (KHÔNG `⚠️` trong thân).
- [ ] Suy luận / lỗi nguồn / điểm mở / markup biên tập đều nằm trong **sổ phát hiện** ngoài luồng và đã báo User — KHÔNG trong thân nháp.
- [ ] Đã nháp local + chờ User duyệt TRƯỚC khi đẩy FARE.
- [ ] Vị trí đẩy lên FARE: đã đọc `knowledge-tree`, đặt theo cách project tổ chức tài liệu tương tự + User chốt — KHÔNG mặc định folder nguồn, cũng không mặc định Module.
- [ ] Không doc nào set `approved`; không tự tạo module / folder.
