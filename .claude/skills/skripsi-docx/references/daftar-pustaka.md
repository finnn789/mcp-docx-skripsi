# Format Daftar Pustaka APA 7

Panduan lengkap format daftar pustaka untuk skripsi menggunakan gaya APA edisi ke-7.
Setiap entri menggunakan `type: "reference"` dengan field `runs`.

---

## Aturan Umum

- Urutan: alfabetis berdasarkan nama belakang penulis pertama
- Hanging indent 1,25 cm (ditangani otomatis oleh `reference`)
- Spasi 1 (single spacing) — otomatis
- Setiap entri DIIKUTI `{ "type": "blank" }` untuk jarak antar entri
- Nama jurnal, nama prosiding, judul buku → **ITALIC**

---

## Format per Jenis Sumber

### 1. Artikel Jurnal

**Pola:**
```
Nama, I. (Tahun). Judul artikel. Nama Jurnal, Volume(Nomor), Halaman. DOI
```

**Contoh JSON:**
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

**Contoh kedua (jurnal biasa):**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Liu, Y., Ott, M., Goyal, N., Du, J., Joshi, M., Chen, D., Levy, O., Lewis, M., Zettlemoyer, L., & Stoyanov, V. (2019). RoBERTa: A robustly optimized BERT pretraining approach. " },
    { "text": "arXiv preprint arXiv:1907.11692", "italic": true },
    { "text": ". https://arxiv.org/abs/1907.11692" }
  ]
}
```

---

### 2. Prosiding Konferensi

**Pola:**
```
Nama, I. (Tahun). Judul. Dalam Nama Prosiding (hal. xx–xx). Penerbit. DOI
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. Dalam " },
    { "text": "Advances in Neural Information Processing Systems, 30", "italic": true },
    { "text": " (hal. 5998–6008). Curran Associates." }
  ]
}
```

---

### 3. Buku

**Pola:**
```
Nama, I. (Tahun). Judul Buku. Penerbit.
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Goodfellow, I., Bengio, Y., & Courville, A. (2016). " },
    { "text": "Deep Learning", "italic": true },
    { "text": ". MIT Press." }
  ]
}
```

---

### 4. Buku dengan Editor

**Pola:**
```
Nama, I. (Ed.). (Tahun). Judul Buku. Penerbit.
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Manning, C. D., & Schütze, H. (1999). " },
    { "text": "Foundations of Statistical Natural Language Processing", "italic": true },
    { "text": ". MIT Press." }
  ]
}
```

---

### 5. Bab dalam Buku Kumpulan

**Pola:**
```
Nama, I. (Tahun). Judul bab. Dalam N. Editor (Ed.), Judul Buku (hal. xx–xx). Penerbit.
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Hochreiter, S., & Schmidhuber, J. (1997). Long short-term memory. Dalam " },
    { "text": "Neural Computation, 9", "italic": true },
    { "text": "(8), 1735–1780. MIT Press." }
  ]
}
```

---

### 6. Tesis / Skripsi

**Pola:**
```
Nama, I. (Tahun). Judul [Tesis/Skripsi, Nama Universitas]. Repositori.
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Santoso, B. (2023). Klasifikasi sentimen ulasan produk menggunakan IndoBERT [Skripsi, Universitas Indonesia]. Repositori Institusi UI." }
  ]
}
```

---

### 7. Sumber Web / Website

**Pola:**
```
Nama, I. (Tahun, Tanggal Bulan). Judul halaman. Nama Situs. URL
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Google AI. (2023, 12 Desember). " },
    { "text": "BERT: Pre-training of deep bidirectional transformers", "italic": true },
    { "text": ". Google AI Blog. https://ai.googleblog.com/2018/11/open-sourcing-bert-state-of-art-pre.html" }
  ]
}
```

---

### 8. Dataset / Software

**Pola:**
```
Nama, I. (Tahun). Nama dataset/software (Versi x.x) [Dataset/Software]. Penyedia. DOI
```

**Contoh JSON:**
```json
{
  "type": "reference",
  "runs": [
    { "text": "Koto, F., Rahimi, A., Lau, J. H., & Baldwin, T. (2020). IndoLEM and IndoBERT: A benchmark dataset and pre-trained language model for Indonesian NLP. Dalam " },
    { "text": "Proceedings of the 28th International Conference on Computational Linguistics", "italic": true },
    { "text": " (hal. 757–770). https://doi.org/10.18653/v1/2020.coling-main.66" }
  ]
}
```

---

## Template Blok Daftar Pustaka Lengkap

```json
[
  { "type": "page_break" },
  { "type": "section_title", "text": "DAFTAR PUSTAKA" },

  {
    "type": "reference",
    "runs": [
      { "text": "Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. " },
      { "text": "Proceedings of NAACL-HLT 2019", "italic": true },
      { "text": ", 4171–4186. https://doi.org/10.18653/v1/N19-1423" }
    ]
  },
  { "type": "blank" },

  {
    "type": "reference",
    "runs": [
      { "text": "Goodfellow, I., Bengio, Y., & Courville, A. (2016). " },
      { "text": "Deep Learning", "italic": true },
      { "text": ". MIT Press." }
    ]
  },
  { "type": "blank" },

  {
    "type": "reference",
    "runs": [
      { "text": "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. Dalam " },
      { "text": "Advances in Neural Information Processing Systems, 30", "italic": true },
      { "text": " (hal. 5998–6008). Curran Associates." }
    ]
  },
  { "type": "blank" }
]
```

---

## Kesalahan Umum yang Harus Dihindari

| Kesalahan | Yang Benar |
|---|---|
| Nama jurnal tidak italic | Nama jurnal WAJIB italic dalam `runs` |
| Menggunakan `text` (bukan `runs`) | `reference` WAJIB pakai `runs` |
| Tidak ada `blank` setelah entri | Selalu tambahkan `{ "type": "blank" }` |
| Urutan tidak abjad | Urutkan A–Z berdasarkan nama belakang |
| Format tahun salah: (2019, June) | Bahasa Indonesia: (2019, Juni) |
| Tanda hubung biasa (-) | Gunakan en-dash (–) untuk rentang halaman |
