import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useReactToPrint } from 'react-to-print';
import { Student } from '../types';
import { Download, CreditCard, Check, Palette, Sparkles, ShieldCheck, Printer, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface StudentIdCardProps {
  student: Student;
  isDark?: boolean;
  isPrintMode?: boolean;
  forcedThemeId?: string;
  schoolIdentity?: {
    name: string;
    city: string;
    logo?: string;
  };
}

export interface CardTheme {
  id: string;
  name: string;
  desc: string;
  // Canvas values
  gradColors: string[]; // [stop0, stop03, stop1]
  circle1Color: string;
  circle2Color: string;
  badgeBgColor: string;
  accentColor: string;
  textMutedColor: string;
  dividerColor: string;
  pillsBgColor: string;
  pillsBorderColor: string;
  avatarBorderColor: string;
  avatarBgColor: string;
  // HTML mockup classes
  htmlBgClass: string;
  htmlAccentText: string;
  htmlAccentBorder: string;
  htmlBadgeBg: string;
  htmlPillsClass: string;
  htmlCircle1Color: string;
  htmlCircle2Color: string;
  htmlColorHex: string; // for selection dot
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'sd-merah',
    name: 'Merah Putih',
    desc: 'Tema SD (Merah Putih)',
    gradColors: ['#b91c1c', '#dc2626', '#991b1b'],
    circle1Color: 'rgba(239, 68, 68, 0.25)',
    circle2Color: 'rgba(248, 113, 113, 0.15)',
    badgeBgColor: '#b91c1c',
    accentColor: '#fca5a5',
    textMutedColor: '#fee2e2',
    dividerColor: '#ef4444',
    pillsBgColor: 'rgba(239, 68, 68, 0.3)',
    pillsBorderColor: '#b91c1c',
    avatarBorderColor: '#fca5a5',
    avatarBgColor: '#7f1d1d',
    htmlBgClass: 'from-[#b91c1c] via-[#dc2626] to-[#991b1b]',
    htmlAccentText: 'text-red-200',
    htmlAccentBorder: 'border-red-300/50',
    htmlBadgeBg: 'bg-red-600/80',
    htmlPillsClass: 'bg-red-500/30 text-red-100 border-red-500/50',
    htmlCircle1Color: 'bg-red-500/20',
    htmlCircle2Color: 'bg-rose-500/20',
    htmlColorHex: '#b91c1c'
  },
  {
    id: 'smp-biru',
    name: 'Biru Dongker',
    desc: 'Tema SMP (Biru Dongker)',
    gradColors: ['#1e3a8a', '#1d4ed8', '#172554'],
    circle1Color: 'rgba(59, 130, 246, 0.25)',
    circle2Color: 'rgba(96, 165, 250, 0.15)',
    badgeBgColor: '#1e3a8a',
    accentColor: '#93c5fd',
    textMutedColor: '#dbeafe',
    dividerColor: '#3b82f6',
    pillsBgColor: 'rgba(59, 130, 246, 0.3)',
    pillsBorderColor: '#1e3a8a',
    avatarBorderColor: '#93c5fd',
    avatarBgColor: '#172554',
    htmlBgClass: 'from-[#1e3a8a] via-[#1d4ed8] to-[#172554]',
    htmlAccentText: 'text-blue-200',
    htmlAccentBorder: 'border-blue-300/50',
    htmlBadgeBg: 'bg-blue-800/80',
    htmlPillsClass: 'bg-blue-600/30 text-blue-100 border-blue-500/50',
    htmlCircle1Color: 'bg-blue-500/20',
    htmlCircle2Color: 'bg-indigo-500/20',
    htmlColorHex: '#1e3a8a'
  },
  {
    id: 'hijau-tosca',
    name: 'Hijau Tosca',
    desc: 'Tema Segar (Tosca)',
    gradColors: ['#0f766e', '#14b8a6', '#042f2e'],
    circle1Color: 'rgba(20, 184, 166, 0.25)',
    circle2Color: 'rgba(45, 212, 191, 0.15)',
    badgeBgColor: '#0f766e',
    accentColor: '#5eead4',
    textMutedColor: '#ccfbf1',
    dividerColor: '#14b8a6',
    pillsBgColor: 'rgba(20, 184, 166, 0.3)',
    pillsBorderColor: '#0f766e',
    avatarBorderColor: '#5eead4',
    avatarBgColor: '#042f2e',
    htmlBgClass: 'from-[#0f766e] via-[#14b8a6] to-[#042f2e]',
    htmlAccentText: 'text-teal-200',
    htmlAccentBorder: 'border-teal-300/50',
    htmlBadgeBg: 'bg-teal-700/80',
    htmlPillsClass: 'bg-teal-600/30 text-teal-100 border-teal-500/50',
    htmlCircle1Color: 'bg-teal-500/20',
    htmlCircle2Color: 'bg-emerald-500/20',
    htmlColorHex: '#0f766e'
  },
  {
    id: 'kuning-ceria',
    name: 'Kuning Ceria',
    desc: 'Tema Ceria (Kuning)',
    gradColors: ['#b45309', '#f59e0b', '#78350f'],
    circle1Color: 'rgba(245, 158, 11, 0.25)',
    circle2Color: 'rgba(251, 191, 36, 0.15)',
    badgeBgColor: '#b45309',
    accentColor: '#fcd34d',
    textMutedColor: '#fef3c7',
    dividerColor: '#f59e0b',
    pillsBgColor: 'rgba(245, 158, 11, 0.3)',
    pillsBorderColor: '#b45309',
    avatarBorderColor: '#fcd34d',
    avatarBgColor: '#78350f',
    htmlBgClass: 'from-[#b45309] via-[#f59e0b] to-[#78350f]',
    htmlAccentText: 'text-amber-200',
    htmlAccentBorder: 'border-amber-300/50',
    htmlBadgeBg: 'bg-amber-600/80',
    htmlPillsClass: 'bg-amber-500/30 text-amber-100 border-amber-500/50',
    htmlCircle1Color: 'bg-amber-500/20',
    htmlCircle2Color: 'bg-yellow-500/20',
    htmlColorHex: '#f59e0b'
  },
  {
    id: 'ungu-prestasi',
    name: 'Ungu Prestasi',
    desc: 'Tema Kreatif (Ungu)',
    gradColors: ['#6d28d9', '#8b5cf6', '#4c1d95'],
    circle1Color: 'rgba(139, 92, 246, 0.25)',
    circle2Color: 'rgba(167, 139, 250, 0.15)',
    badgeBgColor: '#6d28d9',
    accentColor: '#c4b5fd',
    textMutedColor: '#ede9fe',
    dividerColor: '#8b5cf6',
    pillsBgColor: 'rgba(139, 92, 246, 0.3)',
    pillsBorderColor: '#6d28d9',
    avatarBorderColor: '#c4b5fd',
    avatarBgColor: '#4c1d95',
    htmlBgClass: 'from-[#6d28d9] via-[#8b5cf6] to-[#4c1d95]',
    htmlAccentText: 'text-violet-200',
    htmlAccentBorder: 'border-violet-300/50',
    htmlBadgeBg: 'bg-violet-700/80',
    htmlPillsClass: 'bg-violet-600/30 text-violet-100 border-violet-500/50',
    htmlCircle1Color: 'bg-violet-500/20',
    htmlCircle2Color: 'bg-purple-500/20',
    htmlColorHex: '#8b5cf6'
  }
];

export default function StudentIdCard({ student, isDark = false, schoolIdentity, isPrintMode = false, forcedThemeId }: StudentIdCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(forcedThemeId || 'sd-merah');
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);

    const handlePrintSingle = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Kartu_Siswa_${student.name}`,
    onBeforePrint: () => {
      setIsPrintingSingle(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPrintingSingle(false),
    onPrintError: (e) => { setIsPrintingSingle(false); console.error(e); alert("Gagal mencetak. Silakan klik Download PNG sebagai alternatif, atau buka aplikasi di tab baru."); }
  });

  // Auto-detect theme based on class name
  useEffect(() => {
    const cls = (student.className || '').toLowerCase();
    if (cls.includes('smp') || cls.includes('7') || cls.includes('8') || cls.includes('9')) {
      setSelectedThemeId('smp-biru');
    } else if (cls.includes('sma') || cls.includes('mts')) {
      setSelectedThemeId('hijau-tosca');
    } else if (cls.includes('1') || cls.includes('2')) {
      setSelectedThemeId('kuning-ceria');
    } else if (cls.includes('3') || cls.includes('4')) {
      setSelectedThemeId('ungu-prestasi');
    } else {
      setSelectedThemeId('sd-merah'); // default SD
    }
  }, [student.className]);

  // Find the currently active theme config
  const currentTheme = CARD_THEMES.find(t => t.id === selectedThemeId) || CARD_THEMES[0];

  useEffect(() => {
    // Generate QR Code for scanning
    QRCode.toDataURL(student.id || "N/A", { margin: 1, width: 150 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error(err));
  }, [student.id]);

  // Default elegant school info
  const schoolName = schoolIdentity 
    ? schoolIdentity.name
    : 'SDN TULUNGREJO 03 BATU';
  
  const schoolCity = schoolIdentity ? schoolIdentity.city : 'KEC. BUMIAJI, KOTA BATU';
  const schoolLogo = schoolIdentity?.logo || '🏫';

  // Helper to draw the unified Single-Sided High-Res PNG (Profile, QR Code and all credentials in one side)
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `kartu_id_lengkap_${student.name.toLowerCase().replace(/\s+/g, '_')}_${student.id}.png`;
      link.href = dataUrl;
      link.click();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to download PNG:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      
      {/* Hidden high-res rendering canvas */}

      {!isPrintMode && (
      <>
      {/* Modern Theme Selector with Beautiful UI */}
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1b2e] border border-slate-200/60 dark:border-[#3e405b]/40 rounded-2xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-indigo-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Gaya &amp; Warna Kartu Kelas 🎨</span>
          </div>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Sparkles size={10} />
            Saran Otomatis
          </span>
        </div>

        {/* Color Bubbles */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {CARD_THEMES.map(theme => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-slate-50 dark:bg-[#23243d] border-slate-300 dark:border-[#6366f1] shadow-xs' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#1f2035]'}`}
                title={theme.desc}
              >
                <span 
                  className="w-5.5 h-5.5 rounded-full shadow-xs flex items-center justify-center text-[10px] text-white font-bold transition-transform"
                  style={{ backgroundColor: theme.htmlColorHex }}
                >
                  {isSelected && '✓'}
                </span>
                <span className="text-[9px] font-bold text-gray-500 dark:text-slate-400 mt-1 text-center truncate w-full">
                  {theme.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[10.5px] text-gray-400 dark:text-slate-500 leading-tight">
          Mendeteksi siswa <span className="font-bold text-indigo-500">{student.className}</span> dan merekomendasikan tema <strong className="text-gray-700 dark:text-slate-300">{currentTheme.name}</strong>. Anda bebas menggantinya sesuka hati!
        </p>
      </div>

      {/* Helpful Info Badge */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-2.5 max-w-sm text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck size={13} />
          Praktis: Cetak Sekali Saja (Satu Sisi Lengkap)! ✨
        </span>
        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 leading-relaxed">
          Semua informasi mulai dari QR Code presensi, akun CBT, E-Learning siswa, hingga portal Wali Murid telah disatukan di **sisi depan** untuk kepraktisan cetak fisik.
        </p>
      </div>

            </>
      )}
      {/* Integrated HTML ID Card Mockup (Enhanced Width 310px, Height 512px) */}
      <div className={`relative w-[310px] h-[512px] rounded-2xl flex flex-col justify-between p-4 pt-8 text-center border-[3px] border-slate-950 bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white select-none ${isPrintingSingle ? 'print-active-overlay' : ''} shadow-2xl overflow-hidden`}>
        {/* Dynamic Class Background Theme Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.htmlBgClass} opacity-100 z-0`} />

        {/* Elegant Inset White Frame/Border exactly matching the screenshot */}
        <div className="absolute inset-1.5 border border-white/20 rounded-[14px] pointer-events-none z-20" />

        {/* Elegant Gold Brass Lanyard Hole */}
        <div className="absolute top-4.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <span className="text-[6.5px] font-black text-amber-400 tracking-widest uppercase mb-1 font-sans">LUBANG KALUNG</span>
          <div className="w-6 h-6 bg-[#090a0f] rounded-full border border-amber-500/80 flex items-center justify-center shadow-inner">
            <div className="w-3.5 h-3.5 bg-black rounded-full" />
          </div>
        </div>

        {/* Background Ambient Curves */}
        <div className={`absolute top-[-40px] left-[-40px] w-[130px] h-[130px] rounded-full ${currentTheme.htmlCircle1Color} pointer-events-none z-10`} />
        <div className={`absolute bottom-[-40px] right-[-40px] w-[130px] h-[130px] rounded-full ${currentTheme.htmlCircle2Color} pointer-events-none z-10`} />

        {/* Card Header (Z-10 relative) */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-7">
          <div className="w-9 h-9 rounded-full bg-white/90 p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0">
            {schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http') ? (
              <img src={schoolLogo} crossOrigin="anonymous" alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg">{schoolLogo}</span>
            )}
          </div>
          <div className="flex flex-col text-left justify-center">
            <p className="text-[11.5px] font-black tracking-wide text-white leading-tight uppercase font-sans">
              {schoolName}
            </p>
            <p className="text-[7.5px] font-bold tracking-widest text-amber-300 font-mono uppercase mt-0.5">
              {schoolCity}
            </p>
          </div>
        </div>
        <div className="relative z-10 w-[90%] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1.5" />

        {/* Centered QR Code & Student Bio */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-2">
          {/* Centered Enlarged QR Code */}
          <div className="bg-white rounded-xl p-2 shrink-0 flex flex-col items-center justify-center shadow-lg border border-black/10">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded animate-pulse" />
            )}
            <span className="text-[10px] font-mono font-black text-slate-800 tracking-widest leading-none mt-1">
              {student.id}
            </span>
          </div>

          {/* Typography */}
          <div className="space-y-0.5 mt-2 flex flex-col items-center text-center">
            <h3 className="text-[13.5px] font-black tracking-wide text-white uppercase truncate max-w-[240px] font-sans" title={student.name}>
              {student.name.length > 21 ? student.name.toUpperCase().substring(0, 21) + '...' : student.name.toUpperCase()}
            </h3>
            <p className="text-[11px] font-mono font-bold text-amber-200">
              NIS: {student.id}
            </p>
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wide">
              KELAS: {student.className.toUpperCase()}
            </p>
            <p className="text-[8.5px] text-rose-200/95 font-medium">
              Lahir: {student.pob || 'Batu'}, {student.dob || '42014'}
            </p>
          </div>
        </div>

        {/* Middle Section Credentials Header (Beautiful Orange Banner) */}
        <div className="relative z-10 bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1 rounded-full mt-2.5 mx-2.5 shadow-md flex items-center justify-center gap-1.5">
          <span className="text-[9.5px]">🔑</span>
          <p className="text-[8px] font-black tracking-wider text-white uppercase leading-none font-sans">
            REKAP LOGIN AKADEMIK SISWA &amp; ORANG TUA
          </p>
        </div>

        {/* Credentials Table Layout */}
        <div className="relative z-10 mt-2 flex-1 w-full flex flex-col px-1">
          <div className="rounded-lg overflow-hidden shadow-md bg-slate-950/90 border border-slate-800">
            <table className="w-full text-left border-collapse text-[9.5px] leading-tight">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[8.5px] font-bold text-amber-400 uppercase tracking-wider">
                  <th className="py-1.5 px-2 w-[35%]">LAYANAN</th>
                  <th className="py-1.5 px-2 border-l border-slate-800 w-[35%]">USER</th>
                  <th className="py-1.5 px-2 border-l border-slate-800 w-[30%]">PASS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono font-black">
                <tr>
                  <td className="py-1.5 px-2 text-white font-sans font-bold">Ujian CBT</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-orange-400 break-all">{student.usernameCbt}</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-orange-400 break-all">{student.passwordCbt}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 text-white font-sans font-bold">E-Learning</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-cyan-400 break-all">{student.id}</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-cyan-400 break-all">{student.dob.replace(/-/g, '')}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 text-white font-sans font-bold">Portal Wali</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-emerald-400 break-all">{student.usernameParent}</td>
                  <td className="py-1.5 px-2 border-l border-slate-800 text-emerald-400 break-all">{student.passwordParent}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[7.5px] text-slate-300/90 mt-1.5 text-center leading-tight">
            * Gunakan kredensial di atas untuk masuk ke CBT, E-Learning, dan Portal Wali.
          </p>
        </div>

        {/* Footer info single side */}
        <div className="relative z-10 text-[7px] text-white/50 border-t border-white/10 pt-1 mt-2 uppercase tracking-widest text-center font-semibold">
          ESTUGADIGITAL SMART CARD SYSTEM • 2026
        </div>
      </div>

      {/* Action Download & Print Buttons */}
      {!isPrintMode && (
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs justify-center no-print exclude-from-capture">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadPng();
          }}
          disabled={downloading || isPrintingSingle}
          type="button"
          className={`flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex-1
            ${downloadSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:scale-[1.02]'}`}
        >
          {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
          <span>{downloading ? 'Unduh...' : downloadSuccess ? 'Selesai!' : 'Download PNG'}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrintSingle();
          }}
          disabled={downloading || isPrintingSingle}
          type="button"
          className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm hover:scale-[1.02] transition-all flex-1"
        >
          <Printer size={14} />
          <span>{isPrintingSingle ? 'Mencetak...' : 'Cetak Kartu'}</span>
                </button>
      </div>
      )}
    </div>
  );
}
