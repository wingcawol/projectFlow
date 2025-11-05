import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, TeamMember, View } from '@/types';
import * as api from '@/services/api';
import Sidebar from '@/components/Sidebar';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectsData, membersData] = await Promise.all([
        api.getProjects(),
        api.getTeamMembers()
      ]);
      setProjects(projectsData);
      setTeamMembers(membersData);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      // Potentially handle token expiration
      handleLogout();
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
          await fetchData();
        } catch (error) {
          console.error("세션 복구 실패:", error);
          api.clearToken();
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, [fetchData]);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await api.login(email, password);
      setCurrentUser(user);
      await fetchData();
      return true;
    } catch (error) {
      console.error("로그인 실패:", error);
      return false;
    }
  };

  const handleSignup = async (newMemberData: Omit<TeamMember, 'id' | 'isAdmin'>): Promise<boolean> => {
     try {
      const { user } = await api.signup(newMemberData);
      setCurrentUser(user);
      await fetchData(); // Fetch initial data for the new user
      return true;
    } catch (error) {
      console.error("회원가입 실패:", error);
      return false;
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setProjects([]);
    setTeamMembers([]);
    setAuthMode('login');
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id);
    setCurrentView('projectDetail');
  };
  
  const updateProject = useCallback(async (updatedProject: Project) => {
    try {
      const newProgress = calculateProgress(updatedProject);
      const projectWithProgress = { ...updatedProject, progress: newProgress };
      const savedProject = await api.updateProject(projectWithProgress);
      setProjects(prevProjects => prevProjects.map(p => p.id === savedProject.id ? savedProject : p));
    } catch (error) {
       console.error("프로젝트 업데이트 실패:", error);
    }
  }, []);


  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'progress' | 'history' | 'timeline' | 'files' | 'kanban'> & { team: string[] }) => {
    try {
      const newProject = await api.addProject(newProjectData);
      setProjects(prev => [newProject, ...prev]);
    } catch (error) {
      console.error("프로젝트 추가 실패:", error);
    }
  };
  
  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            await api.deleteProject(projectId);
            setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        } catch (error) {
            console.error("프로젝트 삭제 실패:", error);
        }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (currentUser?.id === userId) {
        alert("자기 자신은 삭제할 수 없습니다.");
        return;
    }
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            await api.deleteUser(userId);
            setTeamMembers(prev => prev.filter(member => member.id !== userId));
        } catch (error) {
            console.error("사용자 삭제 실패:", error);
        }
    }
  };
  
  const selectedProject = useMemo(() => {
      return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  
  const renderView = () => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><p className="text-xl">로딩 중...</p></div>;
    }
    if (!currentUser) return null; // Should not happen due to the top-level check, but good for safety.

    switch (currentView) {
      case 'dashboard':
        return <DashboardView projects={projects} currentUser={currentUser} />;
      case 'projects':
        // FIX: Added currentUser and onDeleteProject props to ProjectListView call.
        return <ProjectListView projects={projects} teamMembers={teamMembers} onAddProject={handleAddProject} onSelectProject={handleSelectProject} currentUser={currentUser} onDeleteProject={handleDeleteProject} />;
      case 'projectDetail':
        return selectedProject ? <ProjectDetailView project={selectedProject} teamMembers={teamMembers} onBack={() => setCurrentView('projects')} updateProject={updateProject} currentUser={currentUser} /> : <div>프로젝트를 찾을 수 없습니다.</div>;
      case 'calendar':
        return <CalendarView projects={projects} />;
      case 'myTasks':
        return <MyTasksView projects={projects} currentUser={currentUser} updateProject={updateProject} />;
      case 'team':
        return <TeamView teamMembers={teamMembers} />;
      case 'settings':
        return <SettingsView 
                    currentUser={currentUser} 
                    teamMembers={teamMembers} 
                    onDeleteUser={handleDeleteUser}
                    projects={projects}
                    onDeleteProject={handleDeleteProject}
                />;
      default:
        return <DashboardView projects={projects} currentUser={currentUser} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 animate-pulse"><i className="fas fa-tasks mr-2"></i> ProjectFlow</h1>
          <p className="mt-4">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (authMode === 'login') {
        // FIX: The onLogin prop for LoginView expects a Promise<boolean>, which handleLogin provides. The error seems to stem from a stale type definition. No change is needed here as the types are compatible in the provided `src` files.
        return <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
    }
    // FIX: The onSignup prop for SignupView expects a Promise<boolean>, which handleSignup provides. The error seems to be from a stale type definition. No change is needed here as the types are compatible in the provided `src` files.
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
