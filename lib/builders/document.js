const { Document } = require('docx');
const { TNR, SZ, DSG, mOther, mLeft } = require('../layout');
const { buildParagraph } = require('./paragraph');
const { buildTable } = require('./table');

// ─── Buat dokumen Word ────────────────────────────────────────
function buildDocument(children) {
  return new Document({
    styles: {
      default: {
        document: {
          run:       { font: TNR, size: SZ },
          paragraph: { spacing: DSG },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size:   { width: 11906, height: 16838 },
            margin: { top: mOther, right: mOther, bottom: mOther, left: mLeft },
          },
        },
        children: children.flatMap(item =>
          item.type === 'table' ? buildTable(item) : buildParagraph(item)
        ),
      },
    ],
  });
}

module.exports = { buildDocument };
