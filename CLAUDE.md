# mcp-docx-skripsi — Instructor Instructions

Project: MCP server untuk generate dokumen skripsi .docx (Node.js).
Entry: index.js → lib/ (builders, converters, schemas).

## Executor Templates

Template berikut langsung siap pakai. Opus append `\n\nINPUT:\n<task spesifik>` lalu spawn.
Jangan menulis ulang template ini — baca sekali, pakai terus.

---

### T1: code-writer (model: sonnet)
```
Executor: tulis kode. Baca file yang disebut, tulis perubahan, lapor 1 baris.
Aturan: verbatim sesuai spec, tanpa komentar kecuali diminta, tanpa eksplorasi lain.
Output wajib: "DONE: <fungsi> di <file>:<baris>"
```

### T2: test-writer (model: haiku)
```
Executor: tulis unit test. Baca source file, tulis test file, lapor 1 baris.
Aturan: minimal 3 kasus (happy/edge/error), framework jest kecuali diminta lain.
Output wajib: "DONE: <N> tests di <test_file>"
```

### T3: refactor (model: haiku)
```
Executor: perubahan mekanis saja (rename, reorder, extract). Tanpa ubah logika.
Aturan: interpretasi paling konservatif jika ambigu.
Output wajib: "<file>: <N> perubahan" per baris, total di akhir.
```

### T4: reviewer (model: sonnet)
```
Executor: temukan bug nyata saja. Baca file yang disebut, lapor temuan.
Aturan: bukan style/preference, max 5 temuan, prioritas HIGH dulu.
Output wajib: "[HIGH/MED/LOW] <file>:<baris> — <masalah>" atau "BERSIH"
```

### T5: doc-writer (model: haiku)
```
Executor: tulis JSDoc/komentar untuk fungsi yang disebut. Tanpa ubah kode.
Aturan: 1 baris deskripsi + @param + @returns, bahasa Indonesia.
Output wajib: "DONE: JSDoc ditulis untuk <N> fungsi di <file>"
```

---

## Cara Opus memanggil (copy-paste pattern)

```javascript
// Task tunggal:
Agent({
  model: "sonnet",            // atau "haiku" untuk task mekanis
  description: "<3 kata>",
  prompt: `${T1}\n\nINPUT:\nfile: lib/builders/run.js\nspec: tambah fungsi buildRunBold(text)`
})

// Task paralel (kirim dalam 1 pesan, tidak ada dependensi):
Agent({ model:"haiku", prompt:`${T2}\n\nINPUT:\nsource: lib/builders/run.js\nfunction: buildRun\ntest_file: tests/run.test.js` })
Agent({ model:"haiku", prompt:`${T4}\n\nINPUT:\nfiles: lib/converters/pdf.js` })
```

**Aturan paralel:** task independen → spawn bersamaan dalam 1 message.  
**Aturan sequential:** task B butuh output task A → spawn A dulu, tunggu, baru spawn B.
