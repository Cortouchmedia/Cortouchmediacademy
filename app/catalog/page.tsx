"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Catalog } from '../../components/Catalog';
import { useRouter } from 'next/navigation';

export default function CatalogPage() {
  const { coursesWithEnrollmentStatus, handleCourseSelect } = useAppContext();
  const router = useRouter();

  return (
    <Catalog 
      courses={coursesWithEnrollmentStatus} 
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }} 
    />
  );
}
