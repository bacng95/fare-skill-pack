# Khuôn: doc_type = erd

Mô hình dữ liệu — thực thể (entity) + trường (field) + quan hệ (relation). Dùng cho thiết kế DB của một chức năng hoặc toàn hệ thống.
`create_document(doc_type="erd", content=<JSON dưới>)` — `content_format` FARE tự set `json`. KHÔNG truyền `purpose`.

> Schema lấy từ mô tả tool `create_document` (nguồn canonical) — nếu FARE đổi, tra lại ở đó.

## Schema
```json
{
  "mode": "sql",
  "entities": [
    {
      "id": "ent-user",
      "name": "users",
      "description": "Tài khoản người dùng",
      "color": "#4F46E5",
      "position": { "x": 40, "y": 40 },
      "fields": [
        { "id": "fld-user-id", "name": "id", "type": "BIGINT", "isPK": true, "nullable": false, "unique": true },
        { "id": "fld-user-email", "name": "email", "type": "VARCHAR(255)", "isPK": false, "nullable": false, "unique": true, "indexed": true },
        { "id": "fld-user-org", "name": "org_id", "type": "BIGINT", "isFK": true, "nullable": false, "description": "FK → organizations.id" }
      ]
    },
    {
      "id": "ent-org",
      "name": "organizations",
      "position": { "x": 400, "y": 40 },
      "fields": [
        { "id": "fld-org-id", "name": "id", "type": "BIGINT", "isPK": true, "nullable": false }
      ]
    }
  ],
  "relations": [
    {
      "id": "rel-user-org",
      "source": "ent-user", "target": "ent-org",
      "sourceField": "fld-user-org", "targetField": "fld-org-id",
      "type": "N:M", "style": "solid", "label": "thuộc về"
    }
  ]
}
```

## Quy tắc
- **`mode`** enum: `sql | nosql`. SQL → field có `type` kiểu cột (`BIGINT`, `VARCHAR(255)`, `TEXT`, `BOOLEAN`, `TIMESTAMP`...); NoSQL → kiểu document/field tương ứng.
- **`entities[].id` & `fields[].id`** — định danh nội bộ ổn định (vd `ent-user`, `fld-user-email`). **Quan hệ trỏ bằng các id này**, KHÔNG bằng tên — sai id = đường nối vỡ.
- **Field flags** (boolean, chỉ thêm khi đúng): `isPK`, `isFK`, `nullable`, `required`, `unique`, `indexed`. `defaultValue`, `description` optional. (FARE tự bù đủ cờ mặc định khi lưu — không cần liệt kê hết cờ `false`.)
- **`position: {x, y}`** — BẮT BUỘC đặt cho mỗi entity, **giãn toạ độ** (vd cách nhau ~300px ngang, ~250px dọc; xếp lưới theo cụm liên quan). BỎ TRỐNG → FARE mặc định `{0,0}` cho TẤT CẢ → mọi entity nằm đè tại gốc canvas, User phải kéo tách thủ công. Đây là điểm hay bỏ sót khi đẩy qua MCP.
- **`relations[]`** — `source`/`target` trỏ `entities.id`; `sourceField`/`targetField` trỏ `fields.id`. **`type`** enum quan hệ: `1:1 | 1:N | N:M`. `style`: `solid | dashed`. `label` optional.
- **FK nhất quán:** field `isFK:true` nên có quan hệ tương ứng trong `relations[]` (và ngược lại) — đừng để FK mồ côi.
- **Tên bảng/cột** theo đúng quy ước nguồn (snake_case hay camelCase) — KHÔNG tự đổi.
- **Trung thực §7:** chỉ mô hình entity/field/quan hệ có trong nguồn (schema thật, migration, spec, mô tả User). KHÔNG bịa bảng, không tự thêm cột "cho đầy đủ", không suy ra quan hệ nguồn không nêu → hỏi User.
- **Vị trí:** ERD của một chức năng → gắn `plan_item_id` story; model dữ liệu cấp hệ thống → `scope="project"`.
- Doc mặc định `draft` (create KHÔNG nhận `status`). KHÔNG `approved`.

## ERD (dữ liệu, doc_type=erd) ≠ Sơ đồ ERD (hình vẽ, doc_type=diagram)
`erd` lưu **mô hình dữ liệu có cấu trúc** (FARE tự render được). Nếu User muốn một **hình vẽ** ERD tùy biến để nhúng → đó là `doc_type="diagram"` (drawio), khác doc. Đừng nhầm hai loại.

## Sửa sau khi tạo
Structured KHÔNG có block op — sửa bằng `edit_document(ops=[{op:"replace_all", content:<FULL JSON mới>}])`. Đọc `read_document` lấy JSON hiện tại trước, sửa, gửi lại TRỌN bộ.
