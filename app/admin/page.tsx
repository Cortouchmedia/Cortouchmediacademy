"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AdminDashboard } from '../../components/AdminDashboard';

export default function AdminPage() {
  const { 
    currentUser, courses, users
  } = useAppContext();

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <AdminDashboard 
      users={users} 
      courses={courses} 
    />
  );
}
