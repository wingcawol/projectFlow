import React, { useState, useMemo, useCallback, useEffect } from 'react';
// FIX: The path alias '@/' is used to maintain consistency.
import { Project, TeamMember, View } from '@/types';
import { initialProjects, initialTeamMembers } from '@/data/mockData';
import useLocalStorage from '@/hooks/useLocalStorage';
import Sidebar from '@/components/Sidebar';
// FIX: Import the new 'MyTasksView' component to be used in the main view rendering logic. This resolves the error 'Module has no exported member MyTasksView'.
import { DashboardView, ProjectListView, ProjectDetailView, CalendarView, TeamView, SettingsView, MyTasksView } from '@/components/Views';
import LoginView from '@/components/LoginView';
import SignupView from '@/components/SignupView';

// Helper function to calculate progress
const calculateProgress = (project: Project): number => {
  if (project.status === '종료') return 100;
  
  if (!project.timeline || project.timeline.length === 0) {
    const allTasks = [...project.kanban.todo, ...project.kanban.inprogress, ...project.kanban.done];
    if (allTasks.length === 0) return 0;
    return Math.round((project.kanban.done.length / allTasks.length) * 100);
  }

  const totalWeight = project.timeline.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 0;

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
    // Normalize weight
    return acc + (milestoneProgress * (milestone.weight / totalWeight));
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

  useEffect(() => {
    // One-time data migration check on component mount.
    // If any team member in localStorage is missing a password, it indicates stale data.
    // In this case, reset the team members to the initial mock data.
    // FIX: Accessing member.password which requires updating the TeamMember type.
    const isStale = teamMembers.length > 0 && teamMembers.some(member => typeof (member as any).password !== 'string');
    if (isStale) {
      console.log('Stale team member data detected in localStorage. Resetting to initial data.');
      setTeamMembers(initialTeamMembers);
    }
  }, []); // Empty dependency array ensures this runs only once.

  const handleLogin = (email: string, password: string): boolean => {
    const user = teamMembers.find(member => member.email === email);
    // This is a mock authentication. In a real app, use hashed password verification.
    // FIX: Accessing user.password which requires updating the TeamMember type. This resolves the error 'Property 'password' does not exist on type 'TeamMember''.
    if (user && user.password === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  // FIX: Updated signature to Omit 'isAdmin' as it's not set during signup. The password property is now correctly typed.
  const handleSignup = (newMemberData: Omit<TeamMember, 'id' | 'isAdmin'>): boolean => {
    const userExists = teamMembers.some(member => member.email === newMemberData.email);
    if(userExists) {
        return false;
    }
    const newMember: TeamMember = {
        ...newMemberData,
        id: Date.now(),
        isAdmin: false, // Default new users to non-admin
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
      // FIX: Add a case to render the new 'MyTasksView' component. This resolves the error 'Type '"myTasks"' is not comparable to type 'View''.
      case 'myTasks':
        return <MyTasksView projects={projects} currentUser={currentUser} updateProject={updateProject} />;
      case 'team':
        return <TeamView teamMembers={teamMembers} />;
      case 'settings':
        // FIX: Pass teamMembers and setTeamMembers props to SettingsView for user management. This resolves the property assignment error.
        return <SettingsView currentUser={currentUser} teamMembers={teamMembers} setTeamMembers={setTeamMembers} />;
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
