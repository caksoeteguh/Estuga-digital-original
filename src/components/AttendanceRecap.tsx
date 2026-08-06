import React, { useState, useMemo } from 'react';
import { Student, Attendance } from '../types';
import { Calendar as CalendarIcon, Download, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AttendanceRecapProps {
  students: Student[];
  attendance: Attendance[];
}

export default function AttendanceRecap({ students, attendance }: AttendanceRecapProps) {
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Get all available classes
  const classes = useMemo(() => {
    return Array.from(new Set(students.map(s => s.className).filter(Boolean))).sort();
  }, [students]);

  // Process data for the selected period
  const processedData = useMemo(() => {
    let filteredStudents = students;
    if (filterClass !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.className === filterClass);
    }
    if (searchQuery) {
      filteredStudents = filteredStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.id && s.id.includes(searchQuery))
      );
    }

    return filteredStudents.map(student => {
      // Get student's attendance records for the selected period
      const studentRecords = attendance.filter(a => {
        if (a.studentId !== student.id) return false;
        
        // Match period
        if (viewMode === 'monthly') {
          return a.date && a.date.startsWith(selectedMonth); // e.g. "2023-10" matches "2023-10-01"
        } else {
          // Weekly: just roughly use current week for now, or last 7 days
          // Better to just implement monthly for now as it's standard, but let's do 
          // last 7 days if weekly is selected
          const recordDate = new Date(a.date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - recordDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          return diffDays <= 7;
        }
      });

      // Avoid double counting same day for same student (in case of multiple scans)
      // Usually attendance is 1 per day.
      const uniqueDays = new Map<string, Attendance>();
      studentRecords.forEach(r => {
        // Only keep the 'highest' status (Hadir > Izin > Sakit > Alpa) or just the last recorded one
        // Let's just keep the last recorded one for each day.
        uniqueDays.set(r.date, r);
      });

      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alpa = 0;

      uniqueDays.forEach((r) => {
        const stat = r.status?.toLowerCase();
        if (stat === 'hadir' || stat === 'masuk') hadir++;
        else if (stat === 'izin') izin++;
        else if (stat === 'sakit') sakit++;
        else if (stat === 'alpa' || stat === 'alfa' || stat === 'absen') alpa++;
        else hadir++; // fallback
      });

      return {
        ...student,
        rekap: { hadir, izin, sakit, alpa, total: hadir + izin + sakit + alpa }
      };
    });
  }, [students, attendance, filterClass, searchQuery, viewMode, selectedMonth]);

  const handleExportExcel = () => {
    const dataToExport = processedData.map((s, index) => ({
      'No': index + 1,
      'NIS': s.id || '-',
      'Nama Siswa': s.name,
      'Kelas': s.className || '-',
      'Hadir (H)': s.rekap.hadir,
      'Izin (I)': s.rekap.izin,
      'Sakit (S)': s.rekap.sakit,
      'Alpa (A)': s.rekap.alpa,
      'Total Terdata': s.rekap.total
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi");
    const periodName = viewMode === 'monthly' ? `Bulan_${selectedMonth}` : '7_Hari_Terakhir';
    XLSX.writeFile(wb, `Rekap_Presensi_${periodName}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-emerald-600" size={28} />
            Rekap Presensi Siswa
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau jumlah kehadiran, izin, dan sakit siswa secara berkala.</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download size={18} />
          Ekspor Excel
        </button>
      </div>

      <div className="bg-white dark:bg-[#111625] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'weekly' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Bulanan
              </button>
            </div>
            
            {viewMode === 'monthly' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
              />
            )}
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white appearance-none min-w-[140px] focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Kelas</th>
                <th className="p-4 text-center">Hadir (H)</th>
                <th className="p-4 text-center">Izin (I)</th>
                <th className="p-4 text-center">Sakit (S)</th>
                <th className="p-4 text-center">Alpa (A)</th>
                <th className="p-4 text-center">Total Terdata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedData.length > 0 ? (
                processedData.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-center font-mono">{idx + 1}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {student.name}
                      <div className="text-xs text-slate-400 font-normal">NIS: {student.id || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-bold">
                        {student.className || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 leading-8 font-bold">
                        {student.rekap.hadir}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 leading-8 font-bold">
                        {student.rekap.izin}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 leading-8 font-bold">
                        {student.rekap.sakit}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 leading-8 font-bold">
                        {student.rekap.alpa}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      {student.rekap.total} Hari
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                    Tidak ada data siswa atau rekap yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
