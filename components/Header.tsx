"use client";

import React from 'react';
import type { Page, User } from '../types';
import { Icon } from './Icon';

interface HeaderProps {
  user: User;
  currentPage: Page | 'Course Details' | 'Edit Course' | 'Search Results' | 'Admin Portal';
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentPage, searchQuery, onSearchChange }) => {
  return (
    <header className="bg-brand-surface sticky top-0 z-30 p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{currentPage}</h1>

        <div className="flex items-center gap-6">
          <div className="relative w-64">
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

          <button className="relative text-brand-muted hover:text-gray-900">
            <Icon name="bell" className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                {user.role === 'admin' && (
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};