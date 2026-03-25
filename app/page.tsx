"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function Page() {
  const { isLoggedIn, currentUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, currentUser, router]);

  return null;
}
