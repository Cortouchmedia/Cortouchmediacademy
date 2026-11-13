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
  // 🎯 3 STATES
  
  // 1. Completed: Has a certificate (all lessons + project graded)
  const certifiedCourses = courses.filter(
    (c) => c.isEnrolled && !!(c as any).certificate
  );

  // 2. Project Phase: All lessons done, but no certificate yet
  const projectPhaseCourses = courses.filter(
    (c) =>
      c.isEnrolled &&
      !(c as any).certificate &&
      (c.progress >= 100 || !!(c as any).completed_at)
  );

  // 3. In Progress: Still doing lessons
  const inProgressCourses = courses.filter(
    (c) =>
      c.isEnrolled &&
      !(c as any).certificate &&
      c.progress < 100 &&
      !(c as any).completed_at
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-brand-muted mt-1">All your enrolled courses in one place.</p>
      </div>

      {/* ─────────────────────────── IN PROGRESS ─────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          In Progress ({inProgressCourses.length})
        </h2>
        {inProgressCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onCourseSelect={onCourseSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
            <Icon name="courses" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
            <p className="text-brand-muted">You have no courses in progress.</p>
            <p className="text-sm text-brand-muted mt-1">
              Check out the{' '}
              <span className="font-semibold text-brand-primary">Catalog</span> to get
              started!
            </p>
          </div>
        )}
      </section>

      {/* ─────────────────────────── PROJECT PHASE ─────────────────────────── */}
      {projectPhaseCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Icon name="briefcase" className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Project Phase ({projectPhaseCourses.length})
            </h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium">
              🎓 You've completed all lessons! Submit your project and wait for
              instructor approval to earn your certificate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projectPhaseCourses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard course={course} onCourseSelect={onCourseSelect} />
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-wider">
                  Project Pending
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────── COMPLETED ─────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="award" className="w-7 h-7 text-green-500" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Completed ({certifiedCourses.length})
          </h2>
        </div>
        {certifiedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certifiedCourses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard course={course} onCourseSelect={onCourseSelect} />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider">
                  <Icon name="checkCircle" className="w-3 h-3" />
                  Certified
                </div>
                {(course as any).certificate?.verification_code && (
                  <a
                    href={`/verify-certificate/${(course as any).certificate.verification_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Icon name="award" className="w-4 h-4" />
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
            <Icon name="award" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
            <p className="text-brand-muted">
              Complete a project to earn your first certificate!
            </p>
            <p className="text-sm text-brand-muted mt-1">Keep learning!</p>
          </div>
        )}
      </section>
    </div>
  );
};