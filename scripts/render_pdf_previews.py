"""Render page 1 of each PDF to a PNG next to it, and print {"file.pdf": page_count} as JSON.

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


def render_first_page(pdf_path: Path) -> int:
    pdf = pdfium.PdfDocument(str(pdf_path))
    try:
        page = pdf[0]
        width_pt, _ = page.get_size()
        bitmap = page.render(scale=WIDTH / width_pt, rev_byteorder=True, may_draw_forms=True)
        out = pdf_path.with_suffix(".png")
        try:
            image = bitmap.to_pil().convert("RGB")
            image.save(out, optimize=True)
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
        return len(pdf)
    finally:
        pdf.close()


if __name__ == "__main__":
    pages = {Path(p).name: render_first_page(Path(p)) for p in sys.argv[1:]}
    print(json.dumps(pages))
