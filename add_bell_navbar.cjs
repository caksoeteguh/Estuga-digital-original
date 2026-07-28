const fs = require('fs');
let code = fs.readFileSync('src/components/SneatNavbar.tsx', 'utf-8');

// Import Bell
code = code.replace(/RefreshCw,\n  LogOut,\n  ChevronDown\n\} from 'lucide-react';/, "RefreshCw,\n  LogOut,\n  ChevronDown,\n  Bell\n} from 'lucide-react';");

// Add showNotificationDropdown state
const oldState = '  const [showProfileDropdown, setShowProfileDropdown] = useState(false);';
const newState = '  const [showProfileDropdown, setShowProfileDropdown] = useState(false);\n  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);';
code = code.replace(oldState, newState);

// Add Bell Button right before Profile Dropdown
const bellUI = `
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
            className={\`p-2 rounded-xl transition-all cursor-pointer border hover:scale-105 active:scale-95 relative
              \${isDark 
                 ? 'border-slate-800 bg-[#090d16]/80 hover:bg-slate-800 text-slate-300' 
                 : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'}\`}
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
            <div className={\`absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-xl border overflow-hidden z-50 animate-scale-up
              \${isDark ? 'bg-[#111625] border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800'}\`}>
              <div className="p-3 border-b flex justify-between items-center border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090d16]/50">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Notifikasi</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      markAllNotificationsRead();
                      setShowNotificationDropdown(false);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
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
                      className={\`p-3 border-b border-slate-100 dark:border-slate-800 flex gap-3 text-left
                        \${!notif.read ? (isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : ''}\`}
                    >
                      <div className={\`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 \${!notif.read ? 'bg-indigo-500' : 'bg-transparent'}\`}></div>
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
`;

code = code.replace(/\{\/\* Profile Avatar \/ Quick Profile \*\/\}/, bellUI + '\n        {/* Profile Avatar / Quick Profile */}');
fs.writeFileSync('src/components/SneatNavbar.tsx', code);
