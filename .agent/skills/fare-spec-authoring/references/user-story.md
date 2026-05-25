# Khuôn: doc_type = user_story

Đặc tả user_story trên FARE — câu chuyện người dùng + tiêu chí nghiệm thu.
`create_document(doc_type="user_story", content=<JSON dưới>)` — `content_format` FARE tự set `json`.

> Schema lấy từ mô tả tool `create_document` của FARE (nguồn canonical) — nếu FARE đổi, tra lại ở đó.

## Schema
```json
{
  "stories": [
    {
      "uid": "us-xxx", "title": "...",
      "as_a": "...", "i_want": "...", "so_that": "...",
      "priority": "low|medium|high|critical", "story_points": 5, "notes": "...",
      "acceptance_criteria": [
        { "uid": "ac-xxx", "given_clause": "...", "when_clause": "...", "then_clause": "..." }
      ]
    }
  ]
}
```

## Quy tắc
- `as_a` / `i_want` / `so_that` — ba mệnh đề: vai trò / mong muốn / giá trị nhận được.
- `acceptance_criteria` — mỗi tiêu chí một bộ Given-When-Then: `given_clause` (bối cảnh), `when_clause` (hành động), `then_clause` (kết quả kỳ vọng — phải **kiểm chứng được**).
- `story_points` — số; chỉ điền khi User / đội đã ước lượng. KHÔNG tự gán.
- `priority` enum: `low|medium|high|critical`. `notes` — optional.
- `uid` — bỏ trống thì FARE tự sinh.
- Chỉ viết AC truy được về yêu cầu; KHÔNG tự chế tiêu chí nghiệm thu nguồn không nêu.
