const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun } = require('docx');
const fs   = require('fs');
const path = require('path');
const { TNR, SZ } = require('../layout');

// ─── Builder Table ────────────────────────────────────────────
function buildTable(item) {
  const headers = item.headers ?? [];
  const rows    = item.rows    ?? [];

  const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  const ALIGN_MAP = {
    center: AlignmentType.CENTER,
    left:   AlignmentType.LEFT,
    right:  AlignmentType.RIGHT,
  };

  const makeCell = (content, bold = false) => {
    let paragraph;

    if (content !== null && typeof content === 'object' && content.type === 'image') {
      const imgPath = content.path ?? '';
      const width   = content.width  ?? 150;
      const height  = content.height ?? 100;
      const align   = ALIGN_MAP[content.alignment ?? 'center'] ?? AlignmentType.CENTER;
      const ext     = path.extname(imgPath).toLowerCase().replace('.', '') || 'png';
      const imgType = ['jpg', 'jpeg'].includes(ext) ? 'jpg' : ext === 'gif' ? 'gif' : 'png';
      const data    = fs.readFileSync(imgPath);

      paragraph = new Paragraph({
        alignment: align,
        spacing:   { line: 240, lineRule: 'auto', before: 0, after: 0 },
        children:  [new ImageRun({ type: imgType, data, transformation: { width, height } })],
      });
    } else {
      paragraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:   { line: 240, lineRule: 'auto', before: 0, after: 0 },
        children:  [new TextRun({ text: String(content ?? ''), font: TNR, size: SZ, bold })],
      });
    }

    return new TableCell({
      borders: cellBorders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [paragraph],
    });
  };

  const tableRows = [];

  if (headers.length) {
    tableRows.push(new TableRow({
      tableHeader: true,
      children: headers.map(h => makeCell(h, true)),
    }));
  }

  for (const row of rows) {
    tableRows.push(new TableRow({
      children: (Array.isArray(row) ? row : [row]).map(cell => makeCell(cell)),
    }));
  }

  const tbl = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows:  tableRows,
  });

  // Jika ada caption, kembalikan array [caption_para, tabel]
  if (item.caption) {
    const caption = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { line: 480, lineRule: 'auto', before: 200, after: 100 },
      children:  [new TextRun({ text: item.caption, font: TNR, size: SZ, bold: true })],
    });
    return [caption, tbl];
  }

  return tbl;
}

module.exports = { buildTable };
