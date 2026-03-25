"use client";

import React from 'react';
import type { Course, CourseWithEnrollment } from '../types';
import { CourseCard } from './CourseCard';
import { Icon } from './Icon';

interface MyCoursesProps {
    courses: CourseWithEnrollment[];
    onCourseSelect: (course: Course) => void;
}

export const MyCourses: React.FC<MyCoursesProps> = ({ courses, onCourseSelect }) => {
  const inProgressCourses = courses.filter(c => c.isEnrolled && !c.completed);
  const completedCourses = courses.filter(c => c.completed);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-brand-muted mt-1">All your enrolled courses in one place.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">In Progress ({inProgressCourses.length})</h2>
        {inProgressCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inProgressCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
                <Icon name="courses" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                <p className="text-brand-muted">You have no courses in progress.</p>
                <p className="text-sm text-brand-muted mt-1">Check out the <span className="font-semibold text-brand-primary">Catalog</span> to get started!</p>
            </div>
        )}
      </section>

       <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed ({completedCourses.length})</h2>
         {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {completedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
                ))}
            </div>
         ): (
            <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
                <Icon name="checkCircle" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                <p className="text-brand-muted">You haven't completed any courses yet.</p>
                <p className="text-sm text-brand-muted mt-1">Keep learning!</p>
            </div>
         )}
      </section>
    </div>
  );
};