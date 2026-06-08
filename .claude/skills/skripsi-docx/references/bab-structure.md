# Template Struktur BAB Skripsi

Panduan susunan elemen `children[]` untuk masing-masing BAB standar skripsi Indonesia.

---

## BAB I — PENDAHULUAN

```
bab_title  "BAB I"
bab_title  "PENDAHULUAN"  (last: true)

sub  "1.1 Latar Belakang"
  paragraph ×4–6  (minimal 4 paragraf, gunakan runs untuk istilah asing)

sub  "1.2 Rumusan Masalah"
  paragraph ×1  (kalimat tanya, biasanya 1–3 kalimat)

sub  "1.3 Hipotesa"
  paragraph ×1  (jawaban sementara atas rumusan masalah)

sub  "1.4 Batasan Masalah"
  paragraph (noIndent) "Batasan masalah penelitian ini adalah sebagai berikut:"
  numbered 1…n

sub  "1.5 Tujuan Penelitian"
  paragraph (noIndent) "Tujuan dari penelitian ini adalah sebagai berikut:"
  numbered 1…n

sub  "1.6 Manfaat Penelitian"
  paragraph (noIndent) "Manfaat dari penelitian ini adalah sebagai berikut:"
  label "1"  "Manfaat Praktis"
    paragraph ×1–2
  label "2"  "Manfaat Akademik"
    paragraph ×1–2

page_break
section_title  "DAFTAR PUSTAKA"
  reference + blank  (per entri, urut abjad)
```

### Contoh JSON BAB I (parsial)

```json
[
  { "type": "bab_title", "text": "BAB I" },
  { "type": "bab_title", "text": "PENDAHULUAN", "last": true },
  { "type": "sub", "text": "1.1 Latar Belakang" },
  { "type": "paragraph", "runs": [
    { "text": "Perkembangan " },
    { "text": "natural language processing", "italic": true },
    { "text": " (NLP) dalam beberapa tahun terakhir..." }
  ]},
  { "type": "paragraph", "text": "Penelitian terdahulu menunjukkan bahwa..." },
  { "type": "sub", "text": "1.2 Rumusan Masalah" },
  { "type": "paragraph", "text": "Berdasarkan latar belakang di atas, maka rumusan masalah penelitian ini adalah bagaimana akurasi model BERT dalam mengklasifikasikan sentimen?" },
  { "type": "sub", "text": "1.4 Batasan Masalah" },
  { "type": "paragraph", "text": "Batasan masalah penelitian ini adalah sebagai berikut:", "noIndent": true },
  { "type": "numbered", "n": 1, "text": "Dataset yang digunakan hanya teks berbahasa Indonesia." },
  { "type": "numbered", "n": 2, "text": "Klasifikasi terbatas pada tiga kelas: positif, negatif, dan netral." },
  { "type": "sub", "text": "1.6 Manfaat Penelitian" },
  { "type": "paragraph", "text": "Manfaat dari penelitian ini adalah sebagai berikut:", "noIndent": true },
  { "type": "label", "n": 1, "text": "Manfaat Praktis" },
  { "type": "paragraph", "text": "Hasil penelitian dapat digunakan oleh perusahaan untuk memantau sentimen pelanggan secara otomatis." },
  { "type": "label", "n": 2, "text": "Manfaat Akademik" },
  { "type": "paragraph", "text": "Penelitian ini berkontribusi pada pengembangan model NLP untuk bahasa Indonesia." },
  { "type": "page_break" },
  { "type": "section_title", "text": "DAFTAR PUSTAKA" },
  { "type": "reference", "runs": [
    { "text": "Devlin, J. (2019). BERT: Pre-training of deep bidirectional transformers. " },
    { "text": "Proceedings of NAACL", "italic": true },
    { "text": ", 4171–4186." }
  ]},
  { "type": "blank" }
]
```

---

## BAB II — LANDASAN TEORI

```
bab_title  "BAB II"
bab_title  "LANDASAN TEORI"  (last: true)

sub  "2.1 [Topik Utama 1]"
  paragraph (pengantar topik, 1–2 paragraf)
  sub2  "2.1.1 [Sub Topik]"
    paragraph ×2–3
  sub2  "2.1.2 [Sub Topik]"
    paragraph ×2–3
    sub3  "2.1.2.1 [Sub-Sub Topik]"  (jika perlu kedalaman ekstra)
      paragraph ×1–2

sub  "2.2 [Topik Utama 2]"
  paragraph ×1–2
  sub2  "2.2.1 ..."
    paragraph ×2–3
  image  (diagram/arsitektur jika ada)
  figure_caption

sub  "2.3 [Penelitian Terdahulu]"
  paragraph ×1
  table  (tabel perbandingan penelitian sebelumnya)
  paragraph ×1  (gap analisis)

page_break
section_title  "DAFTAR PUSTAKA"
  reference + blank
```

### Tabel Perbandingan Penelitian Terdahulu

```json
{
  "type": "table",
  "caption": "Tabel 2.1 Penelitian Terdahulu",
  "headers": ["No", "Peneliti", "Tahun", "Metode", "Hasil"],
  "rows": [
    ["1", "Devlin et al.", "2019", "BERT", "F1: 93.5%"],
    ["2", "Liu et al.", "2019", "RoBERTa", "F1: 94.6%"],
    ["3", "Sanh et al.", "2020", "DistilBERT", "F1: 92.7%"]
  ]
}
```

---

## BAB III — METODOLOGI PENELITIAN

```
bab_title  "BAB III"
bab_title  "METODOLOGI PENELITIAN"  (last: true)

sub  "3.1 Metode Penelitian"
  paragraph ×1–2  (jenis penelitian, pendekatan yang digunakan)

sub  "3.2 Tahapan Penelitian"
  paragraph (noIndent) "Tahapan penelitian ini adalah sebagai berikut:"
  numbered 1…n  (setiap tahap)
  image  (diagram alur penelitian dari generate_diagram)
  figure_caption  "Gambar 3.1 Alur Penelitian"

sub  "3.3 Data Penelitian"
  sub2  "3.3.1 Sumber Data"
    paragraph ×1–2
  sub2  "3.3.2 Teknik Pengumpulan Data"
    paragraph ×1–2
  sub2  "3.3.3 Distribusi Dataset"
    paragraph ×1
    table  (tabel distribusi kelas/label)

sub  "3.4 Perancangan Sistem"
  sub2  "3.4.1 Arsitektur Model"
    paragraph ×1–2
    image  (arsitektur model)
    figure_caption
  sub2  "3.4.2 Preprocessing"
    paragraph ×1–2
    numbered 1…n  (langkah preprocessing)
  sub2  "3.4.3 Pelatihan Model"
    paragraph ×1–2
    table  (hyperparameter training)

sub  "3.5 Evaluasi Model"
  paragraph ×1
  numbered  (metrik: accuracy, precision, recall, F1-score)

page_break
section_title  "DAFTAR PUSTAKA"
  reference + blank
```

### Diagram Alur Penelitian (contoh `generate_diagram`)

```json
{
  "output_path": "C:/Users/arips/Dokumen/skripsi",
  "filename": "alur_penelitian.png",
  "config": {
    "canvas": { "width": 400, "height": 500, "background": "#FFFFFF" },
    "shapes": [
      { "id": "s1", "type": "stadium",      "x": 120, "y": 30,  "width": 160, "height": 45, "fill": "#1E3A5F", "text": "Mulai" },
      { "id": "s2", "type": "rounded_rect", "x": 120, "y": 110, "width": 160, "height": 50, "fill": "#2E5FA3", "text": "Pengumpulan Data" },
      { "id": "s3", "type": "rounded_rect", "x": 120, "y": 195, "width": 160, "height": 50, "fill": "#2E5FA3", "text": "Preprocessing" },
      { "id": "s4", "type": "rounded_rect", "x": 120, "y": 280, "width": 160, "height": 50, "fill": "#2E5FA3", "text": "Pelatihan Model" },
      { "id": "s5", "type": "rounded_rect", "x": 120, "y": 365, "width": 160, "height": 50, "fill": "#2E5FA3", "text": "Evaluasi" },
      { "id": "s6", "type": "stadium",      "x": 120, "y": 450, "width": 160, "height": 45, "fill": "#1E3A5F", "text": "Selesai" }
    ],
    "connections": [
      { "from": "s1", "to": "s2", "fromAnchor": "bottom", "toAnchor": "top" },
      { "from": "s2", "to": "s3", "fromAnchor": "bottom", "toAnchor": "top" },
      { "from": "s3", "to": "s4", "fromAnchor": "bottom", "toAnchor": "top" },
      { "from": "s4", "to": "s5", "fromAnchor": "bottom", "toAnchor": "top" },
      { "from": "s5", "to": "s6", "fromAnchor": "bottom", "toAnchor": "top" }
    ],
    "labels": [
      { "x": 200, "y": 14, "text": "Alur Penelitian", "fontSize": 14, "bold": true, "color": "#1E3A5F" }
    ]
  }
}
```

---

## ABSTRAK

```json
[
  { "type": "section_title", "text": "ABSTRAK" },
  { "type": "paragraph", "text": "Nama Mahasiswa: ...", "noIndent": true },
  { "type": "paragraph", "text": "NIM: ...", "noIndent": true },
  { "type": "paragraph", "text": "Program Studi: ...", "noIndent": true },
  { "type": "blank" },
  { "type": "paragraph", "text": "Isi abstrak dalam satu paragraf, maksimal 250 kata. Berisi latar belakang singkat, tujuan, metode, dan hasil penelitian..." },
  { "type": "blank" },
  { "type": "paragraph", "text": "Kata Kunci: deep learning, BERT, analisis sentimen, bahasa Indonesia", "noIndent": true }
]
```
