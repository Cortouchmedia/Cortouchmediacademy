"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { SearchResults } from '../../components/SearchResults';

export default function SearchPage() {
  const { filteredCourses, searchQuery } = useAppContext();

  return (
    <SearchResults
      courses={filteredCourses}
      searchQuery={searchQuery}
    />
  );
}