# Khuôn: doc_type = use_case

Đặc tả use_case trên FARE — actor, use case, luồng xử lý, quan hệ.
`create_document(doc_type="use_case", content=<JSON dưới>)` — `content_format` FARE tự set `json`.

> Schema lấy từ mô tả tool `create_document` của FARE (nguồn canonical) — nếu FARE đổi, tra lại ở đó.

## Schema
```json
{
  "actors": [
    { "uid": "act-xxx", "name": "...", "type": "primary|secondary|system", "description": "..." }
  ],
  "use_cases": [
    {
      "uid": "uc-xxx", "name": "...", "description": "...",
      "preconditions": "...", "postconditions": "...",
      "priority": "low|medium|high|critical", "complexity": "low|medium|high",
      "flows": [
        { "uid": "flow-xxx", "flow_type": "main|alternative|exception", "step_number": 1, "description": "..." }
      ]
    }
  ],
  "connections": [
    { "uid": "conn-xxx",
      "source_type": "actor|use_case", "source_uid": "act-xxx",
      "target_type": "actor|use_case", "target_uid": "uc-xxx",
      "connection_type": "association|include|extend|generalization" }
  ]
}
```

## Quy tắc
- `uid` — bỏ trống thì FARE tự sinh; nếu tự đặt thì phải duy nhất để `flows` / `connections` tham chiếu đúng.
- `flow_type`: `main` = luồng chính; `alternative` = nhánh thay thế vẫn thành công; `exception` = lỗi / thất bại. `step_number` của nhánh alt/exception gắn nó vào bước tương ứng của luồng chính.
- `connections`: actor ↔ use_case dùng `association`; use_case ↔ use_case dùng `include` / `extend` / `generalization`.
- enum (`type`, `priority`, `complexity`, `flow_type`, `connection_type`) — đúng y một trong các giá trị cho phép.
- Chỉ điền field từ thông tin User cung cấp. `preconditions` / `postconditions` / `complexity`… nguồn không nêu → để trống hoặc hỏi, KHÔNG bịa.
