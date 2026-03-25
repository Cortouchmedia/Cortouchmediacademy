"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Icon } from '../../../components/Icon';

export default function AdminReportsPage() {
  const { 
    currentUser, courses, users
  } = useAppContext();

  if (!currentUser || currentUser.role !== 'admin') return null;

  const totalEnrollments = users.reduce((acc, user) => acc + user.enrolledCourseIds.length, 0);
  const totalRevenue = courses.reduce((acc, course) => acc + (course.price * course.enrollmentCount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-brand-muted mt-1 font-medium">Detailed insights into your academy's growth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-brand-surface p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Revenue Growth</h3>
            <select className="bg-brand-bg border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-brand-muted outline-none focus:border-brand-primary transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 60, 55, 75, 90, 85, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-brand-primary/20 rounded-t-lg relative overflow-hidden" style={{ height: `${height}%` }}>
                  <div className="absolute inset-0 bg-brand-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
                <span className="text-[10px] font-bold text-brand-muted uppercase">Day {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                <Icon name="trendingUp" className="w-4 h-4" />
                +12.5%
              </p>
              <p className="text-xs text-brand-muted">vs last period</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Enrollment by Category</h3>
            <div className="space-y-4">
              {[
                { label: 'Design', value: 45, color: 'bg-brand-primary' },
                { label: 'Programming', value: 35, color: 'bg-brand-accent' },
                { label: 'Marketing', value: 20, color: 'bg-green-500' },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-900">{cat.label}</span>
                    <span className="text-brand-muted">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-navy p-6 rounded-xl shadow-xl shadow-brand-navy/20 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl"></div>
             <h3 className="text-lg font-bold text-white mb-2 relative z-10">Export Data</h3>
             <p className="text-xs text-white/80 mb-6 relative z-10">Download your academy data in CSV or PDF format for offline analysis.</p>
             <button className="w-full py-3 bg-white text-brand-navy font-black text-sm rounded-lg hover:bg-[#219BD5]/10 transition-colors flex items-center justify-center gap-2">
               <Icon name="download" className="w-4 h-4" />
               Download Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
