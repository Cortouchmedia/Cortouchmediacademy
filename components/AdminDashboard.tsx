"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useRouter } from 'next/navigation';
import { api, authStorage } from '../lib/api';
import { ApiAdmin } from '../lib/ApiAdmin';

// Notice we removed the props interface entirely
export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  
  // Local state for data
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch everything directly here!
    Promise.all([
      ApiAdmin.listUsers(token).catch((e) => { console.error("Users failed:", e); return []; }),
      api.get('/courses').catch((e) => { console.error("Courses failed:", e); return []; })
    ]).then(([usersData, coursesData]) => {
      // 👈 Added 'as any[]' to fix the red squiggly line
      setUsers((usersData as any[]) || []);
      setCourses((coursesData as any[]) || []);
      setLoading(false);
    });
  }, [router]);

  const StatCard = ({ title, value, icon, color, onClick }: any) => {
    const textColor = color.replace('bg-', 'text-');
    return (
      <div className={`bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon name={icon} className={`w-6 h-6 ${textColor}`} />
          </div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Stats</span>
        </div>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-brand-muted mt-1">{title}</p>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  const totalEnrollments = users.reduce((acc, user) => acc + (user.enrolledCourseIds?.length || 0), 0);
  const totalRevenue = courses.reduce((acc, course) => acc + ((course.price || 0) * (course.enrollmentCount || 0)), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-brand-muted mt-1 font-medium">Overview of your academy's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={users.length} icon="community" color="bg-[#219BD5]" onClick={() => router.push('/admin/users')} />
        <StatCard title="Total Courses" value={courses.length} icon="courses" color="bg-[#10B981]" onClick={() => router.push('/admin/courses')} />
        <StatCard title="Total Enrollments" value={totalEnrollments} icon="bookOpen" color="bg-[#F59E0B]" />
        <StatCard title="Total Revenue" value={`₦${(totalRevenue / 1000000).toFixed(1)}M`} icon="trendingUp" color="bg-[#EF4444]" onClick={() => router.push('/admin/reports')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
            <button onClick={() => router.push('/admin/users')} className="text-sm font-bold text-[#219BD5] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {users.length === 0 ? <p className="text-gray-500">No users found.</p> : users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push('/admin/users')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#219BD5] text-white flex items-center justify-center font-bold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.full_name || 'Unknown'}</p>
                    <p className="text-xs text-brand-muted">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#219BD5] bg-[#219BD5]/10 px-2 py-1 rounded-full uppercase">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};