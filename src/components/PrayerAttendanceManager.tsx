import React, { useState, useMemo } from 'react';
import { Student, PrayerAttendance } from '../types';
import { Calendar, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import SholatDhuhurWidget from './SholatDhuhurWidget';

interface PrayerAttendanceManagerProps {
  students: Student[];
  prayerAttendance: PrayerAttendance[];
  onAddPrayerAttendance: (att: PrayerAttendance) => void;
  onUpdatePrayerAttendance: (att: PrayerAttendance) => void;
}

export default function PrayerAttendanceManager({
  students,
  prayerAttendance,
  onAddPrayerAttendance,
  onUpdatePrayerAttendance
}: PrayerAttendanceManagerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prayerType, setPrayerType] = useState<'sholat_dhuhur' | 'sholat_jumat'>('sholat_dhuhur');

  // Get eligible students (Class 3-6 and Muslim)
  const eligibleStudents = useMemo(() => {
    return students.filter(student => {
      const grade = student.className.match(/\d/)?.[0];
      const gradeNum = grade ? parseInt(grade) : 0;
      const isEligibleGrade = gradeNum >= 3 && gradeNum <= 6;
      const isMuslim = !student.religion || student.religion.toLowerCase() === 'islam';
      const isMale = !student.gender || student.gender.toLowerCase() === 'laki-laki';
      
      if (prayerType === 'sholat_jumat') {
        return isEligibleGrade && isMuslim && isMale;
      }
      
      if (prayerType === 'sholat_dhuhur') {
        const selectedDay = new Date(selectedDate).getDay();
        if (selectedDay === 5) {
          // On Friday, only females do Sholat Dhuhur
          return isEligibleGrade && isMuslim && !isMale;
        }
        return isEligibleGrade && isMuslim;
      }
      
      return isEligibleGrade && isMuslim;
    });
  }, [students, prayerType, selectedDate]);

  const classes = useMemo(() => {
    const classSet = new Set(eligibleStudents.map(s => s.className));
    return Array.from(classSet).sort();
  }, [eligibleStudents]);

  const filteredStudents = useMemo(() => {
    return eligibleStudents.filter(s => {
      const matchesClass = selectedClass === 'all' || s.className === selectedClass;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
      return matchesClass && matchesSearch;
    });
  }, [eligibleStudents, selectedClass, searchQuery]);

  const handleStatusChange = (student: Student, status: 'hadir' | 'tidak_hadir', reason?: string) => {
    const existing = prayerAttendance.find(a => a.studentId === student.id && a.date === selectedDate && a.type === prayerType);
    
    if (existing) {
      onUpdatePrayerAttendance({
        ...existing,
        status,
        reason: reason as any || null
      });
    } else {
      onAddPrayerAttendance({
        id: `pray_${Date.now()}_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: selectedDate,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        type: prayerType,
        status,
        reason: reason as any || null
      });
    }
  };

  const getAttendanceForStudent = (studentId: string) => {
    return prayerAttendance.find(a => a.studentId === studentId && a.date === selectedDate && a.type === prayerType);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Jurnal Sholat Berjamaah</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pantau dan kelola kehadiran sholat jamaah siswa kelas 3-6.</p>
      </div>

      <SholatDhuhurWidget prayerAttendance={prayerAttendance} students={students} />

      <div className="bg-white dark:bg-[#2b2c40] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tanggal</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Filter Kelas</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all appearance-none"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2b2c40] rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#232333] border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 w-16">NIS</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Nama Siswa</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Kelas</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Status & Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const att = getAttendanceForStudent(student.id);
                  const isHadir = att?.status === 'hadir';
                  const isTidakHadir = att?.status === 'tidak_hadir';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{student.id}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{student.className}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStatusChange(student, 'hadir')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                              ${isHadir 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-transparent'}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Hadir
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(student, 'tidak_hadir', att?.reason || 'Tanpa Keterangan')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                ${isTidakHadir 
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' 
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-transparent'}`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tidak Hadir
                            </button>

                            {isTidakHadir && (
                              <select
                                value={att?.reason || 'Tanpa Keterangan'}
                                onChange={(e) => handleStatusChange(student, 'tidak_hadir', e.target.value)}
                                className="pl-2 pr-8 py-1.5 bg-rose-50 dark:bg-[#232333] border border-rose-200 dark:border-rose-900/30 rounded-lg text-xs text-rose-700 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/20 outline-none cursor-pointer"
                              >
                                <option value="Menstruasi">Menstruasi</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Kegiatan Lain">Kegiatan Lain</option>
                                <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Tidak ada data siswa yang cocok dengan filter saat ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
