import { UserRole } from '../types';
import { 
  Sun, 
  Moon, 
  User, 
  Wifi, 
  WifiOff, 
  CloudLightning,
  RefreshCw,
  LogOut,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface SneatNavbarProps {
  sidebarCollapsed: boolean;
  onToggleMenu?: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOnline: boolean;
  toggleOnline: () => void;
  syncQueueCount: number;
  syncData: () => void;
  isSyncing: boolean;
  notifications: any[];
  markAllNotificationsRead: () => void;
  session?: {
    username: string;
    role: UserRole;
    name: string;
    detailId?: string;
    subject?: string;
    originalRole?: UserRole;
  } | null;
  schoolIdentity?: any;
  onLogout?: () => void;
}

export default function SneatNavbar({
  sidebarCollapsed,
  onToggleMenu,
  activeRole,
  setActiveRole,
  isDark,
  toggleTheme,
  isOnline,
  toggleOnline,
  syncQueueCount,
  syncData,
  isSyncing,
  notifications,
  markAllNotificationsRead,
  session,
  onLogout,
  schoolIdentity,
}: SneatNavbarProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'guru': return 'Guru Mapel';
      case 'kepsek': return 'Kepsek';
      case 'walimurid': return 'Walimurid';
      case 'siswa': return 'Siswa';
    }
  };

  const getRoleAvatar = (role: UserRole) => {
    switch (role) {
      case 'admin': return '👩‍🏫';
      case 'guru': return '👨‍🏫';
      case 'kepsek': return '👨‍💼';
      case 'walimurid': return '👪';
      case 'siswa': return '🎓';
    }
  };

  const userNotifications = notifications.filter(n => 
    !n.recipientId || n.recipientId === 'all' || 
    (session && (n.recipientId === session.username || n.recipientId === session.role || n.recipientId === session.detailId))
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header 
      id="sneat-navbar"
      className={`fixed top-0 right-0 z-20 h-16 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 border-b
        ${sidebarCollapsed ? 'w-full md:w-[calc(100%-4rem)]' : 'w-full md:w-[calc(100%-16rem)]'}
        ${isDark ? 'bg-[#111625] border-slate-800/80 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}
    >
      {/* Left side: Role info or title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMenu && (
          <button 
            onClick={onToggleMenu}
            className={`md:hidden p-1.5 rounded-lg border transition-all cursor-pointer mr-1
              ${isDark ? 'border-slate-800 bg-[#090d16] hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
          >
            <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
              <span className={`block w-4 h-0.5 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`}></span>
              <span className={`block w-4 h-0.5 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`}></span>
              <span className={`block w-4 h-0.5 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`}></span>
            </div>
          </button>
        )}
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Panel Akses</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            {getRoleDisplayName(activeRole)}
          </span>
        </div>
      </div>

      {/* Right side: Actions, Offline Indicator, Role Switcher, Dark Mode, Notifications, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Offline & Sync Simulation Controller */}
        <div className="flex items-center gap-2">
          {/* Offline/Online Mode toggle */}
          <button
            id="toggle-online-btn"
            onClick={toggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border hover:scale-[1.02] active:scale-[0.98]
              ${isOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'}`}
            title={isOnline ? 'Klik untuk simulasikan Offline Mode' : 'Klik untuk simulasikan Online Mode'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {/* Sync Trigger for Offline Queue */}
          {syncQueueCount > 0 && (
            <button
              id="trigger-sync-btn"
              onClick={syncData}
              disabled={isSyncing || !isOnline}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                ${!isOnline 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#090d16]' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}`}
              title={isOnline ? `${syncQueueCount} data tertunda. Klik untuk sinkronisasi!` : `${syncQueueCount} data tertunda. Hubungkan internet untuk sinkronisasi.`}
            >
              <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
              <span>{syncQueueCount} Sync</span>
            </button>
          )}
        </div>

        {/* ROLE QUICK SWITCHER (Essential for applet demonstration!) */}
        {(session?.role === 'admin' || session?.originalRole === 'admin') && (
          <div className="relative flex items-center gap-1.5">
            <label className="hidden md:inline text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Peran:</label>
            <select
              id="role-quick-switcher"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold border-none rounded-lg px-2.5 py-1.5 focus:ring-0 outline-none cursor-pointer appearance-none pr-8 relative z-10"
            >
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="kepsek">Kepsek</option>
              <option value="walimurid">Walimurid</option>
              <option value="siswa">Siswa</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500 z-20">
              <ChevronDown size={14} />
            </div>
          </div>
        )}

        {/* Theme Switcher */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all cursor-pointer border hover:scale-105 active:scale-95
            ${isDark 
              ? 'border-slate-800 bg-[#090d16]/80 hover:bg-slate-800 text-yellow-400' 
              : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        
        {/* Explicit Save Button for user peace of mind */}
        <button
          onClick={() => {
            const btn = document.getElementById('save-indicator-btn');
            if (btn) {
              btn.innerHTML = '<span class="text-xs">⏳</span> Menyimpan...';
              btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
              btn.classList.remove('bg-white', 'dark:bg-[#2b2c40]', 'text-slate-600', 'dark:text-slate-300');
            }
            // Trigger local storage save forcefully via a custom event if needed
            window.dispatchEvent(new Event('force-save-local'));
            setTimeout(() => {
              if (btn) {
                btn.innerHTML = '<span class="text-xs">✅</span> Tersimpan';
                setTimeout(() => {
                  btn.innerHTML = '<span class="text-xs">💾</span> Simpan';
                  btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                  btn.classList.add('bg-white', 'dark:bg-[#2b2c40]', 'text-slate-600', 'dark:text-slate-300');
                }, 2000);
              }
            }, 800);
          }}
          id="save-indicator-btn"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#2b2c40] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          title="Simpan perubahan ke memori perangkat"
        >
          <span className="text-xs">💾</span> Simpan
        </button>

        {/* Direct Logout Button */}
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              alert('Session logout disimulasikan.');
            }
          }}
          className={`md:hidden p-2 rounded-xl transition-all cursor-pointer border hover:scale-105 active:scale-95
            ${isDark 
              ? 'border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400' 
              : 'border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600'}`}
          title="Logout Sesi"
        >
          <LogOut size={16} />
        </button>

        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer border hover:scale-105 active:scale-95 relative
              ${isDark 
                 ? 'border-slate-800 bg-[#090d16]/80 hover:bg-slate-800 text-slate-300' 
                 : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#111625]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotificationDropdown && (
            <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-xl border overflow-hidden z-50 animate-scale-up
              ${isDark ? 'bg-[#111625] border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
              <div className="p-3 border-b flex justify-between items-center border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090d16]/50">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Notifikasi</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      markAllNotificationsRead();
                      setShowNotificationDropdown(false);
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                    Belum ada notifikasi
                  </div>
                ) : (
                  userNotifications.slice(0, 20).map((notif, idx) => (
                    <div 
                      key={notif.id || idx}
                      className={`p-3 border-b border-slate-100 dark:border-slate-800 flex gap-3 text-left
                        ${!notif.read ? (isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50') : ''}`}
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!notif.read ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">{notif.text || notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Quick Profile */}
        <div className="relative">
          <button
            id="profile-dropdown-btn"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
            }}
            className="flex items-center gap-1 p-1 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50/80 dark:bg-emerald-950/30 flex items-center justify-center text-lg">
              {getRoleAvatar(activeRole)}
            </div>
            <ChevronDown size={12} className="text-slate-400 pr-0.5" />
          </button>

          {/* Profile Dropdown menu */}
          {showProfileDropdown && (
            <div 
              id="profile-dropdown-menu"
              className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-scale-up
                ${isDark ? 'bg-[#111625] border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090d16]/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50/80 dark:bg-emerald-950/30 flex items-center justify-center text-xl shadow-sm">
                  {getRoleAvatar(activeRole)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate" title={session?.name || 'Pengguna Aktif'}>
                    {session?.name || 'Pengguna Aktif'}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                    @{session?.username || 'guest'} • <span className="capitalize">{activeRole}</span>
                  </p>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                {(session?.role === 'admin' || session?.originalRole === 'admin') && (
                  <>
                    <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ganti Peran Cepat</div>
                    {(['admin', 'guru', 'kepsek', 'walimurid', 'siswa'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          setShowProfileDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer
                          ${activeRole === role 
                            ? 'bg-emerald-50/80 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-[#1c2438]'}`}
                      >
                        <span className="text-sm">{getRoleAvatar(role)}</span>
                        <span className="capitalize text-slate-700 dark:text-slate-300">{role === 'kepsek' ? 'Kepala Sekolah' : role}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    const btn = document.getElementById('save-logout-btn-text');
                    if (btn) btn.innerText = 'Menyimpan...';
                    window.dispatchEvent(new Event('force-save-local'));
                    setTimeout(() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        alert('Session logout disimulasikan.');
                      }
                      setShowProfileDropdown(false);
                    }, 500);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer mb-1"
                >
                  <span className="text-emerald-500">💾</span>
                  <span id="save-logout-btn-text">Simpan & Logout</span>
                </button>
                <button 
                  onClick={() => {
                    if (onLogout) {
                      onLogout();
                    } else {
                      alert('Session logout disimulasikan.');
                    }
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left transition-all cursor-pointer"
                >
                  <LogOut size={14} className="text-rose-500" />
                  <span>Logout Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
