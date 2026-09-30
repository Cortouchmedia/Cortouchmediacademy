"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProfilePage } from '../../components/ProfilePage';

export default function Profile() {
  const { currentUser, courses } = useAppContext();

  if (!currentUser) return null;

  return <ProfilePage user={currentUser} courses={courses} />;
}