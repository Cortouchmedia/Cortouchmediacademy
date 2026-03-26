"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Dashboard } from '../../components/Dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { currentUser, coursesWithEnrollmentStatus, handleNavigate, handleCourseSelect } = useAppContext();
  const router = useRouter();

  if (!currentUser) return null;

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
