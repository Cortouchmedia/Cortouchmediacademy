

"use client";

import React from 'react';
import { Icon } from './Icon';

export const About: React.FC = () => {
    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 text-center">About Cortouch Media Academy</h1>
                <p className="text-brand-muted mt-2 text-center text-lg">Empowering the next generation of digital creators.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-brand-muted">
                    <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
                    <p>At Cortouch Media Academy, our mission is to provide accessible, high-quality education in digital skills. We believe that anyone, anywhere, should have the opportunity to learn, grow, and succeed in the ever-evolving digital landscape.</p>
                    <p>We are committed to delivering practical, hands-on training that not only teaches theory but also builds real-world competence and confidence.</p>
                </div>
                <div>
                    <img src="https://picsum.photos/seed/about1/600/400" alt="Team collaborating" className="rounded-lg shadow-lg"/>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                 <div>
                    <img src="https://picsum.photos/seed/about2/600/400" alt="Student learning" className="rounded-lg shadow-lg"/>
                </div>
                <div className="space-y-4 text-brand-muted">
                    <h2 className="text-2xl font-semibold text-gray-900">Our Story</h2>
                    <p>Founded by a group of passionate industry veterans, Cortouch Media Academy was born from a shared desire to bridge the gap between traditional education and the fast-paced demands of the digital industry.</p>
                    <p>We saw a need for a learning platform that was not only comprehensive but also engaging, supportive, and focused on the practical skills that truly matter. Today, we're proud to have helped thousands of learners achieve their personal and professional goals.</p>
                </div>
            </div>
             
             <div className="bg-brand-surface rounded-lg p-8 text-center border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
                <p className="text-brand-muted mb-6">Start your learning journey with us today and become part of a thriving community of creators, innovators, and lifelong learners.</p>
                 <button className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:opacity-90 transition-transform transform hover:scale-105">
                    Explore Courses
                </button>
             </div>
        </div>
    );
};