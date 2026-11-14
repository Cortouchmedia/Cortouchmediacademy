"use client";

import React from 'react';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/navigation';

export const About: React.FC = () => {
    const { handleNavigate } = useAppContext();
    const router = useRouter();

    return (
        <div className="space-y-16 max-w-5xl mx-auto py-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">About Cortouch Media Academy</h1>
                <p className="text-brand-muted mt-4 text-lg md:text-xl">
                    Bridging the digital skills gap by providing exceptional, hands-on training and opportunities that empower youth, enhance employability, and foster innovation in Africa.
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-brand-surface p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon name="target" className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
                    <p className="text-brand-muted leading-relaxed">
                        To bridge the digital skills gap by providing exceptional, hands-on training and opportunities that empower youth, enhance employability, and foster innovation in Africa.
                    </p>
                </div>
                <div className="bg-brand-surface p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon name="eye" className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
                    <p className="text-brand-muted leading-relaxed">
                        To become a leading hub for digital talent development in Nigeria, training 10,000+ young people by 2030 and contributing to a thriving African digital economy.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 space-y-4 text-brand-muted leading-relaxed">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                    <p>
                        Founded as a talent-as-a-service information technology company, Cortouch Media was born from a desire to bridge the gap between traditional education and the fast-paced demands of the digital industry.
                    </p>
                    <p>
                        We operate as both a digital skills training provider and a tech solutions agency. This dual model means our students learn from professionals working on live agency projects, gaining real-world experience that truly matters.
                    </p>
                    <p>
                        Today, we are proud to be an IBM SkillsBuild Accredited training partner, helping hundreds of learners across Southwest Nigeria secure employment, start businesses, and contribute to the digital economy.
                    </p>
                </div>
                <div className="order-1 md:order-2">
                    <img 
                        src="/tt.jpg" 
                        alt="Cortouch Media Team" 
                        className="rounded-2xl shadow-xl w-full object-cover"
                    />
                </div>
            </div>

            {/* Our Schools / What We Teach */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Schools</h2>
                <p className="text-brand-muted mb-10">Industry-aligned programs designed for employability.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { title: 'Software Engineering', desc: 'Frontend, Backend & Full Stack' },
                        { title: 'Data School', desc: 'Analytics, Science & Power BI' },
                        { title: 'Product School', desc: 'UI/UX Design & Management' },
                        { title: 'Cybersecurity', desc: 'Ethical Hacking & Network Security' },
                        { title: 'Digital Marketing', desc: 'SEO, Social Media & Google Ads' },
                        { title: 'Business & Creative', desc: 'Project Management & Design' },
                    ].map((school) => (
                        <div key={school.title} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
                            <h3 className="font-bold text-gray-900">{school.title}</h3>
                            <p className="text-sm text-brand-muted mt-1">{school.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Core Values</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Excellence in Training', icon: 'award' },
                        { title: 'Practical & Relevant Learning', icon: 'bookOpen' },
                        { title: 'Inclusion & Gender Equity', icon: 'community' },
                        { title: 'Innovation & Creativity', icon: 'zap' },
                        { title: 'Measurable Impact', icon: 'trendingUp' },
                        { title: 'Professionalism', icon: 'shield' },
                    ].map((value) => (
                        <div key={value.title} className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Icon name={value.icon as any} className="w-5 h-5 text-brand-accent" />
                            </div>
                            <span className="font-medium text-gray-200">{value.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
                <p className="text-brand-muted mb-6 max-w-2xl mx-auto">
                    Start your learning journey with us today and become part of a thriving community of creators, innovators, and lifelong learners.
                </p>
                <button 
                    onClick={() => {
                        handleNavigate('Catalog');
                        router.push('/catalog');
                    }}
                    className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-transform transform hover:scale-105 shadow-lg"
                >
                    Explore Courses
                </button>
            </div>
        </div>
    );
};