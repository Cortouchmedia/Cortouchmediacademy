"use client";

import React from 'react';
import { Icon } from './Icon';
import type { Course, User } from '../types';

interface AdminDashboardProps {
  users: User[];
  courses: Course[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon name={icon} className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Stats</span>
    </div>
    <h3 className="text-3xl font-black text-gray-900">{value}</h3>
    <p className="text-sm font-medium text-brand-muted mt-1">{title}</p>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, courses }) => {
  const totalEnrollments = users.reduce((acc, user) => acc + user.enrolledCourseIds.length, 0);
  const totalRevenue = courses.reduce((acc, course) => acc + (course.price * course.enrollmentCount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-brand-muted mt-1 font-medium">Overview of your academy's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={users.length} icon="community" color="bg-[#219BD5]" />
        <StatCard title="Total Courses" value={courses.length} icon="courses" color="bg-brand-primary" />
        <StatCard title="Total Enrollments" value={totalEnrollments} icon="bookOpen" color="bg-brand-accent" />
        <StatCard title="Total Revenue" value={`₦${(totalRevenue / 1000000).toFixed(1)}M`} icon="trendingUp" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Enrollments</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-brand-muted">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                  {user.enrolledCourseIds.length} Courses
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Courses</h3>
          <div className="space-y-4">
            {courses.sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 5).map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={course.imageUrl} alt={course.title} className="w-12 h-8 object-cover rounded" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{course.title}</p>
                    <p className="text-xs text-brand-muted">{course.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{course.enrollmentCount}</p>
                  <p className="text-[10px] font-bold text-brand-muted uppercase">Students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
