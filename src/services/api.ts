import { Project, TeamMember } from '@/types';

// 백엔드 API의 기본 URL입니다. 실제 백엔드 서버 주소로 변경해야 합니다.
const API_BASE_URL = '/api';

// localStorage에서 인증 토큰을 가져오는 함수
export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// localStorage에 인증 토큰을 저장하는 함수
const setToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};

// localStorage에서 인증 토큰을 삭제하는 함수
export const clearToken = (): void => {
    localStorage.removeItem('authToken');
};

// API 요청을 처리하는 통합 함수
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'API 요청 실패');
    }

    // DELETE 요청 등 내용이 없는 응답 처리
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
};

// --- 인증 API ---

export const login = async (email: string, password: string): Promise<{ token: string; user: TeamMember }> => {
    const data = await request<{ token: string; user: TeamMember }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
};

export const signup = async (userData: Omit<TeamMember, 'id' | 'isAdmin'>): Promise<{ token: string; user: TeamMember }> => {
    const data = await request<{ token: string; user: TeamMember }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
    setToken(data.token);
    return data;
};

export const getCurrentUser = (): Promise<TeamMember> => {
    return request<TeamMember>('/auth/me');
};

// --- 프로젝트 API ---

export const getProjects = (): Promise<Project[]> => {
    return request<Project[]>('/projects');
};

export const addProject = (projectData: Omit<Project, 'id' | 'progress' | 'history' | 'timeline' | 'files' | 'kanban'> & { team: string[] }): Promise<Project> => {
    return request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
};

export const updateProject = (project: Project): Promise<Project> => {
    return request<Project>(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(project),
    });
};

export const deleteProject = (projectId: number): Promise<void> => {
    return request<void>(`/projects/${projectId}`, {
        method: 'DELETE',
    });
};

// --- 팀 멤버 API ---

export const getTeamMembers = (): Promise<TeamMember[]> => {
    return request<TeamMember[]>('/users');
};

export const deleteUser = (userId: number): Promise<void> => {
    return request<void>(`/users/${userId}`, {
        method: 'DELETE',
    });
};
