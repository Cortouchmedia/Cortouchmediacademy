"use client";

import React from 'react';
import type { Course, User } from '../types';

interface CertificateProps {
  user: User;
  course: Course;
  certificateRef: React.RefObject<HTMLDivElement>;
}

// Brand colors
const BRAND_PRIMARY = '#219BD5';
const BRAND_DARK = '#1a7fb0';
const BRAND_LIGHT = '#e6f4fb';
const GOLD = '#c8a951';

// Logo — put your file at `public/logo.png` in the frontend project
const LOGO_SRC = '/logo.png';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildCertificateId(
  courseId: string | number,
  userName: string,
  when: number,
): string {
  const initials = userName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const compact = String(courseId).replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
  const ts = when.toString(36).toUpperCase().slice(-6);
  return `CMA-${compact}-${initials}-${ts}`;
}

function buildVerificationUrl(id: string): string {
  return `https://cortouch.tech/verify/${id}`;
}

export const Certificate: React.FC<CertificateProps> = ({
  user,
  course,
  certificateRef,
}) => {
  const issuedAt = new Date();
  const completionDate = formatDate(issuedAt);
  const certificateId = buildCertificateId(course.id, user.name, issuedAt.getTime());
  const verificationUrl = buildVerificationUrl(certificateId);

  return (
    <div
      ref={certificateRef}
      className="relative bg-white"
      style={{
        width: 1000,
        height: 707,
        fontFamily: '"Playfair Display", "Times New Roman", serif',
        color: '#0f172a',
      }}
    >
      {/* Outer border - brand blue */}
      <div className="absolute inset-0 border-[10px]" style={{ borderColor: BRAND_PRIMARY }} />

      {/* Inner gold frame */}
      <div className="absolute inset-[26px] border-2" style={{ borderColor: GOLD }} />

      {/* Corner ornaments */}
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => {
        const styleMap: Record<string, string> = {
          'top-left': 'top-[18px] left-[18px]',
          'top-right': 'top-[18px] right-[18px] rotate-90',
          'bottom-left': 'bottom-[18px] left-[18px] -rotate-90',
          'bottom-right': 'bottom-[18px] right-[18px] rotate-180',
        };
        return (
          <div
            key={corner}
            className={`absolute ${styleMap[corner]} w-12 h-12 pointer-events-none`}
          >
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M2 2 H20 M2 2 V20 M2 2 L14 14"
                stroke={GOLD}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}

      {/* Watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${BRAND_PRIMARY} 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center px-20 py-12 text-center">
        {/* Header with real logo */}
        <div className="flex items-center gap-4">
          <img
            src={LOGO_SRC}
            alt="Cortouch Media Academy"
            className="h-16 w-auto object-contain"
            crossOrigin="anonymous"
          />
          <div className="text-left">
            <p
              className="text-[11px] tracking-[0.32em] font-bold uppercase"
              style={{ color: BRAND_PRIMARY }}
            >
              Cortouch Media Academy
            </p>
            <p className="text-[10px] tracking-[0.32em] text-[#7c8794] uppercase mt-1">
              Excellence in Digital Education
            </p>
          </div>
        </div>

        <div className="w-24 h-[2px] my-6" style={{ backgroundColor: GOLD }} />

        {/* Title */}
        <p className="text-xs tracking-[0.5em] text-[#7c8794] uppercase mb-2">
          Certificate
        </p>
        <h1
          className="text-[44px] leading-none font-bold tracking-wide"
          style={{ fontFamily: '"Playfair Display", serif', color: BRAND_DARK }}
        >
          of Completion
        </h1>

        <div className="w-16 h-[2px] mt-4 mb-6" style={{ backgroundColor: GOLD }} />

        {/* Presented to */}
        <p className="text-[13px] text-[#7c8794] italic">
          This certificate is proudly presented to
        </p>

        <h2
          className="text-[54px] leading-tight mt-3 mb-1"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontWeight: 600,
            color: BRAND_PRIMARY,
          }}
        >
          {user.name}
        </h2>

        <div className="w-64 h-[1px] mt-1 mb-6" style={{ backgroundColor: GOLD }} />

        {/* Course */}
        <p className="text-[13px] text-[#7c8794] italic">
          for successfully completing the course
        </p>
        <p
          className="text-[28px] mt-2 leading-snug max-w-3xl font-semibold"
          style={{ fontFamily: '"Playfair Display", serif', color: BRAND_DARK }}
        >
          {course.title}
        </p>

        {course.duration && (
          <p className="text-[12px] text-[#7c8794] mt-2">
            Duration: {course.duration}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto w-full flex items-end justify-between pt-8">
          {/* Signature */}
          <div className="text-center w-56">
            <p
              className="text-[22px] pb-1"
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                color: BRAND_DARK,
              }}
            >
              {course.instructor}
            </p>
            <div className="h-[1px] mb-1" style={{ backgroundColor: BRAND_DARK }} />
            <p className="text-[10px] tracking-widest text-[#7c8794] uppercase">
              Lead Instructor
            </p>
          </div>

          {/* Center seal */}
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
              <div
                className="absolute inset-[3px] rounded-full border"
                style={{ borderColor: GOLD }}
              />
              <span
                className="text-[10px] tracking-widest font-bold"
                style={{ color: '#ffffff' }}
              >
                VERIFIED
              </span>
            </div>
            <p className="text-[10px] text-[#7c8794] mt-2 tracking-widest uppercase">
              Official Seal
            </p>
          </div>

          {/* Date */}
          <div className="text-center w-56">
            <p
              className="text-[18px] pb-1"
              style={{ fontFamily: '"Playfair Display", serif', color: BRAND_DARK }}
            >
              {completionDate}
            </p>
            <div className="h-[1px] mb-1" style={{ backgroundColor: BRAND_DARK }} />
            <p className="text-[10px] tracking-widest text-[#7c8794] uppercase">
              Date of Completion
            </p>
          </div>
        </div>

        {/* ID line */}
        <div className="mt-6 flex items-center gap-3 text-[9px] text-[#7c8794] tracking-widest">
          <span>ID: {certificateId}</span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: GOLD }} />
          <span>VERIFY AT {verificationUrl}</span>
        </div>
      </div>
    </div>
  );
};