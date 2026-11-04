import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import HelpSupportModal from '../components/HelpSupportModal';
import SettingsModal from '../components/SettingsModal';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:pl-16' : 'md:pl-56'
        }`}
      >
        <Topbar
          onToggleMobile={() => setMobileOpen(true)}
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>

      {/* Auxiliary Global Modals */}
      <HelpSupportModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
