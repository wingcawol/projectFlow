import React, { useState, useCallback, useMemo } from 'react';
import { Project, TeamMember, ProjectStatus, ProjectHistoryItem, TimelineEvent } from '@/types';
import { PlusIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PaperclipIcon, UploadIcon, ClockIcon, TrashIcon } from './Icons';
import KanbanBoard from './KanbanBoard';

// Helper Functions
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ko-KR');

const getStatusBadge = (status: ProjectStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case '진행': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>진행</span>;
        case '시작': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>시작</span>;
        case '중단': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>중단</span>;
        case '종료': return <span className={`${baseClasses} bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300`}>종료</span>;
        default: return <span className={`${baseClasses} bg-gray-200 text-gray-800`}>Unknown</span>;
    }
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
);

// AddProjectModal Component
const AddProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  addProject: (newProject: Omit<Project, 'id' | 'progress' | 'team' | 'history' | 'timeline' | 'files' | 'kanban'> & { team: string[] }) => void;
  teamMembers: TeamMember[];
}> = ({ isOpen, onClose, addProject, teamMembers }) => {
    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const pm = formData.get('pm') as string;
        addProject({
            name: formData.get('projectName') as string,
            client: formData.get('client') as string,
            pm,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            status: formData.get('status') as ProjectStatus,
            description: formData.get('description') as string,
            team: [pm]
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 transform transition-all animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold">새 프로젝트 추가</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="projectName" className="block text-sm font-medium mb-1">프로젝트명</label>
                            <input type="text" name="projectName" required className="w-full input-field" />
                        </div>
                         <div>
                            <label htmlFor="client" className="block text-sm font-medium mb-1">클라이언트</label>
                            <input type="text" name="client" required className="w-full input-field" />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium mb-1">시작일</label>
                            <input type="date" name="startDate" required className="w-full input-field" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium mb-1">종료일</label>
                            <input type="date" name="endDate" required className="w-full input-field" />
                        </div>
                        <div>
                            <label htmlFor="pm" className="block text-sm font-medium mb-1">담당 PM</label>
                            <select name="pm" required className="w-full input-field">
                                {teamMembers.map(member => <option key={member.id} value={member.name}>{member.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-1">상태</label>
                            <select name="status" required className="w-full input-field">
                                <option value="시작">시작</option>
                                <option value="진행">진행</option>
                                <option value="중단">중단</option>
                                <option value="종료">종료</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="description" className="block text-sm font-medium mb-1">설명</label>
                            <textarea name="description" rows={3} className="w-full input-field"></textarea>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="btn-secondary">취소</button>
                        <button type="submit" className="btn-primary">저장</button>
                    </div>
                </form>
            </div>
             <style>{`
                .input-field {
                    background-color: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.375rem;
                    padding: 0.5rem 0.75rem;
                    transition: all 0.2s;
                }
                .dark .input-field {
                    background-color: #334155;
                    border-color: #475569;
                }
                .input-field:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px #a5b4fc;
                }
                 .btn-primary {
                    background-color: #4f46e5;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4338ca;
                }
                 .btn-secondary {
                    background-color: #e2e8f0;
                    color: #334155;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                 .dark .btn-secondary {
                    background-color: #475569;
                    color: #e2e8f0;
                }
                 .btn-secondary:hover {
                    background-color: #cbd5e1;
                }
                 .dark .btn-secondary:hover {
                    background-color: #64748b;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

// Dashboard View
export const DashboardView: React.FC<{ projects: Project[], currentUser: TeamMember }> = ({ projects, currentUser }) => {
    const inProgressCount = projects.filter(p => p.status === '진행' || p.status === '시작').length;
    const completedCount = projects.filter(p => p.status === '종료').length;
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">대시보드</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">총 프로젝트</h3>
                    <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">진행 중</h3>
                    <p className="text-3xl font-bold text-green-500">{inProgressCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">완료</h3>
                    <p className="text-3xl font-bold text-blue-500">{completedCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">이슈 발생</h3>
                    <p className="text-3xl font-bold text-red-500">{projects.filter(p=> p.status === '중단').length}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
                    <ul className="space-y-4">
                        {projects.flatMap(p => p.history).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(activity => (
                             <li key={activity.id} className="flex items-center space-x-3">
                                <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full"><ClockIcon className="text-indigo-600 dark:text-indigo-400"/></span>
                                <div>
                                    <p><span className="font-semibold">{activity.user}</span>님이 <span className="text-indigo-600 dark:text-indigo-400">{activity.action}</span> (을)를 완료했습니다.</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(activity.date)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">내 태스크 (To Do)</h2>
                    <ul className="space-y-3">
                       {projects.filter(p => p.pm === currentUser.name || p.team.includes(currentUser.name)).flatMap(p => p.kanban.todo.map(task => ({...task, projectName: p.name}))).slice(0,5).map(task => (
                           <li key={task.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                               <p className="font-medium">{task.content}</p>
                               <p className="text-sm text-indigo-500">{task.projectName}</p>
                           </li>
                       ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ProjectList View
export const ProjectListView: React.FC<{
  projects: Project[];
  teamMembers: TeamMember[];
  onAddProject: (p: Omit<Project, 'id' | 'progress' | 'team' | 'history' | 'timeline' | 'files' | 'kanban'> & { team: string[] }) => void;
  onSelectProject: (id: number) => void;
}> = ({ projects, teamMembers, onAddProject, onSelectProject }) => {
    const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredProjects = useMemo(() => {
        if (filter === 'all') return projects;
        return projects.filter(p => p.status === filter);
    }, [projects, filter]);

    const FilterButton: React.FC<{ status: ProjectStatus | 'all', text: string }> = ({ status, text }) => (
        <button
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${filter === status ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
        >
            {text}
        </button>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">프로젝트 목록</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center">
                    <PlusIcon className="mr-2" /> 새 프로젝트 추가
                </button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <FilterButton status="all" text="전체" />
                <FilterButton status="진행" text="진행" />
                <FilterButton status="시작" text="시작" />
                <FilterButton status="중단" text="중단" />
                <FilterButton status="종료" text="종료" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                            <th className="p-4 text-left font-semibold">프로젝트명</th>
                            <th className="p-4 text-left font-semibold">클라이언트</th>
                            <th className="p-4 text-left font-semibold">담당 PM</th>
                            <th className="p-4 text-left font-semibold">기간</th>
                            <th className="p-4 text-center font-semibold">상태</th>
                            <th className="p-4 text-left font-semibold">진행률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr
                                key={project.id}
                                onClick={() => onSelectProject(project.id)}
                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                            >
                                <td className="p-4 font-medium">{project.name}</td>
                                <td className="p-4">{project.client}</td>
                                <td className="p-4">{project.pm}</td>
                                <td className="p-4 text-sm">{`${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`}</td>
                                <td className="p-4 text-center">{getStatusBadge(project.status)}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <ProgressBar progress={project.progress} />
                                        <span className="text-sm font-semibold">{project.progress}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} addProject={onAddProject} teamMembers={teamMembers} />
        </div>
    );
};

// ProjectDetail View
export const ProjectDetailView: React.FC<{
  project: Project;
  teamMembers: TeamMember[];
  onBack: () => void;
  updateProject: (updatedProject: Project) => void;
  currentUser: TeamMember;
}> = ({ project, teamMembers, onBack, updateProject, currentUser }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const [newHistory, setNewHistory] = useState('');
    const [timelineDate, setTimelineDate] = useState('');
    const [timelineTitle, setTimelineTitle] = useState('');
    const [timelineDesc, setTimelineDesc] = useState('');
    const [timelineWeight, setTimelineWeight] = useState(0);

    const totalWeight = useMemo(() => project.timeline.reduce((sum, m) => sum + m.weight, 0), [project.timeline]);

    const handleAddHistory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHistory.trim()) return;
        const newHistoryItem: ProjectHistoryItem = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            user: currentUser.name,
            action: newHistory.trim(),
        };
        updateProject({
            ...project,
            history: [newHistoryItem, ...project.history],
        });
        setNewHistory('');
    };

    const handleAddTimeline = (e: React.FormEvent) => {
        e.preventDefault();
        if (!timelineDate || !timelineTitle.trim() || !timelineDesc.trim()) return;
        if(totalWeight + timelineWeight > 100){
            alert("총 가중치는 100%를 넘을 수 없습니다.");
            return;
        }
        const newTimelineEvent: TimelineEvent = {
            id: Date.now(),
            date: timelineDate,
            title: timelineTitle.trim(),
            description: timelineDesc.trim(),
            weight: timelineWeight
        };
        updateProject({
            ...project,
            timeline: [...project.timeline, newTimelineEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        });
        setTimelineDate('');
        setTimelineTitle('');
        setTimelineDesc('');
        setTimelineWeight(0);
    };

    const handleWeightChange = (id: number, weight: number) => {
        const otherMilestonesWeight = project.timeline.filter(m => m.id !== id).reduce((sum, m) => sum + m.weight, 0);
        if(otherMilestonesWeight + weight > 100){
            alert("총 가중치는 100%를 넘을 수 없습니다.");
            return;
        }
        const updatedTimeline = project.timeline.map(m => m.id === id ? {...m, weight} : m);
        updateProject({ ...project, timeline: updatedTimeline });
    }

    const TabButton: React.FC<{ tab: string, text: string }> = ({ tab, text }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 inline-flex items-center gap-2 text-sm font-medium text-center border-b-2 transition-colors ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
                {text}
            </button>
        );
    };

    const projectTeam = teamMembers.filter(member => project.team.includes(member.name));

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <ArrowLeftIcon className="mr-2" /> 목록으로 돌아가기
            </button>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm mb-8">
                <div className="flex justify-between items-start">
                    <div>
                         <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
                         <p className="text-slate-500 dark:text-slate-400">클라이언트: {project.client}</p>
                    </div>
                    {getStatusBadge(project.status)}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium mb-1">진행률: {project.progress}%</p>
                    <ProgressBar progress={project.progress} />
                </div>
            </div>
            <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <TabButton tab="overview" text="개요" />
                    <TabButton tab="kanban" text="칸반보드" />
                    <TabButton tab="history" text="히스토리" />
                    <TabButton tab="timeline" text="타임라인" />
                    <TabButton tab="files" text="산출물" />
                </nav>
            </div>
            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">프로젝트 설명</h3>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{project.description}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">참여 멤버</h3>
                            <ul className="space-y-4">
                               {projectTeam.map(member => (
                                    <li key={member.id} className="flex items-center space-x-3">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                                        </div>
                                    </li>
                               ))}
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'kanban' && <KanbanBoard project={project} updateProject={updateProject} />}
                {activeTab === 'history' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">히스토리 추가</h3>
                        <form onSubmit={handleAddHistory} className="flex gap-4 items-start">
                           <textarea 
                                value={newHistory}
                                onChange={(e) => setNewHistory(e.target.value)}
                                placeholder="작업 내용이나 변경 사항을 기록하세요..."
                                rows={2}
                                className="flex-grow input-field"
                           />
                           <button type="submit" className="btn-primary">기록</button>
                        </form>
                        <hr className="my-6 dark:border-slate-700"/>
                        <h3 className="text-xl font-semibold mb-4">작업 내역</h3>
                        <ul className="space-y-4">
                            {project.history.map(item => (
                                <li key={item.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                                    <p className="font-semibold">{item.action}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.user} - {formatDate(item.date)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeTab === 'timeline' && (
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">마일스톤 추가</h3>
                        <form onSubmit={handleAddTimeline} className="space-y-4 p-4 border rounded-lg dark:border-slate-700 mb-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">날짜</label>
                                    <input type="date" value={timelineDate} onChange={e => setTimelineDate(e.target.value)} required className="w-full input-field" />
                                </div>
                                <div className="flex-grow">
                                     <label className="block text-sm font-medium mb-1">마일스톤 제목</label>
                                     <input type="text" value={timelineTitle} onChange={e => setTimelineTitle(e.target.value)} required className="w-full input-field" placeholder="예: 1차 중간 보고" />
                                </div>
                                <div>
                                     <label className="block text-sm font-medium mb-1">가중치 (%)</label>
                                     <input type="number" value={timelineWeight} onChange={e => setTimelineWeight(parseInt(e.target.value, 10) || 0)} required className="w-full input-field" min="0" max="100"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">설명</label>
                                <textarea value={timelineDesc} onChange={e => setTimelineDesc(e.target.value)} required rows={2} className="w-full input-field"></textarea>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="btn-primary">마일스톤 추가</button>
                            </div>
                        </form>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">주요 마일스톤</h3>
                            <div className="text-right">
                                <p className="font-semibold">총 가중치: 
                                    <span className={totalWeight === 100 ? 'text-green-500' : 'text-red-500'}> {totalWeight}%</span> / 100%
                                </p>
                            </div>
                        </div>
                        <div className="relative border-l border-slate-300 dark:border-slate-600 pl-8">
                        {project.timeline.map(event => (
                            <div key={event.id} className="mb-8">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-500 rounded-full ring-8 ring-white dark:ring-slate-800"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-indigo-600 dark:text-indigo-400">{formatDate(event.date)}</p>
                                        <h4 className="font-semibold text-lg">{event.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">가중치:</label>
                                        <input 
                                            type="number" 
                                            value={event.weight}
                                            onChange={(e) => handleWeightChange(event.id, parseInt(e.target.value, 10) || 0)}
                                            className="w-20 input-field text-center"
                                            min="0"
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-1">{event.description}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                {activeTab === 'files' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">프로젝트 산출물</h3>
                            <button className="btn-primary flex items-center gap-2"><UploadIcon/> 파일 업로드</button>
                        </div>
                         <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {project.files.map(file => (
                                <li key={file.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <PaperclipIcon className="text-slate-400"/>
                                        <div>
                                            <a href="#" className="font-medium hover:underline">{file.name}</a>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{file.size} - {file.uploadedBy} on {formatDate(file.date)}</p>
                                        </div>
                                    </div>
                                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">다운로드</a>
                                </li>
                            ))}
                         </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


// Calendar View
export const CalendarView: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const renderCalendar = useCallback((date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        // empty days
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-start-${i}`} className="border border-slate-200 dark:border-slate-700"></div>);
        }
        
        // actual days
        for (let day = 1; day <= lastDate; day++) {
             const dayProjects = projects.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                const current = new Date(year, month, day);
                return current >= start && current <= end;
             });
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            calendarDays.push(
                <div key={day} className="border border-slate-200 dark:border-slate-700 p-2 min-h-[120px] flex flex-col">
                    <span className={`font-semibold ${isToday ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto text-xs">
                       {dayProjects.map(p => <div key={p.id} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 p-1 rounded truncate">{p.name}</div>)}
                    </div>
                </div>
            );
        }

        return calendarDays;
    }, [projects]);
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">캘린더</h1>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeftIcon /></button>
                    <h2 className="text-2xl font-bold">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRightIcon /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-600 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="text-red-500">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-500">토</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {renderCalendar(currentDate)}
                </div>
            </div>
        </div>
    );
};

// Team View
export const TeamView: React.FC<{ teamMembers: TeamMember[] }> = ({ teamMembers }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">팀 멤버</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">총 {teamMembers.length}명의 멤버가 있습니다.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamMembers.map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
                        <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{member.role}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{member.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Settings View
// FIX: Update SettingsView props to accept teamMembers and setTeamMembers for user management.
export const SettingsView: React.FC<{
    currentUser: TeamMember,
    teamMembers: TeamMember[],
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>
}> = ({ currentUser, teamMembers, setTeamMembers }) => {

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            setTeamMembers(prev => prev.filter(member => member.id !== userId));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">설정</h1>
            <div className="space-y-8 max-w-4xl">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 border-b dark:border-slate-700 pb-3">프로필 설정</h2>
                    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">이름</label>
                                <input type="text" defaultValue={currentUser.name} className="w-full input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">직책</label>
                                <input type="text" defaultValue={currentUser.role} className="w-full input-field" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">이메일</label>
                            <input type="email" defaultValue={currentUser.email} className="w-full input-field" />
                        </div>
                        <div className="text-right pt-2">
                            <button type="submit" className="btn-primary">프로필 저장</button>
                        </div>
                    </form>
                </div>

                {/* FIX: Add user management section visible only to admin users by checking currentUser.isAdmin. */}
                {currentUser.isAdmin && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 border-b dark:border-slate-700 pb-3">사용자 관리</h2>
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {/* FIX: Filter out the admin user from the list of users that can be deleted. */}
                            {teamMembers.filter(member => !member.isAdmin).map(member => (
                                <li key={member.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold">{member.name} <span className="text-sm text-slate-500">({member.role})</span></p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(member.id)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                                        aria-label={`Delete ${member.name}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
             <style>{`
                .input-field {
                    background-color: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.375rem;
                    padding: 0.5rem 0.75rem;
                    transition: all 0.2s;
                }
                .dark .input-field {
                    background-color: #334155;
                    border-color: #475569;
                }
                .input-field:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px #a5b4fc;
                }
                 .btn-primary {
                    background-color: #4f46e5;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4338ca;
                }
             `}</style>
        </div>
    );
};
