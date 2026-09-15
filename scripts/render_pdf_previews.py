"""Render a PNG preview of each PDF next to it, and print
{"file.pdf": {"pages": n, "previewPage": p}} as JSON.

The preview is the first real page: W-2 and 1099 PDFs start with an IRS "Attention" cover sheet
(identical across forms), so leading pages like that are skipped.

Used by scripts/irs-forms.mjs. Needs `pip install pypdfium2`. Uses Pillow for smaller PNGs if it's
installed, otherwise writes the PNG with the standard library.
"""

import json
import struct
import sys
import zlib
from pathlib import Path

import pypdfium2 as pdfium

WIDTH = 900  # px; sharp enough to read, small enough to ship in the progress artifact


def write_png(path: Path, width: int, height: int, rgb_rows: list[bytes]) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + row for row in rgb_rows)  # filter type 0 per scanline
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def preview_page_index(pdf: pdfium.PdfDocument) -> int:
    """First page that isn't an IRS 'Attention' cover sheet."""
    for i in range(len(pdf)):
        page = pdf[i]
        textpage = page.get_textpage()
        head = textpage.get_text_range()[:400]
        textpage.close()
        page.close()
        if "Attention" not in head:
            return i
    return 0


def render_preview(pdf_path: Path) -> dict:
    pdf = pdfium.PdfDocument(str(pdf_path))
    try:
        index = preview_page_index(pdf)
        page = pdf[index]
        width_pt, _ = page.get_size()
        bitmap = page.render(scale=WIDTH / width_pt, rev_byteorder=True, may_draw_forms=True)
        out = pdf_path.with_suffix(".png")
        try:
            bitmap.to_pil().convert("RGB").save(out, optimize=True)
        except Exception:
            width, height, stride, channels = bitmap.width, bitmap.height, bitmap.stride, bitmap.n_channels
            buf = bytes(bitmap.buffer)
            rows = []
            for y in range(height):
                row = buf[y * stride : y * stride + width * channels]
                if channels == 4:  # drop alpha
                    row = bytes(b for i, b in enumerate(row) if i % 4 != 3)
                rows.append(row)
            write_png(out, width, height, rows)
        page.close()
        return {"pages": len(pdf), "previewPage": index + 1}
    finally:
        pdf.close()


if __name__ == "__main__":
    print(json.dumps({Path(p).name: render_preview(Path(p)) for p in sys.argv[1:]}))
