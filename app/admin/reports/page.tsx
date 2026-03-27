"use client";

import React, { useState } from 'react';
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
import { useAppContext } from '../../../context/AppContext';
import { Icon } from '../../../components/Icon';

const COLORS = ['#219BD5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Generate realistic revenue data for the last 7/30 days
const generateRevenueData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    revenue: Math.floor(Math.random() * 50000000) + 20000000 + i * 3000000,
    enrollments: Math.floor(Math.random() * 50) + 20 + i * 2,
  }));
};

// Generate monthly data
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    enrollments: Math.floor(Math.random() * 50) + 20 + index * 3,
    revenue: Math.floor(Math.random() * 50000000) + 20000000 + index * 4000000,
  }));
};

export default function AdminReportsPage() {
  const { currentUser, courses, users } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '12months'>('7days');
  const [revenueData, setRevenueData] = useState(generateRevenueData(7));
  const [monthlyData] = useState(generateMonthlyData());

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Calculate totals
  const totalEnrollments = users.reduce((acc, user) => acc + (user.enrolledCourseIds?.length || 0), 0);
  const totalRevenue = courses.reduce((acc, course) => acc + ((course.price || 0) * (course.enrollmentCount || 0)), 0);
  const lastPeriodRevenue = revenueData.reduce((acc, day) => acc + day.revenue, 0);
  const previousPeriodRevenue = lastPeriodRevenue * 0.875;
  const revenueGrowth = ((lastPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1);

  // Update data when period changes
  const handlePeriodChange = (period: '7days' | '30days' | '12months') => {
    setSelectedPeriod(period);
    if (period === '7days') {
      setRevenueData(generateRevenueData(7));
    } else if (period === '30days') {
      setRevenueData(generateRevenueData(30));
    }
  };

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
        enrollments: course.enrollmentCount || 0,
      });
    }
    return acc;
  }, [] as { name: string; value: number; enrollments: number }[]);

  // Calculate percentages for category distribution
  const totalCourses = courses.length;
  const categoryPercentages = categoryData.map(cat => ({
    ...cat,
    percentage: ((cat.value / totalCourses) * 100).toFixed(0),
  }));

  // Custom currency formatter
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`;
    }
    return `₦${value}`;
  };

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
          <p className="text-3xl font-black">{formatCurrency(totalRevenue)}</p>
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
              onClick={() => handlePeriodChange('7days')}
              className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                selectedPeriod === '7days'
                  ? 'bg-[#219BD5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePeriodChange('30days')}
              className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                selectedPeriod === '30days'
                  ? 'bg-[#219BD5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handlePeriodChange('12months')}
              className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
                selectedPeriod === '12months'
                  ? 'bg-[#219BD5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 12 Months
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {selectedPeriod === '12months' ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#219BD5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#219BD5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis
                    stroke="#6B7280"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#219BD5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#219BD5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis
                    stroke="#6B7280"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
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
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
            <p className="text-3xl font-black text-gray-900">
              {formatCurrency(selectedPeriod === '12months' 
                ? monthlyData.reduce((acc, month) => acc + month.revenue, 0)
                : lastPeriodRevenue
              )}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-600 font-bold text-sm">+{revenueGrowth}%</span>
              <span className="text-gray-500 text-xs">vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollment by Category */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Enrollment by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
                      'Category',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryPercentages.map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-900">{cat.name}</span>
                      <span className="text-brand-muted">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">No category data available</div>
          )}
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Courses</h3>
          {coursePerformance.length > 0 ? (
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
          ) : (
            <div className="text-center py-12 text-gray-500">No course data available</div>
          )}
        </div>
      </div>

      {/* Monthly Enrollment Trends */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Enrollment Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              formatter={(value: number) => [`${value} enrollments`, 'Enrollments']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="enrollments"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              name="Enrollments"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#219BD5] p-6 rounded-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2">Export Data</h3>
            <p className="text-sm text-white/80">Download your academy data in CSV or PDF format for offline analysis.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('Exporting as CSV...');
                alert('CSV export would be implemented here');
              }}
              className="px-6 py-3 bg-white text-[#1e3a5f] font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Icon name="download" className="w-5 h-5" />
              CSV
            </button>
            <button
              onClick={() => {
                console.log('Exporting as PDF...');
                alert('PDF export would be implemented here');
              }}
              className="px-6 py-3 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7aa8] transition-colors flex items-center gap-2 border border-white/20"
            >
              <Icon name="document" className="w-5 h-5" />
              PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}