"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { SearchResults } from '../../components/SearchResults';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { filteredCourses, searchQuery, handleCourseSelect } = useAppContext();
  const router = useRouter();

  return (
    <SearchResults
      courses={filteredCourses}
      searchQuery={searchQuery}
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }}
    />
  );
}
