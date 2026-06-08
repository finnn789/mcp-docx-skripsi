---
name: skripsi-docx
description: This skill should be used when the user asks to "tulis BAB skripsi", "buat dokumen skripsi", "generate BAB I/II/III", "buatkan landasan teori", "tulis metodologi penelitian", "buat daftar pustaka", "preview dokumen", "tampilkan hasil docx", "buat diagram", "sisipkan tabel", "sisipkan gambar di skripsi", or mentions creating any academic thesis document section in Indonesian format. Activates the mcp-docx-skripsi MCP server workflow for generating .docx files.
version: 1.0.0
---

# Skill: Penulis Skripsi Otomatis (mcp-docx-skripsi)

Generate file `.docx` skripsi akademik Indonesia menggunakan MCP server `mcp-docx-skripsi`. Setiap permintaan dokumen skripsi WAJIB memanggil tool `create_docx` — jangan hanya menampilkan teks.

## Tools yang Tersedia

| Tool | Fungsi | Kapan Digunakan |
|---|---|---|
| `create_docx` | Generate `.docx` dari array elemen | Setiap kali menulis konten BAB |
| `generate_diagram` | Render diagram → PNG | Sebelum `create_docx` jika butuh gambar |
| `export_html` | `.docx` → `.html` preview | Preview di Claude Code |
| `preview_docx` | `.docx` → `.pdf` via MS Word | Preview di Claude Chat |
| `extract_text_to_word` | OCR PDF → `.docx` | Ekstrak teks dari PDF scan |

## Format Dokumen (otomatis diterapkan)

- Margin: Kiri 4 cm, Atas/Kanan/Bawah 3 cm
- Font: Times New Roman 12 pt
- Spasi isi: 2 (double) — Spasi Daftar Pustaka: 1 (single)
- Indent paragraf: 1,25 cm firstLine (default)

## Urutan Pemanggilan Tool

### Menulis BAB
1. Susun `children[]` sesuai struktur BAB (lihat referensi)
2. Panggil `create_docx` → `filename`, `output_path`, `children`

### Menulis BAB dengan Diagram
1. Panggil `generate_diagram` → simpan `png_path`
2. Gunakan `png_path` di `children` sebagai `{ "type": "image", "path": "<png_path>" }`
3. Panggil `create_docx`

### Preview di Claude Code
1. Panggil `export_html` → dapatkan `html_path`
2. Panggil `mcp__Claude_Preview__preview_start` → `url = html_path`
3. Panggil `mcp__Claude_Preview__preview_screenshot`

### Preview di Claude Chat
1. Panggil `preview_docx` → dapatkan `pdf_path`
2. Panggil `mcp__pdf-viewer__display_pdf` → `url = pdf_path`

## Elemen Utama `children[]`

Setiap elemen adalah object dengan `"type"` wajib. Tipe-tipe paling sering digunakan:

```json
{ "type": "bab_title", "text": "BAB I" }
{ "type": "bab_title", "text": "PENDAHULUAN", "last": true }
{ "type": "sub", "text": "1.1 Latar Belakang" }
{ "type": "sub2", "text": "1.1.1 Konteks Penelitian" }
{ "type": "paragraph", "text": "Teks paragraf biasa..." }
{ "type": "paragraph", "runs": [{"text":"Model "}, {"text":"deep learning","italic":true}, {"text":" digunakan."}] }
{ "type": "numbered", "n": 1, "text": "Item pertama" }
{ "type": "reference", "runs": [{"text":"Nama, I. (2024). Judul. "},{"text":"Jurnal, 10","italic":true},{"text":"(2), 1–10."}] }
{ "type": "page_break" }
{ "type": "section_title", "text": "DAFTAR PUSTAKA" }
```

Lihat referensi lengkap semua tipe di [`references/element-types.md`](references/element-types.md).

## Aturan Penulisan Wajib

### Istilah Asing → Italic
Istilah bahasa Inggris / teknis bukan nama diri WAJIB italic via `runs`:
- Benar: `{ "text": "deep learning", "italic": true }`
- Akronim setelah diperkenalkan boleh tegak: LSTM, FinBERT, GRU

### `noIndent` Hanya untuk Kalimat Pengantar Daftar
```json
{ "type": "paragraph", "text": "Batasan masalah adalah sebagai berikut:", "noIndent": true }
```

### `bab_title` — `last:true` pada Baris Terakhir
```json
{ "type": "bab_title", "text": "BAB II" },
{ "type": "bab_title", "text": "LANDASAN TEORI", "last": true }
```

## Struktur Tiap BAB (ringkas)

```
bab_title "BAB I"
bab_title "PENDAHULUAN"  (last:true)
sub "1.1 Latar Belakang"
  paragraph ×4–6
sub "1.2 Rumusan Masalah"
  paragraph ×1
sub "1.3 Hipotesa"
  paragraph ×1
sub "1.4 Batasan Masalah"
  paragraph (noIndent) "…sebagai berikut:"
  numbered 1…n
sub "1.5 Tujuan Penelitian"
  paragraph (noIndent) "…sebagai berikut:"
  numbered 1…n
sub "1.6 Manfaat Penelitian"
  paragraph (noIndent) "…sebagai berikut:"
  label "1" → paragraph
  label "2" → paragraph
page_break
section_title "DAFTAR PUSTAKA"
  reference + blank (per entri)
```

Struktur BAB II dan BAB III tersedia di [`references/bab-structure.md`](references/bab-structure.md).

## Daftar Pustaka APA 7 — Format Cepat

### Jurnal
```json
{ "type": "reference", "runs": [
  { "text": "Nama, I. (2024). Judul artikel. " },
  { "text": "Nama Jurnal, 10", "italic": true },
  { "text": "(2), 1–10. https://doi.org/..." }
]}
```

Format lengkap (jurnal, prosiding, buku) di [`references/daftar-pustaka.md`](references/daftar-pustaka.md).

## Contoh `create_docx` Minimal

```json
{
  "filename": "BAB_I.docx",
  "output_path": "C:/Users/arips/Dokumen/skripsi",
  "children": [
    { "type": "bab_title", "text": "BAB I" },
    { "type": "bab_title", "text": "PENDAHULUAN", "last": true },
    { "type": "sub", "text": "1.1 Latar Belakang" },
    { "type": "paragraph", "text": "Penelitian ini membahas..." },
    { "type": "page_break" },
    { "type": "section_title", "text": "DAFTAR PUSTAKA" }
  ]
}
```

## Additional Resources

- **[`references/element-types.md`](references/element-types.md)** — Tabel lengkap semua tipe elemen, field wajib/opsional, dan contoh
- **[`references/bab-structure.md`](references/bab-structure.md)** — Template struktur BAB I, II, III, dan Abstrak
- **[`references/daftar-pustaka.md`](references/daftar-pustaka.md)** — Format APA 7 lengkap (jurnal, prosiding, buku, web) dengan contoh `runs`
