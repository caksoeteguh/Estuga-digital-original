import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  QrCode, 
  BookOpen, 
  Award, 
  Users, 
  GraduationCap, 
  Settings, 
  Calendar, 
  Database, 
  MessageSquare,
  FileText,
  ClipboardList,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

interface SneatSidebarProps {
  activeRole: UserRole;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  onCloseMobile?: () => void;
  isMobileInline?: boolean;
  session?: any;
}

export default function SneatSidebar({ 
  activeRole, 
  currentTab, 
  setCurrentTab, 
  collapsed, 
  setCollapsed,
  isDark,
  onCloseMobile,
  isMobileInline,
  session
}: SneatSidebarProps) {

  // Menu items config based on roles
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'guru', 'kepsek', 'siswa', 'walimurid']
    },
    {
      id: 'barcode-scan',
      label: 'Presensi QR Code',
      icon: QrCode,
      roles: ['admin', 'guru']
    },
    {
      id: 'rekap-presensi',
      label: 'Rekap Presensi Siswa',
      icon: ClipboardList,
      roles: ['admin', 'guru']
    },
    {
      id: 'daftar-nilai',
      label: 'Daftar Nilai Siswa',
      icon: FileText,
      roles: ['guru', 'admin']
    },
    {
      id: 'jurnal-harian',
      label: 'Jurnal Harian',
      icon: BookOpen,
      roles: ['guru', 'admin', 'kepsek']
    },
    {
      id: 'cbt-exam',
      label: 'Penilaian CBT',
      icon: Award,
      roles: ['guru', 'siswa', 'admin', 'walimurid']
    },
    {
      id: 'e-learning',
      label: 'E-Learning',
      icon: GraduationCap,
      roles: ['guru', 'siswa', 'admin', 'walimurid']
    },
    {
      id: 'data-master',
      label: 'Data Kelengkapan',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'kepsek-overview',
      label: 'Monitoring Kinerja',
      icon: TrendingUp,
      roles: ['kepsek']
    },
    {
      id: 'parent-realtime',
      label: 'Presensi & Nilai Anak',
      icon: BookmarkCheck,
      roles: ['walimurid']
    },
    {
      id: 'calendar',
      label: 'Kalender Akademik',
      icon: Calendar,
      roles: ['admin', 'guru', 'kepsek', 'siswa', 'walimurid']
    },
    {
      id: 'wa-logs',
      label: 'Notifikasi WA',
      icon: MessageSquare,
      roles: ['admin']
    },
    {
      id: 'php-export',
      label: 'Ekspor PHP & MySQL',
      icon: Database,
      roles: ['admin']
    }
  ];
  const isReligionTeacher = activeRole === 'guru' && session?.subject && session.subject.toLowerCase().includes('agama');
  if (isReligionTeacher || activeRole === 'kepsek' || activeRole === 'admin') {
    menuItems.splice(3, 0, {
      id: 'rekap-sholat',
      label: 'Rekap Sholat Jamaah',
      icon: BookmarkCheck,
      roles: ['guru', 'kepsek', 'admin']
    });
  }

  const filteredItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside 
      id="sneat-sidebar"
      className={`${isMobileInline ? 'w-full flex flex-col relative bg-transparent' : 'fixed top-0 left-0 z-30 h-screen transition-all duration-300 border-r flex flex-col justify-between shadow-sm ' + (collapsed ? 'w-16' : 'w-64')}
        ${!isMobileInline && isDark ? 'bg-[#111625] border-slate-800/80 text-slate-400' : ''}
        ${!isMobileInline && !isDark ? 'bg-white border-slate-100 text-slate-600' : ''}
        ${isMobileInline && isDark ? 'text-slate-400' : ''}
        ${isMobileInline && !isDark ? 'text-slate-600' : ''}`}
    >
      <div>
        {/* Brand/Logo */}
        {!isMobileInline && (
          <div className={`p-4 flex items-center h-16 border-b transition-all duration-300
            ${isDark ? 'border-slate-800/80' : 'border-slate-100'}
            ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  <span className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
                    <GraduationCap size={20} />
                  </span>
                  <span id="sidebar-logo-text" className="tracking-tight font-extrabold font-sans bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-950 dark:from-white dark:to-slate-300">EstugaDigital</span>
                </div>
                {onCloseMobile && (
                  <button 
                    onClick={onCloseMobile}
                    className={`md:hidden p-1.5 rounded-lg border transition-all cursor-pointer 
                      ${isDark ? 'border-slate-800 bg-[#090d16] text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            {collapsed && (
              <span className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
                <GraduationCap size={18} />
              </span>
            )}

            <button 
              id="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden md:flex p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95
                ${isDark ? 'border-slate-800 bg-[#090d16] hover:bg-[#1c2438] text-slate-400 hover:text-white' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          {filteredItems.map(item => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' 
                    : isDark 
                      ? 'hover:bg-[#1c2438] hover:text-slate-100' 
                      : 'hover:bg-slate-50 hover:text-slate-800'}`}
                title={collapsed ? item.label : undefined}
              >
                <IconComponent size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      {!isMobileInline && (
        <div className={`p-4 border-t transition-all duration-300 text-[10px] text-center font-medium
          ${isDark ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-400'}`}
        >
          {!collapsed ? (
            <div>
              <p className="font-bold tracking-wider text-slate-700 dark:text-slate-400">v1.2.0 Stable</p>
              <p className="mt-0.5 opacity-80">PHP Native Supported</p>
            </div>
          ) : (
            <span className="font-bold">v1.2</span>
          )}
        </div>
      )}
    </aside>
  );
}
