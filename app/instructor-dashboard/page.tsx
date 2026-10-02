"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { InstructorDashboard } from '../../components/InstructorDashboard';

// Map internal Page names to URL paths.
// Keep this in one place so it's easy to update.
const PAGE_TO_ROUTE: Record<string, string> = {
  'Instructor Dashboard': '/instructor/dashboard',
  'My Courses': '/instructor/courses',
  'Create Course': '/instructor/create-course',
  'Students': '/instructor/students',
  'Revenue': '/instructor/revenue',
  'Profile': '/instructor/profile',
  'Settings': '/instructor/settings',
};

export default function InstructorDashboardPage() {
  const { currentUser, courses, handleNavigate, handleCourseSelect } =
    useAppContext();
  const router = useRouter();

  // Redirect non-instructors away (don't just render null and leave them stuck)
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== 'instructor') {
      router.replace('/student-dashboard');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'instructor') {
    return null;
  }

  return (
    <InstructorDashboard
      user={currentUser}
      courses={courses}
      setActivePage={(page) => {
        handleNavigate(page);
        const path = PAGE_TO_ROUTE[page] ?? `/${page.toLowerCase().replace(/\s+/g, '-')}`;
        router.push(path);
      }}
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }}
    />
  );
}