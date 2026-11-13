"use client";

import React from 'react';
import { CourseCard } from './CourseCard';
import { Icon } from './Icon';
import type { Page, Course, User, CourseWithEnrollment } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../constants/translations';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  user: User;
  courses: CourseWithEnrollment[];
  setActivePage: (page: Page) => void;
  onCourseSelect: (course: Course) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, setActivePage, onCourseSelect }) => {
  const { language, auditLogs } = useAppContext();
  const router = useRouter();
  const t = translations[language];
  
  const enrolledCourses = courses.filter(c => c.isEnrolled);
  
  // 1. Achievements = Courses with certificates
  const realAchievements = enrolledCourses.filter(c => (c as any).certificate);
  
  // 2. Ongoing = Enrolled BUT NO certificate yet (fix: removing the `progress > 0` restriction)
  const ongoingCourses = enrolledCourses
    .filter(c => !(c as any).certificate)
    .slice(0, 2); // 👈 Slices to 2 to fill the 2-column grid
        
  // 3. Completed = Courses with certificates
  const completedCourses = realAchievements;
  
  // 4. Recommended = Courses NOT enrolled
  const recommendedCourses = courses.filter(c => !c.isEnrolled).slice(0, 2);
  
  const totalProgress = enrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  const avgProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;

  const userActivity = auditLogs
    .filter(log => log.userId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // 5. Hero Banner = The most recently active ongoing course
  const lastInteractedCourse = ongoingCourses[0];

  const stats = [
    { label: 'Enrolled', value: enrolledCourses.length, icon: 'courses', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: completedCourses.length, icon: 'checkCircle', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: 'academicCap', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Achievements', value: realAchievements.length, icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t.welcomeBack}, {user.name}!</h1>
          <p className="text-brand-muted mt-1 text-sm lg:text-base">Here's a summary of your learning activity.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-brand-muted bg-brand-surface px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Active Session
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <Icon name={stat.icon as any} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Hero */}
      {lastInteractedCourse && (
        <div className="bg-gradient-to-br from-[#219BD5] to-[#1a7bb0] rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Continue Learning
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold">{lastInteractedCourse.title}</h2>
              <p className="text-white/80 text-base">You've completed {lastInteractedCourse.progress}% of this course. Keep going to earn your certificate!</p>
              
              <div className="pt-2 w-full max-w-sm">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Course Progress</span>
                  <span>{lastInteractedCourse.progress}%</span>
                </div>
                <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000 ease-out rounded-full" style={{ width: `${lastInteractedCourse.progress}%` }}></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onCourseSelect(lastInteractedCourse)}
              className="px-8 py-4 bg-white text-[#1a7bb0] font-bold rounded-xl hover:bg-slate-50 hover:scale-105 transition-all shadow-lg flex items-center gap-2 w-fit whitespace-nowrap"
            >
              {lastInteractedCourse.progress > 0 ? 'Resume Course' : 'Start Course'}
              <Icon name="play" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🎯 MAIN GRID (2 columns: Left = Courses, Right = Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8/12) - Ongoing & Recommended */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Ongoing Courses */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">{t.ongoingCourses}</h2>
              <button 
                onClick={() => setActivePage('My Courses')} 
                className="text-sm font-bold text-[#219BD5] hover:text-white hover:bg-[#219BD5] border border-[#219BD5] px-4 py-1.5 rounded-lg transition-all"
              >
                View All
              </button>
            </div>
            {ongoingCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {ongoingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 text-sm mb-4">No ongoing courses. Start a new one from the catalog!</p>
                <button onClick={() => setActivePage('Catalog')} className="px-5 py-2.5 bg-[#219BD5] text-white rounded-lg text-sm font-bold hover:bg-[#1a7bb0] transition-colors">
                  Browse Catalog
                </button>
              </div>
            )}
          </section>

          {/* Recommended Courses */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t.recommendedForYou}</h2>
                <p className="text-sm text-slate-500 mt-1">Based on your interests and learning history.</p>
              </div>
              <button 
                onClick={() => setActivePage('Catalog')} 
                className="text-sm font-bold text-[#219BD5] hover:text-white hover:bg-[#219BD5] border border-[#219BD5] px-4 py-1.5 rounded-lg transition-all"
              >
                Catalog
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isRecommended={true} onCourseSelect={onCourseSelect} />
                ))
              ) : (
                <div className="col-span-full p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                  <p className="text-slate-500 text-sm">No recommendations available at the moment.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (4/12) - Achievements & Activity */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Achievements Box */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Achievements</h2>
              <button onClick={() => setActivePage('Certificates')} className="text-xs font-bold text-slate-400 hover:text-[#219BD5] transition-colors">
                View All →
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {realAchievements.length > 0 ? (
                realAchievements.slice(0, 3).map((course) => {
                  const cert = (course as any).certificate;
                  return (
                    <div
                      key={course.id}
                      onClick={() => router.push(`/verify-certificate/${cert.verification_code}`)}
                      className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                          <Icon name="award" className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{course.title}</h3>
                          <p className="text-xs text-slate-500">
                            {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <Icon name="chevronRight" className="w-4 h-4 text-slate-300 group-hover:text-[#219BD5] transition-colors shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Icon name="award" className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">No certificates yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Complete a course to earn your first!</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity Box */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-5">Recent Activity</h2>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              {userActivity.length > 0 ? (
                userActivity.map((log) => (
                  <div key={log.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`mt-1 p-2 rounded-lg h-fit ${
                      log.type === 'auth' ? 'bg-blue-50 text-blue-600' :
                      log.type === 'course' ? 'bg-green-50 text-green-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      <Icon name={log.type === 'auth' ? 'user' : log.type === 'course' ? 'play' : 'edit'} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{log.action}</p>
                      <p className="text-xs text-slate-500 truncate">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wide">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">No recent activity.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};