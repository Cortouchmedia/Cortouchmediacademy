"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Dashboard } from '../../components/Dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const {
    currentUser,
    isHydrated,
    coursesWithEnrollmentStatus,
    handleNavigate,
    handleCourseSelect,
  } = useAppContext();
  const router = useRouter();

  // Redirect to login once hydration is done and user is missing
  React.useEffect(() => {
    if (isHydrated && !currentUser) {
      router.replace('/login');
    }
  }, [isHydrated, currentUser, router]);

  // Still rehydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-brand-muted">Loading…</p>
      </div>
    );
  }

  // Rehydrated, no user → redirecting
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-brand-muted">Redirecting to login…</p>
      </div>
    );
  }

  // Render the real dashboard
  return (
    <Dashboard
      user={currentUser}
      courses={coursesWithEnrollmentStatus}
      setActivePage={(page) => {
        handleNavigate(page);
        let path = page.toLowerCase().replace(/\s+/g, '-');
        if (path === 'dashboard') path = 'student-dashboard';
        router.push(`/${path}`);
      }}
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }}
    />
  );
}