import os
import re
import unicodedata

def slugify(value):
    value = value.replace('Đ', 'D').replace('đ', 'd')
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

directory = '/media/bacnguyen/01DCC7C9FB5EA4F0/fare_skill/docs/outputs/quan-ly-nhan-vien/'

# The old filenames have already been renamed, so we need to rename from the original again. Let's just hardcode the corrections.
corrections = {
    '1.10-them-moi-gpl.md': '1.10-them-moi-gpld.md',
    '1.11-cap-nhat-gpl.md': '1.11-cap-nhat-gpld.md',
    '1.14-danh-sach-gpl.md': '1.14-danh-sach-gpld.md',
    '1.18-cap-nhat-anh-gia-nhan-vien.md': '1.18-cap-nhat-danh-gia-nhan-vien.md',
    '1.4-them-moi-hl-cho-nhan-vien.md': '1.4-them-moi-hdld-cho-nhan-vien.md',
    '1.5-cap-nhat-hl-cho-nhan-vien.md': '1.5-cap-nhat-hdld-cho-nhan-vien.md',
    '1.6-danh-sach-hl.md': '1.6-danh-sach-hdld.md',
    '1.7-them-moi-on-gia.md': '1.7-them-moi-don-gia.md',
    '1.8-cap-nhat-on-gia.md': '1.8-cap-nhat-don-gia.md',
    '1.9-danh-sach-on-gia.md': '1.9-danh-sach-don-gia.md',
    '1.0-phan_chung.md': '1.0-phan-chung.md'
}

for old_name, new_name in corrections.items():
    old_path = os.path.join(directory, old_name)
    new_path = os.path.join(directory, new_name)
    if os.path.exists(old_path):
        print(f"Renaming: '{old_name}' -> '{new_name}'")
        os.rename(old_path, new_path)

