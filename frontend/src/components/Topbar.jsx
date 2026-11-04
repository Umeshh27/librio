import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  Calendar,
  Layers,
} from 'lucide-react';

const ROUTE_INFO = {
  '/': { title: 'Overview', section: 'Workspace' },
  '/books': { title: 'Book Inventory', section: 'Catalog' },
  '/members': { title: 'Member Directory', section: 'Patrons' },
  '/issue-return': { title: 'Circulation Desk', section: 'Operations' },
  '/history': { title: 'Borrowing History', section: 'Audit' },
  '/overdue': { title: 'Overdue Monitoring', section: 'Alerts' },
  '/reports': { title: 'Executive Reports', section: 'Analytics' },
};

export default function Topbar({
  onToggleMobile,
  searchTerm = '',
  setSearchTerm,
}) {
  const location = useLocation();
  const currentRoute = ROUTE_INFO[location.pathname] || {
    title: 'Dashboard',
    section: 'Workspace',
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    setTodayDate(formatted);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'Overdue Loan Notice',
      desc: '"Clean Code" is past due by Aarav Sharma',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Circulation Alert',
      desc: 'Active borrowing transactions updated',
      time: '1h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Sleek Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-gray-100 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean, single-line SaaS breadcrumb — no redundant text stacking */}
        <nav className="flex items-center gap-1.5 text-xs text-secondary font-medium truncate">
          <span className="hidden sm:inline text-secondary/60 font-semibold tracking-wider uppercase text-[10px]">
            LIBRIO
          </span>
          <ChevronRight className="hidden sm:inline w-3 h-3 text-secondary/40 flex-shrink-0" />
          <span className="text-secondary/80 hidden md:inline truncate">{currentRoute.section}</span>
          <ChevronRight className="hidden md:inline w-3 h-3 text-secondary/40 flex-shrink-0" />
          <span className="text-foreground font-bold tracking-tight truncate">
            {currentRoute.title}
          </span>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-border text-[11px] font-medium text-secondary whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
          <span>{todayDate}</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-36 sm:w-52 md:w-60">
          <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            placeholder="Search catalog, patrons..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-gray-50 border border-border rounded-lg text-foreground placeholder:text-secondary/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <kbd className="hidden sm:block absolute right-2 top-1.5 pointer-events-none text-[9px] font-mono text-gray-400 bg-white px-1 rounded border border-gray-200">
            /
          </kbd>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-dropdown border border-border py-2 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-border">
                <span className="text-xs font-bold text-foreground">
                  Notifications
                </span>
                <span className="text-[10px] bg-indigo-50 text-primary font-semibold px-2 py-0.5 rounded-full">
                  1 unread
                </span>
              </div>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-3.5 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notif.unread ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-secondary ml-2 whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary leading-normal">
                      {notif.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-3.5 py-1.5 border-t border-border text-center">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-medium text-primary hover:text-primary-hover"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg border border-border hover:bg-gray-50 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-foreground text-white flex items-center justify-center text-[10px] font-bold">
              AV
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline pr-1">
              Aditya
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-border py-2 z-50 animate-in fade-in duration-150">
              <div className="px-3.5 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground truncate">
                  Aditya Verma
                </p>
                <p className="text-[10px] text-secondary truncate">
                  aditya.verma@librio.ac.in
                </p>
              </div>
              <div className="py-1 px-3.5 space-y-1 text-[11px] text-secondary">
                <div className="flex items-center justify-between">
                  <span>Database:</span>
                  <span className="font-semibold text-emerald-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Port:</span>
                  <span className="font-mono text-foreground font-semibold">5000</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
