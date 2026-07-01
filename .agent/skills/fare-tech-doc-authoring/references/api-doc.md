# Khuôn: doc_type = api_doc

Đặc tả hợp đồng REST API — nhóm endpoint, từng endpoint kèm method/path/params/body/response.
`create_document(doc_type="api_doc", content=<JSON dưới>)` — `content_format` FARE tự set `json`. KHÔNG truyền `purpose`.

> Schema lấy từ mô tả tool `create_document` (nguồn canonical) — nếu FARE đổi, tra lại ở đó.

## Schema
```json
{
  "groups": [
    {
      "uid": "grp-xxx",
      "name": "Quản lý nhân viên",
      "description": "Các endpoint CRUD nhân viên",
      "endpoints": [
        {
          "uid": "ep-xxx",
          "method": "POST",
          "path": "/api/v1/employees",
          "name": "Thêm mới nhân viên",
          "description": "Tạo một bản ghi nhân viên mới",
          "headers": [{ "key": "Authorization", "value": "Bearer {token}" }],
          "query_params": [{ "key": "lang", "type": "string", "required": false }],
          "body_type": "json",
          "body_content": "{ \"full_name\": \"string\", \"email\": \"string\" }",
          "responses": [
            { "status": 201, "description": "Tạo thành công", "body": "{ \"id\": 1 }" },
            { "status": 422, "description": "Dữ liệu không hợp lệ", "body": "{ \"errors\": [] }" }
          ]
        }
      ]
    }
  ]
}
```

## Quy tắc
- **`method`** enum: `GET | POST | PUT | PATCH | DELETE`. Đúng động từ HTTP theo nghiệp vụ (đọc → GET, tạo → POST, thay toàn phần → PUT, vá một phần → PATCH, xóa → DELETE).
- **`path`** — đường dẫn thật, có version + tham số path (`/api/v1/employees/{id}`). KHÔNG để path giả định nếu nguồn chưa nêu → hỏi User (§7).
- **`body_type`** enum: `json | form-data | raw | none`. `none` cho GET/DELETE không body. `body_content` là string mẫu (JSON để dạng string escape như ví dụ).
- **`query_params[].required`** — boolean. `type` ghi kiểu dữ liệu (`string` / `integer` / `boolean` / `date`...).
- **`responses[]`** — tối thiểu liệt kê mã thành công + các mã lỗi nghiệp vụ quan trọng (`422` validate, `401` auth, `404` not found). `status` là số.
- **`uid`** — bỏ trống thì FARE tự sinh; chỉ tự đặt khi cần tham chiếu chéo.
- **Gom nhóm theo tài nguyên / chức năng** (`groups[].name`), không trộn mọi endpoint vào một group.
- **Trung thực §7:** chỉ ghi endpoint / field / mã lỗi có trong nguồn (spec, code contract, OpenAPI nguồn, mô tả User). KHÔNG bịa endpoint, không tự "chuẩn hóa" path/field mà nguồn không nói.
- **Vị trí:** API của một chức năng → gắn `plan_item_id` story; API cấp hệ thống dùng chung → `scope="project"`.
- Doc mặc định `draft` (create KHÔNG nhận `status`). KHÔNG `approved`.

## Sửa sau khi tạo
Structured KHÔNG có block op — sửa bằng `edit_document(ops=[{op:"replace_all", content:<FULL JSON mới>}])`. Đọc `read_document` lấy JSON hiện tại trước, sửa, gửi lại TRỌN bộ.
