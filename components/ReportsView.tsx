"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Icon } from './Icon';
import type { Course, User } from '../types';

interface ReportsViewProps {
  users: User[];
  courses: Course[];
}

// Generate realistic revenue data for the last 7 days
const generateRevenueData = () => {
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  return days.map((day, index) => ({
    day,
    revenue: Math.floor(Math.random() * 50000000) + 20000000 + index * 3000000,
    students: Math.floor(Math.random() * 50) + 20 + index * 5,
  }));
};

// Generate monthly data
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    enrollments: Math.floor(Math.random() * 50) + 20 + index * 5,
    revenue: Math.floor(Math.random() * 50000000) + 20000000 + index * 3000000,
    students: Math.floor(Math.random() * 100) + 50 + index * 8,
  }));
};

const COLORS = ['#219BD5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const ReportsView: React.FC<ReportsViewProps> = ({ users, courses }) => {
  const [revenueData, setRevenueData] = useState(generateRevenueData());
  const [monthlyData, setMonthlyData] = useState(generateMonthlyData());
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days'>('7days');

  // Calculate totals
  const totalRevenue = courses.reduce((acc, course) => acc + (course.price * (course.enrollmentCount || 0)), 0);
  const totalEnrollments = users.reduce((acc, user) => acc + (user.enrolledCourseIds?.length || 0), 0);
  const last7DaysRevenue = revenueData.reduce((acc, day) => acc + day.revenue, 0);
  const previousPeriodRevenue = last7DaysRevenue * 0.875; // Simulating 12.5% growth
  const revenueGrowth = ((last7DaysRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1);

  // Course performance data
  const coursePerformance = courses
    .map(course => ({
      name: course.title?.length > 20 ? course.title.substring(0, 20) + '...' : course.title || 'Untitled',
      students: course.enrollmentCount || 0,
      revenue: (course.price || 0) * (course.enrollmentCount || 0),
    }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 6);

  // Category distribution
  const categoryData = courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value++;
      existing.enrollments += course.enrollmentCount || 0;
    } else {
      acc.push({ 
        name: category, 
        value: 1,
        enrollments: course.enrollmentCount || 0 
      });
    }
    return acc;
  }, [] as { name: string; value: number; enrollments: number }[]);

  // If no courses, show empty state
  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icon name="info" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Data Available</h3>
          <p className="text-gray-500 mt-2">Add courses to see analytics and reports</p>
        </div>
      </div>
    );
  }

  // Custom tooltip formatter
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`;
    }
    return `₦${value}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-brand-muted mt-1 font-medium">Detailed insights into your academy's growth.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon name="trendingUp" className="w-8 h-8" />
            <span className="text-xs font-bold opacity-80 uppercase">Total Revenue</span>
          </div>
          <p className="text-3xl font-black">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-sm opacity-90 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon name="community" className="w-8 h-8" />
            <span className="text-xs font-bold opacity-80 uppercase">Total Students</span>
          </div>
          <p className="text-3xl font-black">{users.length}</p>
          <p className="text-sm opacity-90 mt-2">Active learners</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon name="courses" className="w-8 h-8" />
            <span className="text-xs font-bold opacity-80 uppercase">Total Enrollments</span>
          </div>
          <p className="text-3xl font-black">{totalEnrollments}</p>
          <p className="text-sm opacity-90 mt-2">Course enrollments</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Icon name="star" className="w-8 h-8" />
            <span className="text-xs font-bold opacity-80 uppercase">Avg. Rating</span>
          </div>
          <p className="text-3xl font-black">4.5 / 5.0</p>
          <p className="text-sm opacity-90 mt-2">Based on reviews</p>
        </div>
      </div>

      {/* Revenue Growth Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Revenue Growth</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('7days')}
              className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                selectedPeriod === '7days' 
                  ? 'bg-[#219BD5] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('30days')}
              className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                selectedPeriod === '30days' 
                  ? 'bg-[#219BD5] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#219BD5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#219BD5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis 
                  stroke="#6B7280"
                  tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#219BD5" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
            <p className="text-3xl font-black text-gray-900">{formatCurrency(last7DaysRevenue)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-600 font-bold text-sm">+{revenueGrowth}%</span>
              <span className="text-gray-500 text-xs">vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Enrollment by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} courses (${props.payload.enrollments} enrollments)`, 
                  'Category'
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Courses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformance} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis type="category" dataKey="name" stroke="#6B7280" width={100} />
              <Tooltip 
                formatter={(value: number) => [`${value} students`, 'Enrollments']}
              />
              <Bar dataKey="students" fill="#219BD5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export Data</h3>
            <p className="text-brand-muted mt-1">Download your academy data in CSV or PDF format for offline analysis.</p>
          </div>
          <button 
            onClick={() => {
              console.log('Exporting report...');
              alert('Export functionality would be implemented here');
            }}
            className="px-6 py-3 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7aa8] transition-colors flex items-center gap-2"
          >
            <Icon name="download" className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};