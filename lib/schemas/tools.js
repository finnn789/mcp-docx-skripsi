const TOOL_DEFINITIONS = [
    {
      name: 'create_docx',
      description:
        'Membuat file Word (.docx) format skripsi. ' +
        'Margin kiri 4 cm, atas/kanan/bawah 3 cm. Font Times New Roman 12 pt.',
      inputSchema: {
        type: 'object',
        required: ['filename', 'output_path', 'children'],
        properties: {
          filename: {
            type: 'string',
            description: 'Nama file output, contoh: BAB_I.docx',
          },
          output_path: {
            type: 'string',
            description: 'Direktori output, contoh: /mnt/user-data/outputs/',
          },
          children: {
            type: 'array',
            description: 'Daftar elemen dokumen secara berurutan.',
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                type: {
                  type: 'string',
                  enum: [
                    'bab_title',
                    'sub',
                    'sub2',
                    'sub3',
                    'paragraph',
                    'numbered',
                    'label',
                    'section_title',
                    'reference',
                    'page_break',
                    'blank',
                    'spacer',
                    'table',
                    'image',
                    'figure_caption',
                  ],
                  description:
                    'bab_title: judul BAB (center, kapital, bold) — gunakan last:true pada baris judul terakhir. ' +
                    'sub: sub-judul level 1 mis. 2.1 (kiri, bold, before:400). ' +
                    'sub2: sub-judul level 2 mis. 2.1.1 (indent 1.25cm, bold, before:200). ' +
                    'sub3: sub-judul level 3 mis. 2.1.1.1 (indent 2.5cm, bold, before:120). ' +
                    'paragraph: isi teks — pakai "text" untuk teks polos, "runs" untuk mixed italic/bold, noIndent:true opsional. ' +
                    'numbered: item bernomor "n. teks" (justify, hanging indent). ' +
                    'label: label bold "n. teks" (kiri, bold). ' +
                    'section_title: judul seksi (DAFTAR PUSTAKA, ABSTRAK, dll.). ' +
                    'reference: entri daftar pustaka (justify, hanging indent, spasi 1). ' +
                    'page_break: pindah halaman. ' +
                    'blank: baris kosong spasi tunggal. ' +
                    'spacer: baris kosong spasi ganda. ' +
                    'table: tabel dengan border — gunakan headers (array string), rows (array of array string), caption (opsional). ' +
                    'image: sisipkan gambar dari file — wajib: path (path absolut PNG/JPG), opsional: width (px, default 400), height (px, default 300), alignment (center|left|right). ' +
                    'figure_caption: caption gambar — wajib: text (mis. "Gambar 2.1 Siklus CRISP-DM"). Bold italic, center, TNR 12pt.',
                },
                text: {
                  type: 'string',
                  description: 'Teks tunggal — untuk bab_title, sub, section_title, dan paragraph (teks polos).',
                },
                n: {
                  type: ['string', 'number'],
                  description: 'Nomor untuk numbered dan label.',
                },
                last: {
                  type: 'boolean',
                  description: 'Khusus bab_title: true pada baris terakhir blok judul (menambah after:480).',
                },
                noIndent: {
                  type: 'boolean',
                  description: 'Khusus paragraph: hilangkan indent firstLine.',
                },
                bold: {
                  type: 'boolean',
                  description: 'Khusus paragraph teks polos: cetak tebal.',
                },
                italic: {
                  type: 'boolean',
                  description: 'Khusus paragraph teks polos: cetak miring.',
                },
                runs: {
                  type: 'array',
                  description: 'Array TextRun untuk paragraph (mixed) dan reference.',
                  items: {
                    type: 'object',
                    required: ['text'],
                    properties: {
                      text:    { type: 'string'  },
                      italic:  { type: 'boolean' },
                      bold:    { type: 'boolean' },
                      allCaps: { type: 'boolean' },
                    },
                  },
                },
                headers: {
                  type: 'array',
                  description: 'Khusus table: array string judul kolom (bold, center).',
                  items: { type: 'string' },
                },
                rows: {
                  type: 'array',
                  description: 'Khusus table: array of array string, tiap inner array = 1 baris.',
                  items: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                caption: {
                  type: 'string',
                  description: 'Khusus table: judul tabel (bold, center) yang ditempatkan di atas tabel.',
                },
                path: {
                  type: 'string',
                  description: 'Khusus image: path absolut ke file gambar (PNG/JPG).',
                },
                width: {
                  type: 'number',
                  description: 'Khusus image: lebar gambar dalam piksel (default 400).',
                },
                height: {
                  type: 'number',
                  description: 'Khusus image: tinggi gambar dalam piksel (default 300).',
                },
                alignment: {
                  type: 'string',
                  description: 'Khusus image: perataan gambar — center | left | right (default center).',
                },
              },
            },
          },
        },
      },
    },
    {
      name: 'generate_diagram',
      description: `Membuat diagram/gambar kustom dan menyimpannya sebagai file PNG.

KAPAN DIGUNAKAN:
Panggil tool ini SEBELUM create_docx jika dokumen membutuhkan gambar/diagram.
Hasil png_path langsung dipakai di create_docx sebagai { type: "image", path: "<png_path>", width: ..., height: ... }.

CARA KERJA:
Tool ini menerima deskripsi visual berupa JSON yang berisi shapes (bentuk), connections (panah), dan labels (teks bebas).
Semua elemen dirender ke canvas dan disimpan sebagai PNG.

─── CANVAS ───────────────────────────────────────────────────────────────────
{ width: 700, height: 500, background: "#FFFFFF" }
  - width/height  : ukuran canvas dalam piksel (default 700 × 500)
  - background    : warna latar hex string (default putih)

─── SHAPES ───────────────────────────────────────────────────────────────────
Tiap shape adalah objek dengan field:
  id          (string, wajib untuk koneksi) — pengenal unik shape
  type        — "rounded_rect" | "rect" | "diamond" | "oval" | "ellipse" |
                "circle" | "stadium" | "parallelogram" | "cylinder" | "hexagon"
  x, y        — koordinat pojok kiri-atas (piksel)
  width, height — ukuran shape (piksel)
  radius      — jari-jari sudut untuk rounded_rect (default 8)
  fill        — warna isi hex (mis. "#2E5FA3")
  stroke      — warna border hex (mis. "#1A3A6B")
  strokeWidth — tebal border piksel (default 2, 0 = tanpa border)
  shadow      — true/false, tambahkan drop shadow (default false)
  text        — teks di dalam shape, gunakan "\\n" untuk multi-baris
  textColor   — warna teks hex (default "#FFFFFF")
  fontSize    — ukuran font piksel (default 13)
  bold        — true/false (default false)
  fontFamily  — nama font (default "Arial")
  skew        — offset miring khusus parallelogram (default 15)

Contoh shape:
  { "id":"A", "type":"rounded_rect", "x":270, "y":60, "width":160, "height":55,
    "fill":"#2E5FA3", "stroke":"#1A3A6B", "text":"Business\\nUnderstanding",
    "textColor":"#FFF", "bold":true }

─── CONNECTIONS ──────────────────────────────────────────────────────────────
Tiap koneksi adalah panah dari satu titik ke titik lain:
  from        — id shape ATAU objek koordinat { "x": 100, "y": 200 }
  to          — id shape ATAU objek koordinat { "x": 300, "y": 200 }
  fromAnchor  — "top" | "bottom" | "left" | "right" | "auto" (default "auto")
  toAnchor    — "top" | "bottom" | "left" | "right" | "auto" (default "auto")
  curved      — true = bezier curve, false = garis lurus (default false)
  tension     — kekuatan kurva bezier 0.0–1.0 (default 0.45, hanya jika curved:true)
  style       — "solid" | "dashed" (default "solid")
  color       — warna panah hex (default "#444444")
  width       — tebal garis piksel (default 2)
  label       — teks di atas garis panah (opsional)
  arrowSize   — ukuran kepala panah piksel (default 10)

Anchor "auto" menghitung arah terbaik berdasarkan posisi relatif kedua shape.
Untuk diagram melingkar (mis. CRISP-DM), gunakan anchor eksplisit agar kurva rapi.

Contoh connection:
  { "from":"A", "to":"B", "curved":true, "fromAnchor":"right", "toAnchor":"left",
    "color":"#2E5FA3", "width":2 }

─── LABELS ───────────────────────────────────────────────────────────────────
Teks bebas yang tidak terikat pada shape:
  x, y        — koordinat titik acuan teks
  text        — isi teks, gunakan "\\n" untuk multi-baris
  fontSize    — ukuran font piksel (default 14)
  bold        — true/false (default false)
  italic      — true/false (default false)
  color       — warna hex (default "#1A1A1A")
  align       — "center" | "left" | "right" (default "center")
  fontFamily  — nama font (default "Arial")

─── CONTOH LENGKAP — Flowchart 3 langkah ────────────────────────────────────
{
  "canvas": { "width": 400, "height": 400, "background": "#FFFFFF" },
  "shapes": [
    { "id":"start", "type":"stadium",       "x":120, "y":30,  "width":160, "height":45, "fill":"#1E3A5F", "text":"Mulai" },
    { "id":"p1",    "type":"rounded_rect",  "x":120, "y":115, "width":160, "height":50, "fill":"#2E5FA3", "text":"Kumpulkan Data" },
    { "id":"dec",   "type":"diamond",       "x":100, "y":205, "width":200, "height":60, "fill":"#F0A500", "text":"Data Valid?", "textColor":"#1A1A1A" },
    { "id":"end",   "type":"stadium",       "x":120, "y":315, "width":160, "height":45, "fill":"#1E3A5F", "text":"Selesai" }
  ],
  "connections": [
    { "from":"start", "to":"p1",  "fromAnchor":"bottom", "toAnchor":"top" },
    { "from":"p1",    "to":"dec", "fromAnchor":"bottom", "toAnchor":"top" },
    { "from":"dec",   "to":"end", "fromAnchor":"bottom", "toAnchor":"top", "label":"Ya" }
  ],
  "labels": [
    { "x":200, "y":16, "text":"Alur Penelitian", "fontSize":15, "bold":true, "color":"#1E3A5F" }
  ]
}`,
      inputSchema: {
        type: 'object',
        required: ['output_path', 'config'],
        properties: {
          output_path: {
            type: 'string',
            description: 'Direktori tempat menyimpan file PNG hasil diagram.',
          },
          filename: {
            type: 'string',
            description: 'Nama file output, mis. "crisp_dm.png". Default: "diagram.png".',
          },
          config: {
            type: 'object',
            description: 'Konfigurasi diagram. Lihat deskripsi tool untuk schema lengkap.',
            properties: {
              canvas:      { type: 'object'  },
              shapes:      { type: 'array'   },
              connections: { type: 'array'   },
              labels:      { type: 'array'   },
            },
          },
        },
      },
    },
    {
      name: 'export_html',
      description:
        'Mengkonversi file .docx menjadi .html menggunakan mammoth, lengkap dengan CSS ' +
        'yang menyerupai tampilan halaman Word (A4, margin skripsi, TNR 12pt, spasi 2). ' +
        'Digunakan untuk preview di Claude Code: setelah tool ini berhasil, ' +
        'panggil mcp__Claude_Preview__preview_start dengan url = html_path yang dikembalikan, ' +
        'lalu panggil mcp__Claude_Preview__preview_screenshot untuk melihat hasilnya.',
      inputSchema: {
        type: 'object',
        required: ['filename', 'output_path'],
        properties: {
          filename: {
            type: 'string',
            description: 'Nama file .docx sumber, contoh: BAB_I.docx',
          },
          output_path: {
            type: 'string',
            description: 'Direktori tempat .docx berada (HTML akan disimpan di direktori yang sama).',
          },
        },
      },
    },
    {
      name: 'preview_docx',
      description:
        'Mengkonversi file .docx hasil create_docx menjadi .pdf menggunakan Microsoft Word, ' +
        'lalu kembalikan path PDF agar dapat ditampilkan dengan pdf-viewer. ' +
        'PENTING: setelah tool ini berhasil, segera panggil mcp__pdf-viewer__display_pdf ' +
        'dengan url = pdf_path yang dikembalikan.',
      inputSchema: {
        type: 'object',
        required: ['filename', 'output_path'],
        properties: {
          filename: {
            type: 'string',
            description: 'Nama file .docx yang akan dikonversi, contoh: BAB_I.docx',
          },
          output_path: {
            type: 'string',
            description: 'Direktori tempat file .docx berada (dan PDF akan disimpan di sini juga).',
          },
        },
      },
    },

    // ── extract_text_to_word ─────────────────────────────────────
    {
      name: 'extract_text_to_word',
      description:
        'Mengekstrak teks dari file PDF hasil scan (CamScanner, scanner, dll.) menggunakan OCR Tesseract.js ' +
        'dan menyimpannya ke file .docx. Mendukung bahasa Indonesia (ind) dan Arab (ara). ' +
        'Bisa memproses satu PDF maupun banyak PDF sekaligus (batch). ' +
        'Strategi dua tahap: coba ambil teks digital dulu, jika gagal baru OCR gambar.',
      inputSchema: {
        type: 'object',
        required: ['pdf_path', 'output_path'],
        properties: {
          pdf_path: {
            oneOf: [
              { type: 'string', description: 'Path ke satu file PDF.' },
              { type: 'array', items: { type: 'string' }, description: 'Array path ke beberapa file PDF (batch).' },
            ],
            description:
              'Path absolut ke file PDF, atau array path untuk proses beberapa PDF sekaligus. ' +
              'Contoh tunggal: "C:/Users/arips/Dokumen/scan1.pdf" ' +
              'Contoh batch: ["C:/scan1.pdf", "C:/scan2.pdf"]',
          },
          output_path: {
            type: 'string',
            description:
              'Direktori tempat menyimpan file .docx hasil OCR. ' +
              'Contoh: "C:/Users/arips/Dokumen/hasil_ocr"',
          },
          language: {
            type: 'string',
            default: 'ind+ara',
            description:
              'Bahasa OCR Tesseract. Gunakan + untuk gabungan bahasa. ' +
              'Contoh: "ind" (Indonesia saja), "ara" (Arab saja), "ind+ara" (keduanya). ' +
              'Default: "ind+ara"',
          },
          scale: {
            type: 'number',
            default: 2.0,
            description:
              'Skala rendering halaman PDF ke gambar sebelum OCR. ' +
              'Lebih tinggi = lebih akurat tapi lebih lambat. Range: 1.0–4.0. Default: 2.0',
          },
          output_filename: {
            type: 'string',
            description:
              'Nama file .docx output (tanpa ekstensi). Jika tidak diisi, ' +
              'nama file mengikuti nama PDF dengan suffix "_OCR". ' +
              'Hanya berlaku untuk mode satu PDF.',
          },
          force_ocr: {
            type: 'boolean',
            default: false,
            description:
              'Jika true, paksa OCR meski PDF sudah punya teks digital. ' +
              'Gunakan jika teks digital hasil ekstraksi berantakan.',
          },
          tess_data_path: {
            type: 'string',
            description:
              'Opsional. Path ke folder tessdata lokal untuk mode offline. ' +
              'Jika tidak diisi, Tesseract.js mengunduh data bahasa dari internet.',
          },
        },
      },
    },
  ];

module.exports = { TOOL_DEFINITIONS };
