"use client";

import React from 'react';
import type { Course, CourseWithEnrollment } from '../types';
import { ProgressBar } from './ProgressBar';
import { Icon } from './Icon';

interface CourseCardProps {
  course: CourseWithEnrollment;
  isRecommended?: boolean;
  onCourseSelect: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isRecommended = false, onCourseSelect }) => {
  return (
    <div 
      onClick={() => onCourseSelect(course)}
      className="group bg-white rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer border border-gray-100 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
        
        {isRecommended && (
          <div className="absolute top-2 left-2 bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider z-10">
            Bestseller
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight h-10">
          {course.title}
        </h3>
        
        <p className="text-xs text-gray-500 mb-1 truncate">
          {course.instructor || "Cortouch Media Academy"}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3 text-[#219BD5]" />
            <span>{course.duration || "10h 30m"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="bookOpen" className="w-3 h-3 text-[#219BD5]" />
            <span>{course.modules || 12} modules</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs font-bold text-brand-secondary">
            {(course.rating || 4.5).toFixed(1)}
          </span>
          <div className="flex text-yellow-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon 
                key={star} 
                name="star" 
                className={`w-3 h-3 ${star <= Math.round(course.rating || 4.5) ? 'fill-current' : 'opacity-30'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            ({(course.enrollmentCount || 1200).toLocaleString()})
          </span>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          {!course.isEnrolled && course.price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gray-900">
                ₦{course.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₦{(course.price * 1.5).toLocaleString()}
              </span>
            </div>
          ) : course.completed ? (
            <div className="flex items-center text-brand-accent text-xs font-bold">
              <Icon name="checkCircle" className="w-3 h-3 mr-1" />
              <span>Completed</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                <span>{course.progress}% complete</span>
              </div>
              <ProgressBar progress={course.progress} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
