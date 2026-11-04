import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  History,
  AlertOctagon,
  BarChart3,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Library,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Books', path: '/books', icon: BookOpen },
  { name: 'Members', path: '/members', icon: Users },
  { name: 'Issue & Return', path: '/issue-return', icon: Repeat },
  { name: 'Borrowing History', path: '/history', icon: History },
  { name: 'Overdue Books', path: '/overdue', icon: AlertOctagon },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenHelp,
  onOpenSettings,
}) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111113] text-[#9898a0] border-r border-[#232328] select-none overflow-x-hidden">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#232328] flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-950 flex-shrink-0">
            <Library className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="text-xs font-bold tracking-wider text-white uppercase font-sans">
                LIBRIO
              </span>
              <span className="text-[9px] text-gray-400 font-medium tracking-tight truncate">
                Smart Library Suite
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1c1c20]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-1">
        <div
          className={`px-2 mb-1.5 text-[9px] font-semibold tracking-wider text-gray-500 uppercase ${
            collapsed ? 'text-center' : ''
          }`}
        >
          {collapsed ? '•' : 'Main Menu'}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-[#27272d] text-white font-semibold shadow-sm'
                  : 'hover:bg-[#1c1c20] hover:text-gray-200'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'
                }`}
              />
              {!collapsed && (
                <span className="truncate tracking-wide text-xs">{item.name}</span>
              )}

              {/* Active left bar accent */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-indigo-500 rounded-r-full" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-2.5 border-t border-[#232328] space-y-1 flex-shrink-0">
        <button
          onClick={onOpenHelp}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1c1c20] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Help & Support' : undefined}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">Help & Docs</span>}
        </button>

        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1c1c20] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </button>

        {/* Admin profile pill */}
        <div className="pt-1.5">
          <div
            className={`flex items-center gap-2 p-1.5 rounded-lg bg-[#17171a] border border-[#232328] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
              AV
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="text-[11px] font-semibold text-white truncate leading-tight">
                  Aditya Verma
                </span>
                <span className="text-[9px] text-gray-400 truncate flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" /> Chief Librarian
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:flex justify-end pt-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c1c20] transition-colors w-full flex items-center justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <ChevronLeft className="w-3 h-3" /> Collapse menu
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (md and above) */}
      <aside
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
