const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const { execSync }  = require('child_process');

// ─── Konversi .docx → .pdf via Microsoft Word COM (PowerShell) ──
function convertDocxToPdf(docxPath, outputDir) {
  const pdfPath   = path.join(outputDir, path.basename(docxPath, '.docx') + '.pdf');
  const tmpScript = path.join(os.tmpdir(), 'mcp_docx2pdf.ps1');

  // wdFormatPDF = 17
  const ps = `
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
  $doc = $word.Documents.Open('${docxPath.replace(/'/g, "''")}')
  $doc.SaveAs('${pdfPath.replace(/'/g, "''")}', 17)
  $doc.Close($false)
} finally {
  $word.Quit()
}
Write-Output '${pdfPath.replace(/'/g, "''")}'
`.trim();

  fs.writeFileSync(tmpScript, ps, { encoding: 'utf8' });

  try {
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpScript}"`,
      { encoding: 'utf8', timeout: 60000 },
    );
  } finally {
    try { fs.unlinkSync(tmpScript); } catch (_) {}
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Konversi gagal: file PDF tidak ditemukan di ${pdfPath}`);
  }

  return pdfPath;
}

module.exports = { convertDocxToPdf };
