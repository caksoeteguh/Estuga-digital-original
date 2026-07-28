import { createPortal } from 'react-dom';
import React, {
  useState, useEffect, useRef } from 'react';

import { Printer, Check, CheckSquare, Square, Search, Filter, X, Grid, Info, Sparkles, CreditCard, Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { CARD_THEMES, CardTheme } from './StudentIdCard';
import { renderStaffIdCardToCanvas } from '../utils/cardRenderer';
import { toPng } from 'html-to-image';
import StaffIdCard from './StaffIdCard';

interface BulkPrintStaffCardsProps {
  staffs: any[];
  schoolIdentity?: {
    name: string;
    city: string;
    logo?: string;
  };
  onClose: () => void;
}

export default function BulkPrintStaffCards({ staffs, schoolIdentity, onClose }: BulkPrintStaffCardsProps) {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [themeOverride, setThemeOverride] = useState<string>('auto'); // 'auto' or theme id
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  
  // Dynamic Printer Calibration Offsets
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [scaleAdjust, setScaleAdjust] = useState<number>(100);
  const [showPrinterGuide, setShowPrinterGuide] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  // Bulk PNG Download states
  const [downloadingPngs, setDownloadingPngs] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const bulkCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get unique classes for filtering
  const classes = ['Semua', ...Array.from(new Set(staffs.map(s => s.subject || 'Guru')))];

  // Filter staffs based on class and search query
  const filteredStaffs = staffs.filter(staff => {
    const matchesClass = selectedClass === 'Semua' || (staff.subject || "Guru") === selectedClass;
    const matchesSearch = (staff.name || "guru").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.id.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  // Select all / Deselect all for filtered staffs
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStaffs.map(s => s.id);
    const allSelected = filteredIds.every(id => selectedStaffIds.includes(id));

    if (allSelected) {
      // Deselect all filtered
      setSelectedStaffIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedStaffIds(prev => {
        const newSelection = [...prev];
        filteredIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Pre-select all staffs of the current filtered list by default on open
  useEffect(() => {
    setSelectedStaffIds(staffs.map(s => s.id));
  }, [staffs]);

  // Generate QR Codes for selected staffs
  useEffect(() => {
    const generateQRs = async () => {
      const newQrs: Record<string, string> = { ...qrCodes };
      let updated = false;

      for (const staffId of selectedStaffIds) {
        if (!newQrs[staffId]) {
          try {
            const url = await QRCode.toDataURL(staffId || "N/A", { margin: 1, width: 120 });
            newQrs[staffId] = url;
            updated = true;
          } catch (err) {
            console.error('Error generating QR in BulkPrint:', err);
          }
        }
      }

      if (updated) {
        setQrCodes(newQrs);
      }
    };

    if (selectedStaffIds.length > 0) {
      generateQRs();
    }
  }, [selectedStaffIds]);

  const schoolName = schoolIdentity?.name || 'SDN TULUNGREJO 03 BATU';
  const schoolCity = schoolIdentity?.city || 'KEC. BUMIAJI, KOTA BATU';
  const schoolLogo = schoolIdentity?.logo || '🏫';

  // Get active theme for a specific student card
  const getStaffTheme = (staffClass: string): CardTheme => {
    if (themeOverride !== 'auto') {
      return CARD_THEMES.find(t => t.id === themeOverride) || CARD_THEMES[0];
    }
    const cls = staffClass.toLowerCase();
    if (cls.includes('smp') || cls.includes('8-b') || cls.includes('8-a')) {
      return CARD_THEMES.find(t => t.id === 'emerald') || CARD_THEMES[1];
    } else if (cls.includes('9') || cls.includes('sma') || cls.includes('mts')) {
      return CARD_THEMES.find(t => t.id === 'crimson') || CARD_THEMES[2];
    } else if (cls.includes('7')) {
      return CARD_THEMES.find(t => t.id === 'ocean') || CARD_THEMES[3];
    } else if (cls.includes('5') || cls.includes('6')) {
      return CARD_THEMES.find(t => t.id === 'sunset') || CARD_THEMES[4];
    }
    return CARD_THEMES[0]; // default Indigo
  };

  // Get selected staffs details
  const selectedStaffToPrint = staffs.filter(s => selectedStaffIds.includes(s.id));

  // Paginate selected staffs into pages of 4 cards
  const pagesOfStaff: any[][] = [];
  for (let i = 0; i < selectedStaffToPrint.length; i += 4) {
    pagesOfStaff.push(selectedStaffToPrint.slice(i, i + 4));
  }

  // Handle printing
    const handlePrint = () => {
    setTimeout(() => {
      try {
        window.print();
      } catch (e) { console.error("Print failed", e); alert("Gagal mencetak. Jika Anda menggunakan browser HP atau mode preview, silakan klik Download PNG atau buka aplikasi di tab baru (icon pojok kanan atas)."); }
    }, 100);
  };

  // Handle bulk download as PNG ZIP
  const handleBulkDownloadPng = async () => {
    if (selectedStaffToPrint.length === 0) return;
    setDownloadingPngs(true);
    setDownloadSuccess(false);
    setDownloadTotal(selectedStaffToPrint.length);
    setDownloadProgress(0);

    try {
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      for (let i = 0; i < selectedStaffToPrint.length; i++) {
        const staff = selectedStaffToPrint[i];
        
        const elementId = `print-card-actual-staff-${staff.id}`;
        const cardElement = document.getElementById(elementId);
        
        if (cardElement) {
          const dataUrl = await toPng(cardElement, { 
            cacheBust: true, 
            pixelRatio: 3, 
            backgroundColor: 'transparent'
          });
          const base64Data = dataUrl.split(',')[1];
          const fileName = `kartu_guru_${(staff.name || "guru").toLowerCase().replace(/\s+/g, '_')}_${staff.id}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
        
        setDownloadProgress(i + 1);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `kartu_id_png_guru_massal_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating bulk ZIP:', err);
    } finally {
      setDownloadingPngs(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 flex flex-col h-screen print:static print:h-auto print:min-h-auto print:block print:bg-white print:p-0 print:m-0 print:overflow-visible print-active-overlay">
      <style>{`
        @media print {
          /* Force physical printer page setup */
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          
          /* Reset root layout constraints for continuous multipage flow */
          html, body, #root {
            background: white !important;
            color: black !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Enforce background colors, gradients, and images to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide absolutely everything else */
          #root,
          body > #root > *:not(.print-active-overlay),
          #root > *:not(.print-active-overlay),
          .no-print,
          .print\:hidden {
            display: none !important;
          }
          
          /* Ensure our print-active-overlay expands without height boundaries */
          .print-active-overlay {
            position: static !important;
            
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {/* Hidden high-res rendering canvas for bulk operations */}
      <canvas ref={bulkCanvasRef} style={{ display: 'none' }} />
      {/* HEADER CONTROLS (Hidden during printing) */}
      <div className="p-4 md:p-5 bg-white dark:bg-[#1a1b2e] border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-sm print:hidden">
        <div>
          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Modul Cetak Massal A4
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1.5 flex items-center gap-2">
            <Printer size={20} className="text-indigo-600" />
            <span>Cetak Kartu Identitas Banyak (4 Kartu per A4)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fitur cerdas untuk mencetak kartu berukuran presisi (85mm x 129mm) dalam layout grid 2x2 yang siap dipotong.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Download PNG Button */}
          <button
            onClick={handleBulkDownloadPng}
            disabled={selectedStaffToPrint.length === 0 || downloadingPngs}
            className={`flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-white cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex-1 md:flex-none
              ${downloadSuccess 
                ? 'bg-emerald-600' 
                : downloadingPngs 
                  ? 'bg-indigo-500' 
                  : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {downloadingPngs ? (
              <Loader2 size={15} className="animate-spin" />
            ) : downloadSuccess ? (
              <Check size={15} />
            ) : (
              <Download size={15} />
            )}
            <span>
              {downloadingPngs 
                ? `Mengunduh (${downloadProgress}/${downloadTotal})...` 
                : downloadSuccess 
                  ? 'Sukses!' 
                  : 'Download Banyak PNG (ZIP)'}
            </span>
          </button>

          <button
            onClick={() => setShowPrintPreview(true)}
            disabled={selectedStaffToPrint.length === 0}
            className="flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex-1 md:flex-none"
          >
            <Printer size={15} />
            <span>Cetak Sekarang (Print)</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer font-bold text-sm"
            title="Tutup"
          >
            ✕
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE SPLIT (Hidden during printing) */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden print:hidden">
        
        {/* LEFT BAR: Filter & Selection Panel */}
        <div className="w-full lg:w-96 bg-slate-50 dark:bg-[#11121e] border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col h-1/2 lg:h-full shrink-0 overflow-hidden">
          
          {/* Filtering */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 space-y-3 shrink-0">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Filter size={12} />
              Filter &amp; Pengaturan Cetak
            </h3>

            {/* Class Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Rombongan Belajar (Kelas)</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-[#1a1b2e] text-slate-800 dark:text-white dark:border-[#3e405b]"
              >
                {classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama atau NIS staf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border bg-white dark:bg-[#1a1b2e] text-slate-800 dark:text-white dark:border-[#3e405b]"
              />
              <Search size={13} className="absolute left-2.5 top-3 text-slate-400" />
            </div>

            {/* Style override dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Override Tema Desain Kartu</label>
              <select
                value={themeOverride}
                onChange={(e) => setThemeOverride(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-[#1a1b2e] text-slate-800 dark:text-white dark:border-[#3e405b] focus:outline-none"
              >
                <option value="auto">✨ Auto-Detect (Sesuai Kelas)</option>
                {CARD_THEMES.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.name} ({theme.desc.split(' ')[2]})</option>
                ))}
              </select>
            </div>
          </div>

          {/* any Selectors List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400">
                Siswa ({filteredStaffs.length} Terfilter)
              </span>
              <button
                onClick={handleSelectAllFiltered}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
              >
                {filteredStaffs.every(s => selectedStaffIds.includes(s.id)) ? 'Hapus Semua' : 'Pilih Semua'}
              </button>
            </div>

            {filteredStaffs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Tidak ada staf yang cocok.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredStaffs.map(staff => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  const stTheme = getStaffTheme((staff.subject || "Guru"));
                  return (
                    <button
                      key={`bulk-select-${staff.id}`}
                      onClick={() => toggleStaffSelection(staff.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer
                        ${isSelected 
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/40' 
                          : 'bg-white dark:bg-[#1a1b2e] border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1f2035]'}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isSelected ? (
                          <CheckSquare size={16} className="text-indigo-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{staff.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIS: {staff.id}</p>
                        </div>
                      </div>

                      <span 
                        className="text-[9px] font-extrabold px-2 py-0.5 rounded-lg border leading-none shrink-0"
                        style={{ 
                          borderColor: stTheme.pillsBorderColor, 
                          backgroundColor: stTheme.pillsBgColor, 
                          color: stTheme.accentColor 
                        }}
                      >
                        {(staff.subject || "Guru")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Printer Alignment Calibration */}
          <div className="p-4 bg-slate-50/50 dark:bg-[#131422] border-t border-slate-200/50 dark:border-slate-800/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>🎛️ Kalibrasi Sumbu Printer (X/Y)</span>
              </h4>
              <button 
                onClick={() => {
                  setOffsetX(0);
                  setOffsetY(0);
                  setScaleAdjust(100);
                }}
                className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Reset Alinyemen
              </button>
            </div>
            
            <div className="space-y-2.5 text-[10.5px]">
              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Sumbu X (Kiri - Kanan):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{offsetX > 0 ? `+${offsetX}` : offsetX} mm</span>
                </div>
                <input 
                  type="range" 
                  min="-10" 
                  max="10" 
                  step="0.5"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer dark:bg-slate-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Sumbu Y (Atas - Bawah):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{offsetY > 0 ? `+${offsetY}` : offsetY} mm</span>
                </div>
                <input 
                  type="range" 
                  min="-10" 
                  max="10" 
                  step="0.5"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer dark:bg-slate-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Skala Kartu (Ukuran Fisik):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{scaleAdjust}%</span>
                </div>
                <input 
                  type="range" 
                  min="90" 
                  max="110" 
                  step="1"
                  value={scaleAdjust}
                  onChange={(e) => setScaleAdjust(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer dark:bg-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Quick Counter Footer */}
          <div className="p-4 bg-white dark:bg-[#161726] border-t border-slate-200/60 dark:border-slate-800/60 text-xs space-y-3 shrink-0 text-slate-500 dark:text-slate-400">
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span>Siswa Terpilih:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{selectedStaffIds.length} Siswa</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Jumlah Lembar A4:</span>
                <span className="font-semibold">{pagesOfStaff.length} Halaman</span>
              </div>
            </div>

            {/* Quick Action Sidebar Download Button */}
            <button
              onClick={handleBulkDownloadPng}
              disabled={selectedStaffToPrint.length === 0 || downloadingPngs}
              className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                ${downloadSuccess 
                  ? 'bg-emerald-600' 
                  : downloadingPngs 
                    ? 'bg-indigo-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {downloadingPngs ? (
                <Loader2 size={14} className="animate-spin" />
              ) : downloadSuccess ? (
                <Check size={14} />
              ) : (
                <Download size={14} />
              )}
              <span>
                {downloadingPngs 
                  ? `Mengunduh (${downloadProgress}/${downloadTotal})...` 
                  : downloadSuccess 
                    ? 'Selesai di-Download!' 
                    : 'Download Semua PNG (ZIP)'}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT AREA: Realistic A4 Layout Preview */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-8 shadow-inner">
          <div className="max-w-[750px] w-full bg-white dark:bg-[#1a1b2e] border border-slate-300/60 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm text-left space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Printer size={15} className="text-indigo-600" />
                  Hubungkan &amp; Cetak Kartu EstugaDigital 🖨️
                </h3>
                <p className="text-[11px] text-slate-500">Sistem terintegrasi penuh dengan printer lokal Anda.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-900/40 shrink-0 self-start sm:self-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Driver Printer Siap Terhubung (Sistem Aktif)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Panduan Browser */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#131422] p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block text-[10.5px] uppercase tracking-wider">💡 1. Pengaturan Browser (Kritikal)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Saat kotak dialog print browser muncul, pastikan konfigurasi berikut agar presisi dan warna keluar sempurna:
                </p>
                <ul className="space-y-1 list-disc list-inside text-[10.5px] text-slate-500 dark:text-slate-400 pl-1">
                  <li><strong>Tujuan (Destination):</strong> Pilih printer fisik Anda atau <span className="text-indigo-500 font-bold">Simpan ke PDF</span>.</li>
                  <li><strong>Ukuran Kertas:</strong> Wajib pilih <span className="font-bold text-slate-700 dark:text-slate-300">A4</span>.</li>
                  <li><strong>Margin:</strong> Atur ke <span className="font-bold text-slate-700 dark:text-slate-300">None / Tanpa Margin</span>.</li>
                  <li><strong>Background Graphics:</strong> Wajib <span className="text-emerald-600 font-extrabold">DICENTANG</span> agar warna gradasi &amp; QR Code tercetak.</li>
                </ul>
              </div>

              {/* Rekomendasi Kertas */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#131422] p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block text-[10.5px] uppercase tracking-wider">📄 2. Rekomendasi Media &amp; Kertas</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gunakan kertas berkualitas tinggi untuk menjamin daya tahan kartu yang dipegang staf sehari-hari:
                </p>
                <ul className="space-y-1 list-disc list-inside text-[10.5px] text-slate-500 dark:text-slate-400 pl-1">
                  <li><strong>Kertas Photo Glossy:</strong> Gramatur <span className="font-bold">230gsm s/d 260gsm</span> (Sangat direkomendasikan).</li>
                  <li><strong>Kertas PVC Instan:</strong> Gunakan lembaran PVC 3-layer jika printer mendukung cetak PVC rumahan.</li>
                  <li><strong>Pemotong Kartu:</strong> Gunakan <span className="font-bold text-slate-700 dark:text-slate-300">ID Card Cutter Plong</span> ukuran standar CR-80 (54mm x 86mm).</li>
                  <li><strong>Pelindung:</strong> Lakukan laminasi panas/dingin agar tinta awet dari goresan air.</li>
                </ul>
              </div>
            </div>

            {/* Collapsible untuk troubleshooting */}
            <details className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <summary className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#151625] font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <span>🔧 Cara Menghubungkan ke Printer PVC Khusus (Zebra, Fargo, Epson, dll.)</span>
                <span className="transition-transform group-open:rotate-180 text-slate-400">▼</span>
              </summary>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b2e] text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <p>Jika sekolah Anda memiliki printer ID Card PVC khusus (seperti Fargo HDP5000, Zebra ZC300, Evolis Primacy, dll.):</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px]">
                  <li>Pastikan kabel USB printer telah tercolok ke komputer, atau printer terhubung ke Wi-Fi / LAN yang sama.</li>
                  <li>Nyalakan printer, pastikan Ribbon tinta warna (YMCKO) dan kartu PVC kosong sudah terpasang.</li>
                  <li>Buka driver printer di Control Panel komputer Anda dan atur ukuran kertas cetak bawaan ke <span className="font-bold text-slate-800 dark:text-slate-200">CR-80 (Card Standard)</span>.</li>
                  <li>Klik tombol <strong className="text-indigo-600 dark:text-indigo-400">Cetak Sekarang</strong> diatas, lalu pilih printer PVC Anda pada kolom "Printer/Destination".</li>
                  <li><em>Tips Kalibrasi:</em> Jika posisi cetak kurang pas atau terpotong sedikit, gunakan panel <strong>Kalibrasi Sumbu Printer (X/Y)</strong> di sebelah kiri untuk menggeser letak kartu sebelum klik cetak!</li>
                </ol>
              </div>
            </details>
          </div>

          {selectedStaffToPrint.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <Info size={40} className="text-slate-300 mb-3" />
              <p className="font-bold text-sm">Tidak ada kartu yang dipilih</p>
              <p className="text-xs text-center max-w-sm mt-1">Centang daftar staf di panel sebelah kiri untuk memunculkan preview kartu di halaman A4.</p>
            </div>
          ) : (
            pagesOfStaff.map((page, pIdx) => (
              <div key={`page-preview-${pIdx}`} className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block text-center">
                  Halaman Lembar A4 ke-{pIdx + 1} ({page.length} Kartu)
                </span>
                
                {/* Visual A4 Aspect Ratio container on Screen */}
                <div 
                  className="bg-white text-black shadow-2xl rounded-sm border border-slate-300/80 origin-top transition-all duration-200"
                  style={{
                    width: '210mm',
                    height: '297mm',
                    padding: `${12 + offsetY}mm ${10 + offsetX}mm`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',
                    gap: '4mm',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    transform: `scale(${(scaleAdjust / 100) * 0.85})`,
                    transformOrigin: 'top center'
                  }}
                >
                  {page.map(staff => {
          const stTheme = getStaffTheme((staff.subject || "Guru"));
          return (
            <div id={`print-card-actual-staff-${staff.id}`} key={`print-card-actual-${staff.id}`} style={{ transform: 'scale(1)', transformOrigin: 'top left', width: '310px', height: '512px', overflow: 'hidden' }}>
              <StaffIdCard 
                staff={staff} 
                schoolIdentity={{ name: schoolName, city: schoolCity, logo: schoolLogo }} 
                isPrintMode={true}
              />
            </div>
          );
        })}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ======================================================= */}
      {/* PRINT-ONLY AREA (ONLY visible during print) */}
      {/* ======================================================= */}
      <div className="hidden print:block print:bg-white print:p-0 print:m-0 print:overflow-visible">
        {pagesOfStaff.map((page, pIdx) => (
          <div 
            key={`print-page-actual-${pIdx}`} 
            className="print:flex print:flex-wrap print:gap-[6mm] print:justify-center print:items-center print:align-content-start"
            style={{
              width: '210mm',
              height: '297mm',
              padding: `${12 + offsetY}mm ${10 + offsetX}mm`,
              boxSizing: 'border-box',
              pageBreakAfter: pIdx < pagesOfStaff.length - 1 ? 'always' : 'auto',
              breakAfter: pIdx < pagesOfStaff.length - 1 ? 'page' : 'auto',
              backgroundColor: '#ffffff',
              transform: scaleAdjust !== 100 ? `scale(${scaleAdjust / 100})` : undefined,
              transformOrigin: 'top center'
            }}
          >
            {page.map(staff => {
          const stTheme = getStaffTheme((staff.subject || "Guru"));
          return (
            <div id={`print-card-actual-staff-${staff.id}`} key={`print-card-actual-${staff.id}`} style={{ transform: 'scale(1)', transformOrigin: 'top left', width: '310px', height: '512px', overflow: 'hidden' }}>
              <StaffIdCard 
                staff={staff} 
                schoolIdentity={{ name: schoolName, city: schoolCity, logo: schoolLogo }} 
                isPrintMode={true}
              />
            </div>
          );
        })}
          </div>
        ))}
      </div>
        
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/95 z-[99999] flex flex-col print:hidden backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Printer className="text-indigo-600" />
                    Preview Cetak Massal
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Pastikan printer disetel ke ukuran A4 & margin Minimum/None.</p>
                </div>
                <button onClick={() => setShowPrintPreview(false)} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold">
                  ✕ Batal
                </button>
              </div>
              
              <div className="p-6 flex flex-col items-center gap-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto max-h-[60vh]">
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-sm w-full font-medium">
                  <strong>Penting:</strong> Jika tombol cetak di bawah ini tidak merespon (karena mode preview / iframe), silakan klik icon <strong>"Open in New Tab"</strong> di sudut kanan atas layar Anda, lalu coba lagi.
                </div>
                
                <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl relative scale-50 md:scale-75 lg:scale-100 origin-top border border-slate-200">
                  {/* Simulate Page 1 only for preview performance */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-2xl font-bold opacity-30">
                    ILLUSTRASI HALAMAN A4 (SIMULASI)
                  </div>
                  <div className="p-10 text-center relative z-10 space-y-4">
                    <p className="font-bold text-slate-800 text-xl mt-20">Siap Mencetak {selectedStaffToPrint.length} Kartu</p>
                    <div className="grid grid-cols-2 gap-4 mx-auto w-max opacity-80 pointer-events-none">
                      <div className="w-[85mm] h-[129mm] bg-slate-200 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">Kartu 1</div>
                      <div className="w-[85mm] h-[129mm] bg-slate-200 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">Kartu 2</div>
                      <div className="w-[85mm] h-[129mm] bg-slate-200 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">Kartu 3</div>
                      <div className="w-[85mm] h-[129mm] bg-slate-200 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">Kartu 4</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                <button onClick={() => setShowPrintPreview(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Kembali
                </button>
                <button 
                  onClick={() => {
                    setShowPrintPreview(false);
                    handlePrint();
                  }} 
                  className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Printer size={18} />
                  Lanjutkan ke Printer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
    </div>,
    document.body
  );
}
