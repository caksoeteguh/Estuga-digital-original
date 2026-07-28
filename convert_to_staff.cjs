const fs = require('fs');
let code = fs.readFileSync('src/components/BulkPrintStaffCards.tsx', 'utf-8');

code = code.replace(/StudentIdCard/g, 'StaffIdCard');
code = code.replace(/renderStudentIdCardToCanvas/g, 'renderStaffIdCardToCanvas');
code = code.replace(/BulkPrintCards/g, 'BulkPrintStaffCards');
code = code.replace(/students:/g, 'staffs:');
code = code.replace(/students;/g, 'staffs;');
code = code.replace(/students\.filter/g, 'staffs.filter');
code = code.replace(/students\.map/g, 'staffs.map');
code = code.replace(/student\.className/g, 'staff.subject || "Guru"');
code = code.replace(/student\.name/g, 'staff.name');
code = code.replace(/student\.id/g, 'staff.id');
code = code.replace(/student =>/g, 'staff =>');
code = code.replace(/filteredStudents/g, 'filteredStaffs');
code = code.replace(/selectedStudentIds/g, 'selectedStaffIds');
code = code.replace(/setSelectedStudentIds/g, 'setSelectedStaffIds');
code = code.replace(/Student/g, 'any'); // We use any for staff since it's Teacher | Admin
code = code.replace(/siswa/g, 'staf');
code = code.replace(/Siswa/g, 'Staf');
code = code.replace(/kelas/g, 'jabatan/mapel');
code = code.replace(/Kelas/g, 'Jabatan/Mapel');

fs.writeFileSync('src/components/BulkPrintStaffCards.tsx', code);
