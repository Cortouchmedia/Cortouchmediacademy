"use client";

import React from 'react';
import type { Page, User } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { useAppContext } from '../context/AppContext';
import { translations } from '../constants/translations';
import { useRouter } from 'next/navigation';
import { usePendingSubmissions } from '../hooks/usePendingSubmissions';

interface SidebarProps {
  user: User;
  activePage: Page;
}

const NavLink: React.FC<{
  iconName: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ iconName, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary text-white shadow-md'
        : 'text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary'
    }`}
  >
    <Icon name={iconName} className="w-6 h-6" />
    <span className="font-semibold flex-1 text-left">{label}</span>
    {badge != null && badge > 0 && (
      <span
        className={`text-xs font-bold rounded-full px-2 py-0.5 ${
          isActive
            ? 'bg-white text-brand-primary'
            : 'bg-red-500 text-white'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ user, activePage }) => {
  const { language, handleNavigate, handleLogout } = useAppContext();
  const t = translations[language];
  const router = useRouter();

  // Shared hook — same source as the notification bell in the header
  const { count: pendingCount } = usePendingSubmissions(user);

  const PAGE_ROUTES: Record<string, string> = {
    'Instructor Submissions': '/instructor-submissions',
    'Instructor Dashboard': '/instructor-dashboard',
    'Instructor Courses': '/instructor-courses',
    'Instructor Students': '/instructor-students',
    'Instructor Revenue': '/instructor-revenue',
    Dashboard: '/student-dashboard',
  };

  const onNavigate = (page: Page) => {
    handleNavigate(page);
    const mapped = PAGE_ROUTES[page];
    const path =
      mapped ?? `/${page.toLowerCase().replace(/\s+/g, '-')}`;
    router.push(path);
  };

  const onLogout = () => {
    handleLogout();
    router.push('/');
  };

  const studentNavItems: { label: Page; icon: string; translation: string }[] = [
    { label: 'Dashboard', icon: 'dashboard', translation: t.dashboard },
    { label: 'My Courses', icon: 'bookOpen', translation: t.myCourses },
    { label: 'Catalog', icon: 'courses', translation: t.catalog },
    { label: 'Certificates', icon: 'certificates', translation: t.certificates },
    { label: 'Community', icon: 'community', translation: t.community },
  ];

  const instructorNavItems: { label: Page; icon: string; translation: string; badge?: number }[] = [
    { label: 'Instructor Dashboard', icon: 'dashboard', translation: t.dashboard },
    { label: 'Instructor Submissions', icon: 'edit', translation: 'Submissions', badge: pendingCount },
    { label: 'Instructor Courses', icon: 'bookOpen', translation: t.myCourses },
    { label: 'Instructor Students', icon: 'users', translation: t.students },
    { label: 'Instructor Revenue', icon: 'trendingUp', translation: t.revenue },
  ];

  const navItems = user.role === 'instructor' ? instructorNavItems : studentNavItems;

  const bottomNavItems: { label: Page; icon: string; translation: string }[] = [
    { label: 'Profile', icon: 'user', translation: t.profile },
    { label: 'Settings', icon: 'settings', translation: t.settings },
    { label: 'About Us', icon: 'info', translation: t.aboutUs },
  ];

  return (
    <aside className="bg-brand-surface w-64 min-h-screen flex flex-col p-4 border-r border-gray-200">
      <div className="flex items-center space-x-2 mb-10 px-2">
        <Logo size="lg" />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            iconName={item.icon}
            label={item.translation}
            isActive={activePage === item.label}
            onClick={() => onNavigate(item.label)}
            badge={(item as any).badge}
          />
        ))}
      </nav>

      <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.label}
            iconName={item.icon}
            label={item.translation}
            isActive={activePage === item.label}
            onClick={() => onNavigate(item.label)}
          />
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Icon name="logout" className="w-6 h-6" />
          <span className="font-semibold">{t.logout}</span>
        </button>
      </div>
    </aside>
  );
};