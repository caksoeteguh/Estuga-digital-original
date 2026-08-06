import React, { useState } from 'react';
import { AcademicEvent, AssignmentTask } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Tag, 
  Info, 
  CheckCircle,
  FileText,
  X,
  AlertCircle,
  Bell,
  Filter,
  BookOpen,
  User,
  CalendarDays
} from 'lucide-react';

interface CalendarSchedulerProps {
  events: AcademicEvent[];
  onAddEvent: (event: AcademicEvent) => void;
  activeRole: string;
  schoolClasses?: string[];
  assignments?: AssignmentTask[];
  onAddAssignment?: (assignment: AssignmentTask) => void;
  schoolSubjects?: string[];
  onTriggerPushNotification?: (text: string, type: 'attendance' | 'grade' | 'announcement' | 'system') => void;
}

export default function CalendarScheduler({
  events,
  onAddEvent,
  activeRole,
  schoolClasses = [
    "Kelas 1-A (SD)",
    "Kelas 1-B (SD)",
    "Kelas 2-A (SD)",
    "Kelas 3-A (SD)",
    "Kelas 4-A (SD)",
    "Kelas 5-A (SD)",
    "Kelas 6-A (SD)",
    "Kelas 7-A (SMP)",
    "Kelas 7-B (SMP)",
    "Kelas 8-A (SMP)",
    "Kelas 8-B (SMP)",
    "Kelas 9-A (SMP)"
  ],
  assignments = [],
  onAddAssignment,
  schoolSubjects = [
    "Matematika",
    "IPA (Sains)",
    "IPS (Sosial)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Pancasila"
  ],
  onTriggerPushNotification
}: CalendarSchedulerProps) {
  // Current active date is set to June 2026 (matching our context)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 is June
  const [selectedDay, setSelectedDay] = useState<number | null>(28); // Default to June 28

  // Calendar Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'cbt' | 'task' | 'meeting' | 'holiday' | 'event'>('all');

  // New Event Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false); // Flag if scheduling a task/deadline
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<AcademicEvent['type'] | 'task'>('cbt');
  const [evtClass, setEvtClass] = useState(schoolClasses[0] || 'Kelas 4-A (SD)');
  const [evtSubject, setEvtSubject] = useState(schoolSubjects[0] || 'Matematika');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtTime, setEvtTime] = useState('23:59'); // Default deadline time
  const [evtSuccess, setEvtSuccess] = useState(false);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Pad dates array with blanks for correct calendar offset alignment
  const calendarCells: Array<number | null> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const getFormattedDateString = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Extract Assignments as Unified Virtual Calendar Events
  const virtualAssignmentEvents = assignments.map(a => {
    const datePart = a.deadline ? a.deadline.split('T')[0] : '';
    const timePart = a.deadline && a.deadline.includes('T') ? a.deadline.split('T')[1] : '23:59';
    return {
      id: a.id,
      title: `[TUGAS] ${a.subject}: ${a.title}`,
      date: datePart,
      type: 'task' as const,
      className: a.className,
      description: `Batas pengumpulan jam ${timePart}. Deskripsi: ${a.description}`,
      author: a.teacherName,
      subject: a.subject,
      rawAssignment: a
    };
  });

  // Combine standard events and virtual assignment events
  const allCombinedItems = [
    ...events.map(e => ({ ...e, author: 'Sistem Akademik', subject: undefined as string | undefined, rawAssignment: undefined as any })),
    ...virtualAssignmentEvents
  ];

  // Filter combined list by type filter
  const getFilteredItemsForDate = (dateStr: string) => {
    return allCombinedItems.filter(item => {
      if (item.date !== dateStr) return false;
      if (activeFilter === 'all') return true;
      return item.type === activeFilter;
    });
  };

  // Filter events/assignments for the selected day
  const selectedDateStr = selectedDay ? getFormattedDateString(selectedDay) : '';
  const selectedDayItems = allCombinedItems.filter(item => item.date === selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !selectedDay) return;

    const dateStr = getFormattedDateString(selectedDay);

    if (evtType === 'task') {
      // Create a real E-learning task assignment!
      if (onAddAssignment) {
        const newAssignment: AssignmentTask = {
          id: `task_${Date.now()}`,
          title: evtTitle,
          subject: evtSubject,
          className: evtClass,
          teacherName: activeRole === 'kepsek' ? 'Kepala Sekolah' : 'Wali Kelas / Guru',
          deadline: `${dateStr}T${evtTime}`,
          description: evtDesc,
          questions: [], // start empty
          allowImageUpload: true,
          taskType: 'tugas',
          createdAt: new Date().toISOString()
        };
        onAddAssignment(newAssignment);
        
        // Push notification update
        if (onTriggerPushNotification) {
          onTriggerPushNotification(
            `📢 Tugas baru ditambahkan via Kalender: ${evtSubject} - ${evtTitle} untuk kelas ${evtClass}!`,
            'announcement'
          );
        }
      }
    } else {
      // Create a standard academic event
      const newEvent: AcademicEvent = {
        id: `ev_${Date.now()}`,
        title: evtTitle,
        date: dateStr,
        type: evtType as AcademicEvent['type'],
        className: evtType === 'cbt' ? evtClass : undefined,
        description: evtDesc
      };
      onAddEvent(newEvent);

      // Push notification update
      if (onTriggerPushNotification) {
        let notifType: 'announcement' | 'system' = 'announcement';
        if (newEvent.type === 'holiday') notifType = 'system';
        onTriggerPushNotification(
          `📅 Agenda Baru Kalender: ${newEvent.title} (${newEvent.type.toUpperCase()}) dijadwalkan pada ${dateStr}`,
          notifType
        );
      }
    }

    setEvtTitle('');
    setEvtDesc('');
    setShowAddForm(false);
    setEvtSuccess(true);

    setTimeout(() => {
      setEvtSuccess(false);
    }, 3000);
  };

  const handlePushImmediateAnnouncement = (item: any) => {
    if (onTriggerPushNotification) {
      onTriggerPushNotification(
        `📢 PENGINGAT REAL-TIME: Agenda "${item.title}" untuk kelas ${item.className || 'Semua Kelas'} dijadwalkan tanggal ${item.date}. Harap diperhatikan!`,
        'announcement'
      );
    }
  };

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'cbt': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'holiday': 
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50';
      case 'meeting': 
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
      case 'event': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'task':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'cbt': return '📝';
      case 'holiday': return '🏖️';
      case 'meeting': return '🤝';
      case 'event': return '🏆';
      case 'task': return '📘';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white flex items-center gap-2">
            <span>📅</span> Kalender Akademik & Tugas Terintegrasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
            Penjadwalan efisien tugas harian, agenda ujian CBT, rapat, dan libur nasional terintegrasi langsung dengan e-learning.
          </p>
        </div>
        
        {(activeRole === 'admin' || activeRole === 'kepsek' || activeRole === 'guru') && selectedDay && !showAddForm && (
          <button
            id="add-event-btn"
            onClick={() => {
              setShowAddForm(true);
              setEvtType('cbt');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Buat Agenda / Tugas Baru</span>
          </button>
        )}
      </div>

      {evtSuccess && (
        <div id="event-success-alert" className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle size={16} />
          <span>Agenda & Notifikasi Berhasil Terdistribusi Real-time ke Semua Sektor!</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 dark:bg-[#1b1c30]/40 border dark:border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          🔍 Semua Agenda
        </button>
        <button
          onClick={() => setActiveFilter('cbt')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'cbt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'}`}
        >
          📝 Ujian CBT
        </button>
        <button
          onClick={() => setActiveFilter('task')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'task' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-sky-400'}`}
        >
          📘 Tugas & PR
        </button>
        <button
          onClick={() => setActiveFilter('meeting')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'meeting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-amber-400'}`}
        >
          🤝 Rapat Sekolah
        </button>
        <button
          onClick={() => setActiveFilter('holiday')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'holiday' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-rose-400'}`}
        >
          🏖️ Hari Libur
        </button>
        <button
          onClick={() => setActiveFilter('event')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeFilter === 'event' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'}`}
        >
          🏆 Kegiatan Ekstra
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE MONTH CALENDAR (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm">
          
          {/* Header Month / Year controls */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b dark:border-[#3e405b]/40">
            <span className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-emerald-600" />
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-slate-100 dark:bg-[#232333] border rounded-lg dark:border-[#3e405b] text-xs font-bold cursor-pointer transition-colors"
              >
                ◀
              </button>
              <button 
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-slate-100 dark:bg-[#232333] border rounded-lg dark:border-[#3e405b] text-xs font-bold cursor-pointer transition-colors"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Grid Layout of Days */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Days of Week headers */}
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, index) => (
              <span key={d} className={`font-black text-gray-400 py-1 ${index === 0 ? 'text-rose-500' : ''}`}>{d}</span>
            ))}

            {/* Calendar cells */}
            {calendarCells.map((day, cellIndex) => {
              if (day === null) {
                return <div key={`empty-${cellIndex}`} className="h-14 bg-slate-50/10 dark:bg-transparent rounded-xl" />;
              }

              const fullDateStr = getFormattedDateString(day);
              const dayItems = getFilteredItemsForDate(fullDateStr);
              const isSelected = selectedDay === day;

              // Color codes if there are events on this day
              let cellEventStyles = 'border-transparent';
              if (dayItems.length > 0) {
                if (dayItems.some(e => e.type === 'holiday')) {
                  cellEventStyles = 'border-rose-300 dark:border-rose-900 bg-rose-500/5';
                } else if (dayItems.some(e => e.type === 'cbt')) {
                  cellEventStyles = 'border-emerald-300 dark:border-emerald-900 bg-emerald-500/5';
                } else if (dayItems.some(e => e.type === 'task')) {
                  cellEventStyles = 'border-sky-300 dark:border-sky-900 bg-sky-500/5';
                } else {
                  cellEventStyles = 'border-emerald-300 dark:border-emerald-900 bg-emerald-500/5';
                }
              }

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-14 border rounded-xl flex flex-col justify-between p-2 transition-all cursor-pointer relative
                    ${isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md scale-[1.03]' 
                      : `hover:bg-slate-50 dark:hover:bg-[#232333]/80 ${cellEventStyles}`}`}
                >
                  <span className="font-mono text-xs font-bold self-start">{day}</span>
                  
                  {/* Small dots indicators for multiple events */}
                  {dayItems.length > 0 && (
                    <div className="flex gap-1 justify-center w-full mt-1">
                      {dayItems.slice(0, 3).map(item => (
                        <span 
                          key={item.id} 
                          className={`w-1.5 h-1.5 rounded-full
                            ${isSelected ? 'bg-white' : 
                             item.type === 'cbt' ? 'bg-emerald-500' : 
                             item.type === 'task' ? 'bg-sky-500' : 
                             item.type === 'holiday' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EVENTS SPECIFIC LIST & CREATION FORM (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Day's schedules lists */}
          {selectedDay && !showAddForm && (
            <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm flex flex-col h-full justify-between space-y-4">
              <div>
                <h2 className="text-sm font-black text-gray-700 dark:text-gray-200 border-b dark:border-[#3e405b]/40 pb-3 mb-3 flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={18} className="text-emerald-500" />
                    Agenda Hari: {selectedDay} {monthNames[currentMonth]} {currentYear}
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-extrabold px-2.5 py-0.5 rounded-full">
                    {selectedDayItems.length} Agenda
                  </span>
                </h2>

                {selectedDayItems.length === 0 ? (
                  <div className="text-center py-12 space-y-2.5">
                    <AlertCircle size={36} className="text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Senggang! Tidak ada jadwal, ujian CBT, atau tugas sekolah pada tanggal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedDayItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-xl text-xs space-y-2 relative group transition-all hover:shadow-xs ${getEventTypeStyle(item.type)}`}
                      >
                        <div className="flex justify-between font-bold items-start gap-2">
                          <span className="font-extrabold text-xs">{item.title}</span>
                          <span className="text-[9px] uppercase tracking-wider font-black opacity-85 shrink-0 px-2 py-0.5 rounded bg-white/20 dark:bg-black/20">
                            {getEventTypeIcon(item.type)} {item.type}
                          </span>
                        </div>
                        {item.className && (
                          <div className="flex justify-between items-center text-[10px] opacity-85">
                            <span>Sasar Kelas: <strong className="font-bold">{item.className}</strong></span>
                            {item.subject && <span>Subyek: <strong className="font-bold">{item.subject}</strong></span>}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-[10px] opacity-90 leading-relaxed font-semibold italic bg-white/10 dark:bg-black/10 p-2 rounded">
                            " {item.description} "
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-current/10 text-[9px] opacity-80">
                          <span>Pembuat: <strong className="font-bold">{item.author}</strong></span>
                          
                          {/* Push Reminder Button for teachers/headmaster */}
                          {(activeRole === 'admin' || activeRole === 'kepsek' || activeRole === 'guru') && (
                            <button
                              type="button"
                              onClick={() => handlePushImmediateAnnouncement(item)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Kirim Pesan Pengingat ke Seluruh Siswa/Wali"
                            >
                              <Bell size={10} />
                              <span>Push Notif</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick inline Event creator */}
          {showAddForm && selectedDay && (
            <div id="add-event-form" className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-emerald-500/30 shadow-xl animate-scale-up space-y-4">
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">📅</span>
                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Jadwalkan Agenda ({selectedDateStr})
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama / Agenda Acara</label>
                  <input
                    id="event-title-input"
                    type="text"
                    placeholder="Contoh: Try Out PAS Bersama / Tugas Bahasa Inggris"
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori Agenda</label>
                    <select
                      value={evtType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEvtType(val as any);
                        setIsCreatingTask(val === 'task');
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none font-semibold"
                    >
                      <option value="cbt">📝 Ujian CBT</option>
                      <option value="task">📘 Tugas & PR</option>
                      <option value="event">🏆 Kegiatan Ekstra</option>
                      <option value="meeting">🤝 Rapat Sekolah</option>
                      <option value="holiday">🏖️ Hari Libur</option>
                    </select>
                  </div>
                  
                  {evtType === 'task' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mata Pelajaran</label>
                      <select
                        value={evtSubject}
                        onChange={(e) => setEvtSubject(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none font-semibold"
                      >
                        {schoolSubjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kelas Sasaran (CBT)</label>
                      <select
                        value={evtClass}
                        disabled={evtType !== 'cbt'}
                        onChange={(e) => setEvtClass(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white disabled:opacity-45 focus:outline-none font-semibold"
                      >
                        {schoolClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {evtType === 'task' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kelas Penerima Tugas</label>
                      <select
                        value={evtClass}
                        onChange={(e) => setEvtClass(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none font-semibold"
                      >
                        {schoolClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Jam Deadline</label>
                      <input
                        type="time"
                        value={evtTime}
                        onChange={(e) => setEvtTime(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Keterangan / Deskripsi Rinci</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis deskripsi acara atau instruksi tugas secara detail..."
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold leading-relaxed"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    id="submit-event-btn"
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer text-xs shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>💾 Simpan & Sinkron</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
