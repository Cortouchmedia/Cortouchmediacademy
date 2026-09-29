"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function RootPage() {
  const { isLoggedIn, currentUser, isHydrated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (isLoggedIn && currentUser) {
      if (currentUser.role === 'instructor') router.replace('/instructor-dashboard');
      else if (currentUser.role === 'admin') router.replace('/admin');
      else router.replace('/student-dashboard');
    } else {
      router.replace('/login');
    }
  }, [isHydrated, isLoggedIn, currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-brand-muted">Loading…</p>
    </div>
  );
}