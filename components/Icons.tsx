import React from 'react';

interface IconProps {
  className?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-chart-pie ${className}`}></i>;
export const ProjectsIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-project-diagram ${className}`}></i>;
export const CalendarIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-calendar-alt ${className}`}></i>;
export const TeamIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-users ${className}`}></i>;
export const SettingsIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-cog ${className}`}></i>;
export const PlusIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-plus ${className}`}></i>;
export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-arrow-left ${className}`}></i>;
export const UserPlusIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-user-plus ${className}`}></i>;
export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-chevron-left ${className}`}></i>;
export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-chevron-right ${className}`}></i>;
export const UploadIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-upload ${className}`}></i>;
export const PaperclipIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-paperclip ${className}`}></i>;
export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-check-circle ${className}`}></i>;
export const TimesCircleIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-times-circle ${className}`}></i>;
export const ClockIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-clock ${className}`}></i>;
export const TrashIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-trash ${className}`}></i>;
// FIX: Add UserCheckIcon for the 'My Tasks' view link in the sidebar.
export const UserCheckIcon: React.FC<IconProps> = ({ className }) => <i className={`fas fa-user-check ${className}`}></i>;
