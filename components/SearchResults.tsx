"use client";

import React from 'react';
import type { Course, CourseWithEnrollment } from '../types';
import { CourseCard } from './CourseCard';
import { Icon } from './Icon';

interface SearchResultsProps {
    courses: CourseWithEnrollment[];
    searchQuery: string;
    onCourseSelect: (course: Course) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ courses, searchQuery, onCourseSelect }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Search Results for "{searchQuery}"
        </h1>
        <p className="text-brand-muted mt-1">{courses.length} {courses.length === 1 ? 'result' : 'results'} found.</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-brand-surface rounded-lg border border-gray-200">
            <Icon name="search" className="w-16 h-16 text-brand-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">No courses found</h2>
            <p className="text-brand-muted mt-2 max-w-sm mx-auto">
                We couldn't find any courses matching your search. Try using different or more general keywords.
            </p>
        </div>
      )}
    </div>
  );
};
