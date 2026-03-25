"use client";

import React from 'react';
import { mockAchievements } from '../constants';
import { CourseCard } from './CourseCard';
import { Icon } from './Icon';
import type { Page, Course, User, CourseWithEnrollment } from '../types';

interface DashboardProps {
  user: User;
  courses: CourseWithEnrollment[];
  setActivePage: (page: Page) => void;
  onCourseSelect: (course: Course) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, setActivePage, onCourseSelect }) => {
  const ongoingCourses = courses.filter(c => !c.completed && c.progress > 0).slice(0, 3);
  const recommendedCourses = courses.filter(c => c.progress === 0).slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
        <p className="text-brand-muted mt-1">Ready to continue your learning journey?</p>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Ongoing Courses</h2>
          <button onClick={() => setActivePage('My Courses')} className="text-sm font-medium text-brand-primary hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoingCourses.map((course) => (
            <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-slate-900">Recommended for You</h2>
              <button onClick={() => setActivePage('Catalog')} className="text-sm font-medium text-brand-primary hover:underline">
                Browse Catalog
              </button>
            </div>
            <p className="text-brand-muted mb-6">Based on your interests and learning history, we think you'll love these courses.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} isRecommended={true} onCourseSelect={onCourseSelect} />
                  ))
                ) : (
                  <div className="col-span-full p-8 bg-brand-surface rounded-xl border border-dashed border-slate-300 text-center">
                    <p className="text-brand-muted italic">No recommendations available at the moment. Explore our catalog to find your next course!</p>
                  </div>
                )}
             </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Achievements</h2>
          <div className="bg-brand-surface rounded-lg p-6 space-y-4 shadow-sm border border-slate-200/50">
            {mockAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center">
                <div className="p-3 bg-brand-bg rounded-full">{achievement.icon}</div>
                <div className="ml-4">
                  <h3 className="font-semibold text-slate-800">{achievement.title}</h3>
                  <p className="text-sm text-brand-muted">{achievement.description}</p>
                </div>
              </div>
            ))}
             <button onClick={() => setActivePage('Certificates')} className="w-full text-sm font-medium text-brand-primary hover:underline pt-2">
                View All Achievements
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};