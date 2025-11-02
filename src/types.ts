export type ProjectStatus = '진행' | '시작' | '중단' | '종료';

export interface KanbanTask {
  id: number;
  content: string;
  milestoneId: number | null; // 마일스톤 ID 연결
}

export interface KanbanState {
  todo: KanbanTask[];
  inprogress: KanbanTask[];
  done: KanbanTask[];
}

export interface ProjectHistoryItem {
  id: number;
  date: string;
  user: string;
  action: string;
}

export interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  weight: number; // 마일스톤 가중치
}

export interface ProjectFile {
  id: number;
  name: string;
  size: string;
  uploadedBy: string;
  date: string;
}

export interface Project {
  id: number;
  name: string;
  client: string;
  pm: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  description: string;
  team: string[];
  history: ProjectHistoryItem[];
  timeline: TimelineEvent[];
  files: ProjectFile[];
  kanban: KanbanState;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  avatar: string; // Can be a URL or a base64 string
  // FIX: Add password and isAdmin to support authentication and authorization. This resolves type errors in other files.
  password: string;
  isAdmin?: boolean;
}

export type View = 'dashboard' | 'projects' | 'calendar' | 'team' | 'settings' | 'projectDetail';
