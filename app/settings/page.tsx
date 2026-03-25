"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings } from '../../components/Settings';

export default function SettingsPage() {
  const { currentUser, handleUserUpdate } = useAppContext();

  if (!currentUser) return null;

  return <Settings user={currentUser} onUserUpdate={handleUserUpdate} />;
}
