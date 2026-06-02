const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');
const { TNR, SZ } = require('../layout');

// ─── Builder Table ────────────────────────────────────────────
function buildTable(item) {
  const headers = item.headers ?? [];
  const rows    = item.rows    ?? [];

  const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  const makeCell = (text, bold = false) =>
    new TableCell({
      borders: cellBorders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { line: 240, lineRule: 'auto', before: 0, after: 0 },
          children:  [new TextRun({ text: String(text ?? ''), font: TNR, size: SZ, bold })],
        }),
      ],
    });

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
