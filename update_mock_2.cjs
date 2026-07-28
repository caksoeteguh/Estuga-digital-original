const fs = require('fs');
let content = fs.readFileSync('src/mockData.ts', 'utf8');

content = content.replace(
`    id: "assign_2",
    title: "Latihan Soal: Proses Pencernaan Kimiawi",
    subject: "IPA (Sains)",
    className: "Kelas 8-B (SMP)",`,
`    id: "assign_2",
    title: "Latihan Soal: Proses Pencernaan Manusia",
    subject: "IPA (Sains)",
    className: "Kelas 4-A (SD)",`
);

fs.writeFileSync('src/mockData.ts', content);
