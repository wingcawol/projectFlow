import React, { useState, useMemo, useCallback } from 'react';
import { Project, TeamMember, View } from './types';
import { initialProjects, initialTeamMembers } from './data/mockData';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import { DashboardView, ProjectListView, ProjectDetailView, CalendarView, TeamView, SettingsView } from './components/Views';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';

// Helper function to calculate progress
const calculateProgress = (project: Project): number => {
  if (!project.timeline || project.timeline.length === 0) {
    const allTasks = [...project.kanban.todo, ...project.kanban.inprogress, ...project.kanban.done];
    if (allTasks.length === 0) return project.status === '종료' ? 100 : 0;
    return Math.round((project.kanban.done.length / allTasks.length) * 100);
  }

  const totalProgress = project.timeline.reduce((acc, milestone) => {
    const milestoneTasks = [
        ...project.kanban.todo,
        ...project.kanban.inprogress,
        ...project.kanban.done
    ].filter(task => task.milestoneId === milestone.id);

    if (milestoneTasks.length === 0) {
      return acc;
    }

    const doneTasks = milestoneTasks.filter(task => project.kanban.done.some(doneTask => doneTask.id === task.id));
    const milestoneProgress = (doneTasks.length / milestoneTasks.length);
    return acc + (milestoneProgress * (milestone.weight / 100));
  }, 0);

  return Math.round(totalProgress * 100);
};


const App: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('projectFlowProjects', initialProjects);
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('projectFlowTeamMembers', initialTeamMembers);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useLocalStorage<TeamMember | null>('currentUser', null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogin = (email: string, password: string): boolean => {
    const user = teamMembers.find(member => member.email === email);
    // This is a mock authentication. In a real app, use hashed password verification.
    if (user && password === 'password123') {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleSignup = (newMemberData: Omit<TeamMember, 'id'>): boolean => {
    const userExists = teamMembers.some(member => member.email === newMemberData.email);
    if(userExists) {
        return false;
    }
    const newMember: TeamMember = {
        ...newMemberData,
        id: Date.now(),
    };
    setTeamMembers([...teamMembers, newMember]);
    setCurrentUser(newMember); // Auto-login after signup
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id);
    setCurrentView('projectDetail');
  };
  
  const updateProject = useCallback((updatedProject: Project) => {
    const newProgress = calculateProgress(updatedProject);
    const projectWithProgress = { ...updatedProject, progress: newProgress };
    setProjects(prevProjects => prevProjects.map(p => p.id === projectWithProgress.id ? projectWithProgress : p));
  }, [setProjects]);


  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'progress' | 'history' | 'timeline' | 'files' | 'kanban'> & { team: string[] }) => {
    const newProject: Project = {
      ...newProjectData,
      id: Date.now(),
      progress: 0,
      history: [],
      timeline: [{ id: Date.now(), date: newProjectData.endDate, title: '프로젝트 완료', description: '모든 태스크 완료', weight: 100}],
      files: [],
      kanban: { todo: [], inprogress: [], done: [] }
    };
    setProjects([newProject, ...projects]);
  };
  
  const selectedProject = useMemo(() => {
      return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  
  const renderView = () => {
    if (!currentUser) return null; // Should not happen due to the top-level check, but good for safety.

    switch (currentView) {
      case 'dashboard':
        return <DashboardView projects={projects} currentUser={currentUser} />;
      case 'projects':
        return <ProjectListView projects={projects} teamMembers={teamMembers} onAddProject={handleAddProject} onSelectProject={handleSelectProject} />;
      case 'projectDetail':
        return selectedProject ? <ProjectDetailView project={selectedProject} teamMembers={teamMembers} onBack={() => setCurrentView('projects')} updateProject={updateProject} currentUser={currentUser} /> : <div>프로젝트를 찾을 수 없습니다.</div>;
      case 'calendar':
        return <CalendarView projects={projects} />;
      case 'team':
        return <TeamView teamMembers={teamMembers} />;
      case 'settings':
        return <SettingsView currentUser={currentUser} />;
      default:
        return <DashboardView projects={projects} currentUser={currentUser} />;
    }
  };

  if (!currentUser) {
    if (authMode === 'login') {
        return <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
    }
    return <SignupView onSignup={handleSignup} onSwitchToLogin={() => setAuthMode('login')} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
