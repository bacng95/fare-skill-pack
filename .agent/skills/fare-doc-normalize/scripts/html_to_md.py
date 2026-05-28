#!/usr/bin/env python3
"""
html_to_md.py — biến đổi CÚ PHÁP nội dung 1 section đặc tả (HTML từ Word/editor
của FARE) sang markdown sạch. PURE LOCAL TRANSFORM: chỉ ăn text vào, nhả text ra;
KHÔNG gọi MCP / API / DB / network (tuân fare-rules §8 ngoại lệ).

Dùng cho skill fare-doc-normalize. Agent đã đọc nội dung qua read_document, lưu
HTML vào 1 file local rồi chạy:
    python3 html_to_md.py input.html > output.md
hoặc:  cat input.html | python3 html_to_md.py > output.md

Script CHỈ lo phần lặp-lại deterministic:
  - <table> đặc tả → heading chuẩn (Tổng quan/Luồng chính/Hậu điều kiện/Giao diện/
    Luồng phụ & Ngoại lệ) + hàng key-value (Title/Description/Actors/Preconditions).
  - Bậc thụt lề ĐA KIỂU → bullet markdown: <ul><li>, <p data-indent=N>,
    style padding-left:Npx, marker ⟨INDENT:pl=N⟩, dòng mở đầu '+'/'-'.
  - <img src="fare://files/KEY"> → ![Ảnh minh hoạ](fare://files/KEY) (BỎ alt AI noise).
  - <s>→ ~~...~~ (giữ: nội dung đã bỏ).  <mark>→ giữ text bỏ thẻ.
  - comment-highlight → text + ' ⚠️(comment chưa chốt)'.
  - <strong>/<b> → **...**.  <a href>→ [text](href).
  - Bỏ data-id/style/colspan/&nbsp;/<ul><li> rỗng.

KHÔNG lo phần judgment (agent tự làm sau): ranh giới section, phân giải cross-ref,
sổ ⚠️ lỗi nguồn nội dung, đặt tên file, đẩy FARE. Script KHÔNG thêm/bớt chữ nghĩa.
"""
import sys
import re
from html.parser import HTMLParser

SECTION_LABELS = [
    (("overview", "tổng quan"), "## Tổng quan"),
    (("basic flow", "luồng chính"), "## Luồng chính"),
    (("post condition", "postcondition", "hậu điều kiện"), "## Hậu điều kiện"),
    (("ui/ux", "giao diện"), "## Giao diện"),
    (("alternative flow", "luồng phụ", "ngoại lệ"), "## Luồng phụ & Ngoại lệ"),
]
KV_KEYS = {"title": "Title", "description": "Description",
           "actors and interfaces": "Actors and Interfaces",
           "preconditions": "Preconditions"}


def section_heading(text):
    t = text.strip().lower()
    for keys, heading in SECTION_LABELS:
        if any(k == t or t.startswith(k) for k in keys):
            return heading
    return None


class Line:
    __slots__ = ("indent", "parts", "bullet")

    def __init__(self, indent=0, bullet=False):
        self.indent = indent
        self.parts = []
        self.bullet = bullet

    def text(self):
        return "".join(self.parts).strip()


class Cell:
    def __init__(self):
        self.lines = []


class SpecHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []           # list of list[Cell]
        self.cur_row = None
        self.cur_cell = None
        self.cur_line = None
        self.ul_depth = 0
        self.li_pending = None   # bậc của <li> vừa mở, chờ <p> con kế thừa
        # inline format stack
        self.fmt = []            # 'b','s','mark','comment'
        self.href = None
        self.in_cell = False

    # ---- helpers ----
    def _new_line(self, indent=0, bullet=False):
        if self.cur_cell is None:
            return
        self.cur_line = Line(indent, bullet)
        self.cur_cell.lines.append(self.cur_line)

    def _emit(self, s):
        if self.cur_line is None:
            self._new_line()
        # apply current inline format wrappers around raw chunk later;
        # here we append already-wrapped text
        self.cur_line.parts.append(s)

    @staticmethod
    def _indent_from_attrs(attrs):
        d = dict(attrs)
        if d.get("data-indent"):
            try:
                return max(0, int(d["data-indent"]))
            except ValueError:
                pass
        style = d.get("style", "")
        m = re.search(r"padding-left:\s*(\d+)px", style)
        if m:
            return round(int(m.group(1)) / 32)
        return 0

    # ---- tag handlers ----
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "tr":
            self.cur_row = []
            self.rows.append(self.cur_row)
        elif tag in ("td", "th"):
            self.cur_cell = Cell()
            self.cur_row.append(self.cur_cell)
            self.in_cell = True
            self.cur_line = None
        elif tag == "ul" or tag == "ol":
            self.ul_depth += 1
        elif tag == "li":
            self.li_pending = max(1, self.ul_depth)
            self._new_line(indent=self.li_pending, bullet=True)
        elif tag == "p":
            # <p> ngay trong <li> → kế thừa bullet+bậc của li (không reset thành dòng phẳng)
            if self.li_pending is not None and self.cur_line is not None and not self.cur_line.parts:
                self.cur_line.indent = self.li_pending
                self.cur_line.bullet = True
                self.li_pending = None
            elif self.cur_line is not None and not self.cur_line.parts:
                self.cur_line.indent = self._indent_from_attrs(attrs)
            else:
                self._new_line(indent=self._indent_from_attrs(attrs), bullet=False)
        elif tag in ("strong", "b"):
            self.fmt.append("b"); self._emit("**")
        elif tag == "s" or tag == "del" or tag == "strike":
            self.fmt.append("s"); self._emit("~~")
        elif tag == "mark":
            self.fmt.append("mark")  # bỏ thẻ, giữ text
        elif tag == "span":
            if "comment-highlight" in d.get("class", ""):
                self.fmt.append("comment")
        elif tag == "a":
            self.href = d.get("href", "")
            self._emit("[")
        elif tag == "img":
            src = d.get("src", "")
            m = re.search(r"fare://files/[^\"'\s]+", src)
            ref = m.group(0) if m else src
            # ảnh đứng dòng riêng nếu dòng hiện tại đã có chữ
            if self.cur_line is not None and self.cur_line.parts:
                self._new_line(indent=self.cur_line.indent)
            # GIỮ ref, BỎ alt caption AI
            self._emit(f"![Ảnh minh hoạ]({ref})")
        elif tag == "br":
            self._new_line(indent=self.cur_line.indent if self.cur_line else 0)

    def handle_endtag(self, tag):
        if tag in ("strong", "b"):
            if self.fmt and self.fmt[-1] == "b":
                self.fmt.pop(); self._emit("**")
        elif tag in ("s", "del", "strike"):
            if self.fmt and self.fmt[-1] == "s":
                self.fmt.pop(); self._emit("~~")
        elif tag == "mark":
            if self.fmt and self.fmt[-1] == "mark":
                self.fmt.pop()
        elif tag == "span":
            if self.fmt and self.fmt[-1] == "comment":
                self.fmt.pop(); self._emit(" ⚠️(comment chưa chốt)")
        elif tag == "a":
            href = self.href or ""
            self._emit(f"]({href})")
            self.href = None
        elif tag == "ul" or tag == "ol":
            self.ul_depth = max(0, self.ul_depth - 1)
        elif tag in ("td", "th"):
            self.in_cell = False
            self.cur_line = None

    def handle_data(self, data):
        if not self.in_cell:
            return
        text = data.replace("\xa0", " ")
        if not text.strip():
            # giữ space giữa chữ, bỏ chunk toàn trắng
            if self.cur_line and self.cur_line.parts:
                self.cur_line.parts.append(" ")
            return
        # marker ⟨INDENT:pl=N⟩ ở đầu → set indent của line, bỏ marker
        m = re.match(r"\s*⟨INDENT:pl=(\d+)⟩", text)
        if m and self.cur_line is not None:
            self.cur_line.indent = round(int(m.group(1)) / 32)
            text = text[m.end():]
        if text:
            self._emit(text)

    def handle_entityref(self, name):
        if self.in_cell:
            self._emit({"amp": "&", "lt": "<", "gt": ">", "quot": '"'}.get(name, ""))


def render(parser):
    out = []
    for row in parser.rows:
        # gộp cell: hàng có 1 cell logic (label/section/content) vs 2 cell (k-v)
        cells = [c for c in row if any(l.text() for l in c.lines)] or row
        nonempty = [c for c in cells if any(l.text() for l in c.lines)]
        if len(nonempty) == 1:
            cell = nonempty[0]
            joined = " ".join(l.text() for l in cell.lines if l.text())
            heading = section_heading(re.sub(r"[*~]", "", joined))
            if heading and len(cell.lines) <= 2:
                out.append("\n" + heading)
            else:
                _render_lines(cell.lines, out)
        elif len(nonempty) >= 2:
            key_raw = re.sub(r"[*~\s]+", " ", nonempty[0].lines[0].text()).strip()
            key = KV_KEYS.get(key_raw.lower())
            val = "; ".join(l.text() for l in nonempty[1].lines if l.text())
            if key:
                out.append(f"- **{key}**: {val}")
            else:
                # 2 cột nhưng không phải k-v chuẩn → render lần lượt
                for c in nonempty:
                    _render_lines(c.lines, out)
    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def _render_lines(lines, out):
    for ln in lines:
        t = ln.text()
        if not t:
            continue
        if ln.bullet or ln.indent > 0:
            pad = "  " * max(0, ln.indent - (1 if ln.bullet else 0))
            # dòng mở đầu '+' hoặc '-' người soạn gõ → coi như bullet con
            t = re.sub(r"^[+\-]\s+", "", t)
            out.append(f"{pad}- {t}")
        else:
            out.append(t)


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding="utf-8") as f:
            html = f.read()
    else:
        html = sys.stdin.read()

    # giữ phần đầu không phải HTML (provenance, heading function)
    head = []
    for line in html.splitlines():
        s = line.strip()
        if s.startswith("> Nguồn:"):
            head.append(s)
            continue
        plain = re.sub(r"\*\*", "", s)
        # heading function "N.M Title" (mọi cấp #) → ép về '# ' (h1) cho file tách.
        m = re.match(r"^#{1,6}\s*(\d+(?:\.\d+)*\.?\s+.*)$", plain)
        if m:
            head.append("# " + m.group(1).strip())
        elif re.match(r"^#{1,6}\s", plain):
            head.append(plain)
        elif "<" in s:
            break
    p = SpecHTMLParser()
    p.feed(html)
    body = render(p)
    if head:
        sys.stdout.write("\n".join(head) + "\n\n")
    sys.stdout.write(body)


if __name__ == "__main__":
    main()
