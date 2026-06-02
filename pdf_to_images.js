'use strict';

const fs   = require('fs');
const path = require('path');

async function pdfToImages(pdfPath, outputDir, scale = 2.0) {
  // Load pdfjs legacy (CommonJS)
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const { createCanvas } = require('canvas');

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc   = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  const numPages = pdfDoc.numPages;

  fs.mkdirSync(outputDir, { recursive: true });

  const files = [];

  for (let i = 1; i <= numPages; i++) {
    process.stderr.write(`Rendering halaman ${i}/${numPages}...\n`);
    const page     = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas   = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx      = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const outFile = path.join(outputDir, `page_${String(i).padStart(3,'0')}.png`);
    fs.writeFileSync(outFile, canvas.toBuffer('image/png'));
    files.push(outFile);
  }

  console.log(JSON.stringify({ numPages, files }));
}

const [,, pdfPath, outputDir, scale] = process.argv;
pdfToImages(pdfPath, outputDir, parseFloat(scale) || 2.0).catch(e => {
  process.stderr.write('ERROR: ' + e.message + '\n');
  process.exit(1);
});
