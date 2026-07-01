# Khuôn: doc_type = richtext + purpose ∈ {srs, brd, prd, requirement}

Đặc tả yêu cầu dạng văn — loại tài liệu BA viết NHIỀU NHẤT. FARE tách 4 mức audience khác nhau, KHÔNG dùng chung một khuôn.

`create_document(doc_type="richtext", purpose=<chọn dưới>, content=<Markdown>)` — `content_format` FARE tự set `tiptap`.

> ## ⚠️ SRS theo chức năng (case hay gặp NHẤT) → viết content trực tiếp, ĐỪNG để trống
>
> Đặc tả SRS cho **một chức năng/màn hình cụ thể** (gắn `plan_item_id` cấp story) — team viết theo **format use-case** (Tổng quan / Luồng chính / Hậu điều kiện / Quy tắc nghiệp vụ). Khuôn đầy đủ: **`../../fare-doc-normalize/references/use-case-spec.md`** (cùng khuôn normalize dùng — viết mới & làm sạch ra cùng một dạng). Với case này:
> - **TỰ viết `content` Markdown** theo khuôn use-case-spec + **truyền `title` có nghĩa** ("SRS - {Tên chức năng}"). KHÔNG để `content` trống.
> - **TUYỆT ĐỐI KHÔNG** dùng template hệ thống cho case này: template `srs` là khung ISO 29148 cấp hệ thống (generic, NFR ISO 25010…) — KHÁC format use-case của team, và **ghi đè `title` thành "SRS"** (lấy H1 template) → doc trùng tên, không định vị được trên UI (rule §4).
>
> Mẫu use-case rút gọn (chi tiết + quy tắc trình bày: xem `use-case-spec.md`):
> ```markdown
> # {số} {Tên chức năng}
>
> ## Tổng quan
> - **Mô tả:** … · **Tác nhân:** … · **Tiền điều kiện:** …
>
> ## Luồng chính
> **Bước 1:** …
>
> **Bước 2:** …   ← mỗi "Bước N" là MỘT đoạn, cách nhau dòng trống
>
> ## Hậu điều kiện
> …
>
> ## Quy tắc nghiệp vụ
> - …
> ```

> Mẹo (chỉ cho SRS/BRD/PRD **cấp hệ thống/dự án**, KHÔNG cho SRS-theo-chức-năng ở trên): FARE có **template hệ thống** (ISO 29148 / BABOK v3 / Cagan). Tạo doc với `content` bỏ trống → FARE inject khuôn chuẩn, rồi `edit_document` điền từng block. **Lưu ý:** template ghi đè `title` thành tên mặc định ("SRS"/"BRD"/"PRD") — sau khi tạo phải `update_document(title=...)` đặt lại tên có nghĩa, kẻo không định vị được trên UI (rule §4).

## Chọn purpose — KHÔNG dùng chung

| purpose | Audience chính | Khi nào | Có template hệ thống? |
|---|---|---|---|
| `brd` | Sponsor / stakeholder kinh doanh | Business need ở cấp khởi tạo dự án — "vấn đề gì, vì sao làm, đo bằng KPI nào" (theo IIBA BABOK v3) | ✅ Có |
| `srs` | Engineering team | **Theo chức năng** (gắn story) → format use-case, tự viết content (xem ô ⚠️ trên). **Cấp hệ thống** → khung ISO 29148, NFR ISO 25010 | ✅ Có (chỉ cấp hệ thống) |
| `prd` | Product / Eng / Design / GTM | Yêu cầu sản phẩm theo style Cagan/SVPG — outcome + metric + scope MoSCoW | ✅ Có |
| `requirement` | Mọi vai | **Fallback** khi chưa rõ là BRD/SRS/PRD, hoặc yêu cầu nhẹ. Khi nội dung trưởng thành → đổi `purpose` cho đúng audience | ❌ Không |
| `analysis` | BA / kiến trúc | Nghiên cứu / so sánh phương án (CHƯA phải decision) — khác `adr` | ❌ Không |
| `meeting-notes` | Mọi vai | Biên bản họp khách hàng / nội bộ — attendees, agenda, decisions, action items | ❌ Không |

KHÔNG tự quyết — hỏi User chọn 1 trong các purpose ở trên (Socratic Gate §5).

## Quy trình ưu tiên — template hệ thống (CHỈ cho BRD/PRD, hoặc SRS cấp hệ thống)
> KHÔNG dùng cho SRS-theo-chức-năng — case đó viết content use-case trực tiếp (ô ⚠️ ở đầu file).
1. `create_document(doc_type="richtext", purpose="<srs|brd|prd>")` — bỏ `content` để FARE inject template.
2. `update_document(id, title="...")` — **đặt lại title** (template đã ghi đè thành "SRS"/"BRD"/"PRD"; tên mặc định = không định vị được trên UI, rule §4).
3. `read_document(id, mode="blocks")` — đọc lại các block (có ID ổn định).
4. `edit_document(id, ops=[...])` — điền từng block (replace text trong placeholder `<...>`).
5. Mục nào yêu cầu không có → **xóa hẳn block** đó. KHÔNG để lại "N/A" hay placeholder trống.

## Khi không có template (`requirement` / `analysis` / `meeting-notes`)

Phải tự cung cấp `content` Markdown. Khuôn rút gọn tham khảo dưới đây — chỉ giữ mục có nội dung.

### `purpose=requirement` — Yêu cầu chung (fallback)
```markdown
# {Tên tính năng / phân hệ}

## 1. Mục tiêu nghiệp vụ
Vấn đề kinh doanh đang giải quyết + kết quả kỳ vọng (đo được).

## 2. Phạm vi
- **Bao gồm:** ...
- **Không bao gồm:** ...

## 3. Vai trò liên quan
| Vai | Mô tả ngắn |
|---|---|
| ... | ... |

## 4. Yêu cầu chức năng
| ID | Yêu cầu (testable) | Ưu tiên (MoSCoW) | Nguồn |
|---|---|---|---|
| FR-001 | Hệ thống PHẢI {hành động} để {kết quả} | Must | {stakeholder/doc nguồn} |

## 5. Quy tắc nghiệp vụ
| ID | Rule | Tham chiếu FR |
|---|---|---|
| BR-001 | {phát biểu rule kiểm chứng được} | FR-001 |

## 6. Yêu cầu phi chức năng
- **Hiệu năng:** {ngưỡng đo}
- **Bảo mật:** {phân quyền / audit / dữ liệu nhạy cảm}
- **Khả dụng:** {uptime / RTO / RPO}

## 7. Phụ thuộc & Tài liệu liên quan
- {tên doc}, vai trò → **chip HTML đầy đủ**: `<a class="fare-mention" data-type="mention" data-id="{id}" data-doc-type="richtext" href="/docs/{id}">{tên doc}</a>`. *(Đây là THÂN tài liệu → URI trần `fare://documents/{id}` KHÔNG tự thành chip, chỉ là text thuần; phải đủ `data-type="mention"` kẻo bị nhân đôi; xem `fare-mcp-integration`. KHÔNG markdown link.)*

## 8. Vấn đề mở
- ⚠️ {câu hỏi chờ stakeholder trả lời}
```

### `purpose=analysis` — Nghiên cứu / trade-off
```markdown
# Phân tích: {chủ đề}

## 1. Bối cảnh & mục tiêu
Vì sao phân tích, ra quyết định gì.

## 2. Phương án đang xét
| Phương án | Tóm tắt | Ưu | Nhược | Chi phí | Rủi ro |
|---|---|---|---|---|---|
| A | ... | ... | ... | ... | ... |

## 3. Tiêu chí so sánh
- {tiêu chí 1 — trọng số}
- {tiêu chí 2 — trọng số}

## 4. Khuyến nghị (nếu có)
Nêu phương án đề xuất + lý do. ⚠️ Đây CHƯA phải decision — quyết định chính thức → tạo `adr` riêng.

## 5. Vấn đề mở
- ⚠️ ...
```

### `purpose=meeting-notes` — Biên bản họp
```markdown
# Họp: {chủ đề} — {yyyy-mm-dd}

**Tham dự:** {danh sách}
**Vắng:** {nếu có}

## Agenda
1. ...
2. ...

## Decisions
| # | Quyết định | Người chốt | Hệ quả |
|---|---|---|---|
| 1 | ... | ... | ... |

## Action items
| # | Việc | Owner | Hạn |
|---|---|---|---|
| 1 | ... | ... | yyyy-mm-dd |

## Open questions
- ⚠️ {chưa chốt}
```

## Quy tắc chung (mọi purpose)

- **Định danh:** FR-`NNN`, BR-`NNN`, NFR-`NNN`. KHÔNG đánh số lại khi thêm — chèn nối tiếp.
- **Testable:** mỗi FR phải kiểm chứng được. "Hệ thống lưu mã NV duy nhất trong phạm vi 1 trường" ✅; "Hệ thống nhanh" ❌.
- **Tham chiếu UC/US chi tiết** ở mục Phụ thuộc bằng **chip mention** (`fare://documents/{id}` → chip, xem `fare-mcp-integration`) — KHÔNG markdown link, KHÔNG lặp lại nội dung UC/US trong requirement.
- **MoSCoW** enum cho ưu tiên: `Must | Should | Could | Won't`.
- **Mục không có nội dung** → BỎ HẲN heading. KHÔNG "N/A".
- **Vấn đề mở (Open Questions)** — bắt buộc nếu Socratic Gate còn chưa được trả lời. Đừng xóa khi chưa giải quyết.
- **`status`:** doc mới **mặc định `draft`** (`create_document` KHÔNG nhận param `status`). Gửi soát → `update_document(status="in_review")`. Enum agent set được qua `update_document` chỉ `draft | in_review`; `approved` / `archived` là việc của con người (UI), agent KHÔNG set.
- Trung thực §7: yêu cầu nguồn không nêu → ⚠️ + hỏi User, KHÔNG bịa.
