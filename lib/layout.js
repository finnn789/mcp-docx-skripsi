// ─── Konstanta layout skripsi ────────────────────────────────
const CM     = 566.93;
const mLeft  = Math.round(4    * CM); // 4 cm kiri
const mOther = Math.round(3    * CM); // 3 cm atas/kanan/bawah
const INDENT = Math.round(1.25 * CM); // indent firstLine / hanging

const TNR = 'Times New Roman';
const SZ  = 24; // 12pt

// Spacing presets
const DS  = { line: 480, lineRule: 'auto', before: 0, after: 0   }; // double, tanpa after
const DSG = { line: 480, lineRule: 'auto', before: 0, after: 180 }; // double, gutter antar paragraf
const SS  = { line: 240, lineRule: 'auto', before: 0, after: 160 }; // single (daftar pustaka)

module.exports = { CM, mLeft, mOther, INDENT, TNR, SZ, DS, DSG, SS };
