# Referensi Lengkap Tipe Elemen `children[]`

Semua tipe yang valid untuk parameter `children` pada tool `create_docx`.

---

## Tabel Pemetaan Elemen

| `type` | Kegunaan | Field Wajib | Field Opsional |
|---|---|---|---|
| `bab_title` | Judul BAB — center, bold, ALLCAPS | `text` | `last` (boolean) |
| `sub` | Sub-judul level 1 — kiri, bold | `text` | — |
| `sub2` | Sub-judul level 2 — indent 1.25cm, bold | `text` | — |
| `sub3` | Sub-judul level 3 — indent 2.5cm, bold | `text` | — |
| `paragraph` | Paragraf isi — justify, indent 1.25cm | `text` atau `runs` | `noIndent`, `bold`, `italic` |
| `numbered` | Item bernomor "n. teks" | `n`, `text` | — |
| `label` | Label bold "n. teks" | `n`, `text` | — |
| `section_title` | Judul seksi — center, bold, ALLCAPS | `text` | — |
| `reference` | Entri daftar pustaka — spasi 1, hanging | `runs` | — |
| `page_break` | Pindah halaman | — | — |
| `blank` | Baris kosong spasi tunggal | — | — |
| `spacer` | Baris kosong spasi ganda | — | — |
| `table` | Tabel dengan border | `headers`, `rows` | `caption` |
| `image` | Gambar dari file | `path` | `width`, `height`, `alignment` |
| `figure_caption` | Caption gambar — bold italic, center | `text` | — |

---

## Detail per Tipe

### `bab_title`
- Centered, bold, allCaps, spasi double
- Gunakan `last: true` pada baris TERAKHIR blok judul (menambahkan `after: 480` spacing)
- Blok judul umumnya 2 baris:

```json
{ "type": "bab_title", "text": "BAB III" },
{ "type": "bab_title", "text": "METODOLOGI PENELITIAN", "last": true }
```

### `sub` / `sub2` / `sub3` — Hierarki Sub-Judul

```
sub   "2.1 Judul Utama"              ← kiri, bold, before:400, after:120
  sub2  "2.1.1 Sub Topik"            ← indent 1.25cm, bold, before:200, after:80
    sub3  "2.1.1.1 Sub-Sub Topik"    ← indent 2.5cm, bold, before:120, after:60
      paragraph ...
```

```json
{ "type": "sub",  "text": "2.1 Tinjauan Pustaka" },
{ "type": "sub2", "text": "2.1.1 Machine Learning" },
{ "type": "sub3", "text": "2.1.1.1 Supervised Learning" },
{ "type": "paragraph", "text": "..." }
```

### `paragraph`

**Teks polos:**
```json
{ "type": "paragraph", "text": "Ini adalah teks paragraf biasa yang panjang..." }
```

**Bold:**
```json
{ "type": "paragraph", "text": "Teks ini tebal.", "bold": true }
```

**Italic:**
```json
{ "type": "paragraph", "text": "Teks ini miring.", "italic": true }
```

**Mixed via runs (paling umum untuk istilah asing):**
```json
{
  "type": "paragraph",
  "runs": [
    { "text": "Algoritma ini menggunakan pendekatan " },
    { "text": "deep learning", "italic": true },
    { "text": " berbasis " },
    { "text": "Long Short-Term Memory", "italic": true },
    { "text": " (LSTM) untuk..." }
  ]
}
```

**Tanpa indent (pengantar daftar):**
```json
{ "type": "paragraph", "text": "Batasan masalah penelitian adalah sebagai berikut:", "noIndent": true }
```

### `numbered`

Item daftar bernomor (justified, hanging indent 1.25cm):

```json
{ "type": "numbered", "n": 1, "text": "Sistem hanya memproses data teks bahasa Indonesia." },
{ "type": "numbered", "n": 2, "text": "Dataset yang digunakan adalah Twitter dan berita online." }
```

### `label`

Label bold untuk kategori (left-aligned):

```json
{ "type": "label", "n": 1, "text": "Manfaat Praktis" },
{ "type": "paragraph", "text": "Penelitian ini bermanfaat bagi..." },
{ "type": "label", "n": 2, "text": "Manfaat Akademik" },
{ "type": "paragraph", "text": "Secara akademik, penelitian ini..." }
```

### `section_title`

Judul section seperti DAFTAR PUSTAKA atau ABSTRAK:

```json
{ "type": "section_title", "text": "DAFTAR PUSTAKA" }
{ "type": "section_title", "text": "ABSTRAK" }
```

### `reference`

Entri daftar pustaka — HARUS menggunakan `runs` (bukan `text`), spasi 1, hanging indent 1.25cm:

```json
{
  "type": "reference",
  "runs": [
    { "text": "Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. " },
    { "text": "Proceedings of NAACL-HLT 2019", "italic": true },
    { "text": ", 4171–4186. https://doi.org/10.18653/v1/N19-1423" }
  ]
}
```

Ikuti setiap `reference` dengan `blank` untuk jarak antar entri:

```json
{ "type": "reference", "runs": [...] },
{ "type": "blank" }
```

### `table`

Tabel 100% lebar halaman, border single, header bold:

```json
{
  "type": "table",
  "caption": "Tabel 3.1 Distribusi Dataset",
  "headers": ["No", "Kategori", "Jumlah Data", "Persentase"],
  "rows": [
    ["1", "Positif", "1.200", "40%"],
    ["2", "Negatif", "900",   "30%"],
    ["3", "Netral",  "900",   "30%"]
  ]
}
```

**Gambar di dalam sel:**
```json
{
  "type": "table",
  "headers": ["Model", "Arsitektur"],
  "rows": [
    ["BERT", { "type": "image", "path": "C:/path/bert_arch.png", "width": 150, "height": 100 }]
  ]
}
```

### `image`

Gambar dari file PNG/JPG:

```json
{
  "type": "image",
  "path": "C:/Users/arips/Dokumen/skripsi/diagram_crisp_dm.png",
  "width": 500,
  "height": 350,
  "alignment": "center"
}
```

- `width`/`height`: piksel (default 400×300)
- `alignment`: `"center"` | `"left"` | `"right"` (default `"center"`)
- Gunakan `generate_diagram` terlebih dahulu untuk membuat PNG

### `figure_caption`

Caption gambar (bold italic, center, TNR 12pt):

```json
{ "type": "figure_caption", "text": "Gambar 3.1 Alur Proses CRISP-DM" }
```

Pola gambar + caption yang benar:
```json
{ "type": "image", "path": "...", "width": 500, "height": 350 },
{ "type": "figure_caption", "text": "Gambar 3.1 Siklus CRISP-DM" }
```

### Elemen Kosong

```json
{ "type": "blank" }     // baris kosong spasi tunggal (antar entri pustaka)
{ "type": "spacer" }    // baris kosong spasi ganda
{ "type": "page_break" } // pindah halaman
```

---

## Field `runs` — TextRun Object

Digunakan di `paragraph` (mixed) dan `reference`:

```json
{
  "text": "string wajib",
  "italic": true,   // opsional
  "bold": true,     // opsional
  "allCaps": true   // opsional
}
```

Aturan italic untuk istilah asing:
- WAJIB italic: nama model/teknik asing (_deep learning_, _fine-tuning_, _preprocessing_)
- BOLEH tegak: akronim setelah diperkenalkan (LSTM, BERT, SVM)
- Nama jurnal dalam daftar pustaka WAJIB italic
