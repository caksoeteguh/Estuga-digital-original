const fs = require('fs');
let content = fs.readFileSync('src/mockData.ts', 'utf8');

content = content.replace(
`    description: "Kerjakan lembar latihan halaman 42 buku cetak IPA mengenai nama-nama enzim dan organ penghasilnya. Tulis jawaban dengan rapi.",
    questions: [],
    allowImageUpload: true,
    createdAt: "2026-06-28"`,
`    description: "Kerjakan soal-soal interaktif pilihan ganda tentang enzim pencernaan di bawah ini.",
    questions: [
      {
        id: "q_1",
        type: "pg_sederhana",
        questionText: "Enzim yang berfungsi mengubah karbohidrat (amilum) menjadi gula sederhana (maltosa) di mulut adalah...",
        options: [{id: "A", text: "Pepsin"}, {id: "B", text: "Ptialin"}, {id: "C", text: "Lipase"}, {id: "D", text: "Tripsin"}],
        correctAnswer: "B",
        scoreWeight: 50
      },
      {
        id: "q_2",
        type: "pg_sederhana",
        questionText: "Asam klorida (HCl) yang membunuh kuman pada makanan dihasilkan di organ...",
        options: [{id: "A", text: "Usus Halus"}, {id: "B", text: "Hati"}, {id: "C", text: "Lambung"}, {id: "D", text: "Pankreas"}],
        correctAnswer: "C",
        scoreWeight: 50
      }
    ],
    allowImageUpload: false,
    taskType: "latihan",
    createdAt: "2026-06-28"`
);

fs.writeFileSync('src/mockData.ts', content);
