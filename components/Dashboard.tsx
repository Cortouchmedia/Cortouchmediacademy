"use client";

import React from 'react';
import { mockAchievements } from '../constants';
import { CourseCard } from './CourseCard';
import { Icon } from './Icon';
import type { Page, Course, User, CourseWithEnrollment } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../constants/translations';

interface DashboardProps {
  user: User;
  courses: CourseWithEnrollment[];
  setActivePage: (page: Page) => void;
  onCourseSelect: (course: Course) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, setActivePage, onCourseSelect }) => {
  const { language, auditLogs } = useAppContext();
  const t = translations[language];
  
  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const ongoingCourses = enrolledCourses.filter(c => !c.completed && c.progress > 0).slice(0, 3);
  const completedCourses = enrolledCourses.filter(c => c.completed);
  const recommendedCourses = courses.filter(c => !c.isEnrolled).slice(0, 4);
  
  const totalProgress = enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0);
  const avgProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;

  const userActivity = auditLogs
    .filter(log => log.userId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const lastInteractedCourse = ongoingCourses[0] || enrolledCourses.find(c => c.completed);

  const stats = [
    { label: 'Enrolled', value: enrolledCourses.length, icon: 'courses', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: completedCourses.length, icon: 'checkCircle', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg. Progress', value: `${avgProgress}%`, icon: 'academicCap', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Achievements', value: mockAchievements.length, icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t.welcomeBack}, {user.name}!</h1>
          <p className="text-brand-muted mt-1 text-sm lg:text-base">Here's a summary of your learning activity.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-brand-muted bg-brand-surface px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Active Session
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-brand-surface p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <Icon name={stat.icon as any} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Hero */}
      {lastInteractedCourse && (
        <div className="bg-brand-primary rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent bg-white/10 px-3 py-1 rounded-full">Continue Learning</span>
              <h2 className="text-2xl lg:text-3xl font-bold">{lastInteractedCourse.title}</h2>
              <p className="text-white/80 text-sm lg:text-base max-w-md">You've completed {lastInteractedCourse.progress}% of this course. Keep going to earn your certificate!</p>
              <div className="pt-2 w-full max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{lastInteractedCourse.progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-accent transition-all duration-500" style={{ width: `${lastInteractedCourse.progress}%` }}></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onCourseSelect(lastInteractedCourse)}
              className="px-8 py-3 bg-white text-brand-primary font-bold rounded-xl hover:bg-brand-accent hover:text-white transition-all shadow-md flex items-center gap-2 w-fit"
            >
              Resume Course
              <Icon name="play" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Ongoing Courses */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">{t.ongoingCourses}</h2>
              <button onClick={() => setActivePage('My Courses')} className="text-sm font-medium text-brand-primary hover:underline">
                {t.viewAll}
              </button>
            </div>
            {ongoingCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {ongoingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-brand-surface rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-brand-muted italic text-sm">No ongoing courses. Start a new one from the catalog!</p>
                <button onClick={() => setActivePage('Catalog')} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold">
                  Browse Catalog
                </button>
              </div>
            )}
          </section>

          {/* Recommended Courses */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">{t.recommendedForYou}</h2>
              <button onClick={() => setActivePage('Catalog')} className="text-sm font-medium text-brand-primary hover:underline">
                {t.catalog}
              </button>
            </div>
            <p className="text-brand-muted mb-6 text-sm lg:text-base">Based on your interests and learning history.</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} isRecommended={true} onCourseSelect={onCourseSelect} />
                  ))
                ) : (
                  <div className="col-span-full p-8 bg-brand-surface rounded-xl border border-dashed border-slate-300 text-center">
                    <p className="text-brand-muted italic text-sm">No recommendations available at the moment.</p>
                  </div>
                )}
             </div>
          </section>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {/* Recent Activity */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="bg-brand-surface rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200/50 space-y-4">
              {userActivity.length > 0 ? (
                userActivity.map((log) => (
                  <div key={log.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`mt-1 p-1.5 rounded-full h-fit ${
                      log.type === 'auth' ? 'bg-blue-100 text-blue-600' :
                      log.type === 'course' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon name={log.type === 'auth' ? 'user' : log.type === 'course' ? 'play' : 'edit'} className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                      <p className="text-xs text-brand-muted line-clamp-1">{log.details}</p>
                      <p className="text-[10px] text-brand-muted mt-1 uppercase font-medium">
                        {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-muted italic text-center py-4">No recent activity found.</p>
              )}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4">Achievements</h2>
            <div className="bg-brand-surface rounded-xl p-4 lg:p-6 space-y-4 shadow-sm border border-slate-200/50">
              {mockAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center">
                  <div className="p-2 lg:p-3 bg-brand-bg rounded-full">{achievement.icon}</div>
                  <div className="ml-3 lg:ml-4">
                    <h3 className="font-semibold text-slate-800 text-sm lg:text-base">{achievement.title}</h3>
                    <p className="text-xs lg:text-sm text-brand-muted">{achievement.description}</p>
                  </div>
                </div>
              ))}
               <button onClick={() => setActivePage('Certificates')} className="w-full text-sm font-medium text-brand-primary hover:underline pt-2">
                  {t.viewAll} Achievements
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
