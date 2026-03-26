"use client";

import React from 'react';
import type { Page, User } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface SidebarProps {
  user: User;
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  iconName: string;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ iconName, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary text-white shadow-md'
        : 'text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary'
    }`}
  >
    <Icon name={iconName} className="w-6 h-6" />
    <span className="font-semibold">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onNavigate, onLogout }) => {
  const studentNavItems: { label: Page; icon: string }[] = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'My Courses', icon: 'bookOpen' },
    { label: 'Catalog', icon: 'courses' },
    { label: 'Certificates', icon: 'certificates' },
    { label: 'Community', icon: 'community' },
  ];

  const instructorNavItems: { label: Page; icon: string }[] = [
    { label: 'Instructor Dashboard', icon: 'dashboard' },
    { label: 'Instructor Courses', icon: 'bookOpen' },
    { label: 'Instructor Students', icon: 'community' },
    { label: 'Instructor Revenue', icon: 'trendingUp' },
  ];

  const navItems = user.role === 'instructor' ? instructorNavItems : studentNavItems;

  const bottomNavItems: { label: Page; icon: string }[] = [
      { label: 'Settings', icon: 'settings' },
      { label: 'About Us', icon: 'info' }
  ]

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
            label={item.label}
            isActive={activePage === item.label}
            onClick={() => onNavigate(item.label)}
          />
        ))}
      </nav>
      
      <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
          {bottomNavItems.map((item) => (
            <NavLink
                key={item.label}
                iconName={item.icon}
                label={item.label}
                isActive={activePage === item.label}
                onClick={() => onNavigate(item.label)}
            />
          ))}
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