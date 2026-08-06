import React, { useState } from 'react';
import { ClassJournal, Student, Attendance } from '../types';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  ListTodo, 
  Users,
  Search,
  BookMarked
} from 'lucide-react';

interface JournalManagerProps {
  journals: ClassJournal[];
  onAddJournal: (journal: ClassJournal) => void;
  students: Student[];
  attendance: Attendance[];
  activeRole: string;
  schoolClasses?: string[];
  schoolSubjects?: string[];
  session?: { username: string; role: string; name: string; detailId?: string; subject?: string };
}

export default function JournalManager({
  journals,
  onAddJournal,
  students,
  attendance,
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
  schoolSubjects = [
    "Matematika",
    "IPA (Sains)",
    "IPS (Sosial)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Pancasila"
  ],
  session
}: JournalManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filterClass, setFilterClass] = useState('Semua Kelas');
  const [filterSubject, setFilterSubject] = useState('Semua Mata Pelajaran');

  // New Journal state
  const [className, setClassName] = useState(schoolClasses[0] || 'Kelas 4-A (SD)');
  const [subject, setSubject] = useState(schoolSubjects[0] || 'Matematika');
  const [teacherName, setTeacherName] = useState(session?.name || 'Abdillah Putra, M.Pd.');
  const [topic, setTopic] = useState('');
  const [method, setMethod] = useState('Problem Based Learning & Diskusi Kelompok');
  const [customMethod, setCustomMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [rppFile, setRppFile] = useState<string | null>(null);
  const [rppFileName, setRppFileName] = useState<string>('');
  const [journalSuccess, setJournalSuccess] = useState(false);

  // Curriculum tracker state (for tracking taught and remaining subjects)
  const curriculumMap = [
    { id: 'math_1', class: 'Kelas 4-A (SD)', subject: 'Matematika', topic: 'Pecahan Senilai & Sederhana', core: 'Bab 1 Pecahan', isTaught: true },
    { id: 'math_2', class: 'Kelas 4-A (SD)', subject: 'Matematika', topic: 'Penjumlahan dan Pengurangan Pecahan', core: 'Bab 1 Pecahan', isTaught: false },
    { id: 'math_3', class: 'Kelas 4-A (SD)', subject: 'Matematika', topic: 'FPB dan KPK', core: 'Bab 2 KPK FPB', isTaught: false },
    { id: 'sains_1', class: 'Kelas 8-B (SMP)', subject: 'IPA (Sains)', topic: 'Sistem Pencernaan Manusia', core: 'Bab 1 Sistem Organ', isTaught: true },
    { id: 'sains_2', class: 'Kelas 8-B (SMP)', subject: 'IPA (Sains)', topic: 'Sistem Pernapasan Manusia', core: 'Bab 1 Sistem Organ', isTaught: false },
    { id: 'ips_1', class: 'Kelas 8-B (SMP)', subject: 'IPS (Sosial)', topic: 'Interaksi Sosial Negara ASEAN', core: 'Bab 2 Keberagaman ASEAN', isTaught: true }
  ];

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMethod = method === 'Lainnya' ? customMethod : method;
    if (!topic || !finalMethod) return;

    const newJournal: ClassJournal = {
      id: `j_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      className,
      subject,
      teacherName,
      topic,
      method: finalMethod,
      notes,
      rppFile: rppFile || undefined,
      rppFileName: rppFileName || undefined,
      rppUploadedAt: rppFile ? new Date().toISOString() : undefined
    };

    onAddJournal(newJournal);
    setJournalSuccess(true);
    setTopic('');
    setNotes('');
    setRppFile(null);
    setRppFileName('');
    setShowAddForm(false);

    setTimeout(() => {
      setJournalSuccess(false);
    }, 3000);
  };

  // Check how many topics are taught vs remaining
  const filteredCurriculumMap = curriculumMap.filter(c => {
    if (activeRole === 'guru') {
      return schoolSubjects.includes(c.subject) && schoolClasses.includes(c.class);
    }
    return true;
  });

  const taughtCount = filteredCurriculumMap.filter(c => c.isTaught || journals.some(j => j.topic.toLowerCase().includes(c.topic.toLowerCase()))).length;
  const totalCount = filteredCurriculumMap.length;

  const filteredJournals = journals.filter(j => {
    // If logged in as teacher, only show journals for their assigned subjects and classes
    if (activeRole === 'guru') {
      if (!schoolSubjects.includes(j.subject)) return false;
      if (!schoolClasses.includes(j.className)) return false;
    }

    if (filterSubject !== 'Semua Mata Pelajaran') {
      if (j.subject !== filterSubject) {
        return false;
      }
    }
    
    if (filterClass !== 'Semua Kelas') {
      if (j.className !== filterClass) {
        return false;
      }
    }
    
    return (
      j.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white">Jurnal Harian Pembelajaran</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
            Pencatatan materi pembelajaran harian, metode, dan catatan penting agar kurikulum terpantau, tidak ada materi yang terlewat.
          </p>
        </div>
        {activeRole === 'guru' && !showAddForm && (
          <button
            id="add-journal-btn"
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Isi Jurnal Baru</span>
          </button>
        )}
      </div>

      {journalSuccess && (
        <div id="journal-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle size={16} />
          <span>Jurnal Harian Pembelajaran berhasil direkam dan disinkronisasikan!</span>
        </div>
      )}

      {/* NEW JOURNAL ENTRY FORM */}
      {showAddForm && (
        <div id="add-journal-form" className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/50 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-[#3e405b]">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
              Form Jurnal Harian Pembelajaran
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleJournalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Kelas Sasaran</label>
                <select
                  id="journal-class-select"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                >
                  {schoolClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Mata Pelajaran</label>
                <select
                  id="journal-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                >
                  {schoolSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nama Guru (NIP)</label>
                <input
                  id="journal-teacher-input"
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Topik / Materi Pembelajaran (Silabus)</label>
              <input
                id="journal-topic-input"
                type="text"
                placeholder="Contoh: Operasi Penjumlahan dan Perkalian Matriks"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Metode Pembelajaran</label>
              <select
                id="journal-method-select"
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  if (e.target.value !== 'Lainnya') {
                    setCustomMethod('');
                  }
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
              >
                <option value="Problem Based Learning & Diskusi Kelompok">Problem Based Learning & Diskusi Kelompok</option>
                <option value="Eksperimen Laboratorium & Praktikum Mandiri">Eksperimen Laboratorium & Praktikum Mandiri</option>
                <option value="Ceramah Interaktif & Penugasan Terstruktur">Ceramah Interaktif & Penugasan Terstruktur</option>
                <option value="Blended Learning (Online + Offline)">Blended Learning (Online + Offline)</option>
                <option value="Lainnya">Lainnya (Tulis Sendiri)...</option>
              </select>
              {method === 'Lainnya' && (
                <input
                  type="text"
                  placeholder="Tuliskan metode pembelajaran Anda di sini..."
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 mt-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Catatan Selama Pembelajaran / Hambatan Siswa</label>
              <textarea
                id="journal-notes-textarea"
                rows={3}
                placeholder="Tulis hambatan, siswa yang tidak tuntas, atau catatan keaktifan kelas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
              />
            </div>

            <div className="flex flex-col items-start mb-1">
              <a 
                href="https://generator-rpp-pm-stem-estuga-266662401322.asia-southeast1.run.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800/50 transition-colors shadow-sm"
              >
                <span className="text-sm">✨</span>
                Generator Tulis RPP
              </a>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Lampiran RPP Pembelajaran Harian <span className="text-[10px] text-slate-400 font-normal">(Opsional - PDF saja)</span>
              </label>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-2 max-w-md">
                ⚠️ RPP yang diunggah akan otomatis terhapus secara permanen setelah 24 jam untuk menghemat memori penyimpanan sistem.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 dark:border-[#3e405b] hover:border-emerald-500 rounded-lg bg-gray-50 dark:bg-[#1f2030] cursor-pointer text-xs transition-colors z-0">
                  <FileText size={16} className="text-slate-400" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {rppFileName ? "Ganti RPP PDF" : "Unggah RPP Pembelajaran"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setRppFile(reader.result as string);
                          setRppFileName(file.name);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {rppFileName && (
                  <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100/30 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="truncate max-w-[200px] font-mono">{rppFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRppFile(null);
                        setRppFileName('');
                      }}
                      className="text-rose-500 hover:text-rose-700 font-extrabold text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-semibold border px-4 py-2 rounded-lg bg-white dark:bg-[#232333] text-gray-600 dark:text-gray-300 dark:border-[#3e405b] cursor-pointer"
              >
                Batal
              </button>
              <button
                id="submit-journal-btn"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Simpan Jurnal & Hubungkan Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN TWO COLUMN: CURRICULUM MONITOR vs JOURNAL LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CURRICULUM MONITOR (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1">
              <ListTodo size={18} className="text-emerald-600 dark:text-emerald-400" />
              Kontrol Kurikulum & Silabus
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Visualisasi progres materi untuk menghindari materi terlewat. Otomatis tercentang ketika jurnal diisi dengan topik tersebut.
            </p>

            {/* Visual Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Materi Terajarkan</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {taughtCount} dari {totalCount} Topik ({Math.round((taughtCount / totalCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-[#232333] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(taughtCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Interactive Silabus list */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {filteredCurriculumMap.map(curr => {
                const isTaught = curr.isTaught || journals.some(j => 
                  j.subject.toLowerCase() === curr.subject.toLowerCase() && 
                  j.topic.toLowerCase().includes(curr.topic.toLowerCase())
                );

                return (
                  <div 
                    key={curr.id}
                    className={`p-3 rounded-lg border text-xs flex justify-between items-start gap-2
                      ${isTaught 
                        ? 'bg-emerald-50/55 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                        : 'bg-gray-50/50 border-gray-100 dark:bg-[#232333]/30 dark:border-[#3e405b] text-gray-500 dark:text-gray-400'}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.25 bg-white dark:bg-[#232333] border rounded font-mono font-semibold">
                          {curr.class}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{curr.subject}</span>
                      </div>
                      <h4 className={`font-bold ${isTaught ? 'text-gray-800 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {curr.topic}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">{curr.core}</p>
                    </div>

                    <div className="mt-1">
                      {isTaught ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white font-bold rounded flex items-center gap-1">
                          Tuntas
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded">
                          Belum
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORIC JOURNAL LOG (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <BookMarked size={18} className="text-emerald-600 dark:text-emerald-400" />
                Daftar Riwayat Jurnal Mengajar
              </h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-1.75 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {schoolClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-1.75 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                >
                  <option value="Semua Mata Pelajaran">Semua Mapel</option>
                  {schoolSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-2.5 top-2.5 text-gray-400"><Search size={14} /></span>
                  <input
                    id="search-journal-input"
                    type="text"
                    placeholder="Cari jurnal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.75 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredJournals.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Tidak ada jurnal pembelajaran ditemukan.</p>
              ) : (
                filteredJournals.map(journal => {
                  // Find if there were absences on this day in this class
                  const absCount = attendance.filter(a => a.className === journal.className && a.date === journal.date && a.status !== 'hadir').length;

                  return (
                    <div 
                      key={journal.id} 
                      className="p-4 rounded-xl border border-gray-100 dark:border-[#3e405b]/70 bg-white dark:bg-[#232333]/40 shadow-xs hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-[#3e405b]/40 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.75 rounded-full font-mono">
                            {journal.className}
                          </span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{journal.subject}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                          <Calendar size={12} />
                          {journal.date}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase block tracking-wider">Topik Pembelajaran</span>
                          <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{journal.topic}</p>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase block tracking-wider">Metode Pembelajaran</span>
                          <p className="text-gray-600 dark:text-gray-300 mt-0.5">{journal.method}</p>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase block tracking-wider">Catatan Kelas & Hambatan</span>
                          <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-[#232333]/80 p-2.5 rounded-lg border dark:border-[#3e405b]/50 mt-1">
                            {journal.notes}
                          </p>
                        </div>

                        {/* RPP Attachment indicator/downloader */}
                        {journal.rppFile && (
                          <div className="p-2.5 rounded-lg border border-emerald-100/30 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-400 uppercase font-semibold leading-none">RPP Terlampir</p>
                                <p className="text-[10px] text-slate-700 dark:text-slate-300 font-mono truncate mt-0.5">{journal.rppFileName || "rpp_pembelajaran.pdf"}</p>
                              </div>
                            </div>
                            <a
                              href={journal.rppFile}
                              download={journal.rppFileName || "rpp_pembelajaran.pdf"}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md transition-all text-[10px] flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                            >
                              Unduh 📥
                            </a>
                          </div>
                        )}

                        {/* RPP Feedback comment from Principal */}
                        {journal.rppFeedback && (
                          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-lg space-y-1 mt-2 shadow-inner">
                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                              <span>💬 Supervisi RPP (Kepala Sekolah):</span>
                              <span className="text-[9px] text-gray-400 font-mono font-normal">({journal.rppFeedbackDate})</span>
                            </div>
                            <p className="text-[11px] text-gray-700 dark:text-gray-300 italic font-serif">
                              "{journal.rppFeedback}"
                            </p>
                          </div>
                        )}

                        {/* Connected indicators */}
                        <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                          <span className="font-medium">Guru: {journal.teacherName}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-emerald-500" />
                              {absCount > 0 ? `${absCount} Izin/Sakit Terkoneksi` : 'Siswa Hadir Semua'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
