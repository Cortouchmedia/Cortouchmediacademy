"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Certificates } from '../../components/Certificates';

export default function CertificatesPage() {
  const { currentUser, coursesWithEnrollmentStatus } = useAppContext();

  if (!currentUser) return null;

  return (
    <Certificates user={currentUser} courses={coursesWithEnrollmentStatus} />
  );
}
