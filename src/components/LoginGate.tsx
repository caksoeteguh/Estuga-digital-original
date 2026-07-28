import React, { useState } from 'react';
import { UserRole, Student, Teacher } from '../types';
import { 
  ShieldAlert, 
  Key, 
  User, 
  Lock, 
  HelpCircle, 
  ArrowRight, 
  Eye, 
  EyeOff,
  UserCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface LoginGateProps {
  students: Student[];
  teachers: Teacher[];
  schoolIdentity: any;
  dbError?: string | null;
  onLogin: (session: {
    username: string;
    role: UserRole;
    name: string;
    detailId?: string;
    subject?: string;
  }) => void;
  isDark: boolean;
}

export default function LoginGate({
  students,
  teachers,
  schoolIdentity,
  onLogin,
  isDark,
  dbError
}: LoginGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const adminEmail = schoolIdentity?.adminEmail || 'admin';
  const adminPassword = schoolIdentity?.adminPassword || 'admin123';
  const kepsekEmail = schoolIdentity?.kepsekEmail || 'kepsek123';
  const kepsekPassword = schoolIdentity?.kepsekPassword || 'kepsek123';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Admin
    if (cleanUser === (adminEmail || "").trim().toLowerCase() && cleanPass === (adminPassword || "").trim()) {
      onLogin({
        username: adminEmail,
        role: 'admin',
        name: 'Administrator'
      });
      return;
    }

    // 2. Check Kepala Sekolah
    if (cleanUser === (kepsekEmail || "").trim().toLowerCase() && cleanPass === (kepsekPassword || "").trim()) {
      onLogin({
        username: kepsekEmail,
        role: 'kepsek',
        name: schoolIdentity?.kepsekName || 'Bapak/Ibu Kepala Sekolah'
      });
      return;
    }

    // 3. Check Teacher credentials from the database list
    const foundTeacher = teachers.find(t => (t.username || "").trim().toLowerCase() === cleanUser && (t.password || "").trim() === cleanPass);
    if (foundTeacher) {
      onLogin({
        username: foundTeacher.username,
        role: 'guru',
        name: foundTeacher.name,
        detailId: foundTeacher.id,
        subject: foundTeacher.subject
      });
      return;
    }

    // 4. Check Parent credentials from the database list
    const foundStudentForParent = students.find(s => (s.usernameParent || "").trim().toLowerCase() === cleanUser && (s.passwordParent || "").trim() === cleanPass);
    if (foundStudentForParent) {
      onLogin({
        username: foundStudentForParent.usernameParent,
        role: 'walimurid',
        name: `Wali Murid dari ${foundStudentForParent.name}`,
        detailId: foundStudentForParent.id
      });
      return;
    }

    // 5. Check Student (Siswa) credentials from the database list
    const foundStudent = students.find(s => (s.usernameCbt || "").trim().toLowerCase() === cleanUser && (s.passwordCbt || "").trim() === cleanPass);
    if (foundStudent) {
      onLogin({
        username: foundStudent.usernameCbt,
        role: 'siswa',
        name: foundStudent.name,
        detailId: foundStudent.id
      });
      return;
    }

    // If none matches
    setErrorMsg('Username atau Password salah. Gunakan panduan akun uji coba di bawah untuk masuk.');
  };

  const handleQuickDemoLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMsg('');
    
    // Auto submit simulating typing and logging in beautifully
    setTimeout(() => {
      // 1. Check Admin
      if (demoUser === adminEmail && demoPass === adminPassword) {
        onLogin({
          username: adminEmail,
          role: 'admin',
          name: 'Administrator'
        });
        return;
      }

      // 2. Check Kepala Sekolah
      if (demoUser === kepsekEmail && demoPass === kepsekPassword) {
        onLogin({
          username: kepsekEmail,
          role: 'kepsek',
          name: schoolIdentity?.kepsekName || 'Bapak/Ibu Kepala Sekolah'
        });
        return;
      }

      // 3. Check Teacher credentials
      const foundTeacher = teachers.find(
        t => t.username === demoUser && t.password === demoPass
      );
      if (foundTeacher) {
        onLogin({
          username: foundTeacher.username,
          role: 'guru',
          name: foundTeacher.name,
          detailId: foundTeacher.id,
          subject: foundTeacher.subject
        });
        return;
      }

      // 4. Check Parent credentials
      const foundStudentForParent = students.find(
        s => s.usernameParent === demoUser && s.passwordParent === demoPass
      );
      if (foundStudentForParent) {
        onLogin({
          username: foundStudentForParent.usernameParent,
          role: 'walimurid',
          name: `Wali Murid dari ${foundStudentForParent.name}`,
          detailId: foundStudentForParent.id
        });
        return;
      }

      // 5. Check Student credentials
      const foundStudent = students.find(
        s => s.usernameCbt === demoUser && s.passwordCbt === demoPass
      );
      if (foundStudent) {
        onLogin({
          username: foundStudent.usernameCbt,
          role: 'siswa',
          name: foundStudent.name,
          detailId: foundStudent.id
        });
        return;
      }
    }, 150);
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center p-4 py-8 md:py-12 transition-all duration-500 relative overflow-y-auto overflow-x-hidden
      ${isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-800'}`}
    >
      {/* Decorative gradient glow in dark mode */}
      {isDark && (
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      )}
      {isDark && (
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center relative z-10">
        
        {/* Left column: Beautiful branding with high contrast, elegant typography */}
        <div className="md:col-span-6 space-y-4 md:space-y-8 text-center md:text-left select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full uppercase tracking-wider font-mono">
            <Sparkles size={14} className="animate-spin text-indigo-500" style={{ animationDuration: '4s' }} />
            Sistem Informasi Akademik Sekolah
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-slate-800 dark:text-white">
              Portal Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">EstugaDigital</span>
            </h1>
            <p className="hidden md:block text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Platform penunjang pendidikan modern yang mengintegrasikan <span className="font-semibold text-indigo-600 dark:text-indigo-400">Wali Kelas</span>, <span className="font-semibold text-indigo-600 dark:text-indigo-400">Guru</span>, <span className="font-semibold text-indigo-600 dark:text-indigo-400">Kepala Sekolah</span>, dan <span className="font-semibold text-indigo-600 dark:text-indigo-400">Wali Murid</span> secara langsung dan real-time.
            </p>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4 pt-2">
            <div className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center md:text-left shadow-sm">
              <span className="text-2xl">📷</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-2">QR Code Presensi</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Scan kartu murid langsung mengirim notifikasi WhatsApp otomatis ke orang tua.</p>
            </div>
            <div className="p-5 bg-white dark:bg-[#111625] rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center md:text-left shadow-sm">
              <span className="text-2xl">📝</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-2">CBT & E-Learning</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Ujian online 6 tipe soal lengkap dan bank materi terpadu yang interaktif.</p>
            </div>
          </div>
        </div>

        {/* Right column: Login form card */}
        <div className="md:col-span-6">
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-6 md:p-10 border border-slate-100 dark:border-slate-800/80 shadow-2xl space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Formulir Log Masuk</h2>
              <p className="text-xs text-slate-400">Gunakan kredensial akun Anda untuk mengakses portal.</p>
            </div>

          {dbError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
              ⚠️ <b>Koneksi Database Gagal</b><br/>
              {dbError}<br/>
              Pastikan Anda sudah mengimpor data ke server database MySQL yang baru melalui panel Admin (tombol "Sinkronkan Data Lokal ke DB Baru"). Jika sudah, cek konfigurasi koneksi database Anda di file db.php.
            </div>
          )}
          {!dbError && students.length === 0 && teachers.length <= 1 && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
              ⚠️ <b>Koneksi Database Belum Tersinkron</b><br/>
              Data akun belum ditarik dari server atau database kosong. Jika login gagal, pastikan Admin telah mengunggah data ke database MySQL (atau sinkronisasi manual jika database masih kosong).
            </div>
          )}
          {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 flex items-start gap-2.5 leading-relaxed animate-shake">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-500 dark:text-slate-400">ID Pengguna / Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    id="login-username-input"
                    type="text"
                    placeholder="Contoh: adminutama, admin, abdillah_math"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full text-xs pl-10.5 pr-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 dark:bg-[#090d16]/60 dark:border-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-semibold text-slate-500 dark:text-slate-400">Sandi Masuk / Password</label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full text-xs pl-10.5 pr-10 py-3 rounded-xl border bg-slate-50/50 text-slate-800 dark:bg-[#090d16]/60 dark:border-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.99]"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 text-center">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>Lihat Panduan Akun Demo & Uji Coba</span>
              </button>

              {/* Demo Accounts List Panel */}
              {showDemoAccounts && (
                <div className="mt-4 bg-slate-50 dark:bg-[#090d16]/80 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-left text-[11px] space-y-3 max-h-[220px] overflow-y-auto">
                  <p className="font-semibold text-slate-600 dark:text-slate-300">💡 Klik baris di bawah untuk login simulasi instan:</p>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    
                    {/* Admin */}
                    <button 
                      onClick={() => handleQuickDemoLogin(adminEmail, adminPassword)}
                      className="w-full py-2.5 flex justify-between items-center hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 px-2 rounded-lg text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">👩‍🏫 Admin Utama</span>
                        <span className="text-[10px] text-slate-400">User: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{adminEmail}</span> | Pass: <span className="font-mono">{adminPassword}</span></span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-indigo-900/30">Pilih</span>
                    </button>

                    {/* Guru */}
                    <button 
                      onClick={() => handleQuickDemoLogin('abdillah_math', 'guru123')}
                      className="w-full py-2.5 flex justify-between items-center hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 px-2 rounded-lg text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">👨‍🏫 Guru Matematika (Abdillah Putra)</span>
                        <span className="text-[10px] text-slate-400">User: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">abdillah_math</span> | Pass: <span className="font-mono">guru123</span></span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-indigo-900/30">Pilih</span>
                    </button>

                    {/* Kepsek */}
                    <button 
                      onClick={() => handleQuickDemoLogin(kepsekEmail, kepsekPassword)}
                      className="w-full py-2.5 flex justify-between items-center hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 px-2 rounded-lg text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">👨‍💼 Kepala Sekolah ({schoolIdentity?.kepsekName || 'Bapak/Ibu Kepala Sekolah'})</span>
                        <span className="text-[10px] text-gray-400">User: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{kepsekEmail}</span> | Pass: <span className="font-mono">{kepsekPassword}</span></span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-indigo-900/30">Pilih</span>
                    </button>

                    {/* Walimurid */}
                    <button 
                      onClick={() => handleQuickDemoLogin('parent_ahmad', 'parent123')}
                      className="w-full py-2.5 flex justify-between items-center hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 px-2 rounded-lg text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">👪 Orang Tua Murid (Ahmad Fauzi's parent)</span>
                        <span className="text-[10px] text-gray-400">User: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">parent_ahmad</span> | Pass: <span className="font-mono">parent123</span></span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-indigo-900/30">Pilih</span>
                    </button>

                    {/* Siswa */}
                    <button 
                      onClick={() => handleQuickDemoLogin('ahmad1024', 'cbt123')}
                      className="w-full py-2.5 flex justify-between items-center hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 px-2 rounded-lg text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">🎓 Siswa / Murid (Ahmad Fauzi)</span>
                        <span className="text-[10px] text-gray-400">User: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">ahmad1024</span> | Pass: <span className="font-mono">cbt123</span></span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-indigo-900/30">Pilih</span>
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
