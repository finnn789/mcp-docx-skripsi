const { TNR, SZ } = require('../layout');
const { TextRun } = require('docx');

// ─── Builder TextRun ─────────────────────────────────────────
function buildRun(r) {
  return new TextRun({
    text:    r.text    ?? '',
    font:    TNR,
    size:    SZ,
    bold:    r.bold    ?? false,
    italics: r.italic  ?? false,
    allCaps: r.allCaps ?? false,
  });
}

module.exports = { buildRun };
