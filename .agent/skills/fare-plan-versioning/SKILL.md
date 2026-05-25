---
name: fare-plan-versioning
description: Hiểu & vận hành mô hình Plan của FARE — master plan vs month plan, version DRAFT vs PUBLIC, cách tạo / cập nhật month plan cho 1 sprint mà KHÔNG động vào master. Agent CHỈ chuẩn bị DRAFT — quyết publish (PUBLIC) là việc của User.
---

# fare-plan-versioning — Plan & version trên FARE

Dùng khi: PM cần tạo / cập nhật month plan cho sprint mới, hoặc cần hiểu plan/version trước khi `create_tasks` (vì task có thể gắn `plan_month_id`).

## Mô hình Plan của FARE — đọc qua một lần để khỏi nhầm

```
Project (1)
├── Master Plan (1, auto-created với project, type="master", year-scope)
│   └── Version (n) — DRAFT / PUBLIC. Mỗi version là 1 snapshot cây Module→Submodule→Function.
└── Month Plan (n, PM tự tạo qua upsert_plan, type="month")
    └── Version (n) — seed từ master PUBLIC version mới nhất khi tạo
```

**Sự thật cứng:**
- **Master plan = singleton**, auto-tạo với project, KHÔNG sửa qua `upsert_plan` (chỉ qua giao diện FARE tạo project ban đầu). PM không động vào master qua MCP.
- **Master version PUBLIC** = nguồn cấu trúc Module→Submodule→Function cho cả project. Khi PM muốn thay đổi cây module → BA chạy `/fare-plan` (`fare-plan-breakdown`) tạo / sửa module trên master draft → User publish master để có version PUBLIC mới.
- **Month plan** = container 1 sprint / 1 chu kỳ thực thi. Tạo qua `upsert_plan(project_code, month, year)` — FARE auto-tạo 1 DRAFT version và **seed cây từ master PUBLIC mới nhất**. Sửa cây trong DRAFT month plan KHÔNG ảnh hưởng master.
- **Version có status `DRAFT` hoặc `PUBLIC`** (FARE tự đặt). Agent chỉ chuẩn bị DRAFT; publish → PUBLIC là quyết định User.
- `task.plan_month_id` (optional) gắn task vào 1 month plan để track theo sprint.

## Khi nào PM động vào plan
| Tình huống | Hành động |
|---|---|
| Sprint mới (đầu tháng / đầu cycle) | Tạo month plan mới → seed cây từ master PUBLIC → tạo task gắn `plan_month_id` |
| Cây module có function mới giữa sprint | Bàn BA chạy `/fare-plan` cập nhật master → User publish master → sửa month plan nếu cần snapshot lại |
| Đổi metadata month plan (đổi name, dates) | `upsert_plan(plan_id=..., ...)` — chỉ field thay đổi |
| Đổi `type` / `project_id` của plan | **KHÔNG được** — bất biến sau khi tạo |
| Sửa master plan | KHÔNG qua MCP — báo User dùng giao diện FARE |

## Quy trình tạo month plan mới

1. **Đọc state.** `list_plans(project_code, type="master")` → master plan + latest_version (status, version_number). Nếu master chưa PUBLIC bản nào → DỪNG, báo User: "master plan chưa publish, month plan sẽ seed từ DRAFT không ổn định".
2. **Kiểm trùng.** `list_plans(project_code, type="month")` → đã có plan cho tháng/năm User yêu cầu chưa? Có rồi → dùng tiếp, KHÔNG tạo trùng.
3. **Đề xuất + CHỜ User chốt** (§2):
   ```
   Tạo month plan: project=FARE, month=5, year=2026, name="Sprint tháng 5/2026"
   Seed cây từ master version v3 (PUBLIC ngày 2026-04-28)
   start_at=2026-05-01, end_at=2026-05-31
   ```
4. **Tạo.** `upsert_plan(project_code, month=5, year=2026, name=..., start_at=..., end_at=...)`. FARE trả `plan_id` + auto-create DRAFT version.
5. **Verify.** `get_plan(plan_id, include=["versions"])` → confirm có DRAFT version + cây seed.
6. **Bàn giao.** Báo `plan_id` & `plan_version_id` để bước task breakdown gắn `plan_month_id` đúng.

## Quy trình cập nhật month plan đã có

- Đổi metadata (name / dates / description): `upsert_plan(plan_id=..., name=..., end_at=...)` — CHỈ field thay đổi (§4).
- Sửa cây module trong DRAFT version: KHÔNG có MCP trực tiếp — phải qua BA `/fare-plan` (sửa master) hoặc giao diện FARE. Báo User.
- Publish DRAFT → PUBLIC: **KHÔNG có MCP trực tiếp**; là quyết định người thật + thao tác trên FARE UI. Agent KHÔNG tự publish (rule §7 — "approve" / "publish" là việc của con người).

## Anti-patterns

- ❌ Sửa master plan qua `upsert_plan` (không thuộc phạm vi của tool — sẽ lỗi).
- ❌ Tự tạo month plan trùng tháng/năm với plan đã có.
- ❌ Tự publish version (đổi DRAFT → PUBLIC) — không có MCP, và rule §7 cấm agent duyệt.
- ❌ Truyền `null` cho field giữ nguyên trong `upsert_plan` (§4).
- ❌ Gắn task vào `plan_month_id` của plan đã PUBLIC/đóng — task của sprint cũ. Hỏi User trước.
- ❌ Tạo month plan khi master chưa PUBLIC bản nào — seed sẽ không ổn định.

## Tự kiểm

- [ ] Đã `list_plans` kiểm tra master + month plan hiện có TRƯỚC khi tạo (tránh trùng).
- [ ] Master có ít nhất 1 PUBLIC version trước khi tạo month plan (nếu không, đã báo User).
- [ ] Tham số `month`, `year`, `name` đã được User chốt.
- [ ] Sau `upsert_plan` đã `get_plan(include=["versions"])` verify DRAFT version có sẵn cây seed.
- [ ] KHÔNG tự publish version. Việc publish bàn giao User thao tác trên FARE UI.
