import React, { useMemo } from 'react';
import { PrayerAttendance, Student } from '../types';

interface SholatDhuhurWidgetProps {
  prayerAttendance: PrayerAttendance[];
  students: Student[];
}

export default function SholatDhuhurWidget({ prayerAttendance, students }: SholatDhuhurWidgetProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Get eligible students (Class 3-6 and Muslim)
  const eligibleStudents = useMemo(() => {
    return students.filter(student => {
      const grade = student.className.match(/\d/)?.[0];
      const gradeNum = grade ? parseInt(grade) : 0;
      const isEligibleGrade = gradeNum >= 3 && gradeNum <= 6;
      const isMuslim = !student.religion || student.religion.toLowerCase() === 'islam';
      return isEligibleGrade && isMuslim;
    });
  }, [students]);

  const classes = useMemo(() => {
    const classSet = new Set(eligibleStudents.map(s => s.className));
    return Array.from(classSet).sort();
  }, [eligibleStudents]);

  const attendanceDataByClass = useMemo(() => {
    return classes.map(className => {
      const classStudents = eligibleStudents.filter(s => s.className === className);
      const total = classStudents.length;
      
      let hadir = 0;
      let tidakHadir = 0;
      let belumAbsen = 0;
      
      classStudents.forEach(student => {
        const att = prayerAttendance.find(a => a.studentId === student.id && a.date === todayStr);
        if (att) {
          if (att.status === 'hadir') hadir++;
          else tidakHadir++;
        } else {
          belumAbsen++;
        }
      });
      
      return { className, total, hadir, tidakHadir, belumAbsen };
    });
  }, [classes, eligibleStudents, prayerAttendance, todayStr]);

  const totalHadir = attendanceDataByClass.reduce((sum, item) => sum + item.hadir, 0);
  const totalTidakHadir = attendanceDataByClass.reduce((sum, item) => sum + item.tidakHadir, 0);
  const totalBelumAbsen = attendanceDataByClass.reduce((sum, item) => sum + item.belumAbsen, 0);
  const totalWajib = eligibleStudents.length;

  return (
    <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <span>🕌</span> Rekap Pelaksanaan Sholat Dhuhur
          </h2>
          <p className="text-[10px] text-slate-400 mt-1">Data hari ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})</p>
        </div>
        <div className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-100 dark:border-emerald-800/30">
          Wajib Sholat: {totalWajib} Siswa
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Sudah Hadir</span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{totalHadir}</span>
        </div>
        <div className="p-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100/50 dark:border-rose-900/30 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">Tidak Hadir</span>
          <span className="text-xl font-black text-rose-700 dark:text-rose-300">{totalTidakHadir}</span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-[#1a1b2e]/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Belum Didata</span>
          <span className="text-xl font-black text-slate-700 dark:text-slate-300">{totalBelumAbsen}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {attendanceDataByClass.length > 0 ? (
          attendanceDataByClass.map(data => {
            const progressPercentage = data.total > 0 ? Math.round((data.hadir / data.total) * 100) : 0;
            return (
              <div key={data.className} className="p-3 bg-gray-50/50 dark:bg-[#1e1f33]/50 rounded-xl border border-gray-100 dark:border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{data.className}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {data.total} Siswa
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1.5 text-[10px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{data.hadir} Hadir</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{data.tidakHadir} Absen</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{data.belumAbsen} Belum</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-center py-4 text-slate-400">Tidak ada data kelas wajib sholat dhuhur.</p>
        )}
      </div>
    </div>
  );
}
