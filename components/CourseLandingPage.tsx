"use client";

import React from 'react';
import type { CourseWithEnrollment, User } from '../types';
import { Icon } from './Icon';
import { PaystackButton } from './PaystackButton';
import { motion } from 'framer-motion';

interface CourseLandingPageProps {
    user: User | null;
    course: CourseWithEnrollment;
    onBack: () => void;
    onEnrollmentSuccess: (courseId: number) => void;
}

export const CourseLandingPage: React.FC<CourseLandingPageProps> = ({ 
    user, 
    course, 
    onBack, 
    onEnrollmentSuccess 
}) => {
    const handleEnroll = () => {
        onEnrollmentSuccess(course.id);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-16 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover opacity-10 blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-primary mb-8 transition-colors"
                    >
                        <Icon name="chevronLeft" className="w-5 h-5" />
                        Back to Catalog
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-4">
                                {course.category}
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 font-serif">
                                {course.title}
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                                {course.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-10">
                                <div className="flex items-center gap-2">
                                    <Icon name="star" className="w-5 h-5 text-yellow-400" />
                                    <span className="font-bold text-gray-900">{course.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({course.enrollmentCount.toLocaleString()} students)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="academicCap" className="w-5 h-5 text-brand-secondary" />
                                    <span className="text-gray-700 text-sm">By <span className="font-bold">{course.instructor}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="bell" className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700 text-sm">{course.duration}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-full sm:w-auto">
                                    {user ? (
                                        <PaystackButton
                                            email={user.email}
                                            amount={course.price}
                                            onSuccess={handleEnroll}
                                            onClose={() => console.log('Payment closed')}
                                            metadata={{ course_id: course.id, user_id: user.id }}
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => window.location.href = '/login'}
                                            className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                                        >
                                            Sign in to Enroll
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    One-time payment for lifetime access
                                </p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                <img 
                                    src={course.imageUrl} 
                                    alt={course.title} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Icon name="play" className="w-8 h-8 text-brand-primary ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Modules</p>
                                <p className="text-2xl font-bold text-brand-primary">{course.modules}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What you'll learn */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-serif">What you'll learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {course.whatYouWillLearn?.map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                        <Icon name="checkCircle" className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-gray-700">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center font-serif">Course Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {course.features?.map((feature, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Icon 
                                        name={i === 0 ? 'edit' : i === 1 ? 'academicCap' : i === 2 ? 'videoCamera' : 'award'} 
                                        className="w-8 h-8 text-brand-primary" 
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature}</h3>
                                <p className="text-sm text-gray-500">
                                    {i === 0 ? 'Apply what you learn through practical assignments.' : 
                                     i === 1 ? 'Get instant feedback on your work from our AI.' : 
                                     i === 2 ? 'Interact with instructors in real-time sessions.' : 
                                     'Earn a certificate to showcase your new skills.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Curriculum Overview */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center font-serif">Course Curriculum</h2>
                        <p className="text-gray-600 text-center mb-12">
                            A step-by-step guide to mastering {course.title.split(' ').slice(-2).join(' ')}
                        </p>
                        
                        <div className="space-y-4">
                            {course.content.map((module, i) => (
                                <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="p-5 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                                                {i + 1}
                                            </span>
                                            <h3 className="font-bold text-gray-900">{module.title}</h3>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {module.lessons.length} Lessons
                                        </span>
                                    </div>
                                    <div className="p-2">
                                        {module.lessons.map(lesson => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Icon name={lesson.type === 'video' ? 'play' : 'document'} className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{lesson.title}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Instructor Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto bg-gray-900 rounded-3xl p-8 lg:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/20 blur-3xl rounded-full -ml-32 -mb-32"></div>
                        
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white/10">
                                <img 
                                    src={`https://picsum.photos/seed/${course.instructor}/400/400`} 
                                    alt={course.instructor} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <span className="text-brand-accent font-bold uppercase tracking-widest text-sm mb-4 block">Meet your Instructor</span>
                                <h2 className="text-4xl font-bold mb-6 font-serif">{course.instructor}</h2>
                                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                                    {course.instructorBio}
                                </p>
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-3xl font-bold text-white">10k+</p>
                                        <p className="text-sm text-gray-400">Students Taught</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">4.9</p>
                                        <p className="text-sm text-gray-400">Instructor Rating</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center font-serif">Student Reviews</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {course.reviews.map(review => (
                            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={review.avatarUrl} alt={review.author} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.author}</h4>
                                        <div className="flex gap-0.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon 
                                                    key={i} 
                                                    name="star" 
                                                    className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Ready to start your journey?</h2>
                        <p className="text-lg text-gray-600 mb-10">
                            Join thousands of students and start learning {course.title} today.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            {user ? (
                                <PaystackButton
                                    email={user.email}
                                    amount={course.price}
                                    onSuccess={handleEnroll}
                                    onClose={() => console.log('Payment closed')}
                                    metadata={{ course_id: course.id, user_id: user.id }}
                                />
                            ) : (
                                <button 
                                    onClick={() => window.location.href = '/login'}
                                    className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                                >
                                    Sign in to Enroll
                                </button>
                            )}
                            <p className="text-sm text-gray-500">30-day money-back guarantee</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
