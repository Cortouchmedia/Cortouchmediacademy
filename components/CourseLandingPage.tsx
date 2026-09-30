"use client";

import React, { useMemo } from 'react';
import type { CourseWithEnrollment, User } from '../types';
import { Icon } from './Icon';
import { PaystackButton } from './PaystackButton';
import { motion } from 'framer-motion';

interface CourseLandingPageProps {
  user: User | null;
  course: CourseWithEnrollment;
  onBack: () => void;
  onEnrollmentSuccess: (courseId: number | string) => void;
}

export const CourseLandingPage: React.FC<CourseLandingPageProps> = ({
  user,
  course,
  onBack,
  onEnrollmentSuccess,
}) => {
  const handleEnroll = async () => {
    try {
      await onEnrollmentSuccess(course.id);
    } catch (err) {
      console.error('Enrollment failed after payment:', err);
      alert('Payment succeeded but enrollment failed. Please contact support.');
    }
  };

  // Real computed stats
  const totalLessons = useMemo(() => {
    if (!Array.isArray(course.content)) return 0;
    return course.content.reduce(
      (acc: number, m: any) => acc + (m.lessons?.length ?? 0),
      0,
    );
  }, [course.content]);

  const totalDurationMin = useMemo(() => {
    if (!Array.isArray(course.content)) return 0;
    return course.content.reduce((acc: number, m: any) => {
      const mins = (m.lessons ?? []).reduce((sum: number, l: any) => {
        if (l.video_duration) return sum + Number(l.video_duration);
        if (typeof l.duration === 'string') {
          const n = parseInt(l.duration, 10);
          return isNaN(n) ? sum : sum + n;
        }
        return sum;
      }, 0);
      return acc + mins;
    }, 0);
  }, [course.content]);

  const durationLabel =
    totalDurationMin >= 60
      ? `${Math.floor(totalDurationMin / 60)}h ${totalDurationMin % 60}m`
      : totalDurationMin > 0
        ? `${totalDurationMin}m`
        : course.duration || 'Self-paced';

  const moduleCount = course.content?.length ?? 0;
  const reviewCount = course.reviews?.length ?? 0;
  const hasReviews = reviewCount > 0;
  const hasLearnItems = (course.whatYouWillLearn?.length ?? 0) > 0;
  const hasFeatures = (course.features?.length ?? 0) > 0;

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        {/* Background image with heavy overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={course.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-900/70" />
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white mb-8 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
            Back to Catalog
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/20 text-brand-accent text-xs font-bold uppercase tracking-wider mb-5">
                {course.category}
              </span>
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-5 font-serif">
                {course.title}
              </h1>
              <p className="text-base lg:text-lg text-white/75 mb-8 max-w-2xl leading-relaxed line-clamp-3">
                {course.description}
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm mb-8">
                <span className="flex items-center gap-2">
                  <Icon name="star" className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">{course.rating.toFixed(1)}</span>
                  <span className="text-white/60">
                    ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="community" className="w-4 h-4 text-white/70" />
                  <span className="font-bold">
                    {course.enrollmentCount.toLocaleString()}
                  </span>
                  <span className="text-white/60">students</span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="bookOpen" className="w-4 h-4 text-white/70" />
                  <span className="font-bold">{moduleCount}</span>
                  <span className="text-white/60">
                    module{moduleCount === 1 ? '' : 's'}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="document" className="w-4 h-4 text-white/70" />
                  <span className="font-bold">{totalLessons}</span>
                  <span className="text-white/60">
                    lesson{totalLessons === 1 ? '' : 's'}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="bell" className="w-4 h-4 text-white/70" />
                  <span className="font-bold">{durationLabel}</span>
                </span>
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {course.price === 0
                      ? 'Free'
                      : `₦${course.price.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    One-time payment · Lifetime access
                  </p>
                </div>

                <div className="w-full sm:w-auto">
                  {user ? (
                    course.price === 0 ? (
                      <button
                        onClick={handleEnroll}
                        className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg"
                      >
                        Enroll for Free
                      </button>
                    ) : (
                      <PaystackButton
                        email={user.email}
                        amount={course.price}
                        onSuccess={handleEnroll}
                        onClose={() => console.log('Payment closed')}
                        metadata={{ course_id: course.id, user_id: user.id }}
                      />
                    )
                  ) : (
                    <button
                      onClick={() => (window.location.href = '/login')}
                      className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg"
                    >
                      Sign in to Enroll
                    </button>
                  )}
                </div>
              </div>

              {/* Instructor line */}
              <div className="mt-8 flex items-center gap-3 text-sm">
                <img
                  src={`https://i.pravatar.cc/80?u=${encodeURIComponent(course.instructor)}`}
                  alt={course.instructor}
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
                <div>
                  <p className="text-white/60 text-xs">Instructor</p>
                  <p className="font-semibold text-white">{course.instructor}</p>
                </div>
              </div>
            </motion.div>

            {/* Hero image card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-2 relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 p-4 rounded-xl shadow-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Lessons
                </p>
                <p className="text-2xl font-bold text-brand-primary">
                  {totalLessons}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CURRICULUM */}
      {moduleCount > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 text-center font-serif">
                Course Curriculum
              </h2>
              <p className="text-gray-500 text-center mb-10 text-sm">
                {moduleCount} module{moduleCount === 1 ? '' : 's'} ·{' '}
                {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
              </p>

              <div className="space-y-3">
                {course.content.map((module: any, i: number) => {
                  const lessonCount = module.lessons?.length ?? 0;
                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="px-5 py-4 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <h3 className="font-bold text-gray-900">
                            {module.title}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      {lessonCount > 0 && (
                        <div className="divide-y divide-gray-100">
                          {module.lessons.map((lesson: any) => {
                            const isVideo = !!(lesson.videoUrl || lesson.video_url);
                            const lessonDuration =
                              lesson.video_duration
                                ? `${lesson.video_duration} min`
                                : lesson.duration || '';
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between px-5 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon
                                    name={isVideo ? 'play' : 'document'}
                                    className="w-4 h-4 text-gray-400"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {lessonDuration}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES — only if we have data */}
      {hasFeatures && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 text-center font-serif">
              What's included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {course.features!.map((feature, i) => (
                <div
                  key={i}
                  className="text-center p-6 rounded-2xl bg-white border border-gray-100"
                >
                  <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon
                      name={
                        i === 0
                          ? 'edit'
                          : i === 1
                            ? 'academicCap'
                            : i === 2
                              ? 'videoCamera'
                              : 'award'
                      }
                      className="w-7 h-7 text-brand-primary"
                    />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {feature}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSTRUCTOR */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-8 lg:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/20 blur-3xl rounded-full -ml-32 -mb-32" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-white/10">
                <img
                  src={`https://i.pravatar.cc/400?u=${encodeURIComponent(course.instructor)}`}
                  alt={course.instructor}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <span className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-3 block">
                  Your Instructor
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 font-serif">
                  {course.instructor}
                </h2>
                <p className="text-white/75 leading-relaxed text-sm lg:text-base">
                  {course.instructorBio ||
                    'Experienced educator passionate about sharing knowledge.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS — only if we have data */}
      {hasReviews && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 text-center font-serif">
              Student Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {course.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={
                        review.avatarUrl ||
                        `https://i.pravatar.cc/80?u=${encodeURIComponent(review.author)}`
                      }
                      alt={review.author}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {review.author}
                      </h4>
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
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-20 lg:py-24 text-center bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Ready to start your journey?
            </h2>
            <p className="text-base lg:text-lg text-gray-500 mb-10">
              Join thousands of students learning {course.title} today.
            </p>
            <div className="flex flex-col items-center gap-4">
              {user ? (
                course.price === 0 ? (
                  <button
                    onClick={handleEnroll}
                    className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg"
                  >
                    Enroll for Free
                  </button>
                ) : (
                  <PaystackButton
                    email={user.email}
                    amount={course.price}
                    onSuccess={handleEnroll}
                    onClose={() => console.log('Payment closed')}
                    metadata={{ course_id: course.id, user_id: user.id }}
                  />
                )
              ) : (
                <button
                  onClick={() => (window.location.href = '/login')}
                  className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg"
                >
                  Sign in to Enroll
                </button>
              )}
              <p className="text-xs text-gray-400">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};