"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { InstructorDashboard } from '../../components/InstructorDashboard';
import { useRouter } from 'next/navigation';

export default function InstructorDashboardPage() {
  const { currentUser, courses, handleNavigate, handleCourseSelect } = useAppContext();
  const router = useRouter();

  if (!currentUser || currentUser.role !== 'instructor') return null;

  return (
    <InstructorDashboard 
      user={currentUser} 
      courses={courses} 
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
