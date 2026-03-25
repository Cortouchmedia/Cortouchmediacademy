
"use client";

import React, { useState } from 'react';
import type { CourseWithEnrollment, User } from '../types';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { PaystackButton } from './PaystackButton';
import { InstructorAssistant } from './InstructorAssistant';

interface CourseDetailsProps {
    user: User;
    course: CourseWithEnrollment;
    allCourses: CourseWithEnrollment[];
    onBack: () => void;
    onProjectSubmit: (courseId: number, projectId: number) => void;
    onToggleLessonComplete: (courseId: number, lessonId: number) => void;
    onEnrollmentSuccess: (courseId: number) => void;
    onSendCourseMessage: (courseId: number, text: string) => void;
}

type CourseTab = 'Curriculum' | 'Projects' | 'AI Assistant' | 'Webinars';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, iconName: string }> = ({ label, isActive, onClick, iconName }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive ? 'bg-brand-primary text-white' : 'text-brand-muted hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <Icon name={iconName} className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

export const CourseDetails: React.FC<CourseDetailsProps> = ({ user, course, allCourses, onBack, onProjectSubmit, onToggleLessonComplete, onEnrollmentSuccess, onSendCourseMessage }) => {
    const [activeTab, setActiveTab] = useState<CourseTab>('Curriculum');
    
    const handleEnroll = () => {
        onEnrollmentSuccess(course.id);
    };

    const prerequisiteCourses = course.prerequisiteCourseIds
        ? allCourses.filter(c => course.prerequisiteCourseIds!.includes(c.id))
        : [];

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="relative rounded-lg overflow-hidden p-8 flex items-end min-h-[300px] bg-cover bg-center text-white" style={{ backgroundImage: `url(${course.imageUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="relative z-10 w-full">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white mb-4">
                        <Icon name="chevronLeft" className="w-5 h-5" />
                        Back to Courses
                    </button>
                    <p className="text-sm font-semibold text-brand-accent">{course.category}</p>
                    <h1 className="text-4xl font-bold mt-1">{course.title}</h1>
                    <p className="mt-2 max-w-2xl text-white/90">{course.description}</p>
                </div>
            </div>

            {/* Prerequisites section */}
            {prerequisiteCourses.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Icon name="shield" className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-bold text-yellow-800">
                                Prerequisites
                            </p>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>This course has the following prerequisites. We recommend completing them first:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 font-medium">
                                    {prerequisiteCourses.map(p => <li key={p.id}>{p.title}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex space-x-2 border-b border-gray-200 pb-2">
                        <TabButton label="Curriculum" isActive={activeTab === 'Curriculum'} onClick={() => setActiveTab('Curriculum')} iconName="bookOpen" />
                        <TabButton label="Projects" isActive={activeTab === 'Projects'} onClick={() => setActiveTab('Projects')} iconName="edit" />
                        <TabButton label="AI Assistant" isActive={activeTab === 'AI Assistant'} onClick={() => setActiveTab('AI Assistant')} iconName="academicCap" />
                        {course.isEnrolled && (
                             <TabButton label="Webinars" isActive={activeTab === 'Webinars'} onClick={() => setActiveTab('Webinars')} iconName="videoCamera" />
                        )}
                    </div>

                    {/* Curriculum View */}
                    {activeTab === 'Curriculum' && (
                        <div className="space-y-4">
                            {course.content.map(module => (
                                <div key={module.id} className="bg-brand-surface p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-lg text-gray-800">{module.title}</h3>
                                    <ul className="mt-2 space-y-1">
                                        {module.lessons.map(lesson => (
                                            <li key={lesson.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <Icon name={lesson.type === 'video' ? 'play' : 'document'} className="w-5 h-5 text-brand-secondary" />
                                                    <span className="text-sm text-brand-muted">{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-500">{lesson.duration}</span>
                                                    <button 
                                                        onClick={() => onToggleLessonComplete(course.id, lesson.id)}
                                                        disabled={!course.isEnrolled}
                                                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${lesson.isCompleted ? 'bg-brand-accent border-brand-accent' : 'border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {lesson.isCompleted && <Icon name="checkCircle" className="w-4 h-4 text-white" strokeWidth={3} />}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Projects View */}
                    {activeTab === 'Projects' && (
                        <div className="space-y-4">
                        {course.projects.map(project => (
                            <div key={project.id} className="bg-brand-surface p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                <p className="text-sm text-brand-muted mt-2">{project.description}</p>
                                <div className="mt-4">
                                {project.isSubmitted && project.feedback ? (
                                    <div className="p-4 bg-brand-bg rounded-lg border border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">Score: <span className="text-brand-accent">{project.score}%</span></p>
                                        <p className="text-sm font-semibold text-gray-800 mt-2">Feedback:</p>
                                        <p className="text-sm text-brand-muted mt-1 italic">"{project.feedback}"</p>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => onProjectSubmit(course.id, project.id)} 
                                        disabled={project.isGrading || !course.isEnrolled}
                                        className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                    {project.isGrading ? 'Grading...' : 'Submit for AI Grading'}
                                    </button>
                                )}
                                </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {/* AI Assistant */}
                    {activeTab === 'AI Assistant' && (
                        <InstructorAssistant course={course} onSendMessage={onSendCourseMessage} />
                    )}

                    {/* Webinars View */}
                    {activeTab === 'Webinars' && course.isEnrolled && (
                        <div className="space-y-4">
                            {course.webinars && course.webinars.length > 0 ? (
                                course.webinars.map(webinar => (
                                    <div key={webinar.id} className="bg-brand-surface p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-md text-gray-800">{webinar.title}</h4>
                                            <p className="text-sm text-brand-muted mt-1">{webinar.date}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {webinar.status === 'live' && (
                                                <button onClick={() => alert('Joining live session... This is a demo.')} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors animate-pulse w-full sm:w-auto">Join Live</button>
                                            )}
                                            {webinar.status === 'upcoming' && (
                                                <button onClick={() => alert('Adding to calendar... This is a demo.')} className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary transition-colors w-full sm:w-auto">Add to Calendar</button>
                                            )}
                                            {webinar.status === 'ended' && (
                                                <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 text-sm font-semibold rounded-lg cursor-not-allowed w-full sm:w-auto">Session Ended</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-brand-surface rounded-lg border border-gray-200">
                                    <Icon name="videoCamera" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                                    <p className="text-brand-muted">No webinars are scheduled for this course yet.</p>
                                    <p className="text-sm text-brand-muted mt-1">Check back later for live sessions!</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-brand-surface p-6 rounded-lg border border-gray-200">
                        {course.isEnrolled ? (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
                                <div className="flex justify-between items-center text-sm text-brand-muted my-2">
                                    <span>Progress</span>
                                    <span className="font-semibold text-gray-800">{course.progress}%</span>
                                </div>
                                <ProgressBar progress={course.progress} />
                                <p className="text-xs text-brand-muted mt-2 text-center">{course.completed ? 'Course completed!' : 'Keep up the great work!'}</p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-2xl font-bold text-brand-accent">₦{course.price.toLocaleString()}</h3>
                                <PaystackButton
                                    email={user.email}
                                    amount={course.price}
                                    onSuccess={handleEnroll}
                                    onClose={() => console.log('Payment closed')}
                                    metadata={{ course_id: course.id, user_id: user.id }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="bg-brand-surface p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Info</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3"><Icon name="academicCap" className="w-5 h-5 text-brand-muted" /> <span><span className="font-semibold">Instructor:</span> {course.instructor}</span></li>
                            <li className="flex items-center gap-3"><Icon name="courses" className="w-5 h-5 text-brand-muted" /> <span><span className="font-semibold">Modules:</span> {course.modules}</span></li>
                            <li className="flex items-center gap-3"><Icon name="bell" className="w-5 h-5 text-brand-muted" /> <span><span className="font-semibold">Duration:</span> {course.duration}</span></li>
                            <li className="flex items-center gap-3"><Icon name="community" className="w-5 h-5 text-brand-muted" /> <span><span className="font-semibold">Students:</span> {course.enrollmentCount.toLocaleString()}</span></li>
                            <li className="flex items-center gap-3"><Icon name="star" className="w-5 h-5 text-brand-muted" /> <span><span className="font-semibold">Rating:</span> {course.rating.toFixed(1)}/5.0</span></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};