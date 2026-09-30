"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '../../../context/AppContext';
import { CourseDetails } from '../../../components/CourseDetails';
import { Icon } from '../../../components/Icon';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser, coursesWithEnrollmentStatus } = useAppContext();

  const goHome = () => {
    if (!currentUser) return router.push('/');
    if (currentUser.role === 'instructor') return router.push('/instructor-dashboard');
    if (currentUser.role === 'admin') return router.push('/admin');
    return router.push('/student-dashboard');
  };

  // Hydrating
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-brand-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  const course = coursesWithEnrollmentStatus.find(
    (c) => String(c.id) === String(id),
  );

  // Still loading courses from the API
  if (!course && coursesWithEnrollmentStatus.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-brand-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading course…</span>
        </div>
      </div>
    );
  }

  // Truly not found
  if (!course) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon name="alertTriangle" className="w-7 h-7 text-gray-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Course not found
        </h1>
        <p className="text-sm text-brand-muted mb-6">
          The course you're looking for doesn't exist, or you don't have access to it.
        </p>
        <button
          onClick={goHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <Icon name="chevronLeft" className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <CourseDetails
      user={currentUser}
      course={course}
      allCourses={coursesWithEnrollmentStatus}
    />
  );
}