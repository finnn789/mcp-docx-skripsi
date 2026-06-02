const { Paragraph, TextRun, AlignmentType, PageBreak } = require('docx');
const { INDENT, TNR, SZ, DS, DSG, SS } = require('../layout');
const { buildRun } = require('./run');
const { buildImageParagraph, buildFigureCaption } = require('../../image_builder');

// ─── Builder Paragraph per type ──────────────────────────────
function buildParagraph(item) {
  switch (item.type) {

    // ── BABTITLE ─────────────────────────────────────────────
    // Gunakan last:true pada baris judul terakhir agar ada jarak ke sub-judul
    case 'bab_title':
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:   item.last
          ? { line: 480, lineRule: 'auto', before: 0, after: 480 }
          : { line: 480, lineRule: 'auto', before: 0, after: 0   },
        children: [new TextRun({ text: item.text ?? '', font: TNR, size: SZ, bold: true, allCaps: true })],
      });

    // ── SUB-JUDUL level 1  (mis. 2.1 / 3.2) ─────────────────
    case 'sub':
      return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing:   { line: 480, lineRule: 'auto', before: 400, after: 120 },
        children:  [new TextRun({ text: item.text ?? '', font: TNR, size: SZ, bold: true })],
      });

    // ── SUB-JUDUL level 2  (mis. 2.1.1) ─────────────────────
    case 'sub2':
      return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing:   { line: 480, lineRule: 'auto', before: 200, after: 80 },
        indent:    { firstLine: INDENT },
        children:  [new TextRun({ text: item.text ?? '', font: TNR, size: SZ, bold: true })],
      });

    // ── SUB-JUDUL level 3  (mis. 2.1.1.1) ───────────────────
    case 'sub3':
      return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing:   { line: 480, lineRule: 'auto', before: 120, after: 60 },
        indent:    { firstLine: INDENT * 2 },
        children:  [new TextRun({ text: item.text ?? '', font: TNR, size: SZ, bold: true })],
      });

    // ── PARAGRAF ISI ─────────────────────────────────────────
    // Gunakan "text" untuk teks polos, atau "runs" untuk mixed italic/bold
    // Gunakan noIndent:true untuk menghilangkan indent firstLine
    case 'paragraph': {
      const children = Array.isArray(item.runs) && item.runs.length
        ? item.runs.map(buildRun)
        : [new TextRun({
            text:    item.text   ?? '',
            font:    TNR,
            size:    SZ,
            bold:    item.bold   ?? false,
            italics: item.italic ?? false,
          })];
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent:    item.noIndent ? undefined : { firstLine: INDENT },
        spacing:   DSG,
        children,
      });
    }

    // ── DAFTAR BERNOMOR (1. teks ...) ────────────────────────
    case 'numbered':
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent:    { left: INDENT, hanging: INDENT },
        spacing:   DSG,
        children:  [new TextRun({ text: `${item.n}.\t${item.text ?? ''}`, font: TNR, size: SZ })],
      });

    // ── LABEL BOLD (mis. 1. Manfaat Praktis) ─────────────────
    case 'label':
      return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing:   { line: 480, lineRule: 'auto', before: 120, after: 0 },
        children:  [new TextRun({ text: `${item.n}.\t${item.text ?? ''}`, font: TNR, size: SZ, bold: true })],
      });

    // ── JUDUL SEKSI (DAFTAR PUSTAKA, ABSTRAK, dll.) ───────────
    case 'section_title':
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:   { line: 480, lineRule: 'auto', before: 0, after: 480 },
        children:  [new TextRun({ text: item.text ?? '', font: TNR, size: SZ, bold: true, allCaps: true })],
      });

    // ── ENTRI DAFTAR PUSTAKA ──────────────────────────────────
    case 'reference':
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent:    { left: INDENT, hanging: INDENT },
        spacing:   SS,
        children:  (item.runs ?? []).map(buildRun),
      });

    // ── PAGE BREAK ────────────────────────────────────────────
    case 'page_break':
      return new Paragraph({
        spacing:  DS,
        children: [new PageBreak()],
      });

    // ── BARIS KOSONG SPASI TUNGGAL ────────────────────────────
    case 'blank':
      return new Paragraph({
        spacing:  { line: 240, lineRule: 'auto', before: 0, after: 0 },
        children: [new TextRun({ text: '', font: TNR, size: SZ })],
      });

    // ── SPACER (spasi ganda) / fallback ──────────────────────
    case 'spacer':
    default:
      return new Paragraph({
        spacing:  DS,
        children: [new TextRun({ text: '', font: TNR, size: SZ })],
      });

    // ── GAMBAR dari file PNG/JPG ──────────────────────────────
    case 'image':
      return buildImageParagraph(item.path ?? '', {
        width:     item.width     ?? 400,
        height:    item.height    ?? 300,
        alignment: item.alignment ?? 'center',
      });

    // ── CAPTION GAMBAR (bold italic, center) ──────────────────
    case 'figure_caption':
      return buildFigureCaption(item.text ?? '');
  }
}

module.exports = { buildParagraph };
