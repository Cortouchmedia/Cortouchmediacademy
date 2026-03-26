"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '../../../context/AppContext';
import { CourseDetails } from '../../../components/CourseDetails';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { 
    currentUser, coursesWithEnrollmentStatus, handleProjectSubmit, 
    handleToggleLessonComplete, handleEnrollmentSuccess, handleSendCourseMessage 
  } = useAppContext();

  if (!currentUser) return null;

  const course = coursesWithEnrollmentStatus.find(c => c.id === Number(id));

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <button 
          onClick={() => {
            if (currentUser.role === 'instructor') router.push('/instructor-dashboard');
            else if (currentUser.role === 'admin') router.push('/admin');
            else router.push('/student-dashboard');
          }}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg"
        >
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
      onBack={() => router.back()} 
      onProjectSubmit={handleProjectSubmit}
      onToggleLessonComplete={handleToggleLessonComplete}
      onEnrollmentSuccess={handleEnrollmentSuccess}
      onSendCourseMessage={handleSendCourseMessage}
    />
  );
}
