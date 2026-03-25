"use client";

import React, { useState } from 'react';
import { CourseCard } from './CourseCard';
import type { Course, CourseWithEnrollment } from '../types';

interface CatalogProps {
    courses: CourseWithEnrollment[];
    onCourseSelect: (course: Course) => void;
}

const CategoryButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 whitespace-nowrap ${
            isActive ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-muted hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
        }`}
    >
        {label}
    </button>
);

export const Catalog: React.FC<CatalogProps> = ({ courses, onCourseSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = activeCategory === 'All' 
    ? courses 
    : courses.filter(course => course.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
        <p className="text-brand-muted mt-1">Find your next learning opportunity.</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map(category => (
            <CategoryButton 
                key={category} 
                label={category} 
                isActive={activeCategory === category} 
                onClick={() => setActiveCategory(category)}
            />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
        ))}
        {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-16">
                <p className="text-brand-muted">No courses found in this category.</p>
            </div>
        )}
      </div>
    </div>
  );
};