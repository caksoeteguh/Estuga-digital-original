import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useReactToPrint } from 'react-to-print';
import { Download, Palette, Sparkles, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { CARD_THEMES } from './StudentIdCard';
import { renderStaffIdCardToCanvas } from '../utils/cardRenderer';

interface StaffIdCardProps {
  staff: {
    id: string;
    name: string;
    role: string;
    username: string;
    password?: string;
    phone?: string;
    subject?: string;
  };
  isDark?: boolean;
  isPrintMode?: boolean;
  forcedThemeId?: string;
  schoolIdentity?: {
    name: string;
    city: string;
    logo?: string;
  };
}

export default function StaffIdCard({ staff, isDark = false, schoolIdentity, isPrintMode = false, forcedThemeId }: StaffIdCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('sd-merah');
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);
  const [userManuallySelected, setUserManuallySelected] = useState(false);

    const handlePrintSingle = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `Kartu_Guru_${staff.name}`,
    onBeforePrint: () => {
      setIsPrintingSingle(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPrintingSingle(false),
    onPrintError: (e) => { setIsPrintingSingle(false); console.error(e); alert("Gagal mencetak. Silakan klik Download PNG sebagai alternatif, atau buka aplikasi di tab baru."); }
  });

  useEffect(() => {
    if (forcedThemeId) {
      setSelectedThemeId(forcedThemeId);
    } else if (!userManuallySelected) {
      if (staff.role.toLowerCase().includes('kepala') || staff.role.toLowerCase().includes('admin')) {
        setSelectedThemeId('ungu-prestasi');
      } else {
        setSelectedThemeId('smp-biru');
      }
    }
  }, [staff.role, forcedThemeId, userManuallySelected]);

  const currentTheme = CARD_THEMES.find(t => t.id === selectedThemeId) || CARD_THEMES[0];

  useEffect(() => {
    QRCode.toDataURL(staff.id || staff.username || "TIDAK-ADA-NIP", { margin: 1, width: 150 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error(err));
  }, [staff.id, staff.username]);

  const schoolName = schoolIdentity ? schoolIdentity.name : 'SDN TULUNGREJO 03 BATU';
  const schoolCity = schoolIdentity ? schoolIdentity.city : 'KEC. BUMIAJI, KOTA BATU';
  const schoolLogo = schoolIdentity?.logo || '🏫';

  const handleDownloadPng = async () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      await renderStaffIdCardToCanvas(
        canvas,
        staff,
        currentTheme,
        schoolName,
        schoolCity,
        schoolLogo
      );

      const link = document.createElement('a');
      link.download = `kartu_id_staff_${(staff.name || "guru").toLowerCase().replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (e) {
      console.error("Failed to download PNG:", e); alert("Gagal mengunduh kartu. Error: " + (e.message || String(e)));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      <div className="w-full max-w-sm bg-white dark:bg-[#1a1b2e] border border-slate-200/60 dark:border-[#3e405b]/40 rounded-2xl p-3.5 shadow-xs space-y-2.5 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Gaya &amp; Warna Kartu 🎨</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {CARD_THEMES.map(theme => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => { setSelectedThemeId(theme.id); setUserManuallySelected(true); }}
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
      </div>

      <div ref={cardRef} id={`print-card-actual-staff-${staff.id}`} className={`relative w-[310px] h-[512px] rounded-2xl overflow-hidden flex flex-col p-4 pt-8 text-center shadow-lg border border-slate-800/80 bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white select-none ${isPrintingSingle ? 'print-active-overlay' : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.htmlBgClass} opacity-100 z-0`} />

        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <div className="w-6.5 h-6.5 bg-[#0b0c10] rounded-full border-2 border-amber-500 flex items-center justify-center shadow-md">
            <div className="w-3 h-3 bg-black rounded-full" />
          </div>
          <span className="text-[6px] font-bold text-amber-400 tracking-wider uppercase mt-1">LUBANG KALUNG</span>
        </div>

        <div className={`absolute top-[-40px] left-[-40px] w-[130px] h-[130px] rounded-full ${currentTheme.htmlCircle1Color} pointer-events-none z-10`} />
        <div className={`absolute bottom-[-40px] right-[-40px] w-[130px] h-[130px] rounded-full ${currentTheme.htmlCircle2Color} pointer-events-none z-10`} />

        <div className="relative z-10 flex items-center justify-center gap-2 mt-7">
          <div className={`w-9 h-9 rounded-full ${currentTheme.htmlBadgeBg} flex items-center justify-center text-sm shadow-inner shadow-white/10 overflow-hidden shrink-0`}>
            {schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http') ? (
              <img src={schoolLogo} crossOrigin="anonymous" alt="Logo" className="w-full h-full object-cover" />
            ) : (
              schoolLogo
            )}
          </div>
          <div className="flex flex-col text-left justify-center">
            <p className="text-[11px] font-black tracking-wider text-white leading-tight uppercase">
              {schoolName}
            </p>
            <p className={`text-[7px] font-bold tracking-widest ${currentTheme.htmlAccentText} font-mono uppercase mt-0.5`}>
              {schoolCity}
            </p>
          </div>
        </div>
        <div className="relative z-10 w-4/5 mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2" />

        <div className="relative z-10 flex flex-col items-center justify-center mt-2">
          <div className={`bg-white rounded-xl p-2 shrink-0 flex flex-col items-center justify-center shadow-xs border ${currentTheme.htmlAccentBorder}`}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded animate-pulse" />
            )}
            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider leading-none mt-1">
              {staff.id || 'NIP'}
            </span>
          </div>

          <div className="space-y-0.5 mt-2 flex flex-col items-center text-center">
            <h3 className="text-[14px] font-black tracking-wide text-white uppercase truncate max-w-[200px]" title={staff.name}>
              {staff.name}
            </h3>
            <p className={`text-[11px] font-mono font-bold ${currentTheme.htmlAccentText}`}>
              NIP: {staff.id || '-'}
            </p>
            <span className={`inline-block ${currentTheme.htmlPillsClass} font-extrabold text-[9px] px-2 py-0.5 mt-1 rounded-full leading-none uppercase`}>
              {staff.role}
            </span>
            {staff.subject && (
              <p className="text-[9px] text-slate-300 mt-1">
                Mapel: {staff.subject}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 bg-black/15 px-2 py-1 rounded-md mt-4 mx-auto w-full max-w-[240px]">
          <p className="text-[8.5px] font-black tracking-wider text-amber-300 uppercase leading-none">
            🔑 DETAIL LOGIN SISTEM AKADEMIK
          </p>
        </div>

        <div className="relative z-10 mt-2 mx-auto w-full max-w-[240px]">
          <div className="rounded-lg overflow-hidden border border-slate-300/80 shadow-sm bg-white/95 ">
            <table className="w-full text-left border-collapse text-[9px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-300/80 text-[8px] font-bold text-slate-600 uppercase tracking-wider text-center">
                  <th className="py-1.5 px-2 w-1/2">Username / Email</th>
                  <th className="py-1.5 px-2 border-l border-slate-300/80 w-1/2">Password</th>
                </tr>
              </thead>
              <tbody className="font-mono text-center">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-2 px-2 font-black text-slate-800 text-[11px] break-all">{staff.username}</td>
                  <td className="py-2 px-2 border-l border-slate-300/80 font-black text-slate-800 text-[11px] break-all">{staff.password || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1" />
        
        <div className="relative z-10 text-[7px] text-slate-500 border-t border-white/10 pt-1 mt-2 uppercase tracking-wide">
          <span className={`font-bold ${currentTheme.htmlAccentText}`}>EstugaDigital Smart Card System • 2026</span>
        </div>
      </div>

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
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:scale-[1.02]'}`}
        >
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
