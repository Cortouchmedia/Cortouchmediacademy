"use client";

import React, { useMemo, useState } from 'react';
import type { CourseWithEnrollment, User } from '../types';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { PaystackButton } from './PaystackButton';
import { InstructorAssistant } from './InstructorAssistant';
import { CourseLandingPage } from './CourseLandingPage';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/navigation';

interface CourseDetailsProps {
  user: User | null;
  course: CourseWithEnrollment;
  allCourses: CourseWithEnrollment[];
}

type CourseTab = 'Curriculum' | 'Projects' | 'AI Assistant' | 'Webinars' | 'Reviews';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  iconName: string;
}> = ({ label, isActive, onClick, iconName }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-brand-muted hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon name={iconName} className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

function getYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  user,
  course,
  allCourses,
}) => {
  const {
    handleProjectSubmit: onProjectSubmit,
    handleToggleLessonComplete: onToggleLessonComplete,
    handleEnrollmentSuccess: onEnrollmentSuccess,
    handleSendCourseMessage: onSendCourseMessage,
  } = useAppContext();
  const router = useRouter();

  const onBack = () => router.back();

  const [activeTab, setActiveTab] = useState<CourseTab>('Curriculum');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [submissionLinks, setSubmissionLinks] = useState<Record<number, string>>({});

  const isOwnerOrAdmin = useMemo(
    () =>
      !!user &&
      (user.role === 'admin' ||
        (user.role === 'instructor' &&
          String(course.instructor_id) === String(user.id))),
    [user, course.instructor_id],
  );

  // Real, computed stats
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
      const lessonMins = (m.lessons ?? []).reduce((sum: number, l: any) => {
        if (l.video_duration) return sum + Number(l.video_duration);
        if (typeof l.duration === 'string') {
          const n = parseInt(l.duration, 10);
          return isNaN(n) ? sum : sum + n;
        }
        return sum;
      }, 0);
      return acc + lessonMins;
    }, 0);
  }, [course.content]);

  const lessonCountLabel = `${totalLessons} lesson${totalLessons === 1 ? '' : 's'}`;
  const durationLabel =
    totalDurationMin > 0
      ? totalDurationMin >= 60
        ? `${Math.floor(totalDurationMin / 60)}h ${totalDurationMin % 60}m`
        : `${totalDurationMin}m`
      : course.duration || 'Self-paced';

  const handleEnroll = async () => {
    try {
      await onEnrollmentSuccess(course.id);
    } catch (err) {
      console.error('Enrollment failed after payment:', err);
      alert(
        'Payment succeeded but enrollment failed. Please contact support with your transaction reference.',
      );
    }
  };

  const handleVideoEnd = (lessonId: number | string) => {
    if (
      !course.content.some((m: any) =>
        m.lessons.find((l: any) => String(l.id) === String(lessonId))?.isCompleted,
      )
    ) {
      onToggleLessonComplete(course.id, lessonId);
    }
  };

  const handleLinkChange = (projectId: number, link: string) => {
    setSubmissionLinks((prev) => ({ ...prev, [projectId]: link }));
  };

  const prerequisiteCourses = course.prerequisiteCourseIds
    ? allCourses.filter((c) =>
        course.prerequisiteCourseIds!.some(
          (id) => String(id) === String(c.id),
        ),
      )
    : [];

  if (!course.isEnrolled && !isOwnerOrAdmin) {
    return (
      <CourseLandingPage
        user={user}
        course={course}
        onBack={onBack}
        onEnrollmentSuccess={onEnrollmentSuccess}
      />
    );
  }

  const renderVideoOrText = (lesson: any) => {
    const videoUrl = lesson.videoUrl || lesson.video_url || '';
    const isVideo = !!videoUrl;
    if (isVideo) {
      const yt = getYouTubeEmbed(videoUrl);
      return (
        <div className="bg-black rounded-xl overflow-hidden shadow-xl">
          <div className="aspect-video">
            {yt ? (
              <iframe
                key={lesson.id}
                src={yt}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={lesson.id}
                src={videoUrl}
                controls
                className="w-full h-full"
                onEnded={() => handleVideoEnd(lesson.id)}
              />
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
            <h4 className="font-bold text-gray-900">{lesson.title}</h4>
            <p className="text-sm text-brand-muted mt-1">
              {durationLabelFor(lesson)}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{lesson.title}</h3>
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{
            __html: lesson.content || lesson.text_content || '<em>No content yet.</em>',
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Instructor banner */}
      {isOwnerOrAdmin && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900 flex-1">
            <span className="font-semibold">Instructor Preview.</span>{' '}
            You're seeing this page the way students do. Enrollment and progress are hidden.
          </p>
          <button
            onClick={() => router.push('/instructor-courses')}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
          >
            Edit Course →
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-cover bg-center text-white min-h-[360px] flex items-end" style={{ backgroundImage: `url(${course.imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        <div className="relative z-10 p-8 lg:p-10 w-full">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white mb-6 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
            {isOwnerOrAdmin ? 'Back to My Courses' : 'Back to Catalog'}
          </button>

          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold tracking-wider uppercase text-brand-accent mb-3">
              {course.category}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              {course.title}
            </h1>
            <p className="text-white/85 text-sm lg:text-base line-clamp-2 mb-6">
              {course.description}
            </p>

            {/* Stat badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2">
                <Icon name="star" className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{course.rating.toFixed(1)}</span>
                <span className="text-white/70">
                  ({course.reviews?.length ?? 0} reviews)
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Icon name="community" className="w-4 h-4" />
                <span className="font-semibold">
                  {course.enrollmentCount.toLocaleString()}
                </span>
                <span className="text-white/70">students</span>
              </span>
              <span className="flex items-center gap-2">
                <Icon name="bookOpen" className="w-4 h-4" />
                <span className="font-semibold">
                  {course.content?.length ?? 0}
                </span>
                <span className="text-white/70">
                  module{(course.content?.length ?? 0) === 1 ? '' : 's'}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Icon name="bell" className="w-4 h-4" />
                <span className="font-semibold">{durationLabel}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisiteCourses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
          <Icon name="shield" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Prerequisites</p>
            <p className="text-sm text-amber-800 mt-1">
              We recommend completing these first:{' '}
              <span className="font-semibold">
                {prerequisiteCourses.map((p) => p.title).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            <TabButton label="Curriculum" isActive={activeTab === 'Curriculum'} onClick={() => setActiveTab('Curriculum')} iconName="bookOpen" />
            <TabButton label="Projects" isActive={activeTab === 'Projects'} onClick={() => setActiveTab('Projects')} iconName="edit" />
            <TabButton label="AI Assistant" isActive={activeTab === 'AI Assistant'} onClick={() => setActiveTab('AI Assistant')} iconName="academicCap" />
            <TabButton label="Reviews" isActive={activeTab === 'Reviews'} onClick={() => setActiveTab('Reviews')} iconName="star" />
            {(course.isEnrolled || isOwnerOrAdmin) && (
              <TabButton label="Webinars" isActive={activeTab === 'Webinars'} onClick={() => setActiveTab('Webinars')} iconName="videoCamera" />
            )}
          </div>

          {activeTab === 'Curriculum' && (
            <div className="space-y-6">
              {activeLesson ? (
                renderVideoOrText(activeLesson)
              ) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                  <Icon name="play" className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                  <p className="text-brand-muted">Select a lesson to start learning</p>
                </div>
              )}

              <div className="space-y-3">
                {(course.content ?? []).map((module: any, mi: number) => (
                  <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">
                        <span className="text-brand-muted text-sm mr-2">
                          Module {mi + 1}
                        </span>
                        {module.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {module.lessons?.length ?? 0} lesson{(module.lessons?.length ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {(module.lessons ?? []).map((lesson: any) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isVideo = !!(lesson.videoUrl || lesson.video_url);
                        return (
                          <li
                            key={lesson.id}
                            className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              isActive ? 'bg-brand-primary/5' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveLesson(lesson)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Icon name={isVideo ? 'play' : 'document'} className="w-4 h-4" />
                              </div>
                              <span className={`text-sm truncate ${isActive ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {durationLabelFor(lesson)}
                              </span>
                              {!isOwnerOrAdmin && (
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${
                                    lesson.isCompleted
                                      ? 'bg-brand-accent border-brand-accent'
                                      : 'border-gray-300 hover:border-brand-accent'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleLessonComplete(course.id, lesson.id);
                                  }}
                                >
                                  {lesson.isCompleted && (
                                    <Icon name="checkCircle" className="w-4 h-4 text-white" strokeWidth={3} />
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {(course.content?.length ?? 0) === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No modules yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Projects' && (
            <div className="space-y-4">
              {(course.projects ?? []).map((project: any) => (
                <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                  <p className="text-sm text-brand-muted mt-2">{project.description}</p>
                  {project.isSubmitted ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="checkCircle" className="w-5 h-5 text-brand-accent" />
                        <span className="text-sm font-bold text-brand-accent">Submitted</span>
                      </div>
                      {project.submissionLink && (
                        <p className="text-xs text-brand-muted mb-3 break-all">
                          Link:{' '}
                          <a href={project.submissionLink} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                            {project.submissionLink}
                          </a>
                        </p>
                      )}
                      {project.feedback && (
                        <>
                          <p className="text-sm font-semibold text-gray-800">
                            Score: <span className="text-brand-accent">{project.score}%</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-2 italic">"{project.feedback}"</p>
                        </>
                      )}
                    </div>
                  ) : isOwnerOrAdmin ? (
                    <p className="mt-4 text-sm text-gray-500 italic">
                      Students will submit their work here.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <input
                        type="url"
                        placeholder="https://github.com/your-repo"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                        value={submissionLinks[project.id] || ''}
                        onChange={(e) => handleLinkChange(project.id, e.target.value)}
                        disabled={project.isGrading}
                      />
                      <button
                        onClick={() => onProjectSubmit(course.id, project.id, submissionLinks[project.id] || '')}
                        disabled={project.isGrading || !submissionLinks[project.id]}
                        className="px-6 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {project.isGrading ? 'AI Grading…' : 'Submit for AI Grading'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(course.projects?.length ?? 0) === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No projects for this course yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'AI Assistant' && (
            <InstructorAssistant course={course} onSendMessage={onSendCourseMessage} />
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Reviews</h3>
                <div className="flex items-center gap-2">
                  <Icon name="star" className="w-6 h-6 text-yellow-500 fill-current" />
                  <span className="text-xl font-bold text-gray-900">
                    {course.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({course.reviews?.length ?? 0})
                  </span>
                </div>
              </div>
              <div className="grid gap-4">
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={review.avatarUrl || `https://i.pravatar.cc/80?u=${review.author}`}
                          alt={review.author}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900">{review.author}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                name="star"
                                className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No reviews yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Webinars' && (course.isEnrolled || isOwnerOrAdmin) && (
            <div className="space-y-4">
              {course.webinars && course.webinars.length > 0 ? (
                course.webinars.map((webinar: any) => (
                  <div
                    key={webinar.id}
                    className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800">{webinar.title}</h4>
                      <p className="text-sm text-brand-muted mt-1">{webinar.date}</p>
                    </div>
                    {!isOwnerOrAdmin && (
                      <div className="flex-shrink-0">
                        {webinar.status === 'live' && (
                          <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 animate-pulse">
                            Join Live
                          </button>
                        )}
                        {webinar.status === 'upcoming' && (
                          <button className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90">
                            Add to Calendar
                          </button>
                        )}
                        {webinar.status === 'ended' && (
                          <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed">
                            Session Ended
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Icon name="videoCamera" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                  <p className="text-brand-muted">No webinars scheduled yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Primary action card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {isOwnerOrAdmin ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900">Instructor Preview</h3>
                <p className="text-sm text-brand-muted mt-2">
                  You're previewing this course. Students see pricing and enrollment here.
                </p>
                <button
                  onClick={() => router.push('/instructor-courses')}
                  className="mt-4 w-full px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit This Course
                </button>
              </div>
            ) : course.isEnrolled ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
                <div className="flex justify-between items-center text-sm text-brand-muted mb-2">
                  <span>Complete</span>
                  <span className="font-semibold text-gray-900">{course.progress}%</span>
                </div>
                <ProgressBar progress={course.progress} />
                <p className="text-xs text-brand-muted mt-3 text-center">
                  {course.completed ? 'Course completed! 🎉' : `${totalLessons} lesson${totalLessons === 1 ? '' : 's'} total`}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {course.price === 0
                    ? 'Free'
                    : `₦${course.price.toLocaleString()}`}
                </h3>
                <p className="text-xs text-brand-muted mb-4">
                  One-time payment · Lifetime access
                </p>
                {user ? (
                  course.price === 0 ? (
                    <button
                      onClick={handleEnroll}
                      className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all shadow-md"
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
                    className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all shadow-md"
                  >
                    Sign in to Enroll
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Course details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Course Info
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Icon name="academicCap" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Instructor:</span>{' '}
                  <span className="font-semibold text-gray-900">{course.instructor}</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="bookOpen" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Modules:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {course.content?.length ?? 0}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="document" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Lessons:</span>{' '}
                  <span className="font-semibold text-gray-900">{lessonCountLabel.replace('lesson', '').trim()}</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="bell" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Duration:</span>{' '}
                  <span className="font-semibold text-gray-900">{durationLabel}</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="community" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Students:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {course.enrollmentCount.toLocaleString()}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="star" className="w-4 h-4 text-brand-muted" />
                <span>
                  <span className="text-brand-muted">Rating:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {course.rating.toFixed(1)}/5.0
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};


function durationLabelFor(lesson: any): string {
  if (!lesson) return '';
  if (lesson.video_duration) {
    const n = Number(lesson.video_duration);
    return n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n} min`;
  }
  if (typeof lesson.duration === 'string') return lesson.duration;
  return '';
}