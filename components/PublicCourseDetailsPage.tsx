"use client";

import React from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { useAppContext } from "../context/AppContext";
import { translations } from "../constants/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Course } from "../types";
import Link from "next/link";

interface PublicCourseDetailsPageProps {
  course: Course;
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
}

export const PublicCourseDetailsPage: React.FC<PublicCourseDetailsPageProps> = ({
  course,
  onNavigateToSignIn,
  onNavigateToSignUp,
}) => {
  const { language } = useAppContext();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <PublicHeader 
        user={null} 
        onNavigateToSignIn={onNavigateToSignIn} 
        onNavigateToSignUp={onNavigateToSignUp} 
      />

      <main className="pt-24 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-[#219BD5] font-bold mb-4 uppercase tracking-wider">
                  <span>{course.category}</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                  <div className="flex items-center gap-2">
                    <Icon name="user" className="w-4 h-4 text-[#219BD5]" />
                    <span>Created by <span className="font-bold text-gray-900">{course.instructor}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="star" className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{course.rating}</span>
                    <span>({course.enrollmentCount.toLocaleString()} students)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="clock" className="w-4 h-4 text-[#219BD5]" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              {/* What you'll learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon name="check" className="w-5 h-5 text-[#219BD5] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content (Curriculum) */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                <div className="space-y-4">
                  {course.content.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">
                          Module {index + 1}: {module.title}
                        </h3>
                        <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Icon 
                                name={lesson.type === 'video' ? 'playCircle' : 'fileText'} 
                                className="w-4 h-4 text-gray-400" 
                              />
                              <span className="text-gray-700">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructor */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
                <div className="flex items-start gap-6">
                  <img 
                    src={`https://picsum.photos/seed/${course.instructor}/100/100`} 
                    alt={course.instructor} 
                    className="w-20 h-20 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-[#219BD5] mb-2 underline decoration-2 underline-offset-4">
                      {course.instructor}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {course.instructorBio || "Expert instructor at Cortouch Media Academy with years of industry experience."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Reviews */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Icon name="star" className="w-6 h-6 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">{course.rating}</span>
                    <span className="text-gray-500">({course.reviews?.length || 0} reviews)</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {course.reviews && course.reviews.length > 0 ? (
                    course.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={review.avatarUrl || `https://picsum.photos/seed/${review.author}/40/40`} 
                            alt={review.author} 
                            className="w-12 h-12 rounded-full object-cover shadow-sm"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900">{review.author}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Icon 
                                  key={i} 
                                  name="star" 
                                  className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500">No reviews yet for this course.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                      <Icon name="play" className="w-6 h-6 text-[#219BD5] ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold text-gray-900">₦{course.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-400 line-through">₦{(course.price * 1.5).toLocaleString()}</span>
                  </div>
                  
                  <button 
                    onClick={onNavigateToSignUp}
                    className="w-full py-4 bg-[#219BD5] text-white font-bold rounded-xl hover:bg-[#1a7fb0] transition-all shadow-lg shadow-[#219BD5]/20 mb-4"
                  >
                    Enroll Now
                  </button>
                  
                  <p className="text-center text-xs text-gray-500 mb-8">
                    30-Day Money-Back Guarantee
                  </p>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">This course includes:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Icon name="playCircle" className="w-4 h-4 text-[#219BD5]" />
                        <span>{course.duration} on-demand video</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Icon name="fileText" className="w-4 h-4 text-[#219BD5]" />
                        <span>{course.modules} modules</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Icon name="award" className="w-4 h-4 text-[#219BD5]" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Icon name="infinity" className="w-4 h-4 text-[#219BD5]" />
                        <span>Full lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
