const fs = require('fs');
let code = fs.readFileSync('src/components/SneatNavbar.tsx', 'utf-8');

// 1. Add schoolIdentity to props
code = code.replace(/session\?:\s*\{\n\s*username:\s*string;\n\s*role:\s*UserRole;\n\s*name:\s*string;\n\s*detailId\?:\s*string;\n\s*subject\?:\s*string;\n\s*\}\s*\|\s*null;/g, 'session?: {\n    username: string;\n    role: UserRole;\n    name: string;\n    detailId?: string;\n    subject?: string;\n  } | null;\n  schoolIdentity?: any;');

code = code.replace(/onLogout,\n\}: SneatNavbarProps\) \{/g, 'onLogout,\n  schoolIdentity,\n}: SneatNavbarProps) {');

// 2. Hide Role Quick Switcher if not demo mode
const roleSwitcherRegex = /\{\/\* ROLE QUICK SWITCHER \(Essential for applet demonstration!\) \*\/\}\n\s*<div className="relative flex items-center gap-1\.5">[\s\S]*?<\/select>\n\s*<\/div>/m;
const newRoleSwitcher = `
        {/* ROLE QUICK SWITCHER (Essential for applet demonstration!) */}
        {(schoolIdentity?.adminEmail === 'admin' || !schoolIdentity?.adminEmail) && (
          <div className="relative flex items-center gap-1.5">
            <label className="hidden md:inline text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Peran:</label>
            <select
              id="role-quick-switcher"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold border-none rounded-lg px-2.5 py-1.5 focus:ring-0 outline-none cursor-pointer appearance-none pr-8 relative z-10"
            >
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="kepsek">Kepsek</option>
              <option value="walimurid">Walimurid</option>
              <option value="siswa">Siswa</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 z-20">
              <ChevronDown size={14} />
            </div>
          </div>
        )}
`;
code = code.replace(roleSwitcherRegex, newRoleSwitcher.trim());

// 3. Hide quick role switch in dropdown
const dropdownQuickSwitchRegex = /<div className="px-3 py-1\.5 text-\[9px\] font-bold text-slate-400 uppercase tracking-wider font-mono">Ganti Peran Cepat<\/div>\n\s*\{\(\['admin', 'guru', 'kepsek', 'walimurid', 'siswa'\] as UserRole\[\]\)\.map\(role => \([\s\S]*?<\/button>\n\s*\)\)\}/m;
const newDropdownQuickSwitch = `
                {(schoolIdentity?.adminEmail === 'admin' || !schoolIdentity?.adminEmail) && (
                  <>
                    <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ganti Peran Cepat</div>
                    {(['admin', 'guru', 'kepsek', 'walimurid', 'siswa'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          setShowProfileDropdown(false);
                        }}
                        className={\`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer
                          \${activeRole === role 
                            ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-[#1c2438]'}\`}
                      >
                        <span className="text-sm">{getRoleAvatar(role)}</span>
                        <span className="capitalize text-slate-700 dark:text-slate-300">{role === 'kepsek' ? 'Kepala Sekolah' : role}</span>
                      </button>
                    ))}
                  </>
                )}
`;
code = code.replace(dropdownQuickSwitchRegex, newDropdownQuickSwitch.trim());

fs.writeFileSync('src/components/SneatNavbar.tsx', code);
