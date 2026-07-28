import React, { useState } from 'react';
import { VirtualMeet, Student } from '../types';
import { Video, Calendar, Clock, BookOpen, Trash2, Check, Plus } from 'lucide-react';

interface VirtualMeetManagerProps {
  virtualMeets: VirtualMeet[];
  setVirtualMeets: React.Dispatch<React.SetStateAction<VirtualMeet[]>>;
  students: Student[];
  activeRole: string;
  session?: { name: string; role: string; detailId?: string } | null;
  schoolClasses?: string[];
}

export default function VirtualMeetManager({
  virtualMeets,
  setVirtualMeets,
  students,
  activeRole,
  session,
  schoolClasses = ["Kelas 4-A (SD)"]
}: VirtualMeetManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Form states
  const [meetTitle, setMeetTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([schoolClasses[0] || 'Kelas 4-A (SD)']);
  const [description, setDescription] = useState('');

  const currentStudent = ((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') ? students.find(s => s.id === session?.detailId) : null;

  const handleCreateMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle || !meetLink || !meetDate || !meetTime || !subject || selectedClasses.length === 0) {
      alert('Mohon lengkapi semua form jadwal Google Meet.');
      return;
    }

    const scheduledTimestamp = `${meetDate}T${meetTime}`;

    selectedClasses.forEach(cls => {
      const newMeet: VirtualMeet = {
        id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: meetTitle,
        subject,
        className: cls,
        teacherName: session?.name || 'Guru',
        meetLink,
        scheduledAt: scheduledTimestamp,
        description: description,
        createdAt: new Date().toISOString()
      };
      
      setVirtualMeets(prev => [...prev, newMeet]);
    });

    setMeetTitle('');
    setMeetLink('');
    setMeetDate('');
    setMeetTime('');
    setDescription('');
    setActiveTab('list');
    alert('Jadwal Google Meet berhasil dibuat dan dibagikan ke siswa.');
  };

  const filteredMeets = virtualMeets.filter(meet => {
    if (((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') && currentStudent) {
      const matchClass = meet.className === currentStudent.className || meet.className === 'Semua Kelas' || meet.className.includes(currentStudent.className);
      const isExpired = new Date(meet.scheduledAt).getTime() + 3 * 3600 * 1000 < Date.now();
      return matchClass && !isExpired;
    }
    if (activeRole === 'guru' && session?.name) return meet.teacherName === session.name;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Video className="text-indigo-600" />
            Jadwal Virtual Meet
          </h2>
          <p className="text-xs text-slate-500 mt-1">Kelola jadwal pertemuan virtual atau tatap muka online.</p>
        </div>

        {activeRole === 'guru' && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer
                ${activeTab === 'list'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
            >
              Daftar Meet
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1
                ${activeTab === 'create'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
            >
              <Plus size={14} />
              Jadwal Baru
            </button>
          </div>
        )}
      </div>

      {activeTab === 'create' && (
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto">
          <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Video className="text-indigo-600" size={20} />
              Jadwalkan Google Meet Baru
            </h2>
          </div>
          
          <form onSubmit={handleCreateMeet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Judul Meeting <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={meetTitle} 
                  onChange={e => setMeetTitle(e.target.value)} 
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  placeholder="Misal: Pembahasan Bab 1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mata Pelajaran <span className="text-red-500">*</span></label>
                <select 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="Matematika">Matematika</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="IPA">IPA</option>
                  <option value="IPS">IPS</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Pendidikan Agama">Pendidikan Agama</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tanggal <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={meetDate} 
                  onChange={e => setMeetDate(e.target.value)} 
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jam <span className="text-red-500">*</span></label>
                <input 
                  type="time" 
                  value={meetTime} 
                  onChange={e => setMeetTime(e.target.value)} 
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Link Google Meet <span className="text-red-500">*</span></label>
              <input 
                type="url" 
                value={meetLink} 
                onChange={e => setMeetLink(e.target.value)} 
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pilih Kelas <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2 pt-1">
                {schoolClasses.map(cls => (
                  <label key={cls} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-colors ${selectedClasses.includes(cls) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={selectedClasses.includes(cls)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedClasses(prev => [...prev, cls]);
                        else setSelectedClasses(prev => prev.filter(c => c !== cls));
                      }}
                    />
                    {selectedClasses.includes(cls) && <Check size={12} />}
                    {cls}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Deskripsi / Catatan Tambahan (Opsional)</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[80px]"
                placeholder="Persiapkan buku catatan..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Video size={16} />
                Bagikan Jadwal Meet
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-4">
          {filteredMeets.length === 0 ? (
            <div className="bg-white dark:bg-[#111625] rounded-xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
               <Video size={32} className="mx-auto mb-3 text-indigo-400 opacity-50" />
               <p className="font-bold text-slate-500">Belum Ada Jadwal Meet</p>
               {activeRole === 'guru' && (
                 <p className="text-xs mt-1">Gunakan tombol "Jadwal Baru" untuk membuat meeting virtual.</p>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeets.map(meet => {
                const scheduledDate = new Date(meet.scheduledAt);
                const isUpcoming = scheduledDate > new Date();
                return (
                  <div key={meet.id} className={`p-5 rounded-xl border relative transition-all shadow-sm ${isUpcoming ? 'bg-white dark:bg-[#111625] border-indigo-100 dark:border-indigo-800/50' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'}`}>
                    {activeRole === 'guru' && (
                      <button 
                        onClick={() => {
                          if(window.confirm('Hapus jadwal meet ini?')) {
                            setVirtualMeets(prev => prev.filter(m => m.id !== meet.id));
                          }
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-md transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-lg ${isUpcoming ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        <Video size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 pr-6 leading-tight">{meet.title}</h3>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><BookOpen size={10}/> {meet.subject} • {meet.className}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className={`flex flex-col gap-1 p-2 rounded-lg text-xs font-bold border ${isUpcoming ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800/50 dark:text-indigo-300' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Tanggal</span>
                        <div className="flex items-center gap-1"><Calendar size={12} /> {scheduledDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className={`flex flex-col gap-1 p-2 rounded-lg text-xs font-bold border ${isUpcoming ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Jam</span>
                        <div className="flex items-center gap-1"><Clock size={12} /> {scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    
                    {meet.description && (
                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-[#090d16]/50 p-2 rounded border border-slate-100 dark:border-slate-800/50">{meet.description}</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <a 
                        href={meet.meetLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${isUpcoming ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        <Video size={14} />
                        Join Google Meet
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
