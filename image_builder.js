'use strict';

const { Paragraph, ImageRun, TextRun, AlignmentType } = require('docx');
const fs   = require('fs');
const path = require('path');

const TNR = 'Times New Roman';
const SZ  = 24; // 12 pt

const ALIGN_MAP = {
  center: AlignmentType.CENTER,
  left:   AlignmentType.LEFT,
  right:  AlignmentType.RIGHT,
};

/**
 * Membuat Paragraph berisi gambar (ImageRun) dari file PNG/JPG/GIF.
 *
 * @param {string} imagePath  - path absolut ke file gambar
 * @param {object} opts
 * @param {number} opts.width       - lebar gambar dalam piksel (default 400)
 * @param {number} opts.height      - tinggi gambar dalam piksel (default 300)
 * @param {string} opts.alignment   - 'center' | 'left' | 'right' (default 'center')
 * @returns {Paragraph}
 */
function buildImageParagraph(imagePath, opts = {}) {
  const { width = 400, height = 300, alignment = 'center' } = opts;

  const ext  = path.extname(imagePath).toLowerCase().replace('.', '') || 'png';
  const type = ['jpg', 'jpeg'].includes(ext) ? 'jpg'
             : ext === 'gif'                 ? 'gif'
             :                                 'png';

  const data  = fs.readFileSync(imagePath);
  const align = ALIGN_MAP[alignment.toLowerCase()] ?? AlignmentType.CENTER;

  return new Paragraph({
    alignment: align,
    spacing:   { line: 240, lineRule: 'auto', before: 200, after: 80 },
    children:  [
      new ImageRun({ type, data, transformation: { width, height } }),
    ],
  });
}

/**
 * Membuat Paragraph caption gambar, mis. "Gambar 2.1 Siklus CRISP-DM".
 * Format: bold italic, center, TNR 12 pt.
 *
 * @param {string} text - teks caption lengkap
 * @returns {Paragraph}
 */
function buildFigureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:   { line: 240, lineRule: 'auto', before: 40, after: 280 },
    children:  [
      new TextRun({ text, font: TNR, size: SZ, bold: true, italics: true }),
    ],
  });
}

module.exports = { buildImageParagraph, buildFigureCaption };
