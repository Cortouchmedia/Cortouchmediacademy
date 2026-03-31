"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '../../../context/AppContext';
import { PublicCourseDetailsPage } from '../../../components/PublicCourseDetailsPage';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { courses } = useAppContext();
  
  const courseId = parseInt(params.id as string);
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-colors"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleNavigateToSignIn = () => {
    router.push('/login');
  };

  const handleNavigateToSignUp = () => {
    router.push('/signup');
  };

  return (
    <PublicCourseDetailsPage 
      course={course} 
      onNavigateToSignIn={handleNavigateToSignIn} 
      onNavigateToSignUp={handleNavigateToSignUp} 
    />
  );
}
