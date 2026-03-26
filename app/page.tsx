"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function Page() {
  const { isLoggedIn, currentUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (currentUser.role === 'instructor') {
        router.push('/instructor-dashboard');
      } else if (currentUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student-dashboard');
      }
    }
  }, [isLoggedIn, currentUser, router]);

  return null;
}
