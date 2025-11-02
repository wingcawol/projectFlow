import React from 'react';
import { View, TeamMember } from '../types';
import { DashboardIcon, ProjectsIcon, CalendarIcon, TeamIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: TeamMember;
  onLogout: () => void;
}

const NavItem: React.FC<{
  viewName: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  // FIX: Changed icon prop type from React.ReactNode to React.ReactElement to correctly type it for React.cloneElement.
  // FIX: The icon's props type is specified to allow passing 'className' via React.cloneElement, resolving the type error.
  icon: React.ReactElement<{ className?: string }>;
  text: string;
}> = ({ viewName, currentView, setCurrentView, icon, text }) => {
  const isActive = currentView === viewName;
  const activeClasses = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
  const inactiveClasses = 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700';

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setCurrentView(viewName);
      }}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {/* FIX: Removed unnecessary type assertion after correcting the icon prop type. */}
      {React.cloneElement(icon, { className: 'w-6' })}
      <span className="ml-4 font-medium">{text}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser, onLogout }) => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-md flex flex-col flex-shrink-0">
      <div className="p-6 text-2xl font-bold text-indigo-600 border-b border-slate-200 dark:border-slate-700">
        <i className="fas fa-tasks mr-2"></i> ProjectFlow
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem viewName="dashboard" currentView={currentView} setCurrentView={setCurrentView} icon={<DashboardIcon />} text="대시보드" />
        <NavItem viewName="projects" currentView={currentView} setCurrentView={setCurrentView} icon={<ProjectsIcon />} text="프로젝트 목록" />
        <NavItem viewName="calendar" currentView={currentView} setCurrentView={setCurrentView} icon={<CalendarIcon />} text="캘린더" />
        <NavItem viewName="team" currentView={currentView} setCurrentView={setCurrentView} icon={<TeamIcon />} text="팀 멤버" />
        <NavItem viewName="settings" currentView={currentView} setCurrentView={setCurrentView} icon={<SettingsIcon />} text="설정" />
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <img src={currentUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full mr-3 object-cover" />
          <div>
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full mt-4 text-left text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-sign-out-alt w-6"></i>
          <span className="ml-4 font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
