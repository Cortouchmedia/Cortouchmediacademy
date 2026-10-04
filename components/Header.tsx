"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { Page, User } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { usePendingSubmissions } from '../hooks/usePendingSubmissions';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: User;
  currentPage: Page | 'Course Details' | 'Edit Course' | 'Search Results' | 'Admin Portal';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onNavigateToProfile: () => void;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentPage,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onNavigateToProfile,
}) => {
  const { language } = useAppContext();
  const router = useRouter();

  const { count: pendingCount, items: pendingItems } =
    usePendingSubmissions(user);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotificationsOpen]);

  // When the dropdown opens, remember how many items were "seen"
  const openNotifications = () => {
    setIsNotificationsOpen((open) => !open);
    setSeenCount(pendingCount);
  };

  const hasUnseen = pendingCount > seenCount && pendingCount > 0;
  const isInstructor = user.role === 'instructor';

  // Preview: latest 3 pending submissions
  const previewItems = pendingItems.slice(0, 3);

  const goToSubmissions = () => {
    setIsNotificationsOpen(false);
    router.push('/instructor-submissions');
  };

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
            {currentPage}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {/* Search */}
          <div className="relative hidden md:block w-64">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none"
            />
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
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>

          <LanguageSwitcher />

          {/* Notification bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={openNotifications}
              className="relative text-brand-muted hover:text-gray-900 transition-colors"
              aria-label="Notifications"
            >
              <Icon name="bell" className="w-6 h-6" />
              {isInstructor && hasUnseen && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-4 min-w-[16px] px-1 items-center justify-center bg-red-500 text-white text-[10px] font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <p className="font-bold text-gray-900 text-sm">
                    Notifications
                  </p>
                  {isInstructor && pendingCount > 0 && (
                    <span className="text-xs text-brand-muted">
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                {!isInstructor ? (
                  <div className="p-6 text-center text-sm text-gray-500 italic">
                    No notifications.
                  </div>
                ) : pendingCount === 0 ? (
                  <div className="p-6 text-center">
                    <Icon
                      name="checkCircle"
                      className="w-8 h-8 text-green-500 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-700 font-semibold">
                      You're all caught up
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      No submissions waiting for review.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {previewItems.map((s) => (
                        <button
                          key={s.id}
                          onClick={goToSubmissions}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm text-gray-900">
                            <span className="font-bold">
                              {s.student?.full_name ?? 'A student'}
                            </span>{' '}
                            submitted{' '}
                            <span className="font-bold">
                              {s.project?.title ?? 'a project'}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {s.course?.title ?? ''} ·{' '}
                            {formatRelativeTime(s.submitted_at)}
                            {s.is_late && (
                              <span className="text-red-600 font-semibold ml-2">
                                LATE
                              </span>
                            )}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={goToSubmissions}
                        className="w-full py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
                      >
                        View all submissions
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
            onClick={onNavigateToProfile}
          >
            {user.role === 'instructor' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isInstructorPage =
                    window.location.pathname.includes('instructor');
                  window.location.href = isInstructorPage
                    ? '/student-dashboard'
                    : '/instructor-dashboard';
                }}
                className="hidden lg:block mr-4 text-sm font-bold text-[#219BD5] hover:underline"
              >
                {typeof window !== 'undefined' &&
                window.location.pathname.includes('instructor')
                  ? 'Switch to Student View'
                  : 'Switch to Instructor View'}
              </button>
            )}
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">
                  {user.name}
                </p>
                {user.role === 'admin' && (
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};