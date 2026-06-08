---
name: fare-srs
description: Chuẩn hóa một tài liệu yêu cầu nguyên khối thành một VÙNG SRS hoàn chỉnh trên FARE — điều phối tách + format + wire index + sơ đồ use-case + nối link, đồng nhất với các vùng SRS đã có. Dùng khi User muốn "chuẩn hóa tài liệu X thành SRS".
---

# /fare-srs — Dựng/chuẩn hóa một vùng SRS (orchestrator)

**Việc:** biến một tài liệu nguồn nguyên khối (nhiều mục N.1, N.2…) thành một **vùng yêu cầu chức năng hoàn chỉnh TRONG bộ SRS** trên FARE — không chỉ tách từng doc mà **ráp lại thành chỉnh thể**: đặt đúng cấu trúc, mục lục, sơ đồ use-case, liên kết chéo.
**Cú pháp:** `/fare-srs [mã project] [id tài liệu nguồn]`
**Đầu vào người dùng:** $ARGUMENTS
**Agent phụ trách:** `fare-business-analyst`.
**Khác `/fare-ba`:** `/fare-ba` lo tách/viết spec (per-doc). `/fare-srs` thêm lớp **điều phối end-to-end + tie-together** (mục lục, diagram, link chéo, verify) — phần mà skill lẻ không tự làm.

## Nguyên tắc
- **CHỈ thao tác trong project được chỉ định.** Không đọc/ghi sang project khác dù nội dung có vẻ liên quan.
- **🔴 ĐÚNG 1 tài liệu nguồn / lần chạy.** Chuẩn hóa xong vùng đó → **DỪNG + báo cáo, CHỜ User**. **TUYỆT ĐỐI không tự nhảy sang vùng/tài liệu nguồn khác** khi User chưa yêu cầu — kể cả khi thấy còn nhiều vùng chưa tách. "Đồng ý" của User cho **kế hoạch vùng này** ≠ cho phép làm tiếp vùng sau.
- **Tạo folder mới / di chuyển doc đã tồn tại = action RIÊNG, phải User duyệt (§2)** — KHÔNG tự restructure "cho gọn".
- Mọi action ghi FARE đi qua **Confirmation Gate** (`rules/fare-rules.md §2`): đề xuất → CHỜ User chốt.
- Workflow này **KHÔNG lặp lại chi tiết skill** — nó **xâu chuỗi** skill + chèn các bước ráp lại.

## Luồng điều phối
1. **Khám phá ngữ cảnh** (`fare-context-discovery`): chưa biết project của doc nguồn? → `read_document(id)` trả **`projectCode`** (document id là GLOBAL) → dùng nó để định + **giới hạn phạm vi đúng project đó**. Đồng thời xem `pagination.total_pages` / `size_note` để biết **cỡ nguồn** — LỚN (≥6 trang / có `size_note`) → đi flow file-checkpoint (Bước 3), KHÔNG đọc hết vào context. Rồi đọc `fare://projects/{code}/knowledge-tree` → xác định (a) doc nguồn, (b) **gốc SRS** + các **vùng anh em ĐÃ chuẩn hóa** (dùng làm MẪU để đồng nhất — soi cách đặt folder, khung spec, cách link), (c) shared-ref sẵn có (Glossary, ERD), (d) cây module.
2. **Lập doc-set + CHỐT** (`§2`): đọc HẾT nguồn → liệt kê mục sẽ tách + đề xuất **vị trí** (folder dưới gốc SRS, mô phỏng vùng anh em). Nêu **điểm bất thường nguồn** (nhảy số mục, text gạch `<s>`, cross-ref lạ, thiếu Mã UC…) để User quyết TRƯỚC khi tạo. CHỜ User chốt.
3. **Tách + chuẩn hóa từng mục** (`fare-doc-split` + `fare-doc-normalize`): mỗi mục → 1 spec `richtext` theo khuôn (`references/use-case-spec.md`: Mã UC, field đậm, nhóm field lồng, **mỗi Bước là đoạn riêng cách dòng trống**). **Trung thực 100%**; markup biên tập / lỗi nguồn → **sổ phát hiện báo ngoài luồng, KHÔNG nhét ⚠️ vào thân**.
   - **🔴 Nguồn LỚN / TRÀN CONTEXT:** dùng **file local làm bộ nhớ ngoài** — hút nguồn xuống file → script → **tách thành file/section trong `docs/outputs/`** → **xử TỪNG file** (mỗi lúc chỉ 1 section trong context; file = checkpoint resume khi tràn/đổi phiên). **KHÔNG cố tiêu hóa cả tài liệu trong context** (tràn → nén phiên → giao 2 phiên mất mạch → lẫn/bịa). Chia mẻ ~3–5 file/lần, chốt từng mẻ; mỗi spec **đối chiếu 1:1 ĐÚNG section nguồn**; **giữ khuôn, KHÔNG drift template**. Chi tiết: `fare-doc-split`.
   - **🔴 ĐẨY = bản ĐÃ NORMALIZE, KHÔNG đẩy raw:** content `create_document` PHẢI là markdown sạch theo khuôn (Việt hóa nhãn, **bỏ `<table>` nguồn**, Bước tách dòng, field đậm, Mã UC). **Cấm `create_document` bản split thô** (còn `<table>` / nhãn "Overview/Basic Flow" / bullet `*`·`+` literal / Bước dính). `fare-doc-split` giữ raw là cho chế độ standalone; trong orchestrator → **normalize TRƯỚC, create SAU** (lỗi đã gặp: đẩy thẳng raw → doc là bảng HTML nguồn).
4. **Verify sau đẩy (BẮT BUỘC):** `read_document` đọc lại từng doc — (a) **KHÔNG còn dấu hiệu RAW** (`<table>` nguồn / nhãn "Overview/Basic Flow" / bullet `*`·`+` literal) = chưa normalize → làm lại doc đó; (b) mỗi `**Bước N:**` là đoạn riêng (KHÔNG dính 1 dòng); (c) chip link hiện **1 cái** (không nhân đôi). Sai → `patch_document` sửa.
5. **Wire index:** thêm vùng vừa làm vào **mục lục của spine SRS** (chip folder mention) — để vùng "gia nhập" bộ SRS, không lạc lõng. Chưa có mục lục → tạo.
6. **Đề xuất sơ đồ use-case — CỔNG BẮT BUỘC** (`§5`): bộ có Mã UC mà **CHƯA hỏi User về sơ đồ thì CHƯA được coi là xong** (đừng âm thầm bỏ qua). Hỏi: "vẽ sơ đồ use-case tổng hợp cho bộ này không?". Đồng ý → tạo 1 doc `doc_type="diagram"` (drawio: `shape=umlActor` actor · `ellipse` use-case trong boundary · edge `association` + nét đứt «include»/«extend»), đặt cùng folder, nối Mã UC ↔ diagram bằng chip mention. Từ chối → ghi nhận, bỏ qua. (KHÔNG dùng `use_case` doc_type — đã bỏ.)
7. **Nối cross-link** (`fare-mcp-integration`): ref tới doc ĐÃ tồn → **chip mention** (`<a class="fare-mention" data-type="mention" data-id data-doc-type>…</a>`); ref tới vùng CHƯA tách → giữ `{số} {tên}` + ghi sổ, nối ngược khi vùng đó xong.
8. **Báo cáo + DỪNG:** liệt kê doc đã tạo (id/vị trí), sổ phát hiện, index/diagram/link đã làm. User muốn mốc → ghi version/ngày. **Kết thúc tại đây — KHÔNG tự khởi động vùng kế tiếp.**

## Bàn giao (chỉ GỢI Ý cho User — KHÔNG tự làm)
- `/fare-audit-spec` — soát blind-spot bộ spec (6 lăng kính).
- `/fare-trace` — ma trận truy vết (FR ↔ UC/US ↔ TC).
- Còn vùng khác chưa tách → **đề xuất** User chạy lại `/fare-srs` cho **từng vùng một** (xong → chốt → vùng sau); nối link ngược khi đủ. TUYỆT ĐỐI không tự chạy tiếp khi chưa được yêu cầu.
