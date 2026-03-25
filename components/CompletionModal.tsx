"use client";

import React from 'react';
import type { Course, Page } from '../types';
import { Icon } from './Icon';

interface CompletionModalProps {
  course: Course;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ course, onClose, onNavigate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-surface rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all animate-scale-in">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-brand-primary mb-6">
          <Icon name="award" className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
        <p className="text-brand-muted mb-6">You've successfully completed the course:</p>
        <p className="text-xl font-semibold text-brand-secondary mb-8">{course.title}</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onNavigate('Certificates')}
            className="w-full px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-opacity-80 transition-all transform hover:scale-105"
          >
            View Certificate
          </button>
          <button
            onClick={() => onNavigate('Catalog')}
            className="w-full px-6 py-3 bg-gray-100 text-brand-muted font-bold rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            Explore More Courses
          </button>
        </div>
      </div>
       {/* Add a close button for accessibility */}
       <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
       `}</style>
    </div>
  );
};