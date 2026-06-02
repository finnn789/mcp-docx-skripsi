'use strict';

/**
 * extract_text_to_word.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Modul OCR: Mengekstrak teks dari file PDF (termasuk hasil scan CamScanner)
 * menggunakan Tesseract.js, lalu menyimpan hasilnya ke file .docx
 *
 * Kompatibel dengan:
 *   - pdfjs-dist  v4.x / v5.x
 *   - tesseract.js v5.x / v6.x / v7.x
 *   - canvas       v2.x / v3.x
 *
 * Strategi dua tahap:
 *   1. Coba ekstrak teks digital (beberapa CamScanner PDF sudah punya teks)
 *   2. Jika tidak ada, render halaman → gambar → OCR Tesseract.js
 *
 * Dependensi (install dulu):
 *   npm install tesseract.js pdfjs-dist canvas
 *
 * Ekspor:
 *   extractPdfToWord(pdfPath, outputDir, options)          → 1 PDF  → 1 .docx
 *   extractMultiplePdfsToWord(pdfPaths, outputDir, options) → N PDFs → N .docx
 * ──────────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ─── Konstanta margin Word (EMU: 1 inch = 914400 EMU = 2.54 cm) ──────────────
const EMU_PER_CM   = 914400 / 2.54;
const MARGIN_LEFT  = Math.round(4 * EMU_PER_CM);   // 4 cm kiri
const MARGIN_OTHER = Math.round(3 * EMU_PER_CM);   // 3 cm lainnya

// ─── Lazy-load pdfjs-dist (kompatibel v4 & v5) ───────────────────────────────
let _pdfjsLib = null;

function getPdfjsLib() {
  if (_pdfjsLib) return _pdfjsLib;

  let lib;
  try {
    // Coba legacy build (pdfjs-dist v4)
    lib = require('pdfjs-dist/legacy/build/pdf.js');
  } catch {
    try {
      // pdfjs-dist v5 → gunakan entry point utama
      lib = require('pdfjs-dist');
    } catch {
      throw new Error(
        'pdfjs-dist tidak ditemukan.\nJalankan: npm install pdfjs-dist'
      );
    }
  }

  // Matikan web worker (Node.js tidak punya Worker API standar browser)
  if (lib.GlobalWorkerOptions) {
    lib.GlobalWorkerOptions.workerSrc = '';
  }

  _pdfjsLib = lib;
  return lib;
}

// ─── Render halaman PDF → Buffer PNG ─────────────────────────────────────────
/**
 * Render satu halaman PDF menjadi buffer gambar PNG.
 * Membutuhkan package `canvas`.
 *
 * @param {import('pdfjs-dist').PDFPageProxy} page
 * @param {number} scale   Skala rendering (2 = resolusi 2×)
 * @returns {Promise<Buffer>}
 */
async function renderPageToImage(page, scale = 2.0) {
  let createCanvas;
  try {
    ({ createCanvas } = require('canvas'));
  } catch {
    throw new Error(
      'Package canvas tidak ditemukan.\n' +
      'Jalankan: npm install canvas\n' +
      'Jika gagal kompilasi, install Visual Studio Build Tools 2022 dulu.'
    );
  }

  const viewport = page.getViewport({ scale });
  const canvas   = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx      = canvas.getContext('2d');

  // pdfjs-dist perlu NodeCanvasFactory agar bisa render di Node.js
  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;

  return canvas.toBuffer('image/png');
}

// ─── OCR satu buffer gambar dengan Tesseract.js ───────────────────────────────
/**
 * Jalankan OCR pada buffer gambar.
 * Bahasa diunduh otomatis dari CDN jika belum tersedia.
 *
 * @param {Buffer} imageBuffer
 * @param {string} language       Mis. 'ind+ara', 'ind', 'ara'
 * @param {string} [tessDataPath] Path folder tessdata lokal (opsional)
 * @returns {Promise<string>}
 */
async function ocrImageBuffer(imageBuffer, language, tessDataPath) {
  let createWorker;
  try {
    ({ createWorker } = require('tesseract.js'));
  } catch {
    throw new Error(
      'tesseract.js tidak ditemukan.\nJalankan: npm install tesseract.js'
    );
  }

  // tesseract.js v5+ menerima array bahasa
  const langs = language.split('+').filter(Boolean);

  const workerOpts = {
    // Matikan logger bawaan agar tidak flood stderr
    logger: () => {},
  };
  if (tessDataPath && fs.existsSync(tessDataPath)) {
    workerOpts.langPath = tessDataPath;
  }

  const worker = await createWorker(langs, 1, workerOpts);
  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

// ─── Ekstrak teks dari satu halaman (digital dulu, OCR jika perlu) ────────────
/**
 * @param {import('pdfjs-dist').PDFPageProxy} page
 * @param {number}  pageNum
 * @param {string}  language
 * @param {number}  scale
 * @param {string}  [tessDataPath]
 * @param {boolean} forceOcr
 * @returns {Promise<{text:string, method:'digital'|'ocr'}>}
 */
async function extractPageText(page, pageNum, language, scale, tessDataPath, forceOcr) {
  // ── Tahap 1: coba teks digital ────────────────────────────────────────────
  if (!forceOcr) {
    const textContent = await page.getTextContent();
    const digitalText = textContent.items
      .map(item => (item.str || ''))
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (digitalText.length >= 30) {
      return { text: digitalText, method: 'digital' };
    }
    process.stderr.write(
      `[OCR] Hal. ${pageNum}: teks digital tipis (${digitalText.length} kar), alihkan ke OCR...\n`
    );
  }

  // ── Tahap 2: render → OCR ────────────────────────────────────────────────
  const imageBuffer = await renderPageToImage(page, scale);
  const ocrText     = await ocrImageBuffer(imageBuffer, language, tessDataPath);

  return { text: ocrText.trim(), method: 'ocr' };
}

// ─── Builder: Array Paragraph untuk satu halaman ─────────────────────────────
/**
 * @param {number} pageNum
 * @param {string} pageText
 * @param {'digital'|'ocr'} method
 * @param {{Paragraph:any, TextRun:any, AlignmentType:any}} T  docx types
 * @returns {import('docx').Paragraph[]}
 */
function buildDocxParagraphs(pageNum, pageText, method, T) {
  const { Paragraph, TextRun, AlignmentType } = T;
  const paras = [];

  // Header halaman
  paras.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing:   { before: 480, after: 240 },
    children:  [new TextRun({
      text:  `❖  Halaman ${pageNum}  [${method === 'ocr' ? 'OCR Tesseract' : 'Teks Digital'}]`,
      bold:  true,
      font:  'Times New Roman',
      size:  22,
      color: '2F4F8F',
    })],
  }));

  // Teks per baris
  for (const line of pageText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      paras.push(new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: '', font: 'Times New Roman', size: 24 })],
      }));
    } else {
      paras.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing:   { before: 0, after: 120 },
        children:  [new TextRun({ text: trimmed, font: 'Times New Roman', size: 24 })],
      }));
    }
  }

  // Garis pemisah
  paras.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:   { before: 240, after: 120 },
    children:  [new TextRun({ text: '─'.repeat(50), font: 'Courier New', size: 16, color: 'CCCCCC' })],
  }));

  return paras;
}

// ─── FUNGSI UTAMA: 1 PDF → 1 .docx ───────────────────────────────────────────
/**
 * Ekstrak teks dari satu file PDF dan simpan ke .docx.
 *
 * @param {string} pdfPath       Path absolut ke file PDF
 * @param {string} outputDir     Direktori untuk menyimpan .docx hasil
 * @param {object} [options]
 * @param {string}  [options.language='ind+ara']   Bahasa OCR Tesseract
 * @param {number}  [options.scale=2.0]            Skala render (1–4)
 * @param {string}  [options.outputFilename]       Nama output tanpa ekstensi
 * @param {string}  [options.tessDataPath]         Path tessdata lokal (opsional)
 * @param {boolean} [options.forceOcr=false]       Paksa OCR meski ada teks digital
 * @returns {Promise<{success,output_file,pages,total_chars,digital_pages,ocr_pages,stats}>}
 */
async function extractPdfToWord(pdfPath, outputDir, options = {}) {
  const {
    language       = 'ind+ara',
    scale          = 2.0,
    outputFilename = null,
    tessDataPath   = null,
    forceOcr       = false,
  } = options;

  // Validasi input
  if (!pdfPath)   throw new Error('pdfPath wajib diisi.');
  if (!outputDir) throw new Error('outputDir wajib diisi.');
  if (!fs.existsSync(pdfPath))
    throw new Error(`File PDF tidak ditemukan: ${pdfPath}`);

  const pdfjsLib = getPdfjsLib();

  // Load PDF
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc   = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  const numPages = pdfDoc.numPages;

  process.stderr.write(
    `[OCR] Mulai: "${path.basename(pdfPath)}" — ${numPages} halaman, bahasa: ${language}\n`
  );

  // Siapkan docx types
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
  const T = { Paragraph, TextRun, AlignmentType };

  // Cover dokumen
  const allParas = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 240 },
      children:  [new TextRun({ text: 'Hasil Ekstraksi OCR', bold: true, font: 'Times New Roman', size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 120 },
      children:  [new TextRun({ text: `Sumber: ${path.basename(pdfPath)}`, font: 'Times New Roman', size: 24, color: '555555' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { before: 0, after: 480 },
      children:  [new TextRun({
        text:  `Bahasa: ${language}  |  ${numPages} halaman  |  Tesseract.js`,
        font:  'Times New Roman', size: 20, color: '888888',
      })],
    }),
  ];

  // Proses tiap halaman
  const pageStats = [];

  for (let i = 1; i <= numPages; i++) {
    process.stderr.write(`[OCR] Memproses halaman ${i}/${numPages}...\n`);

    const page = await pdfDoc.getPage(i);
    const { text, method } = await extractPageText(page, i, language, scale, tessDataPath, forceOcr);

    pageStats.push({ page: i, method, chars: text.length });
    allParas.push(...buildDocxParagraphs(i, text, method, T));
  }

  // Buat dokumen Word
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top:    MARGIN_OTHER,
            right:  MARGIN_OTHER,
            bottom: MARGIN_OTHER,
            left:   MARGIN_LEFT,
          },
        },
      },
      children: allParas,
    }],
  });

  // Simpan file
  const baseName = outputFilename || `${path.basename(pdfPath, path.extname(pdfPath))}_OCR`;
  const outFile  = path.join(outputDir, `${baseName}.docx`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outFile, await Packer.toBuffer(doc));

  const totalChars  = pageStats.reduce((s, p) => s + p.chars, 0);
  const ocrPages    = pageStats.filter(p => p.method === 'ocr').length;
  const digPages    = pageStats.filter(p => p.method === 'digital').length;

  process.stderr.write(`[OCR] Selesai → ${outFile}  (digital: ${digPages}, OCR: ${ocrPages}, kar: ${totalChars})\n`);

  return {
    success:       true,
    output_file:   outFile,
    pages:         numPages,
    total_chars:   totalChars,
    digital_pages: digPages,
    ocr_pages:     ocrPages,
    stats:         pageStats,
  };
}

// ─── FUNGSI BATCH: N PDF → N .docx ───────────────────────────────────────────
/**
 * Ekstrak teks dari beberapa file PDF sekaligus.
 *
 * @param {string[]} pdfPaths   Array path ke file PDF
 * @param {string}   outputDir  Direktori output
 * @param {object}   [options]  Sama dengan extractPdfToWord
 * @returns {Promise<Array<{pdf,success,...}>>}
 */
async function extractMultiplePdfsToWord(pdfPaths, outputDir, options = {}) {
  if (!Array.isArray(pdfPaths) || pdfPaths.length === 0)
    throw new Error('pdfPaths harus berupa array yang tidak kosong.');

  const results = [];

  for (const pdfPath of pdfPaths) {
    process.stderr.write(`\n${'='.repeat(60)}\n[BATCH] File: ${path.basename(pdfPath)}\n${'='.repeat(60)}\n`);
    try {
      const result = await extractPdfToWord(pdfPath, outputDir, options);
      results.push({ pdf: pdfPath, ...result });
    } catch (err) {
      process.stderr.write(`[BATCH] ERROR: ${err.message}\n`);
      results.push({ pdf: pdfPath, success: false, error: err.message });
    }
  }

  return results;
}

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
  extractPdfToWord,
  extractMultiplePdfsToWord,
};
