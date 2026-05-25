# Khuôn: doc_type = richtext + purpose ∈ {srs, brd, prd, requirement}

Đặc tả yêu cầu dạng văn — loại tài liệu BA viết NHIỀU NHẤT. FARE tách 4 mức audience khác nhau, KHÔNG dùng chung một khuôn.

`create_document(doc_type="richtext", purpose=<chọn dưới>, content=<Markdown>)` — `content_format` FARE tự set `tiptap`.

> Mẹo: với `purpose ∈ {srs, brd, prd}` FARE có **template hệ thống**. Tạo doc với `content` bỏ trống → FARE tự inject khuôn chuẩn (ISO 29148 / BABOK v3 / Cagan). Sau đó dùng `patch_document` điền nội dung từng block. Tránh việc tự gõ lại template.

## Chọn purpose — KHÔNG dùng chung

| purpose | Audience chính | Khi nào | Có template hệ thống? |
|---|---|---|---|
| `brd` | Sponsor / stakeholder kinh doanh | Business need ở cấp khởi tạo dự án — "vấn đề gì, vì sao làm, đo bằng KPI nào" (theo IIBA BABOK v3) | ✅ Có |
| `srs` | Engineering team | Yêu cầu phần mềm chi tiết, testable, gồm NFR theo ISO 25010 (theo ISO/IEC/IEEE 29148:2018) | ✅ Có |
| `prd` | Product / Eng / Design / GTM | Yêu cầu sản phẩm theo style Cagan/SVPG — outcome + metric + scope MoSCoW | ✅ Có |
| `requirement` | Mọi vai | **Fallback** khi chưa rõ là BRD/SRS/PRD, hoặc yêu cầu nhẹ. Khi nội dung trưởng thành → đổi `purpose` cho đúng audience | ❌ Không |
| `analysis` | BA / kiến trúc | Nghiên cứu / so sánh phương án (CHƯA phải decision) — khác `adr` | ❌ Không |
| `meeting-notes` | Mọi vai | Biên bản họp khách hàng / nội bộ — attendees, agenda, decisions, action items | ❌ Không |

KHÔNG tự quyết — hỏi User chọn 1 trong các purpose ở trên (Socratic Gate §5).

## Quy trình ưu tiên (khi có template hệ thống)
1. `create_document(doc_type="richtext", purpose="<srs|brd|prd>")` — bỏ `content` để FARE inject template.
2. `read_document(id)` — đọc lại các block (dùng `mode="blocks"` để có ID ổn định).
3. `patch_document(id, ops=[...])` — điền từng block (replace text trong placeholder `<...>`).
4. Mục nào yêu cầu không có → **xóa hẳn block** đó. KHÔNG để lại "N/A" hay placeholder trống.

## Khi không có template (`requirement` / `analysis` / `meeting-notes`)

Phải tự cung cấp `content` Markdown. Khuôn rút gọn tham khảo dưới đây — chỉ giữ mục có nội dung.

### `purpose=requirement` — Yêu cầu chung (fallback)
```markdown
# {Tên tính năng / module}

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
- [{tên doc}](fare://documents/{id}) — vai trò

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
- **Tham chiếu UC/US chi tiết** ở mục Phụ thuộc dạng `[{tên} {id mục}](fare://documents/{id})` — KHÔNG lặp lại nội dung UC/US trong requirement.
- **MoSCoW** enum cho ưu tiên: `Must | Should | Could | Won't`.
- **Mục không có nội dung** → BỎ HẲN heading. KHÔNG "N/A".
- **Vấn đề mở (Open Questions)** — bắt buộc nếu Socratic Gate còn chưa được trả lời. Đừng xóa khi chưa giải quyết.
- **`status`:** `draft` khi viết xong; `in_review` khi gửi soát (FARE enum `draft | in_review | approved | outdated | archived` — agent chỉ set `draft` / `in_review`, KHÔNG `approved`).
- Trung thực §7: yêu cầu nguồn không nêu → ⚠️ + hỏi User, KHÔNG bịa.
