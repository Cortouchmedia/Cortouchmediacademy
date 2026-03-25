"use client";

import React from 'react';
import type { Course, User } from '../types';

interface CertificateProps {
  user: User;
  course: Course;
  certificateRef: React.RefObject<HTMLDivElement>;
}

export const Certificate: React.FC<CertificateProps> = ({ user, course, certificateRef }) => {
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const certificateId = `CMA-${course.id}-${user.name.split(' ').join('').toUpperCase()}-${new Date().getTime()}`;

  return (
    <div
      ref={certificateRef}
      className="bg-white w-[800px] h-[565px] p-8 flex flex-col items-center justify-center text-center font-serif relative border-4 border-brand-navy shadow-2xl"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* Ornate Border */}
      <div className="absolute inset-2 border-2 border-brand-secondary"></div>
      <div className="absolute inset-4 border border-brand-navy"></div>

      <div className="relative z-10 flex flex-col items-center">
        <img
          src="https://via.placeholder.com/200x60.png?text=Cortouch+Media"
          alt="Cortouch Media Academy Logo"
          className="h-16 mb-4 object-contain"
        />

        <h1 className="text-4xl font-bold text-brand-navy mt-2">Certificate of Completion</h1>

        <p className="text-lg text-brand-muted mt-8">This certificate is proudly presented to</p>

        <p className="text-5xl font-extrabold text-brand-primary my-4 tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
          {user.name}
        </p>

        <p className="text-lg text-brand-muted">
          for successfully completing the course
        </p>
        <p className="text-2xl font-semibold text-gray-800 my-2">
          {course.title}
        </p>

        <div className="flex justify-between items-end mt-16 w-full max-w-lg">
          <div className="text-center">
            <p className="text-lg font-semibold border-b-2 border-gray-600 pb-1 px-8">{completionDate}</p>
            <p className="text-sm text-brand-muted mt-1">Date of Completion</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold border-b-2 border-gray-600 pb-1 px-8">{course.instructor}</p>
            <p className="text-sm text-brand-muted mt-1">Lead Instructor</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 absolute bottom-[-20px] left-0">{certificateId}</p>
      </div>
    </div>
  );
};