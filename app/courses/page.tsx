"use client";

import React from 'react';
import { PublicCoursesPage } from '../../components/PublicCoursesPage';
import { useAppContext } from '../../context/AppContext';

export default function CoursesPage() {
  const { coursesWithEnrollmentStatus, currentUser } = useAppContext();

  return (
    <PublicCoursesPage 
      allCourses={coursesWithEnrollmentStatus}
      user={currentUser}
    />
  );
}