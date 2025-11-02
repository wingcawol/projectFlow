
import { Project, TeamMember } from '../types';

export const initialTeamMembers: TeamMember[] = [
    { id: 1, name: '김철수', role: 'Project Manager', email: 'cskim@example.com', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: '이영희', role: 'Backend Developer', email: 'yhlee@example.com', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: '박지성', role: 'Frontend Developer', email: 'jspark@example.com', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: '최민수', role: 'Data Scientist', email: 'mschoi@example.com', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: '정다혜', role: 'UI/UX Designer', email: 'dhjeong@example.com', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 6, name: '김민준', role: 'UI/UX Designer', email: 'minjun.kim@example.com', avatar: 'https://i.pravatar.cc/150?u=6' },
];

const ecommerceTimeline = [
    { id: 1, date: '2025-03-20', title: '기획 및 설계', description: '요구사항 분석 및 DB 스키마 설계', weight: 20 },
    { id: 2, date: '2025-04-20', title: 'UI/UX 디자인', description: '와이어프레임 및 프로토타입 제작 완료', weight: 30 },
    { id: 3, date: '2025-06-20', title: '핵심 기능 개발', description: '상품, 주문, 결제 핵심 API 및 UI 개발', weight: 50 }
];

export const initialProjects: Project[] = [
    { 
        id: 1, name: '차세대 이커머스 플랫폼 구축', client: 'A사', pm: '김철수', startDate: '2025-01-15', endDate: '2025-06-30', status: '진행', progress: 35, // progress will be recalculated
        description: '최신 기술 스택을 활용하여 확장 가능하고 안정적인 이커머스 플랫폼을 구축합니다. MSA 기반 아키텍처와 클라우드 네이티브 환경을 목표로 합니다.',
        team: ['김철수', '이영희', '박지성', '정다혜'], 
        history: [
            { id: 1, date: '2025-03-10', user: '박지성', action: '로그인 UI 컴포넌트 완료' },
            { id: 2, date: '2025-03-08', user: '이영희', action: '상품 DB 스키마 설계' },
            { id: 3, date: '2025-03-05', user: '김철수', action: 'WBS v1.2 업데이트' }
        ],
        timeline: ecommerceTimeline,
        files: [
            { id: 1, name: '요구사항정의서_v2.0.pdf', size: '2.5MB', uploadedBy: '김철수', date: '2025-01-20' },
            { id: 2, name: 'UI디자인_시안_A.fig', size: '15.2MB', uploadedBy: '정다혜', date: '2025-02-15' }
        ],
        kanban: {
            todo: [{ id: 1, content: '결제 모듈 연동', milestoneId: 3 }, { id: 2, content: '마이페이지 UI 구현', milestoneId: 3 }],
            inprogress: [{ id: 3, content: '상품 상세 페이지 API 개발', milestoneId: 3 }],
            done: [{ id: 4, content: '메인 페이지 UI 디자인', milestoneId: 2 }, { id: 5, content: '프로젝트 초기 세팅', milestoneId: 1 }]
        } 
    },
    { 
        id: 2, name: 'AI 기반 데이터 분석 시스템', client: 'B사', pm: '이영희', startDate: '2025-02-01', endDate: '2025-08-31', status: '시작', progress: 0,
        description: '머신러닝 모델을 활용하여 판매 데이터를 분석하고 예측하는 시스템을 개발합니다. Python과 TensorFlow를 주 기술 스택으로 사용합니다.',
        team: ['이영희', '최민수'], 
        history: [{ id: 1, date: '2025-02-20', user: '최민수', action: '데이터 전처리 로직 구현' }],
        timeline: [{ id: 1, date: '2025-03-30', title: '예측 모델 v1 개발 완료', description: '기초 시계열 분석 모델 개발', weight: 100 }],
        files: [],
        kanban: {
            todo: [{ id: 1, content: '데이터 수집 파이프라인 구축', milestoneId: 1 }, { id: 2, content: '예측 모델 서빙 API 설계', milestoneId: 1 }],
            inprogress: [{ id: 3, content: '데이터 정제 및 라벨링', milestoneId: 1 }],
            done: []
        } 
    },
    { 
        id: 3, name: '사내 ERP 시스템 고도화', client: '내부', pm: '박지성', startDate: '2024-11-01', endDate: '2025-03-31', status: '종료', progress: 100,
        description: '기존 ERP 시스템의 성능을 개선하고 새로운 회계 모듈을 추가합니다. 레거시 코드 리팩토링 및 DB 마이그레이션을 포함합니다.',
        team: ['박지성'], 
        history: [{ id: 1, date: '2025-03-25', user: '박지성', action: '최종 산출물 전달 및 프로젝트 종료' }],
        timeline: [{ id: 1, date: '2025-03-20', title: '시스템 개발 완료', description: '모든 기능 개발 및 테스트 완료', weight: 100}],
        files: [{ id: 1, name: '프로젝트완료보고서.pdf', size: '1.2MB', uploadedBy: '박지성', date: '2025-03-25' }],
        kanban: {
            todo: [],
            inprogress: [],
            done: [{ id: 1, content: '회계 모듈 개발', milestoneId: 1 }, { id: 2, content: 'DB 마이그레이션', milestoneId: 1 }, { id: 3, content: 'UI 개편', milestoneId: 1 }]
        } 
    },
    { 
        id: 4, name: '모바일 앱 리뉴얼', client: 'C사', pm: '김철수', startDate: '2025-03-10', endDate: '2025-07-20', status: '중단', progress: 30,
        description: '사용자 피드백을 반영하여 모바일 앱의 UI/UX를 전면 개편합니다. React Native 기반으로 개발 진행 중 클라이언트의 요청으로 잠정 중단되었습니다.',
        team: ['김철수', '정다혜'], 
        history: [{ id: 1, date: '2025-04-15', user: '김철수', action: '클라이언트 요청으로 프로젝트 중단' }],
        timeline: [{ id: 1, date: '2025-04-10', title: '디자인 완료', description: '메인 화면 디자인 완료', weight: 100}],
        files: [],
        kanban: {
            todo: [{ id: 1, content: '푸시 알림 기능 구현', milestoneId: 1 }],
            inprogress: [],
            done: [{ id: 2, content: '메인 화면 디자인', milestoneId: 1 }]
        } 
    },
];
