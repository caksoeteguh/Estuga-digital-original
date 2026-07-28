const fs = require('fs');
let code = fs.readFileSync('src/components/BulkPrintCards.tsx', 'utf-8');

code = code.replace(/BulkPrintCardsProps/g, 'BulkPrintStaffCardsProps');
code = code.replace(/BulkPrintCards/g, 'BulkPrintStaffCards');
code = code.replace(/students: Student\[\];/g, 'staffs: any[];');
code = code.replace(/\{ students, schoolIdentity, onClose \}: BulkPrintStaffCardsProps/g, '{ staffs, schoolIdentity, onClose }: BulkPrintStaffCardsProps');
code = code.replace(/const classes = \['Semua', ...Array.from\(new Set\(students\.map\(s => s\.className\)\)\)\];/g, "const classes = ['Semua', ...Array.from(new Set(staffs.map(s => s.subject || 'Guru')))];");
code = code.replace(/const filteredStudents = students\.filter/g, 'const filteredStaffs = staffs.filter');
code = code.replace(/student\.className/g, '(student.subject || "Guru")');
code = code.replace(/filteredStudents/g, 'filteredStaffs');
code = code.replace(/students\.filter/g, 'staffs.filter');
code = code.replace(/students\.find/g, 'staffs.find');
code = code.replace(/selectedStudentIds/g, 'selectedStaffIds');
code = code.replace(/setSelectedStudentIds/g, 'setSelectedStaffIds');
code = code.replace(/StudentIdCard/g, 'StaffIdCard'); // Although CARD_THEMES is from StudentIdCard
code = code.replace(/import \{ CARD_THEMES, CardTheme \} from '\.\/StaffIdCard';/, "import { CARD_THEMES, CardTheme } from './StudentIdCard';");
code = code.replace(/renderStudentIdCardToCanvas/g, 'renderStaffIdCardToCanvas');

// Fix the array map
code = code.replace(/\{filteredStaffs\.map\(student => \(/g, '{filteredStaffs.map((student: any) => (');

fs.writeFileSync('src/components/BulkPrintStaffCards.tsx', code);
