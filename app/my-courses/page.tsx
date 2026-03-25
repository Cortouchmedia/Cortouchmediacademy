"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { MyCourses } from '../../components/MyCourses';
import { useRouter } from 'next/navigation';

export default function MyCoursesPage() {
  const { coursesWithEnrollmentStatus, handleCourseSelect } = useAppContext();
  const router = useRouter();

  return (
    <MyCourses 
      courses={coursesWithEnrollmentStatus} 
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }} 
    />
  );
}
