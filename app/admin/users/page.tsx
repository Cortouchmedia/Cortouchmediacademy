"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Icon } from '../../../components/Icon';

export default function AdminUsersPage() {
  const { 
    currentUser, users, courses
  } = useAppContext();

  if (!currentUser || currentUser.role !== 'admin') return null;

  const getEnrolledCoursesForUser = (user: any) => {
    return courses.filter(course => user.enrolledCourseIds.includes(course.id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
        <p className="text-brand-muted mt-1 font-medium">Manage students and their enrollments.</p>
      </div>

      <div className="bg-brand-surface rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Enrollments</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-brand-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-brand-accent/10 text-brand-accent' 
                      : 'bg-[#219BD5]/10 text-[#219BD5]'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-gray-900">{user.enrolledCourseIds.length} Courses</p>
                    <div className="flex flex-wrap gap-1">
                      {getEnrolledCoursesForUser(user).map(course => (
                        <span key={course.id} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {course.title.split(' ')[0]}...
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
