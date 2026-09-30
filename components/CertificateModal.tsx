"use client";

import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { Course, User } from '../types';
import { Certificate } from './Certificate';
import { Icon } from './Icon';

interface CertificateModalProps {
  user: User;
  course: Course;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  user,
  course,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = useCallback(() => {
    if (!certificateRef.current) return;

    setIsLoading(true);
    toPng(certificateRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `CMA-${course.title.replace(/\s+/g, '-')}-Certificate.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to generate certificate image', err);
        alert('Sorry, there was an error generating your certificate. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [certificateRef, course.title]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Icon name="certificates" className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Your Certificate
              </h2>
              <p className="text-xs text-gray-500">{course.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Icon name="download" className="w-4 h-4" />
                  <span>Download PNG</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="bg-gray-100 max-h-[75vh] overflow-auto">
          <div className="flex justify-center py-8 px-4">
            <div
              className="shadow-2xl"
              style={{
                width: 720,
                height: 509,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  transform: 'scale(0.72)',
                  transformOrigin: 'top left',
                  width: 1000,
                  height: 707,
                }}
              >
                <Certificate
                  user={user}
                  course={course}
                  certificateRef={certificateRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};