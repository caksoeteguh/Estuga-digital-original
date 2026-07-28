import React, { useState, useEffect } from 'react';
import { Student, StudentGradeRecord, Attendance } from '../types';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, Save, Info, Sparkles, Filter } from 'lucide-react';

interface StudentGradesManagerProps {
  students: Student[];
  schoolClasses: string[];
  schoolSubjects: string[];
  grades: StudentGradeRecord[];
  attendance: Attendance[];
  onUpdateGrades: (newGrades: StudentGradeRecord[]) => void;
  isDark: boolean;
}

export default function StudentGradesManager({
  students,
  schoolClasses,
  schoolSubjects,
  grades,
  attendance,
  onUpdateGrades,
  isDark
}: StudentGradesManagerProps) {
  const [selectedClass, setSelectedClass] = useState<string>(schoolClasses[0] || 'Kelas 4-A (SD)');
  const [selectedSubject, setSelectedSubject] = useState<string>(schoolSubjects[0] || 'Matematika');
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (schoolClasses.length > 0 && !schoolClasses.includes(selectedClass)) {
      setSelectedClass(schoolClasses[0]);
    }
    if (schoolSubjects.length > 0 && !schoolSubjects.includes(selectedSubject)) {
      setSelectedSubject(schoolSubjects[0]);
    }
  }, [schoolClasses, schoolSubjects, selectedClass, selectedSubject]);

  // Filter students belonging to the selected class
  const classStudents = students.filter(s => s.className === selectedClass);

  const getGradeRecord = (studentId: string, studentName: string, className: string): StudentGradeRecord => {
    const existing = grades.find(g => g.studentId === studentId && g.subject === selectedSubject && g.className === className);
    if (existing) return existing;

    // Return an empty-initialized record if it doesn't exist
    return {
      id: `${studentId}_${className}_${selectedSubject}`,
      studentId,
      studentName,
      className,
      subject: selectedSubject,
      tugas: Array(10).fill(""),
      ulangan: Array(8).fill(""),
      pts: "",
      pas: ""
    };
  };

  const handleGradeChange = (
    studentId: string,
    studentName: string,
    className: string,
    type: 'tugas' | 'ulangan' | 'pts' | 'pas',
    index: number,
    valueStr: string
  ) => {
    let numericVal: number | "" = "";
    if (valueStr !== "") {
      const val = parseInt(valueStr);
      if (!isNaN(val)) {
        numericVal = Math.min(100, Math.max(0, val));
      }
    }

    const updatedGrades = [...grades];
    const recordIndex = updatedGrades.findIndex(g => g.studentId === studentId && g.subject === selectedSubject && g.className === className);

    let record: StudentGradeRecord;
    if (recordIndex >= 0) {
      record = { ...updatedGrades[recordIndex] };
    } else {
      record = {
        id: `${studentId}_${className}_${selectedSubject}`,
        studentId,
        studentName,
        className,
        subject: selectedSubject,
        tugas: Array(10).fill(""),
        ulangan: Array(8).fill(""),
        pts: "",
        pas: ""
      };
    }

    if (type === 'tugas') {
      const newTugas = [...record.tugas];
      newTugas[index] = numericVal;
      record.tugas = newTugas;
    } else if (type === 'ulangan') {
      const newUlangan = [...record.ulangan];
      newUlangan[index] = numericVal;
      record.ulangan = newUlangan;
    } else if (type === 'pts') {
      record.pts = numericVal;
    } else if (type === 'pas') {
      record.pas = numericVal;
    }

    if (recordIndex >= 0) {
      updatedGrades[recordIndex] = record;
    } else {
      updatedGrades.push(record);
    }

    onUpdateGrades(updatedGrades);
    
    // Quick flash saved status
    setShowSavedFeedback(true);
    const timer = setTimeout(() => setShowSavedFeedback(false), 800);
  };

  const handleExportGradesToExcel = () => {
    const dataToExport = classStudents.map((st, sIdx) => {
      const rec = getGradeRecord(st.id, st.name, st.className);
      
      // Calculate attendance for this student
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alfa = 0;

      attendance.forEach(att => {
        if (att.studentId === st.id) {
          if (att.status === 'hadir') hadir++;
          else if (att.status === 'sakit') sakit++;
          else if (att.status === 'izin') izin++;
          else if (att.status === 'alfa') alfa++;
        }
      });

      const exportRow: any = {
        'No': sIdx + 1,
        'NIS': st.id,
        'Nama Siswa': st.name,
        'Kelas': st.className,
        'Mata Pelajaran': selectedSubject,
      };

      // Fill Tugas 1-10
      for (let i = 0; i < 10; i++) {
        exportRow[`Tugas ${i + 1}`] = rec.tugas[i] !== undefined ? rec.tugas[i] : '';
      }

      // Fill Ulangan Harian 1-8
      for (let i = 0; i < 8; i++) {
        exportRow[`UH ${i + 1}`] = rec.ulangan[i] !== undefined ? rec.ulangan[i] : '';
      }

      exportRow['PTS'] = rec.pts !== undefined ? rec.pts : '';
      exportRow['PAS'] = rec.pas !== undefined ? rec.pas : '';

      // Add Attendance
      exportRow['Hadir'] = hadir;
      exportRow['Sakit'] = sakit;
      exportRow['Izin'] = izin;
      exportRow['Alfa'] = alfa;

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Nilai & Absensi');
    
    const filename = `Rekap_Nilai_Absensi_${selectedSubject.replace(/\s+/g, '_')}_${selectedClass.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white">Daftar Rekam Nilai Siswa</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
            Pencatatan nilai murni akademis untuk 10 Tugas, 8 Ulangan Harian, PTS, dan PAS tanpa perhitungan rata-rata atau predikat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportGradesToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Download size={14} />
          <span>Ekspor Rekap Nilai & Absensi (Excel)</span>
        </button>
      </div>

      {/* Filter and Status Panel */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
            <Filter size={14} />
            <span>Filter Data:</span>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
            >
              {schoolClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
            >
              {schoolSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {showSavedFeedback ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg animate-pulse">
              ✔ Autosave Aktif...
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-semibold italic flex items-center gap-1">
              <Sparkles size={13} className="text-yellow-500" />
              Ketik nilai langsung pada tabel untuk menyimpan
            </span>
          )}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-xl border border-gray-100 dark:border-[#3e405b] shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-[#3e405b]/40 bg-slate-50/50 dark:bg-[#232333]/30 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Daftar Nilai {selectedSubject} - {selectedClass} ({classStudents.length} Siswa)
          </span>
          <span className="text-[10px] text-indigo-500 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded">
            SD ONLY MODE
          </span>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Tidak ada siswa terdaftar di {selectedClass}. Impor data siswa terlebih dahulu di Data Kelengkapan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] w-max text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-[#1a2035]/50 text-slate-500 dark:text-slate-400 font-bold border-b dark:border-[#3e405b]/40">
                  <th className="p-3 text-center w-12 sticky left-0 bg-slate-100/90 dark:bg-[#1a2035]/90 z-10">No</th>
                  <th className="p-3 w-24">NIS</th>
                  <th className="p-3 w-48 sticky left-12 bg-slate-100/90 dark:bg-[#1a2035]/90 z-10">Nama Siswa</th>
                  
                  {/* Tugas 1-10 Header */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={`tg-h-${i}`} className="p-2 text-center text-[10px] font-mono bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400">Tugas {i+1}</th>
                  ))}

                  {/* Ulangan 1-8 Header */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={`ul-h-${i}`} className="p-2 text-center text-[10px] font-mono bg-amber-50/30 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400">UH {i+1}</th>
                  ))}

                  <th className="p-3 text-center bg-violet-50/40 dark:bg-violet-950/10 text-violet-600 dark:text-violet-400">PTS</th>
                  <th className="p-3 text-center bg-rose-50/40 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400">PAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {classStudents.map((st, sIdx) => {
                  const rec = getGradeRecord(st.id, st.name, st.className);

                  return (
                    <tr 
                      key={st.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-[#1f2334]/50 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-slate-400 sticky left-0 bg-white dark:bg-[#2b2c40] z-10">{sIdx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-400">{st.id}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white sticky left-12 bg-white dark:bg-[#2b2c40] z-10 truncate max-w-[180px]" title={st.name}>
                        {st.name}
                      </td>

                      {/* Tugas 1-10 inputs */}
                      {Array.from({ length: 10 }).map((_, i) => {
                        const val = rec.tugas[i];
                        return (
                          <td key={`tg-i-${i}`} className="p-1.5 text-center bg-indigo-50/10 dark:bg-indigo-950/5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="-"
                              value={val === undefined || val === null ? "" : val}
                              onChange={(e) => handleGradeChange(st.id, st.name, st.className, 'tugas', i, e.target.value)}
                              className="w-11 text-center py-1 rounded border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1a2035] text-xs font-mono dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        );
                      })}

                      {/* Ulangan 1-8 inputs */}
                      {Array.from({ length: 8 }).map((_, i) => {
                        const val = rec.ulangan[i];
                        return (
                          <td key={`ul-i-${i}`} className="p-1.5 text-center bg-amber-50/10 dark:bg-amber-950/5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="-"
                              value={val === undefined || val === null ? "" : val}
                              onChange={(e) => handleGradeChange(st.id, st.name, st.className, 'ulangan', i, e.target.value)}
                              className="w-11 text-center py-1 rounded border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1a2035] text-xs font-mono dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                        );
                      })}

                      {/* PTS */}
                      <td className="p-1.5 text-center bg-violet-50/20 dark:bg-violet-950/5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="-"
                          value={rec.pts === undefined || rec.pts === null ? "" : rec.pts}
                          onChange={(e) => handleGradeChange(st.id, st.name, st.className, 'pts', 0, e.target.value)}
                          className="w-12 text-center py-1 rounded border border-violet-200 dark:border-violet-900 bg-white dark:bg-[#1a2035] text-xs font-mono font-bold text-violet-700 dark:text-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </td>

                      {/* PAS */}
                      <td className="p-1.5 text-center bg-rose-50/20 dark:bg-rose-950/5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="-"
                          value={rec.pas === undefined || rec.pas === null ? "" : rec.pas}
                          onChange={(e) => handleGradeChange(st.id, st.name, st.className, 'pas', 0, e.target.value)}
                          className="w-12 text-center py-1 rounded border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#1a2035] text-xs font-mono font-bold text-rose-700 dark:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
