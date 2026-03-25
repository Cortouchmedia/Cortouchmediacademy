"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Dashboard } from '../../components/Dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { currentUser, coursesWithEnrollmentStatus, handleNavigate, handleCourseSelect } = useAppContext();
  const router = useRouter();

  if (!currentUser) return null;

  return (
    <Dashboard 
      user={currentUser} 
      courses={coursesWithEnrollmentStatus} 
      setActivePage={(page) => {
        handleNavigate(page);
        const path = page.toLowerCase().replace(' ', '-');
        router.push(`/${path === 'dashboard' ? 'dashboard' : path === 'catalog' ? 'catalog' : path === 'my-courses' ? 'my-courses' : path === 'certificates' ? 'certificates' : path === 'community' ? 'community' : path === 'settings' ? 'settings' : path === 'about-us' ? 'about' : path === 'admin' ? 'admin' : 'dashboard'}`);
      }} 
      onCourseSelect={(course) => {
        handleCourseSelect(course);
        router.push(`/course/${course.id}`);
      }} 
    />
  );
}
