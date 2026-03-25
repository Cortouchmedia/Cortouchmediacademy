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

export const CertificateModal: React.FC<CertificateModalProps> = ({ user, course, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = useCallback(() => {
    if (certificateRef.current === null) {
      return;
    }
    setIsLoading(true);
    toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `CMA-${course.title.replace(/\s/g, '-')}-Certificate.png`;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-brand-bg p-6 rounded-lg shadow-2xl max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Certificate</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Icon name="download" className="w-5 h-5"/>
                            <span>Download PNG</span>
                        </>
                    )}
                </button>
                 <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <div className="inline-block transform scale-[0.9] origin-top-left">
              <Certificate user={user} course={course} certificateRef={certificateRef} />
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
