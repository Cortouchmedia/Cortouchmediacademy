"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { Page, User } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  user: User;
  currentPage: Page | 'Course Details' | 'Edit Course' | 'Search Results' | 'Admin Portal';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onNavigateToProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentPage, searchQuery, onSearchChange, onToggleSidebar, onNavigateToProfile }) => {
  const { language } = useAppContext();

  return (
    <header className="bg-brand-surface sticky top-0 z-30 p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-brand-muted hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">{currentPage}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="relative hidden md:block w-64">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-full py-2 pl-10 pr-10 text-gray-900 placeholder-brand-muted transition"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-muted hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <Icon name="x" className="w-4 h-4"/>
              </button>
            )}
          </div>

          <LanguageSwitcher />

          <button className="relative text-brand-muted hover:text-gray-900">
            <Icon name="bell" className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>

          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
            onClick={onNavigateToProfile}
          >
            {user.role === 'instructor' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const isInstructorPage = window.location.pathname.includes('instructor');
                  window.location.href = isInstructorPage ? '/student-dashboard' : '/instructor-dashboard';
                }}
                className="hidden lg:block mr-4 text-sm font-bold text-[#219BD5] hover:underline"
              >
                {typeof window !== 'undefined' && window.location.pathname.includes('instructor') ? 'Switch to Student View' : 'Switch to Instructor View'}
              </button>
            )}
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                {user.role === 'admin' && (
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};