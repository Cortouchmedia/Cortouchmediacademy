"use client";

import React from 'react';
import { Icon } from './Icon';
import type { Page, Course, User } from '../types';

interface InstructorDashboardProps {
  user: User;
  courses: Course[];
  setActivePage: (page: Page) => void;
  onCourseSelect: (course: Course) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ user, courses, setActivePage, onCourseSelect }) => {
  const instructorCourses = courses.filter(c => c.instructor === user.name);
  const totalRevenue = instructorCourses.reduce((acc, c) => acc + (c.enrollmentCount * c.price), 0);
  const instructorShare = totalRevenue * 0.3;
  
  const stats = [
    { label: 'Total Students', value: instructorCourses.reduce((acc, c) => acc + c.enrollmentCount, 0).toLocaleString(), icon: 'community', color: 'text-blue-600', bg: 'bg-blue-100', page: 'Instructor Students' as Page },
    { label: 'Total Courses', value: instructorCourses.length, icon: 'academicCap', color: 'text-purple-600', bg: 'bg-purple-100', page: 'Instructor Courses' as Page },
    { label: 'Avg. Rating', value: (instructorCourses.reduce((acc, c) => acc + c.rating, 0) / (instructorCourses.length || 1)).toFixed(1), icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Total Revenue (30%)', value: `₦${instructorShare.toLocaleString()}`, icon: 'trendingUp', color: 'text-green-600', bg: 'bg-green-100', page: 'Instructor Revenue' as Page },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-serif">Instructor Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1 font-sans">Welcome back, {user.name}. Here's what's happening with your courses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm transition-all ${stat.page ? 'cursor-pointer hover:shadow-md hover:border-brand-primary/30' : ''}`}
            onClick={() => stat.page && setActivePage(stat.page)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 lg:p-3 rounded-lg ${stat.bg}`}>
                <Icon name={stat.icon as any} className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
              </div>
              <span className="text-[10px] lg:text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-xs lg:text-sm text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Your Courses</h2>
              <button onClick={() => setActivePage('Instructor Courses')} className="text-sm font-bold text-[#219BD5] hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {instructorCourses.slice(0, 5).map((course) => (
                <div key={course.id} className="p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onCourseSelect(course)}>
                  <img src={course.imageUrl} alt={course.title} className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm lg:text-base text-gray-900 line-clamp-1">{course.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-500">{course.enrollmentCount.toLocaleString()} students • {course.rating} rating</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm lg:text-base text-gray-900">₦{course.price.toLocaleString()}</p>
                    <p className="text-[10px] lg:text-xs text-green-600 font-bold">Active</p>
                  </div>
                </div>
              ))}
              {instructorCourses.length === 0 && (
                <div className="p-8 lg:p-12 text-center">
                  <p className="text-sm text-gray-500 italic">You haven't created any courses yet.</p>
                  <button 
                    onClick={() => setActivePage('Instructor Courses')}
                    className="mt-4 px-4 lg:px-6 py-2 bg-[#219BD5] text-white text-sm lg:text-base font-bold rounded-lg hover:bg-[#1a7fb0] transition-all"
                  >
                    Create Your First Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Recent Student Activity</h2>
            <div className="space-y-4 lg:space-y-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div 
                  key={i} 
                  className="flex gap-3 lg:gap-4 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
                  onClick={() => setActivePage('Instructor Students')}
                >
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Student" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
                  <div>
                    <p className="text-xs lg:text-sm text-gray-900"><span className="font-bold">Student {i+1}</span> enrolled in <span className="font-bold">Course Name</span></p>
                    <p className="text-[10px] lg:text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 lg:p-6 text-white">
            <h3 className="text-base lg:text-lg font-bold mb-2">Instructor Support</h3>
            <p className="text-xs lg:text-sm text-gray-300 mb-4">Need help with your course content or marketing? Our team is here to help.</p>
            <button className="w-full py-2 bg-white text-gray-900 text-sm lg:text-base font-bold rounded-lg hover:bg-gray-100 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
