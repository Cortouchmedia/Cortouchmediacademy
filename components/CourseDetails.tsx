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
import { Api, authStorage } from '../lib/api';

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
    handleProjectSubmitWithFiles: onProjectSubmitWithFiles,
    handleToggleLessonComplete: onToggleLessonComplete,
    handleEnrollmentSuccess: onEnrollmentSuccess,
    handleSendCourseMessage: onSendCourseMessage,
  } = useAppContext();
  const router = useRouter();

  const onBack = () => router.back();

  const [activeTab, setActiveTab] = useState<CourseTab>('Curriculum');
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Per-project form state (keyed by project id)
  const [screenshotFiles, setScreenshotFiles] = useState<Record<string, File[]>>({});
  const [screenshotPreviews, setScreenshotPreviews] = useState<Record<string, string[]>>({});
  const [submissionDescriptions, setSubmissionDescriptions] = useState<Record<string, string>>({});
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({});
  const [submittingProject, setSubmittingProject] = useState<string | null>(null);

  // Per-student project deadlines (keyed by project id)
  const [deadlines, setDeadlines] = useState<Record<string, {
    deadline: string | null;
    source: 'course_completion' | 'instructor_default' | 'none';
    course_completed: boolean;
    course_completed_at: string | null;
  }>>({});

  const [mySubmissions, setMySubmissions] = useState<Record<string, any>>({});

  const isOwnerOrAdmin = useMemo(
    () =>
      !!user &&
      (user.role === 'admin' ||
        (user.role === 'instructor' &&
          String(course.instructor_id) === String(user.id))),
    [user, course.instructor_id],
  );

  // Fetch each project's deadline for the current student
  React.useEffect(() => {
    if (!user || user.role !== 'student') return;
    if (!Array.isArray(course.projects) || course.projects.length === 0) return;

    const token = authStorage.getToken();
    if (!token) return;

    let cancelled = false;

    (async () => {
      const results: Record<string, any> = {};
      await Promise.all(
        course.projects.map(async (project: any) => {
          try {
            const res = await Api.projects.deadline(
              String(project.id),
              user.id,
              token,
            );
            results[String(project.id)] = res;
          } catch (err) {
            console.warn(
              `Failed to fetch deadline for project ${project.id}:`,
              err,
            );
          }
        }),
      );
      if (!cancelled) setDeadlines(results);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, course.id, course.projects?.length]);

    React.useEffect(() => {
      if (!user || user.role !== 'student') return;
      const token = authStorage.getToken();
      if (!token) return;
  
      let cancelled = false;
  
      (async () => {
        try {
          const res: any = await Api.projects.studentSubmissions(user.id, token);
          const list = Array.isArray(res) ? res : res?.data ?? [];
  
          // Keep only the latest submission per project
          const byProject: Record<string, any> = {};
          for (const s of list) {
            const pid = String(s.project_id);
            if (
              !byProject[pid] ||
              new Date(s.submitted_at) > new Date(byProject[pid].submitted_at)
            ) {
              byProject[pid] = s;
            }
          }
          if (!cancelled) setMySubmissions(byProject);
        } catch (err) {
          console.warn('Failed to fetch student submissions:', err);
        }
      })();
  
      return () => {
        cancelled = true;
      };
    }, [user?.id, course.id]);

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

  // ==================== PROJECT SUBMISSION HANDLERS ====================

  const handleScreenshotChange = (projectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 5);
    setScreenshotFiles((prev) => ({ ...prev, [projectId]: arr }));
    setScreenshotPreviews((prev) => ({
      ...prev,
      [projectId]: arr.map((f) => URL.createObjectURL(f)),
    }));
  };

  const handleDescriptionChange = (projectId: string, text: string) => {
    setSubmissionDescriptions((prev) => ({ ...prev, [projectId]: text }));
  };

  const handleLinkChange = (projectId: string, link: string) => {
    setSubmissionLinks((prev) => ({ ...prev, [projectId]: link }));
  };

  const canSubmit = (projectId: string) => {
    const desc = (submissionDescriptions[projectId] || '').trim();
    const shots = screenshotFiles[projectId] ?? [];
    return desc.length > 0 && shots.length > 0;
  };

  const handleSubmitProject = async (projectId: string, projectTitle: string) => {
    const screenshots = screenshotFiles[projectId] ?? [];
    const description = (submissionDescriptions[projectId] || '').trim();
    const url = submissionLinks[projectId];

    if (!description) {
      alert('Please describe what you built before submitting.');
      return;
    }
    if (screenshots.length === 0) {
      alert('Please upload at least one screenshot of your work.');
      return;
    }

    setSubmittingProject(projectId);
    try {
      await onProjectSubmitWithFiles(course.id, projectId, {
        description,
        submissionUrl: url || undefined,
        screenshots,
      });
           // Clear form
           setScreenshotFiles((prev) => ({ ...prev, [projectId]: [] }));
           setScreenshotPreviews((prev) => ({ ...prev, [projectId]: [] }));
           setSubmissionDescriptions((prev) => ({ ...prev, [projectId]: '' }));
           setSubmissionLinks((prev) => ({ ...prev, [projectId]: '' }));
     
           // Refresh submissions so the card immediately flips to "Submitted"
           if (user && user.role === 'student') {
             const token = authStorage.getToken();
             if (token) {
               try {
                 const res: any = await Api.projects.studentSubmissions(user.id, token);
                 const list = Array.isArray(res) ? res : res?.data ?? [];
                 const byProject: Record<string, any> = {};
                 for (const s of list) {
                   const p = String(s.project_id);
                   if (
                     !byProject[p] ||
                     new Date(s.submitted_at) > new Date(byProject[p].submitted_at)
                   ) {
                     byProject[p] = s;
                   }
                 }
                 setMySubmissions(byProject);
               } catch (err) {
                 console.warn('Failed to refresh submissions:', err);
               }
             }
           }
         } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmittingProject(null);
    }
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
              {(course.projects ?? []).map((project: any) => {
                const pid = String(project.id);
                const dl = deadlines[pid];
                const isLate = dl?.deadline
                  ? new Date(dl.deadline) < new Date()
                  : false;
                const isSubmitting = submittingProject === pid;
                const sub = mySubmissions[pid];
                const isSubmitted = !!sub;

                return (
                  <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      {!isOwnerOrAdmin && dl && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            dl.source === 'none'
                              ? 'bg-gray-100 text-gray-600'
                              : isLate
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {dl.source === 'none'
                            ? 'Complete course to unlock'
                            : isLate
                              ? `Overdue: ${new Date(dl.deadline!).toLocaleDateString()}`
                              : `Due: ${new Date(dl.deadline!).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-brand-muted mt-2">{project.description}</p>

                    {/* Deadline context line */}
                    {!isOwnerOrAdmin && dl && dl.source !== 'none' && (
                      <p className="text-xs text-brand-muted mt-2">
                        {dl.source === 'course_completion' && dl.course_completed_at
                          ? `Your 3-week deadline started on ${new Date(
                              dl.course_completed_at,
                            ).toLocaleDateString()}.`
                          : dl.source === 'instructor_default'
                            ? 'Suggested deadline from your instructor. Complete the course to start your personal 3-week window.'
                            : ''}
                      </p>
                    )}

{isSubmitted ? (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="checkCircle" className="w-5 h-5 text-brand-accent" />
                          <span className="text-sm font-bold text-brand-accent">
                            Submitted
                          </span>
                          {sub.is_late && (
                            <span className="text-xs text-red-600 font-semibold">
                              (Late)
                            </span>
                          )}
                        </div>
                        {sub.submission_url && (
                          <p className="text-xs text-brand-muted mb-3 break-all">
                            Link:{' '}
                            <a
                              href={sub.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary hover:underline"
                            >
                              {sub.submission_url}
                            </a>
                          </p>
                        )}
                        {sub.grade != null ? (
                          <>
                            <p className="text-sm font-semibold text-gray-800">
                              Score:{' '}
                              <span className="text-brand-accent">
                                {sub.grade} / {project.points_possible ?? 100}
                              </span>
                            </p>
                            {sub.feedback && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                "{sub.feedback}"
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-brand-muted italic">
                            Your instructor hasn't graded this yet.
                          </p>
                        )}
                      </div>
                    ) : isOwnerOrAdmin ? (
                      <p className="mt-4 text-sm text-gray-500 italic">
                        Students will submit their work here.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {/* Screenshot uploader */}
                        <div>
                          <label className="block text-xs font-medium text-brand-muted mb-1">
                            Upload Screenshots (1–5) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleScreenshotChange(pid, e.target.files)}
                            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:font-semibold file:cursor-pointer hover:file:bg-brand-primary/90"
                            disabled={isSubmitting}
                          />
                          {(screenshotPreviews[pid] ?? []).length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {(screenshotPreviews[pid] ?? []).map((src, i) => (
                                <img
                                  key={i}
                                  src={src}
                                  alt={`screenshot ${i + 1}`}
                                  className="w-20 h-20 rounded object-cover border border-gray-200"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-medium text-brand-muted mb-1">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Describe what you built, how you approached it, and any challenges you ran into..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                            value={submissionDescriptions[pid] || ''}
                            onChange={(e) => handleDescriptionChange(pid, e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Optional URL */}
                        <div>
                          <label className="block text-xs font-medium text-brand-muted mb-1">
                            Live URL / Repo (optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://github.com/your-repo"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                            value={submissionLinks[pid] || ''}
                            onChange={(e) => handleLinkChange(pid, e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>

                        <button
                          onClick={() => handleSubmitProject(pid, project.title)}
                          disabled={isSubmitting || !canSubmit(pid)}
                          className="px-6 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting…' : 'Submit Project'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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