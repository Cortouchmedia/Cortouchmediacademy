"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProfilePage } from '../../components/ProfilePage';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { currentUser, handleUserUpdate } = useAppContext();
  const router = useRouter();

  if (!currentUser) return null;

  return (
    <ProfilePage 
      user={currentUser} 
      onUpdateUser={(updatedFields) => {
        handleUserUpdate({ ...currentUser, ...updatedFields });
      }} 
    />
  );
}
