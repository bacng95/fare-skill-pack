# Khuôn: doc_type = glossary

Sổ thuật ngữ domain — định nghĩa các từ vựng nghiệp vụ project dùng chung. Mỗi project nên CHỈ CÓ 1 glossary doc; FARE dùng nó để grounding khi RAG / AI trả câu hỏi "X là gì".

`create_document(doc_type="glossary", content=<JSON dưới>)` — `content_format` FARE tự set `json`.

> Schema lấy từ mô tả tool `create_document` (nguồn canonical) — nếu FARE đổi, tra lại ở đó.

## Schema
```json
{
  "terms": [
    {
      "uid": "gl-xxx",
      "term": "Campaign",
      "definition": "Đợt kiểm thử có timebox cho 1 release, gắn với mục tiêu QA cụ thể.",
      "tags": ["qa", "process"]
    }
  ]
}
```

## Quy tắc

- **Mỗi project 1 doc.** Trước khi `create_document` → `list_documents(query="glossary", kind="glossary")` kiểm tra. Đã có → `read_document` lấy JSON, bổ sung term mới, `update_document` gửi lại FULL JSON (KHÔNG patch — structured doc không có patch block).
- **`term`** — danh từ chính xác như nghiệp vụ dùng. Ưu tiên tiếng Việt; tiếng Anh chỉ giữ khi nguồn dùng đúng từ đó (vd "Campaign", "Backlog", "OKR").
- **`definition`** — 1 câu (≤ 25 từ) súc tích, theo nghĩa domain CỦA PROJECT NÀY, không phải nghĩa chung của từ điển. Có ví dụ ngắn càng tốt.
- **`tags`** — phân loại: `process | role | data | metric | technical`... Dùng nhất quán; tag mới → bàn với User trước khi thêm.
- **`uid`** — bỏ trống để FARE tự sinh. Chỉ tự đặt khi cần tài liệu khác `[[gl-xxx]]` tham chiếu.
- **Không trùng lặp:** trước khi thêm term mới, scan glossary hiện có (case-insensitive) — biến thể hoa/thường, có/không dấu coi như trùng.
- **Đồng nghĩa / từ viết tắt** — KHÔNG tạo entry riêng. Thêm vào `definition` dạng "Còn gọi: ...; viết tắt: ...".
- **Trung thực §7:** chỉ thêm term có trong nguồn (BRD / SRS / use case / user phỏng vấn). KHÔNG bịa thuật ngữ project chưa dùng đến.
- Cập nhật `status="draft"`. KHÔNG `approved`.

## Khi nào thêm term mới (heuristic)
- Soạn / soát một spec mới → quét danh từ chuyên biệt → đối chiếu glossary → term chưa có → đề xuất bổ sung.
- User dùng cụm gây mơ hồ giữa 2 phiên → hỏi rồi chốt vào glossary.
- Đổi tên trong code/UI mà nghiệp vụ không đổi → cập nhật `definition` với note "Còn gọi: <tên cũ>".
