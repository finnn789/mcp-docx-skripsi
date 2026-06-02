#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { Packer } = require('docx');
const fs   = require('fs');
const path = require('path');

const { extractPdfToWord, extractMultiplePdfsToWord } = require('./extract_text_to_word');
const { generateDiagram }                            = require('./diagram_generator');
const { buildDocument }                              = require('./lib/builders/document');
const { convertDocxToPdf }                           = require('./lib/converters/pdf');
const { convertDocxToHtml }                          = require('./lib/converters/html');
const { TOOL_DEFINITIONS }                           = require('./lib/schemas/tools');

// ─── MCP Server ───────────────────────────────────────────────
const server = new Server(
  { name: 'mcp-docx-skripsi', version: '2.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFINITIONS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── generate_diagram ─────────────────────────────────────────
  if (name === 'generate_diagram') {
    const { output_path, filename = 'diagram.png', config } = args;
    if (!output_path) throw new Error('Parameter wajib: output_path');
    if (!config)      throw new Error('Parameter wajib: config');

    const pngPath = generateDiagram(config, output_path, filename);

    return {
      content: [{
        type: 'text',
        text:
          `Diagram berhasil dibuat: ${pngPath}\n\n` +
          `Gunakan di create_docx:\n` +
          `  { "type": "image", "path": "${pngPath}", "width": ${config.canvas?.width ?? 400}, "height": ${config.canvas?.height ?? 300} }\n` +
          `  { "type": "figure_caption", "text": "Gambar X.Y Judul Gambar" }`,
      }],
    };
  }

  // ── export_html ──────────────────────────────────────────────
  if (name === 'export_html') {
    const { filename, output_path } = args;
    if (!filename || !output_path)
      throw new Error('Parameter wajib: filename, output_path.');

    const docxPath = path.join(output_path, filename);
    if (!fs.existsSync(docxPath))
      throw new Error(`File tidak ditemukan: ${docxPath}`);

    const htmlPath = await convertDocxToHtml(docxPath, output_path);

    return {
      content: [
        {
          type: 'text',
          text:
            `HTML berhasil dibuat: ${htmlPath}\n\n` +
            `Untuk preview di Claude Code:\n` +
            `1. Panggil mcp__Claude_Preview__preview_start dengan url = "${htmlPath}"\n` +
            `2. Panggil mcp__Claude_Preview__preview_screenshot untuk melihat hasilnya.`,
        },
      ],
    };
  }

  // ── preview_docx ─────────────────────────────────────────────
  if (name === 'preview_docx') {
    const { filename, output_path } = args;
    if (!filename || !output_path)
      throw new Error('Parameter wajib: filename, output_path.');

    const docxPath = path.join(output_path, filename);
    if (!fs.existsSync(docxPath))
      throw new Error(`File tidak ditemukan: ${docxPath}`);

    const pdfPath = convertDocxToPdf(docxPath, output_path);

    return {
      content: [
        {
          type: 'text',
          text:
            `Konversi berhasil.\npdf_path: ${pdfPath}\n\n` +
            `Sekarang panggil pdf-viewer display_pdf dengan url = "${pdfPath}"`,
        },
      ],
    };
  }

  // ── extract_text_to_word ──────────────────────────────────────
  if (name === 'extract_text_to_word') {
    const {
      pdf_path,
      output_path,
      language        = 'ind+ara',
      scale           = 2.0,
      output_filename = null,
      force_ocr       = false,
      tess_data_path  = null,
    } = args;

    if (!pdf_path)    throw new Error('Parameter wajib: pdf_path');
    if (!output_path) throw new Error('Parameter wajib: output_path');

    const ocrOptions = {
      language,
      scale,
      forceOcr:       force_ocr,
      tessDataPath:   tess_data_path,
      outputFilename: output_filename,
    };

    // ── Mode batch (array PDF) ────────────────────────────────────
    if (Array.isArray(pdf_path)) {
      const results = await extractMultiplePdfsToWord(pdf_path, output_path, ocrOptions);

      const sukses  = results.filter(r => r.success);
      const gagal   = results.filter(r => !r.success);

      const lines = [
        `✅ Batch OCR selesai: ${sukses.length} berhasil, ${gagal.length} gagal.`,
        '',
        '📄 Hasil per file:',
        ...sukses.map(r =>
          `  ✔ ${path.basename(r.pdf)} → ${path.basename(r.output_file)}\n` +
          `     Halaman: ${r.pages} | Karakter: ${r.total_chars} | ` +
          `Digital: ${r.digital_pages} hal. | OCR: ${r.ocr_pages} hal.`
        ),
        ...(gagal.length ? ['', '❌ Gagal:', ...gagal.map(r => `  ✘ ${path.basename(r.pdf)}: ${r.error}`)] : []),
        '',
        `📁 Semua file disimpan di: ${output_path}`,
      ];

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }

    // ── Mode tunggal (satu PDF) ───────────────────────────────────
    const result = await extractPdfToWord(pdf_path, output_path, ocrOptions);

    const statsLines = result.stats.map(s =>
      `  Hal. ${String(s.page).padStart(3)}: ${s.method === 'ocr' ? '🔍 OCR' : '📝 Digital'} — ${s.chars} karakter`
    ).join('\n');

    const summary = [
      `✅ Ekstraksi OCR berhasil!`,
      ``,
      `📄 File output : ${result.output_file}`,
      `📖 Jumlah halaman : ${result.pages}`,
      `📊 Total karakter : ${result.total_chars}`,
      `📝 Halaman digital : ${result.digital_pages}`,
      `🔍 Halaman di-OCR : ${result.ocr_pages}`,
      ``,
      `📋 Detail per halaman:`,
      statsLines,
    ].join('\n');

    return { content: [{ type: 'text', text: summary }] };
  }

  if (name !== 'create_docx') throw new Error(`Tool tidak dikenal: ${name}`);

  const { filename, output_path, children } = args;
  if (!filename || !output_path || !Array.isArray(children))
    throw new Error('Parameter wajib: filename, output_path, children (array).');

  const doc    = buildDocument(children);
  const buffer = await Packer.toBuffer(doc);
  const dest   = path.join(output_path, filename);

  fs.mkdirSync(output_path, { recursive: true });
  fs.writeFileSync(dest, buffer);

  return {
    content: [{ type: 'text', text: `Dokumen berhasil dibuat: ${dest}` }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp-docx-skripsi] Server berjalan via stdio');
}

main().catch((err) => {
  console.error('[mcp-docx-skripsi] Fatal error:', err);
  process.exit(1);
});
