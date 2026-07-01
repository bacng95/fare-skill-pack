# Khuôn: doc_type = diagram (drawio mxGraph)

Sơ đồ trực quan — use-case, sequence, luồng (flowchart), kiến trúc/component. FARE lưu dưới dạng **drawio mxGraph XML**, render bằng editor drawio nhúng.

`create_document(doc_type="diagram", content=<mxGraphModel XML>)` — `content_format` mặc định `drawio` (bỏ qua được). KHÔNG truyền `purpose`.

> ⛔ **KHÔNG gửi Mermaid / PlantUML string.** FARE không parse các cú pháp đó — chỉ nhận mxGraph XML. Gửi Mermaid = doc rỗng / hỏng.

## Quy trình 2 bước (BẮT BUỘC)
1. **Tạo container** — `create_document(doc_type="diagram", content=<XML tối thiểu hoặc đầy đủ>)`. Chấp nhận:
   - tối thiểu: `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>`
   - hoặc đầy đủ bọc `<mxfile><diagram><mxGraphModel>…</mxGraphModel></diagram></mxfile>`.
2. **Vẽ nội dung qua `edit_diagram`** (per-cell, lossless, live) — KHÔNG resend XML qua `update_document` / `edit_document`. Có thể tạo container đầy đủ ngay ở bước 1 nếu sơ đồ nhỏ; sơ đồ lớn → tạo khung rồi `edit_diagram` thêm từng cell.

## Khung mxGraphModel
```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- node (vertex): có <mxGeometry ... as="geometry"/> -->
    <mxCell id="n1" value="Nhãn" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="120" height="40" as="geometry"/>
    </mxCell>
    <!-- edge: có source + target trỏ id node -->
    <mxCell id="e1" value="" style="endArrow=block;html=1;" edge="1" parent="1" source="n1" target="n2">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>
```

## Quy tắc chung
- **`id` duy nhất** mọi cell; node/edge đều `parent="1"` (cell `0`/`1` là layer mặc định, GIỮ nguyên).
- **Vertex** (`vertex="1"`) phải có `<mxGeometry x y width height as="geometry"/>`. **Edge** (`edge="1"`) phải có `source` + `target` trỏ đúng `id` node đã có; geometry `relative="1"`.
- **Bố cục:** đặt `x/y` giãn cách để không chồng (node ~120×40, cách nhau ≥ 60px). Không cần hoàn hảo — drawio cho User kéo lại.
- **Trung thực §7:** chỉ vẽ actor / bước / thành phần / quan hệ có trong nguồn. KHÔNG bịa node cho "đẹp sơ đồ".
- Doc mặc định `draft` (create KHÔNG nhận `status`). KHÔNG `approved`. Gắn `plan_item_id` story (hoặc `scope` phù hợp), báo User tiêu đề + breadcrumb (rule §4).

## Công thức theo loại sơ đồ

### Use-case (actor + use-case + boundary)
- **Actor:** `style="shape=umlActor;html=1;"` (node hẹp cao ~30×60).
- **Use-case:** `style="ellipse;whiteSpace=wrap;html=1;"` — mỗi UC một ellipse.
- **Boundary** (khung hệ thống bao các UC): `style="rounded=0;html=1;verticalAlign=top;"` node lớn, các UC đặt bên trong.
- **Quan hệ:** actor→UC = association `style="endArrow=none;html=1;"`. Giữa UC: `«include»` / `«extend»` = nét đứt `style="endArrow=open;dashed=1;html=1;"`, `value="«include»"`.
- Gắn Mã UC (UC-XXX-0N) vào `value` để nối chip mention với spec.

### Sequence (tuần tự)
- **Lifeline:** `style="shape=umlLifeline;html=1;"` mỗi actor/đối tượng một cột dọc.
- **Message:** edge ngang giữa 2 lifeline — đồng bộ `endArrow=block`; trả về `dashed=1;endArrow=open`. `value` = tên message theo thứ tự thời gian (trên → dưới).

### Flowchart (luồng xử lý)
- **Bắt đầu/Kết thúc:** `style="ellipse;..."`. **Bước:** `rounded=1;...`. **Điều kiện:** `style="rhombus;..."` (nhánh `value="Có"/"Không"` trên edge).
- Edge `endArrow=block` theo chiều luồng.

### Kiến trúc / Component
- **Thành phần:** `rounded=1` hoặc `shape=component`. **Nhóm/layer:** node container `verticalAlign=top`. **Phụ thuộc:** edge có hướng + `value` mô tả (giao thức/loại gọi).

## Sửa sau khi tạo
**`edit_diagram`** — thêm/sửa/xóa từng cell (lossless, giữ vị trí User đã kéo). TUYỆT ĐỐI KHÔNG `update_document` / `edit_document` cho diagram (ghi đè cả XML, mất layout).
