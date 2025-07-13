import React, { useEffect, useState } from 'react';
import {
  Menu,
  LayoutDashboard,
  Server,
  User,
  Trophy,
  Users,
  PanelTop,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME, BRAND_COLOR, PANEL_URL } from '../config';

function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleLogout = () => {
    fetch('/api/auth/logout', { credentials: 'include' }).then(() => navigate('/auth'));
  };

  const navSections = [
    {
      label: 'Dashboard',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', link: '/dashboard' },
        { icon: Server, label: 'Your Servers', link: '/servers' },
        { icon: User, label: 'Account Settings', link: '/profile' },
      ],
    },
    {
      label: 'TEAMS',
      items: [
        { icon: Users, label: 'Team', link: '/team' },
        { icon: Trophy, label: 'Earn', link: '/earn' },
        { icon: Users, label: 'Leaderboard', link: '/leaderboard' },
      ],
    },
    {
      label: 'MISC',
      items: [
        { icon: PanelTop, label: 'Panel', link: PANEL_URL, external: true },
        user?.is_admin && { icon: Shield, label: 'Admin', link: '/admin' },
      ].filter(Boolean),
    },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`:root { --brand-color: ${BRAND_COLOR}; }`}</style>

      <div className="flex min-h-screen bg-[#0C0E14] text-white select-none" style={{ fontFamily: 'Rubik, sans-serif' }}>
        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[#14171F] p-4 transition-all duration-300`}>
          <div className="mb-8 flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--brand-color)' }}>
            {collapsed ? APP_NAME[0] : APP_NAME}
          </div>

          {navSections.map(section => (
            <div key={section.label} className="mb-6">
              {!collapsed && <div className="text-xs text-gray-400 mb-2 uppercase">{section.label}</div>}
              <div className="flex flex-col gap-1">
                {section.items.map(item => {
                  const isActive = location.pathname.startsWith(item.link);
                  const color = isActive ? 'var(--brand-color)' : '#ccc';

                  return item.external ? (
                    <a
                      key={item.label}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex ${collapsed ? 'justify-center' : 'justify-start'} items-center gap-3 px-3 py-2 rounded-md transition hover:bg-[#1a1d25]`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <item.icon size={20} style={{ color }} />
                      </div>
                      {!collapsed && <span className="text-sm" style={{ color }}>{item.label}</span>}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.link}
                      className={`flex ${collapsed ? 'justify-center' : 'justify-start'} items-center gap-3 px-3 py-2 rounded-md transition hover:bg-[#1a1d25]`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <item.icon size={20} style={{ color }} />
                      </div>
                      {!collapsed && <span className="text-sm" style={{ color }}>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-[#14171F] p-4 flex items-center justify-between relative">
            <Menu size={22} className="cursor-pointer" onClick={() => setCollapsed(!collapsed)} />

            {user?.discord?.username && (
              <div className="relative flex items-center gap-2">
                {user.discord.avatar && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium transition relative"
                >
                  <span>{user.discord.username}</span>
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1d25] rounded-md shadow p-2 z-50 min-w-max">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white transition hover:text-[var(--brand-color)]"
                    >
                      <LogOut size={16} className="transition" />
                      <span className="transition">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}

export default Layout;
