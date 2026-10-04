"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PublicCoursesPage } from '../components/PublicCoursesPage';
import { useCourses } from '../hooks/useCourses';

export default function RootPage() {
  const { isLoggedIn, currentUser, isHydrated } = useAppContext();
  const router = useRouter();
  const { courses, loading } = useCourses(); // see below

  // Signed-in users get bounced to their dashboard
  useEffect(() => {
    if (!isHydrated) return;
    if (isLoggedIn && currentUser) {
      if (currentUser.role === 'instructor') router.replace('/instructor-dashboard');
      else if (currentUser.role === 'admin') router.replace('/admin');
      else router.replace('/student-dashboard');
    }
  }, [isHydrated, isLoggedIn, currentUser, router]);

  // Signed-out users see the public catalog here
  if (!isHydrated || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-brand-muted">Loading…</p>
      </div>
    );
  }

  return (
    <PublicCoursesPage
      user={null}
      allCourses={courses ?? []}
    />
  );
}