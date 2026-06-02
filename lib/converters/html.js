const fs      = require('fs');
const path    = require('path');
const mammoth = require('mammoth');

// ─── Konversi .docx → .html via Mammoth ──────────────────────
async function convertDocxToHtml(docxPath, outputDir) {
  const result      = await mammoth.convertToHtml({ path: docxPath });
  const htmlFilename = path.basename(docxPath, '.docx') + '.html';
  const htmlPath    = path.join(outputDir, htmlFilename);

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#525659;font-family:'Times New Roman',serif;padding:24px}
    .page-wrap{display:flex;flex-direction:column;align-items:center;gap:24px}
    .page{
      background:#fff;width:21cm;min-height:29.7cm;
      padding:3cm 3cm 3cm 4cm;
      box-shadow:0 2px 10px rgba(0,0,0,.45);
      font-size:12pt;line-height:2;color:#000;
    }
    p{text-align:justify;text-indent:1.25cm;margin-bottom:0}
    p+p{margin-top:0}
    h1,h2,h3{
      font-size:12pt;font-weight:bold;line-height:2;
      text-transform:uppercase;text-align:center;
      margin:0 0 .5em 0;
    }
    h2{text-align:left;text-transform:none;margin-top:1em}
    h3{text-align:left;text-transform:none;margin-top:.5em;text-indent:1.25cm}
    strong{font-weight:bold}
    em{font-style:italic}
    table{border-collapse:collapse;width:100%;margin:1em 0}
    td,th{border:1px solid #000;padding:4px 8px;font-size:12pt}
  `;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Preview — ${path.basename(docxPath, '.docx')}</title>
  <style>${css}</style>
</head>
<body>
  <div class="page-wrap">
    <div class="page">${result.value}</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, { encoding: 'utf-8' });
  return htmlPath;
}

module.exports = { convertDocxToHtml };
