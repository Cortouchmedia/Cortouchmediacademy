"use client";

import React from 'react';
import type { User } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { usePathname, useRouter } from 'next/navigation';

interface AdminSidebarProps {
  user: User;
  onLogout: () => void;
}

const NavLink: React.FC<{
  iconName: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ iconName, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-white shadow-md'
        : 'text-brand-muted hover:bg-brand-accent/10 hover:text-brand-accent'
    }`}
  >
    <Icon name={iconName} className="w-6 h-6" />
    <span className="font-semibold">{label}</span>
  </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Admin Dashboard', icon: 'dashboard', path: '/admin' },
    { label: 'Manage Courses', icon: 'courses', path: '/admin/courses' },
    { label: 'Manage Users', icon: 'community', path: '/admin/users' },
    { label: 'Reports', icon: 'trendingUp', path: '/admin/reports' },
  ];

  return (
    <aside className="bg-brand-surface w-64 min-h-screen flex flex-col p-4 border-r border-gray-200">
      <div className="flex items-center space-x-2 mb-10 px-2">
         <Logo variant="accent" size="lg" />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            iconName={item.icon}
            label={item.label}
            isActive={pathname === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}
      </nav>
      
      <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
        <NavLink
          iconName="logout"
          label="Back to Academy"
          isActive={false}
          onClick={() => router.push('/dashboard')}
        />
        <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-brand-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
            <Icon name="logout" className="w-6 h-6" />
            <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};
