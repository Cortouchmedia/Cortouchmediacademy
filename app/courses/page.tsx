"use client";

import React from 'react';
import { PublicCoursesPage } from '../../components/PublicCoursesPage';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import type { Course } from '../../types';

export default function CoursesPage() {
  const { 
    coursesWithEnrollmentStatus, 
    currentUser, 
    handleEnrollmentSuccess,
    handleProjectSubmit,
    handleToggleLessonComplete,
    handleSendCourseMessage
  } = useAppContext();
  const router = useRouter();

  const handleNavigateToSignIn = () => {
    router.push('/login');
  };

  const handleNavigateToSignUp = () => {
    router.push('/signup');
  };

  return (
    <PublicCoursesPage 
      allCourses={coursesWithEnrollmentStatus}
      user={currentUser}
      onNavigateToSignIn={handleNavigateToSignIn} 
      onNavigateToSignUp={handleNavigateToSignUp} 
      onEnrollmentSuccess={handleEnrollmentSuccess}
      onProjectSubmit={handleProjectSubmit}
      onToggleLessonComplete={handleToggleLessonComplete}
      onSendCourseMessage={handleSendCourseMessage}
    />
  );
}
