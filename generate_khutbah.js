'use strict';

const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, HeadingLevel, BorderStyle,
  ShadingType, TableRow, TableCell, Table,
  WidthType, convertInchesToTwip
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ── Margin skripsi (EMU) ─────────────────────────────────────────
const CM = 914400 / 2.54;
const MARGIN = {
  top:    Math.round(3 * CM),
  right:  Math.round(3 * CM),
  bottom: Math.round(3 * CM),
  left:   Math.round(4 * CM),
};

// ── Helper paragraf ──────────────────────────────────────────────
const p = (text, opts = {}) => new Paragraph({
  alignment: opts.center  ? AlignmentType.CENTER
           : opts.right   ? AlignmentType.RIGHT
           : AlignmentType.JUSTIFIED,
  spacing:   { before: opts.before ?? 0, after: opts.after ?? 200, line: opts.line ?? 480 },
  indent:    opts.noIndent ? {} : (opts.hanging ? { hanging: 720 } : { firstLine: 709 }),
  children:  typeof text === 'string'
    ? [new TextRun({
        text,
        font:   opts.font  ?? 'Times New Roman',
        size:   opts.size  ?? 24,
        bold:   opts.bold  ?? false,
        italic: opts.italic ?? false,
        color:  opts.color ?? '000000',
      })]
    : text,   // array of TextRun
});

// Judul bab
const babTitle = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing:   { before: 0, after: 240, line: 480 },
  children:  [new TextRun({ text, font: 'Times New Roman', size: 28, bold: true })],
});

// Sub judul
const subTitle = (text) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing:   { before: 400, after: 160, line: 480 },
  children:  [new TextRun({ text, font: 'Times New Roman', size: 24, bold: true })],
});

// Teks Arab (center, lebih besar)
// ✅ bidirectional:true  → <w:bidi/>  → paragraf RTL
// ✅ rightToLeft:true    → <w:rtl/>   → run RTL
// ✅ font.cs             → <w:cs/>    → slot Complex Script (kunci Arab)
const arabic = (text) => new Paragraph({
  alignment:    AlignmentType.CENTER,
  bidirectional: true,                  // ← paragraf RTL
  spacing:      { before: 200, after: 200, line: 560 },
  children: [new TextRun({
    text,
    rightToLeft: true,                  // ← run RTL
    font: {
      ascii:    'Times New Roman',      // slot Latin (tidak dipakai di sini)
      cs:       'Traditional Arabic',   // ← Complex Script (slot Arab)
      highAnsi: 'Traditional Arabic',
    },
    size:   36,                         // ukuran untuk ayat/takbir
    bold:   false,
  })],
});

// Teks Arab panjang (paragraf, rata kanan = arah alami Arab)
// ✅ Semua properti RTL sama dengan arabic()
const arabicSmall = (text) => new Paragraph({
  alignment:    AlignmentType.RIGHT,
  bidirectional: true,                  // ← paragraf RTL
  spacing:      { before: 160, after: 160, line: 520 },
  children: [new TextRun({
    text,
    rightToLeft: true,                  // ← run RTL
    font: {
      ascii:    'Times New Roman',
      cs:       'Traditional Arabic',   // ← Complex Script (slot Arab)
      highAnsi: 'Traditional Arabic',
    },
    size: 28,
  })],
});

// Sumber hadits (italic, right)
const source = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing:   { before: 0, after: 240, line: 480 },
  children:  [new TextRun({ text, font: 'Times New Roman', size: 22, italic: true, color: '555555' })],
});

// Ayat terjemahan (italic, indent)
const quote = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing:   { before: 120, after: 120, line: 480 },
  indent:    { left: 720, right: 720 },
  children:  [new TextRun({ text: `"${text}"`, font: 'Times New Roman', size: 24, italic: true })],
});

// Blank line
const blank = () => new Paragraph({
  spacing: { before: 0, after: 0, line: 240 },
  children: [new TextRun({ text: '' })],
});

// Separator / garis tipis
const separator = () => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 240, line: 240 },
  border:  { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA' } },
  children: [new TextRun({ text: '' })],
});

// ════════════════════════════════════════════════════════════════
//  ISI DOKUMEN
// ════════════════════════════════════════════════════════════════
const children = [

  // ── COVER KHUTBAH PERTAMA ──────────────────────────────────────
  blank(),
  babTitle('KUMPULAN NASKAH KHUTBAH'),
  babTitle('IDUL ADHA & JUMAT'),
  blank(),
  separator(),
  blank(),

  // ══════════════════════════════════════════════════════════════
  //  KHUTBAH 1 : IDUL ADHA 1447 H
  // ══════════════════════════════════════════════════════════════
  p('KHUTBAH IDUL ADHA 1447 H', { center: true, bold: true, size: 28, before: 200 }),
  p('MENELADANI KELUARGA NABI IBRAHIM AS', { center: true, bold: true, size: 26 }),
  blank(),

  // Takbir pembuka
  arabic('اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - وَلِلَّهِ الْحَمْدُ'),
  arabic('اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - اللهُ أَكْبَرُ'),
  arabic('اللهُ أَكْبَرُ - اللهُ أَكْبَرُ - اللهُ أَكْبَرُ'),
  arabic('سُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا. لَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ. وَلِلَّهِ الْحَمْدُ'),
  blank(),

  // Muqaddimah khutbah
  arabicSmall('اَلْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا كَمَا أَمَرَ، نَحْمَدُهُ سُبْحَانَهُ وَتَعَالَى الَّذِي جَعَلَ الْخَلِيلَ إِبْرَاهِيمَ إِمَامًا لَنَا وَلِسَائِرِ الْبَشَرِ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ. وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ الْمَبْعُوثُ رَحْمَةً لِلْعَالَمِينَ. اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ وَمَنْ تَبِعَهُمْ بِإِحْسَانٍ إِلَى يَوْمِ الْقِيَامَةِ. أَمَّا بَعْدُ، فَيَا عِبَادَ اللهِ، اتَّقُوا اللهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ.'),
  blank(),

  // QS Al-Kautsar
  arabicSmall('إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ. فَصَلِّ لِرَبِّكَ وَانْحَرْ. إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ.'),
  source('(QS. Al-Kautsar: 1-3)'),
  blank(),

  // QS Al-Ahzab 70-71
  arabicSmall('يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللهَ وَقُولُوا قَوْلًا سَدِيدًا. يُصْلِحْ لَكُمْ أَعْمَالَكُمْ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ وَمَنْ يُطِعِ اللهَ وَرَسُولَهُ فَقَدْ فَازَ فَوْزًا عَظِيمًا.'),
  source('(QS. Al-Ahzab: 70-71)'),
  blank(),

  p('Kaum Muslimin, jama\'ah shalat Idul Adha Rahimakumullah.', { bold: false, noIndent: true }),
  blank(),

  // ── Isi Khutbah 1 ─────────────────────────────────────────────
  subTitle('Syukur Kepada Allah SWT'),

  p('Puji dan syukur kita panjatkan kehadirat Allah SWT yang telah memberikan kenikmatan yang banyak kepada kita sehingga kita bisa hadir di masjid pada pagi ini dalam pelaksanaan shalat Idul Adha.'),

  p('Sebagai ungkapan syukur kepada Allah SWT, sesungguhnya Allah SWT tidak pernah perlu kepada syukur kita, karena syukur kita kembali kepada kita sendiri, menambah dan mengekalkan nikmat Allah SWT. Sebagaimana firman Allah dalam QS. An-Naml: 40:'),

  arabicSmall('وَمَنْ شَكَرَ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ'),
  quote('Barang siapa yang bersyukur, maka sesungguhnya dia bersyukur untuk kebaikan dirinya sendiri.'),
  source('(QS. An-Naml: 40)'),
  blank(),

  p('Dan barang siapa yang bersyukur, sebagaimana dalam surat Ibrahim:'),
  arabicSmall('لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ'),
  quote('Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah nikmat kepadamu.'),
  source('(QS. Ibrahim: 7)'),
  blank(),

  p('Semoga kita senantiasa bersyukur kepada Allah SWT dengan cara beriman, menjalankan amal shaleh, dan berkurban dengan iman serta taqwa kepada Allah SWT.'),

  p('Shalawat dan salam semoga selalu tercurahkan kepada Nabi kita Muhammad SAW, beserta keluarga, sahabat, dan para pengikut setia serta para penerus dakwahnya hingga hari kiamat.'),

  blank(),
  subTitle('Seruan Bertaqwa'),

  p('Dari atas mimbar ini pula, khatib mengajak khusus diri khatib sendiri dan jamaah sekalian, mari kita tingkatkan iman serta taqwa kepada Allah SWT. Sesungguhnya tujuan di dalam Islam adalah taqwa yang dilakukan dengan cara membersihkan jiwa dari segala bentuk kesyirikan dan kemunafikan, dengan cara meneranginya dengan banyak berzikir kepada Allah SWT, sehingga hati dapat menerima hidayah Allah dan bahagia di dunia serta sejahtera di akhirat.'),

  blank(),
  p('Allahu Akbar 3x walillahilhamd.', { bold: true, noIndent: true }),
  blank(),

  subTitle('Nabi Ibrahim AS sebagai Teladan'),

  p('Nabi Ibrahim AS adalah sosok yang menjadi teladan mulia bagi seluruh umat manusia. Keluarganya merupakan contoh nyata dari keimanan, ketaatan, dan pengorbanan yang luar biasa kepada Allah SWT. Beliau rela meninggalkan istri dan putranya Ismail di lembah yang tandus, semata-mata karena taat kepada perintah Allah SWT.'),

  p('Dari kisah agung keluarga Nabi Ibrahim AS, kita belajar bagaimana seorang hamba yang beriman rela mengorbankan segala yang paling dicintainya demi ketaatan dan kepatuhan kepada Allah SWT. Ketaatan itulah yang kemudian diabadikan dalam ibadah qurban dan haji hingga hari ini.'),

  p('Semoga kita dapat meneladani keluarga Nabi Ibrahim AS dalam kehidupan kita sehari-hari, sehingga kita menjadi hamba yang benar-benar beriman dan bertaqwa kepada Allah SWT.'),

  blank(),
  separator(),
  blank(),

  // ══════════════════════════════════════════════════════════════
  //  KHUTBAH 2 : MUKMIN ITU BERSAUDARA
  // ══════════════════════════════════════════════════════════════
  p('KHUTBAH JUMAT', { center: true, bold: true, size: 28, before: 200 }),
  p('MUKMIN ITU BERSAUDARA', { center: true, bold: true, size: 26 }),
  p('Ustadz Wandi Bustami, Lc., MA.', { center: true, italic: true, size: 22, color: '555555' }),
  blank(),

  // ── Khutbah Pertama (Jumat) ────────────────────────────────────
  p('Khutbah Pertama', { bold: true, noIndent: true, size: 24 }),
  blank(),

  arabicSmall('اَلْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ وَالْعَاقِبَةُ لِلْمُتَّقِينَ وَلَا عُدْوَانَ إِلَّا عَلَى الظَّالِمِينَ. وَالصَّلَاةُ وَالسَّلَامُ عَلَى الْمَبْعُوثِ رَحْمَةً لِلْعَالَمِينَ وَعَلَى آلِهِ الطَّاهِرِينَ وَأَصْحَابِهِ الْغُرِّ الْمَيَامِينَ إِلَى يَوْمِ الدِّينِ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ.'),
  blank(),

  arabicSmall('يَا أَيُّهَا النَّاسُ أُوصِيكُمْ وَإِيَّايَ بِتَقْوَى اللهِ عَزَّ وَجَلَّ فَقَدْ قَالَ الْمُتَّقُونَ. قَالَ سُبْحَانَهُ وَتَعَالَى:'),
  arabicSmall('يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ مِنْ نَفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَاءً وَاتَّقُوا اللهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ إِنَّ اللهَ كَانَ عَلَيْكُمْ رَقِيبًا.'),
  source('(QS. An-Nisa: 1)'),
  blank(),

  arabicSmall('يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللهَ وَقُولُوا قَوْلًا سَدِيدًا. يُصْلِحْ لَكُمْ أَعْمَالَكُمْ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ وَمَنْ يُطِعِ اللهَ وَرَسُولَهُ فَقَدْ فَازَ فَوْزًا عَظِيمًا. أَمَّا بَعْدُ.'),
  source('(QS. Al-Ahzab: 70-71)'),
  blank(),

  p('Sidang Jamaah Jumat yang berbahagia!!!', { bold: true, noIndent: true }),
  blank(),

  subTitle('Kondisi Umat Islam Saat Ini'),

  p('Beberapa bulan yang lalu, umat Islam di beberapa tempat mendapat perlakuan buruk dan kasar. Mereka dikekang, diintimidasi dan diburu bahkan dibunuh di daerahnya sendiri.'),

  p('Di Palestina misalnya, seorang pemuda Muslim ditembak mati oleh serdadu Israel karena hanya membela diri. Seorang bapak paruh baya dipukul hingga mati saat mencari perlindungan, dan tak kalah penting, seorang anak kecil ditembak berkali-kali karena mempertahankan keyakinannya.'),

  p('Kejadian yang menyakitkan ini tidak hanya berlaku di Palestina. Baru-baru ini umat Islam dikagetkan dengan berita genosida saudara-saudara Muslim Rohingya. Alasan pembunuhannya tidak jelas. Ada yang berkata "mereka bukan rakyat kami, mereka kaum pendatang dan ingin membuat kekacauan di negeri kami", ada pula yang berujar "mereka teroris yang akan mengkudeta pemerintahan resmi kami." Namun jika dilihat lebih jauh, kasus pembunuhan tersebut adalah karena status mereka sebagai seorang Muslim.'),

  p('Melihat dua kasus di atas, kita sebagai seorang Muslim harus punya andil untuk meringankan beban dan penderitaan mereka, karena mereka adalah saudara kita. Dulu di awal Islam mulai berkembang, kondisi umat Islam sangat lemah hingga hampir setiap orang yang memeluk Islam mendapat siksaan dari kafir musyrik.'),

  blank(),
  subTitle('Kisah Bilal bin Rabah dan Semangat Persaudaraan'),

  p('Bilal bin Rabah misalnya. Ketika tuannya mengetahui Bilal masuk Islam, ia disiksa dengan cara diletakkan sebuah batu besar di dadanya pada saat terik matahari. Sungguh dahsyat penderitaan yang beliau alami kala itu. Namun, di saat yang sama Abu Bakar datang menolong dan menebusnya.'),

  p('Tradisi tolong-menolong dalam umat ini sudah ada sedari dulu. Dalam agama Islam diajarkan bahwa apabila seorang Muslim membutuhkan pertolongan maka wajib ditolong, karena satu Muslim dengan Muslim lainnya bagaikan satu bangunan yang kokoh.'),

  blank(),
  subTitle('Hadits: Muslim Bagaikan Satu Bangunan'),

  p('Rasulullah ﷺ bersabda:'),
  arabicSmall('عَنْ أَبِي مُوسَى رَضِيَ اللهُ عَنْهُ عَنِ النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ قَالَ: الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا وَشَبَّكَ بَيْنَ أَصَابِعِهِ.'),
  source('(HR. Bukhari)'),

  quote('Dari Abi Musa RA, dari Nabi ﷺ. Beliau bersabda: "Seorang Mukmin terhadap Mukmin lainnya adalah ibarat satu bangunan yang satu sama lain saling menguatkan", dan beliau mendemonstrasikannya dengan cara mengepalkan jari jemari beliau.'),
  blank(),

  p('Sidang Jamaah Jumat yang berbahagia!!!', { bold: true, noIndent: true }),
  blank(),

  p('Hadits ini menjelaskan kepada kita bahwa seorang Muslim harus menyatu, akrab, bergaul, dan peduli dengan Muslim lainnya, karena mereka adalah satu bangunan yang saling menguatkan. Seperti sebuah bangunan yang tidak menyatu-padu dengan material lainnya, tentu bangunan akan runtuh. Oleh karenanya, jangan sampai sesama Muslim acuh dengan sesama Muslim!'),

  blank(),
  subTitle('Ikatan Ukhuwah Islamiyah'),

  p('Di dalam Al-Qur\'an, Allah ﷻ menyebut setiap Mukmin adalah bersaudara. Yaitu persaudaraan yang diikat dengan tali la ilaha illallah. Siapa pun dan di mana pun mereka hidup selama mengucapkan kalimat tauhid tersebut, mereka bersaudara.'),

  p('Saat ini, kita dipengaruhi oleh isu-isu yang mengatakan bahwa mereka bukan orang Indonesia, bukan etnis kita, bahkan bukan urusan kita. Apakah ini hanya sekadar ucapan belaka atau sudah menjadi keyakinan? Yang jelas ucapan tersebut adalah bentuk ketidakpedulian sesama Muslim. Sikap tersebut bertentangan dengan nilai-nilai agama Islam.'),

  p('Rasulullah ﷺ bersabda:'),
  arabicSmall('عَنْ سَالِمٍ عَنْ أَبِيهِ عَنِ النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ قَالَ: الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يُسْلِمُهُ. فَإِنَّ اللهَ فِي حَاجَتِهِ وَمَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً فَرَّجَ اللهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللهُ يَوْمَ الْقِيَامَةِ.'),
  source('(HR. Abu Daud)'),

  quote('Dari Salim, dari Bapaknya, dari Nabi ﷺ bersabda: "Seorang Muslim adalah saudara bagi sesama Muslim, tidak boleh menganiaya dan merendahkannya. Barangsiapa menyampaikan hajat saudaranya, niscaya Allah menyampaikan hajatnya. Dan barangsiapa membebaskan kesulitan orang Muslim di dunia, niscaya Allah akan membebaskan kesulitannya di hari kiamat. Dan barangsiapa menutup aib seorang Muslim, niscaya Allah akan menutupi aibnya di hari kiamat kelak."'),
  blank(),

  p('Sidang Jamaah Jumat yang berbahagia!!!', { bold: true, noIndent: true }),
  blank(),

  subTitle('Hadits: Mukmin Bagaikan Satu Tubuh'),

  p('Dalam hadis ini dijelaskan betapa mulianya status seorang Muslim. Di kala satu Muslim meringankan kesulitan seorang Muslim, Allah ﷻ akan meringankan kesulitannya di akhirat. Ini mengisyaratkan bahwa seorang Muslim itu dekat dengan Allah ﷻ. Inilah yang disebut Al-Qur\'an hablun minallah wa hablun minannas — apabila dekat dengan Allah secara otomatis dekat dengan manusia.'),

  p('Kedekatan seorang Muslim dengan Muslim lainnya tergambar jelas dalam sabda Rasulullah ﷺ:'),
  arabicSmall('عَنِ النُّعْمَانِ بْنِ بَشِيرٍ قَالَ: قَالَ رَسُولُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى.'),
  source('(HR. Muslim)'),

  quote('Dari Nu\'man bin Basyir, Rasulullah ﷺ bersabda: "Orang-orang Mukmin dalam hal saling mencintai, menyayangi, dan mengasihi bagaikan satu tubuh. Apabila ada salah satu anggota tubuh yang sakit, maka seluruh tubuhnya akan ikut terjaga (tidak bisa tidur) dan panas (turut merasakan sakitnya)."'),
  blank(),

  subTitle('Penerapan Dalam Kehidupan Sehari-hari'),

  p('Sidang Jamaah Jumat yang berbahagia!!!', { bold: true, noIndent: true }),
  blank(),

  p('Penerapan hadits ini terlihat jelas dalam kehidupan sehari-hari. Ketika seorang Muslim membutuhkan bantuan misalnya, maka ia harus ditolong seketika itu juga, jangan membiarkan ia menderita dengan penderitaannya. Apabila itu terjadi, maka ia tidak pantas disebut seorang Muslim.'),

  p('Ketika Rasulullah ﷺ dianiaya oleh penduduk Thaif, datang seorang Nasrani memberi bantuan. Ia mengobati luka beliau ﷺ dan memberi makan serta tempat perlindungan. Bahkan, Ja\'far pernah mendapat perlindungan dari raja Najasy di Etiopia yang kala itu masih Kristen.'),

  p('Orang-orang non-Muslim saja mau menolong kaum Muslimin yang teraniaya, mengapa kita sesama Muslim berat mengulurkan bantuan kepada saudara kita sesama Muslim? Bukankah Allah ﷻ selalu memberi ganjaran yang amat besar apabila mau membantu saudara Muslim lainnya?'),

  arabic('إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ'),
  quote('Orang-orang beriman itu sesungguhnya bersaudara.'),
  source('(QS. Al-Hujurat [49]: 10)'),
  blank(),

  p('Melalui sabda Rasulullah ﷺ, kita tahu bahwa Allah ﷻ akan meringankan kesulitan seorang hamba selama hamba tersebut mau meringankan beban saudaranya. Memberi bantuan kepada sesama Muslim adalah perbuatan yang mulia.'),

  blank(),
  subTitle('Tangan di Atas Lebih Baik'),

  p('Rasulullah ﷺ bersabda:'),
  arabicSmall('الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى.'),
  source('(Muttafaq \'Alaih)'),
  quote('Tangan di atas lebih baik daripada tangan di bawah.'),
  blank(),

  p('Hadits ini menjelaskan bahwa mengulurkan bantuan lebih utama daripada menerima bantuan. Alhamdulillah, hampir seluruh daerah provinsi di Indonesia bergotong-royong membantu saudara Muslim Palestina dan Rohingya. Tradisi baik ini harus dipertahankan, sebab dengan cara seperti itu agama Islam akan jaya.'),

  p('Di dalam Al-Qur\'an, Allah ﷻ menyebutkan bahwa orang yang mau menolong agama Islam dan kaum Muslimin, Allah pasti menolongnya. Allah ﷻ berfirman:'),
  arabicSmall('يَا أَيُّهَا الَّذِينَ آمَنُوا إِنْ تَنْصُرُوا اللهَ يَنْصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ.'),
  source('(QS. Muhammad [47]: 7)'),
  quote('Hai orang-orang Mukmin, jika kamu menolong (agama) Allah, niscaya Dia akan menolongmu dan meneguhkan kedudukanmu.'),
  blank(),

  p('Sidang Jamaah Jumat yang berbahagia!', { bold: true, noIndent: true }),
  blank(),

  p('Imam Fakhruddin al-Razi menafsirkan bahwa pertolongan Allah itu bermacam-macam, di antaranya: jika seorang Muslim menolong agama Allah, maka Allah akan menolong kelompoknya.'),

  p('Dari Abu Qatadah RA, Nabi ﷺ bersabda:'),
  arabicSmall('مَنْ سَرَّهُ أَنْ يُنْجِيَهُ اللهُ مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ فَلْيُنَفِّسْ عَنْ مُعْسِرٍ أَوْ يَضَعَ عَنْهُ.'),
  source('(HR. Muslim)'),
  quote('Siapa yang ingin diselamatkan oleh Allah dari kesulitan-kesulitan hari Kiamat, hendaklah ia meringankan orang yang kesulitan (orang lain) atau membebaskannya.'),
  blank(),

  subTitle('Sedekah dengan Tenaga, Pikiran, dan Harta'),

  p('Meringankan beban saudara sesama Muslim dengan tenaga, ide pikiran, dan harta benda merupakan sedekah. Dalam salah satu hadits, Rasulullah ﷺ bersabda:'),
  arabicSmall('عَوْنُكَ الضَّعِيفَ مِنَ الصَّدَقَةِ.'),
  source('(HR. Abu ad-Dunya)'),
  quote('Pertolonganmu terhadap orang lemah adalah shadaqah.'),
  blank(),

  p('Sidang Jamaah Jumat yang berbahagia!', { bold: true, noIndent: true }),
  blank(),

  p('Amal kebaikan berupa ide pikiran, tenaga, dan harta benda yang dikeluarkan akan menghapus perbuatan jelek seseorang. Allah ﷻ berfirman:'),
  arabicSmall('إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ.'),
  source('(QS. Hud [11]: 114)'),
  quote('Sesungguhnya perbuatan baik itu menghilangkan perbuatan jelek.'),
  blank(),

  subTitle('Balasan Agung di Hari Kiamat'),

  arabicSmall('يُحْشَرُ النَّاسُ يَوْمَ الْقِيَامَةِ أَعْرَى مَا كَانُوا قَطُّ، وَأَجْوَعُ مَا كَانُوا قَطُّ، وَأَظْمَأُ مَا كَانُوا قَطُّ، وَأَنْصَبُ مَا كَانُوا قَطُّ، فَمَنْ كَسَا لِلَّهِ عَزَّ وَجَلَّ كَسَاهُ اللهُ، وَمَنْ أَطْعَمَ لِلَّهِ عَزَّ وَجَلَّ أَطْعَمَهُ اللهُ، وَمَنْ سَقَى لِلَّهِ عَزَّ وَجَلَّ سَقَاهُ اللهُ، وَمَنْ عَفَا لِلَّهِ عَزَّ وَجَلَّ أَعْفَاهُ اللهُ.'),
  blank(),

  quote('Manusia akan dikumpulkan di hari kiamat dalam keadaan sangat membutuhkan pakaian, sangat kelaparan, sangat kehausan, dan sangat kepayahan melebihi yang pernah mereka rasakan di dunia. Maka siapa yang (ketika di dunia) pernah memberi pakaian karena Allah ﷻ, Allah akan memakaikan pakaian kepadanya. Siapa yang pernah memberi makan karena Allah ﷻ, Allah akan memberikan makan kepadanya. Siapa yang pernah memberi minum karena Allah ﷻ, Allah akan memberi minum kepadanya. Siapa yang memaafkan karena Allah ﷻ, Allah akan menjadikan manusia memaafkan kezalimannya.'),
  source('(Jaami\'ul \'Uluumi wal Hikam, 2/287)'),
  blank(),

  separator(),
  blank(),

  // ══════════════════════════════════════════════════════════════
  //  KHUTBAH KEDUA (JUMAT)
  // ══════════════════════════════════════════════════════════════
  p('Khutbah Kedua', { bold: true, noIndent: true, size: 24 }),
  blank(),

  arabicSmall('اَللهُ أَكْبَرُ (٣×) اَللهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا. لَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ، اَللهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ.'),
  blank(),

  arabicSmall('اَلْحَمْدُ لِلَّهِ عَلَى إِحْسَانِهِ وَالشُّكْرُ لَهُ عَلَى تَوْفِيقِهِ وَامْتِنَانِهِ. وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ الدَّاعِي إِلَى رِضْوَانِهِ. اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ وَسَلِّمْ تَسْلِيمًا كَثِيرًا.'),
  blank(),

  arabicSmall('أَمَّا بَعْدُ، يَا أَيُّهَا النَّاسُ اتَّقُوا اللهَ فِيمَا أَمَرَ وَانْتَهُوا عَمَّا نَهَى وَزَجَرَ. وَاعْلَمُوا أَنَّ اللهَ أَمَرَكُمْ بِأَمْرٍ بَدَأَ فِيهِ بِنَفْسِهِ وَثَنَّى بِمَلَائِكَتِهِ بِقُدْسِهِ وَقَالَ تَعَالَى: إِنَّ اللهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ، يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا.'),
  blank(),

  arabicSmall('اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ وَعَلَى أَنْبِيَائِكَ وَرُسُلِكَ وَمَلَائِكَتِكَ الْمُقَرَّبِينَ، وَارْضَ اللَّهُمَّ عَنِ الْخُلَفَاءِ الرَّاشِدِينَ أَبِي بَكْرٍ وَعُمَرَ وَعُثْمَانَ وَعَلِيٍّ، وَعَنْ بَقِيَّةِ الصَّحَابَةِ وَالتَّابِعِينَ وَتَابِعِي التَّابِعِينَ لَهُمْ بِإِحْسَانٍ إِلَى يَوْمِ الدِّينِ، وَارْضَ عَنَّا مَعَهُمْ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.'),
  blank(),

  arabicSmall('اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ وَالْمُسْلِمِينَ وَالْمُسْلِمَاتِ الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ. اللَّهُمَّ أَعِزَّ الْإِسْلَامَ وَأَذِلَّ الشِّرْكَ وَالْمُشْرِكِينَ وَانْصُرْ عِبَادَكَ الْمُوَحِّدِينَ، وَانْصُرْ مَنْ نَصَرَ الدِّينَ وَاخْذُلْ مَنْ خَذَلَ الْمُسْلِمِينَ وَدَمِّرْ أَعْدَاءَ الدِّينِ وَاجْعَلْ كَلِمَتَكَ إِلَى يَوْمِ الدِّينِ.'),
  blank(),

  separator(),
  blank(),

  p('Wassalamu\'alaikum Warahmatullahi Wabarakatuh.', { bold: true, center: true }),
  blank(),
];

// ── Build dokumen ─────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: { page: { margin: MARGIN } },
    children,
  }],
});

const outPath = 'C:\\Users\\arips\\Downloads\\Khutbah_ClaudeVision.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('✅ Dokumen berhasil dibuat: ' + outPath);
}).catch(e => {
  console.error('❌ Gagal:', e.message);
  process.exit(1);
});
