# fare_skill — Hướng dẫn sử dụng cho người mới

> Bạn vừa cài bộ skill này vào Antigravity và muốn dùng. File này trả lời: gồm những loại gì, dùng để làm gì, và **cách gọi** trong khung chat.

## 4 loại "linh kiện" trong workspace — chỉ cần phân biệt 2

| Loại | Bạn gọi trực tiếp được? | Tác dụng |
|---|---|---|
| **Workflow** (`/fare-*`) | ✅ Có — gõ trong chat | Slash-command "mỏng" — kích hoạt nhanh một việc đúng quy trình. *Bạn dùng cái này nhiều nhất.* |
| **Agent** (`fare-business-analyst`...) | ✅ Có — gọi theo tên / Antigravity tự dispatch | Vai chuyên trách (BA / technical-writer / spec-reviewer). Mỗi vai có persona + SOP riêng. |
| **Skill** (`fare-spec-authoring`...) | ❌ Không gọi trực tiếp | Bộ tri thức / quy trình *agent dùng đến trong quá trình làm việc*. Bạn không cần biết tên — agent tự nạp đúng skill. |
| **Rule** (`fare-rules.md`...) | ❌ Không gọi trực tiếp | Quy tắc always-on (an toàn, trung thực, xác nhận trước khi sửa). Tự áp dụng mọi lúc — bạn không cần nhắc. |

**Tóm tắt:** mở chat → gõ workflow `/fare-...` ← *đa số trường hợp*. Nếu chưa biết gõ gì, mô tả việc bằng lời thường — Antigravity sẽ chọn agent + skill thay bạn.

## Trước khi xem ví dụ — giải mã các tham số

Trong mọi workflow, các tham số trong `[...]` đều thuộc một trong các loại sau:

| Tham số | Là gì | Lấy ở đâu |
|---|---|---|
| `[project]` hoặc `[mã project]` | **Mã project** trên FARE — chuỗi viết hoa duy nhất do người tạo project đặt (vd `FARE`, `CRM`, `EDTECH`) | Xem trên giao diện FARE góc trên, hoặc gõ `list_projects` |
| `[id doc]` / `[id spec]` | **ID số của tài liệu** | URL doc trên FARE có dạng `fare://documents/245` → ID là `245`. Hoặc `list_documents` |
| `[id module]` / `[id function]` | **ID số của module/submodule/function** | `list_modules` hoặc resource `fare://projects/{project}/modules` |
| `[tên ...]` | **Chuỗi tự do** mô tả việc (vd "Quản lý nhân viên") | Bạn tự đặt — agent dùng để khoanh phạm vi |
| `"[mô tả ...]"` | Chuỗi dài có dấu cách → **bọc trong dấu ngoặc kép** | Bạn tự viết |
| `?` ở cuối tham số | **Tùy chọn** — có thể bỏ qua, agent sẽ hỏi nếu cần | — |

> Không nhớ mã/ID? Cứ gõ workflow với phần bạn biết, bỏ trống phần còn lại — agent sẽ hỏi lại hoặc tự `list_*` để tra.

## 3 cách dùng (chọn 1)

### Cách 1 — Gõ workflow trực tiếp (NHANH, đúng quy trình)
```
# Viết spec mới — "FARE" là mã project, phần sau là tên tính năng
/fare-ba FARE Quản lý nhân viên

# Soát phủ test — "FARE" là mã project, "100" là ID module muốn soát, "forward" là hướng
/fare-trace FARE 100 forward

# Sửa spec theo yêu cầu khách — "FARE" là mã project, "245" là ID tài liệu spec cần sửa
/fare-change FARE 245 "khách yêu cầu bỏ trường 'số CMND', thay bằng 'CCCD'"
```
✔ Khi bạn đã biết việc rơi vào loại nào (xem bảng định tuyến bên dưới).
✔ Đảm bảo agent chạy đúng SOP — ít hỏi lan man.
💡 Thiếu mã/ID nào → cứ gõ phần bạn biết, agent sẽ hỏi phần còn lại.

### Cách 2 — Mô tả việc bằng lời thường (DỄ cho người mới)
```
"Giúp tôi viết use case cho chức năng đăng nhập của project FARE"
"Tài liệu spec id 245 mới bị khách đổi yêu cầu, sửa giúp tôi"
"Xem chức năng 'Thêm nhân viên' đã có test nào phủ chưa"
```
✔ Khi chưa rõ workflow nào hợp. Agent BA sẽ tự nhận diện việc → mời bạn xác nhận → chạy đúng skill.
⚠ Có thể bị hỏi lại 1–2 câu để định danh việc.

### Cách 3 — Gọi đích danh agent (HIẾM khi cần)
```
"Dùng agent fare-spec-reviewer soi tài liệu id 200 giúp tôi"
```
✔ Chỉ cần khi muốn ép vai cụ thể (vd ép `fare-spec-reviewer` thay vì để BA tự ôm).

## Bảng định tuyến — "Bạn muốn X → gõ Y"

### Vai BA — phân tích & viết spec
| Bạn muốn… | Gõ workflow | Hoặc nói (Cách 2) |
|---|---|---|
| Viết Use Case / User Story cho 1 tính năng | `/fare-ba [project] [tên tính năng]` | "Viết use case cho ..." |
| Viết BRD / SRS / PRD cấp dự án | `/fare-ba [project] [tên doc]` | "Viết SRS cho module ..." |
| Thêm / sửa thuật ngữ trong glossary | `/fare-ba [project] glossary` | "Bổ sung term ... vào glossary" |
| Tách 1 file Word/PDF/Excel yêu cầu → nhiều doc FARE | `/fare-ba [project] [id doc nguồn]` | "Tách file này thành doc FARE" |
| Dọn lại form bản nháp local cho gọn | (gọi skill `fare-doc-normalize` qua lời) | "Làm sạch form file nháp ..." |
| Tạo / sửa cây Module → Submodule → Function | `/fare-plan [project]` | "Cần tạo module cho phạm vi ..." |
| Kiểm "yêu cầu nào chưa có test/task phủ" | `/fare-trace [project] [module?]` | "Soát phủ test cho module ..." |
| Khách / sếp đổi yêu cầu giữa chừng | `/fare-change [project] [id spec] "[đổi gì]"` | "Khách yêu cầu đổi ..." |

### Vai PM — chia task & track tiến độ
| Bạn muốn… | Gõ workflow | Hoặc nói (Cách 2) |
|---|---|---|
| Chia 1 function (đã có spec) thành nhiều task | `/fare-breakdown [project] [id function]` | "Chia task cho function ..." |
| Tạo month plan / sprint mới | `/fare-pm [project] tạo sprint tháng X` | "Mở sprint mới cho tháng 5" |
| Ước effort cho module / function | `/fare-pm [project] ước effort module ...` | "Ước effort cho module ..." |
| Status snapshot project (PM standup) | `/fare-pm [project]` | "Status sprint hiện tại" |
| Grooming backlog (cuối ngày / cuối sprint) | `/fare-groom [project]` | "Soát backlog dùm" |
| Triage bug (gán severity / assignee) | `/fare-groom [project] - bug-triage` | "Triage bug đang mở" |
| Tạo Epic / initiative cross-module mới | `/fare-epic [project] create` | "Tạo epic Mobile Redesign v2" |
| Bulk gán task cũ vào 1 epic | `/fare-epic [project] assign-tasks [id]` | "Gom 20 task này vào epic Payment v3" |
| Đóng epic khi 100% task DONE | `/fare-epic [project] close [id]` | "Đóng epic FCORE-5" |

### Vai QA — viết test & verify
| Bạn muốn… | Gõ workflow | Hoặc nói (Cách 2) |
|---|---|---|
| Viết test case cho 1 spec / function | `/fare-test [project] [id spec hoặc task TEST]` | "Viết TC cho user story ..." |
| Chạy verify 1 round TC | `/fare-verify [project] [scope] [env]` | "Verify TC trong doc test_case 245 trên staging" |
| Báo bug khi test fail | `/fare-verify` (inline) hoặc `/fare-qa [project] báo bug ...` | "Report bug login crash" |
| Soát coverage TC cho 1 module | `/fare-qa [project] soát coverage module ...` | "Module này TC đủ chưa" |

### Vai Dev — pickup, impact, handoff
| Bạn muốn… | Gõ workflow | Hoặc nói (Cách 2) |
|---|---|---|
| Hỏi "tôi nên làm task gì tiếp" / pickup task | `/fare-dev [project]` | "Pickup task tiếp theo dùm" |
| Impact analysis trước khi sửa 1 symbol | `/fare-impact [project] [tên symbol]` | "Sắp sửa validateUser, có ảnh hưởng gì?" |
| Code xong, handoff sang QA | `/fare-handoff [project] [id task]` | "Đẩy task FARE-87 sang VERIFYING" |
| Status các task IN_PROGRESS của tôi | `/fare-dev [project] status` | "Status task của tôi" |

> ⚠️ **Vai Dev KHÔNG tự code.** Agent đứng ngoài hỗ trợ chọn task, phân tích impact qua MCP, ghi evidence. Bạn tự sửa code trong IDE (rule §8). Đây là thiết kế có chủ ý — agent fare_skill không truy cập file ngoài workspace để giữ an toàn.

### Vai khác (kỹ thuật / soát)
| Bạn muốn… | Gõ workflow | Hoặc nói (Cách 2) |
|---|---|---|
| Viết API doc / ERD / diagram | `/fare-write-doc [project]` | "Viết API doc cho ..." |
| Soát 1 spec đã có (blind spot, edge case, đối chiếu Figma) | `/fare-audit-spec [project] [id doc]` | "Soi spec id ... giúp tôi" |

## Bạn cần biết khi tương tác

### Agent sẽ DỪNG để hỏi bạn — đừng bất ngờ
Mỗi việc thay đổi dữ liệu, agent đều phải xác nhận với bạn (rule `fare-rules.md` §2). Cụ thể agent sẽ dừng & chờ khi:
- Trước khi `create_document` / `patch_document` / `update_document` lên FARE.
- Trước khi `add_module` / di chuyển doc.
- Khi yêu cầu thiếu thông tin (Socratic Gate §5 — hỏi ≥2 câu về edge case / vai / ngưỡng).
- Khi cần chốt vị trí folder/module để đẩy doc.

**Bạn cần làm:** trả lời ngắn — "ok", "đúng rồi", "tạo đi", hoặc cung cấp thông tin agent xin.

### Đầy đủ 4 vai chính — và những việc agent KHÔNG làm
Bộ skill nay có **BA · PM · QA · Dev** + 2 vai phụ trợ (technical-writer, spec-reviewer). Tuy vậy có những việc agent **không bao giờ tự làm**, bạn cần biết để không trông đợi:

| Việc | Vì sao agent không làm | Ai làm |
|---|---|---|
| **Sửa file code thực tế** | Rule §8 — agent fare_skill không truy cập file ngoài workspace | Bạn tự code trong IDE; vai Dev hỗ trợ impact + sync metadata |
| **Tạo / quản campaign QA mới** | Không có MCP tool, chỉ list / verify TC trong campaign đã có | Bạn tự bấm trên FARE UI |
| **Publish DRAFT plan version → PUBLIC** | Rule §7 — publish là quyết định người thật | Bạn tự bấm trên FARE UI |
| **Set status `approved` / `archived` cho doc** | Rule §7 — duyệt là việc của con người | Bạn duyệt trên FARE UI |
| **Tạo project mới** | Không có MCP tool, project tạo qua UI | Bạn tạo trên FARE UI |
| **Đóng task → DONE khi chỉ vừa code xong** | Rule §6 — DONE cần evidence verify (TC pass hoặc User confirm) | QA verify hoặc User chốt qua PM `/fare-groom` |
| **Tạo BUG task tự động khi phát hiện lỗi** | Rule §5 — bug discovery cần xác nhận User | Agent báo + hỏi → bạn ok → agent tạo |

### Chế độ vận hành — agent hỏi đầu phiên (1 lần)
Mặc định là **Substitute** (agent đỡ vai BA cho dev — chủ động đề xuất nhiều). Nếu bạn LÀ chuyên gia BA thật, nói "tôi là BA, chạy chế độ Assistant" → agent chuyển sang trợ lý (soạn nháp, không thay bạn quyết). Chi tiết: `rules/operating-mode.md`.

### Agent KHÔNG bao giờ:
- Tự set `status="approved"` cho tài liệu — duyệt là việc của bạn (rule §7).
- Truy cập source code / database / file `.env` của FARE — chỉ qua MCP (rule §8).
- Sửa tài liệu gốc khi đang ở vai *reviewer* — chỉ comment / suggest.

## Lần đầu chạy thử — gợi ý 3 phút

1. Mở project bạn quan tâm trên FARE, ghi nhớ **mã project** (chuỗi viết hoa ở góc trên, vd `FARE`, `CRM`).
2. Trong chat Antigravity, gõ (thay `FARE` bằng mã project của bạn):
   ```
   /fare-ba FARE Đăng nhập bằng mật khẩu
   ```
   Trong đó: `FARE` = mã project · `Đăng nhập bằng mật khẩu` = tên tính năng bạn muốn viết spec cho.
3. Agent sẽ:
   - Đọc ngữ cảnh project (cây module, tài liệu liên quan).
   - Hỏi bạn 2 câu để làm rõ yêu cầu (vd "ai là actor chính?", "có hỗ trợ quên mật khẩu không?").
   - Đề xuất loại doc (Use Case / User Story / SRS...) + vị trí đẩy lên FARE.
   - **CHỜ bạn chốt** rồi mới tạo.
4. Sau khi tạo xong, agent trả URI dạng `fare://documents/123` — `123` là ID doc vừa tạo, mở trên FARE để xem.

## Đọc thêm
- `ARCHITECTURE.md` — danh bạ đầy đủ: agent / skill / workflow / rule + sơ đồ luồng.
- `rules/fare-rules.md` — 9 quy tắc bất khả xâm phạm (đọc để biết agent sẽ & sẽ không làm gì).
- `rules/operating-mode.md` — 2 chế độ Substitute / Assistant.
