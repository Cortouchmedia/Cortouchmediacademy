"use client";

import React, { useState } from 'react';
import { mockAchievements } from '../constants';
import { Icon } from './Icon';
import type { Course, Achievement, User, CourseWithEnrollment } from '../types';
import { CertificateModal } from './CertificateModal';

interface CertificatesProps {
    user: User;
    courses: CourseWithEnrollment[];
}

// Helper function to check eligibility
const canGenerateCertificate = (course: Course): boolean => {
    if (!course.completed) return false;
    if (course.projects.length === 0) return true; // If no projects, completion is enough

    const allProjectsGraded = course.projects.every(p => p.isSubmitted && typeof p.score === 'number');
    if (!allProjectsGraded) return false;
    
    const totalScore = course.projects.reduce((acc, p) => acc + (p.score || 0), 0);
    const averageScore = totalScore / course.projects.length;

    return averageScore >= 60;
};

const CertificateCard: React.FC<{ course: Course; isEligible: boolean; onView: () => void }> = ({ course, isEligible, onView }) => (
    <div className={`bg-brand-surface p-6 rounded-lg flex items-center justify-between shadow-sm border border-gray-200 ${isEligible ? 'hover:shadow-md transition-shadow duration-300' : 'opacity-70'}`}>
        <div>
            <p className="text-sm text-brand-muted">{course.category}</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">{course.title}</h3>
            {!isEligible && course.completed && (
                <p className="text-xs text-red-500 mt-1 font-medium">Average project score is below 60%.</p>
            )}
        </div>
        <button 
            onClick={onView}
            disabled={!isEligible}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-brand-muted disabled:cursor-not-allowed"
        >
            <Icon name="download" className="w-5 h-5"/>
            <span>View Certificate</span>
        </button>
    </div>
);

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className="flex flex-col items-center text-center p-4 bg-brand-surface rounded-lg border border-gray-200">
        <div className="p-4 bg-brand-bg rounded-full mb-3">
            {achievement.icon}
        </div>
        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
        <p className="text-xs text-brand-muted mt-1">{achievement.description}</p>
    </div>
);


export const Certificates: React.FC<CertificatesProps> = ({ user, courses }) => {
    const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);
    const completedCourses = courses.filter(c => c.completed);

    return (
        <>
            <div className="space-y-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Certificates & Achievements</h1>
                    <p className="text-brand-muted mt-1">Showcase your skills and milestones.</p>
                </div>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Certificates</h2>
                    <div className="space-y-4">
                        {completedCourses.length > 0 ? (
                            completedCourses.map(course => (
                                <CertificateCard 
                                    key={course.id} 
                                    course={course} 
                                    isEligible={canGenerateCertificate(course)}
                                    onView={() => setCertificateCourse(course)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
                                <Icon name="certificates" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                                <p className="text-brand-muted">You have not earned any certificates yet.</p>
                                <p className="text-sm text-brand-muted mt-1">Complete a course to earn your first one!</p>
                            </div>
                        )}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Badges</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {mockAchievements.map(achievement => <AchievementBadge key={achievement.id} achievement={achievement} />)}
                    </div>
                </section>
            </div>

            {certificateCourse && (
                <CertificateModal 
                    user={user} 
                    course={certificateCourse} 
                    onClose={() => setCertificateCourse(null)} 
                />
            )}
        </>
    );
};