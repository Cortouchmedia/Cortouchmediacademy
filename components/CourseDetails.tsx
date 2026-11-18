"use client";

import React, { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import type { CourseWithEnrollment, User } from '../types';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { PaystackButton } from './PaystackButton';
import { InstructorAssistant } from './InstructorAssistant';
import { CourseLandingPage } from './CourseLandingPage';
import { useAppContext } from '../context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Api, authStorage } from '../lib/api';
import Player from '@vimeo/player';

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

function getVimeoEmbed(url: string): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (m) {
    const videoId = m[1];
    const hash = m[2] ? `?h=${m[2]}` : '';
    return `https://player.vimeo.com/video/${videoId}${hash}`;
  }
  return null;
}

function durationLabelFor(lesson: any): string {
  if (!lesson) return '';
  if (lesson.video_duration) {
    const n = Number(lesson.video_duration);
    return n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n} min`;
  }
  if (typeof lesson.duration === 'string') return lesson.duration;
  return '';
}

const getAttachmentIcon = (att: { mime_type?: string; url: string }) => {
  const mime = (att.mime_type ?? '').toLowerCase();
  const url = att.url.toLowerCase();

  if (mime.includes('pdf') || url.endsWith('.pdf')) return '📄';
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    url.endsWith('.doc') ||
    url.endsWith('.docx')
  )
    return '📝';
  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    url.endsWith('.xls') ||
    url.endsWith('.xlsx') ||
    url.endsWith('.csv')
  )
    return '📊';
  if (
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    url.endsWith('.ppt') ||
    url.endsWith('.pptx')
  )
    return '📽️';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.includes('zip') || url.endsWith('.zip') || url.endsWith('.rar')) return '🗜️';
  if (url.includes('drive.google.com')) return '📁';
  if (url.includes('github.com')) return '💻';
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'))
    return '🎬';
  return '📎';
};

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// We keep the players simple. The Master Timer handles completion.
const YouTubePlayer: React.FC<{ videoId: string; startAt?: number }> = ({ videoId, startAt = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    let player: any;
    const initPlayer = () => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "w-full h-full";
      containerRef.current!.innerHTML = "";
      containerRef.current!.appendChild(playerDiv);
      player = new (window as any).YT.Player(playerDiv, {
        videoId: videoId,
        playerVars: { autoplay: 1, mute: 1, start: Math.floor(startAt), rel: 0 },
      });
    };
    if ((window as any).YT && (window as any).YT.Player) initPlayer();
    else (window as any).onYouTubeIframeAPIReady = initPlayer;
    return () => { if (player) player.destroy(); };
  }, [videoId, startAt]);
  return <div ref={containerRef} className="w-full h-full" />;
};

const VimeoPlayer: React.FC<{ videoUrl: string; startAt?: number; lessonId: string | number }> = ({ videoUrl, startAt = 0, lessonId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const player = new Player(containerRef.current, { url: videoUrl as any, autoplay: true, muted: true, responsive: true });
    player.ready().then(() => { if (startAt > 0) player.setCurrentTime(startAt).catch(() => {}); }).catch(() => {});
    return () => { player.destroy().catch(() => {}); };
  }, [videoUrl, lessonId]);
  return <div ref={containerRef} className="w-full h-full" />;
};

const LessonAttachments: React.FC<{ attachments?: any[] }> = ({ attachments }) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="document" className="w-5 h-5 text-brand-primary" />
        <h4 className="font-bold text-gray-900 text-sm">Lesson Materials ({attachments.length})</h4>
      </div>
      <ul className="space-y-2">
        {attachments.map((att: any, idx: number) => {
          const key = att.public_id ?? att.url ?? idx;
          const isPdf = (att.mime_type ?? '').toLowerCase().includes('pdf') || (att.url ?? '').toLowerCase().endsWith('.pdf');
          return (
            <li key={key}>
              <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group">
                <span className="text-2xl flex-shrink-0">{getAttachmentIcon(att)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-primary">{att.filename || 'Untitled attachment'}</p>
                  <p className="text-xs text-brand-muted">{isPdf ? 'PDF' : att.mime_type?.split('/')?.pop()?.toUpperCase() ?? 'File'}{att.size ? ` · ${formatBytes(att.size)}` : ''}</p>
                </div>
                <Icon name="arrowRight" className="w-4 h-4 text-gray-400 group-hover:text-brand-primary flex-shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const CourseDetailsInner: React.FC<CourseDetailsProps> = ({ user, course, allCourses }) => {
  const {
    handleProjectSubmitWithFiles: onProjectSubmitWithFiles,
    handleToggleLessonComplete: onToggleLessonComplete,
    handleEnrollmentSuccess: onEnrollmentSuccess,
    handleSendCourseMessage: onSendCourseMessage,
    handleLessonProgress: onLessonProgress, 
    handleLessonProgressToggle: onLessonProgressToggle,
  } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const onBack = () => router.back();

  const initialTab: CourseTab = searchParams.get('tab') === 'projects' ? 'Projects' : 'Curriculum';
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // 🎯 SYNC EFFECT: Keeps the active video player in sync with the global course state
  useEffect(() => {
    if (!activeLesson) return;
    let updatedLesson = null;
    course.content?.forEach((m: any) => {
      const match = m.lessons?.find((l: any) => String(l.id) === String(activeLesson.id));
      if (match) updatedLesson = match;
    });
    if (updatedLesson && updatedLesson.isCompleted !== activeLesson.isCompleted) {
      setActiveLesson(updatedLesson);
    }
  }, [course, activeLesson]);

 
  useEffect(() => {
    if (!activeLesson || activeLesson.isCompleted) return;

    const rawDuration = activeLesson.video_duration ?? activeLesson.duration;

    if (!rawDuration || isNaN(Number(rawDuration)) || Number(rawDuration) <= 0) {
      console.log(`⚠️ No valid duration for lesson ${activeLesson.id}. Timer skipped.`);
      return;
    }

    const durationMins = Number(rawDuration);
    const triggerMs = Math.max(5000, durationMins * 60 * 1000);

    console.log(`⏱️ Master Timer started for lesson ${activeLesson.id} (${durationMins} min). Firing in ${triggerMs / 1000}s`);

    const timer = setTimeout(() => {
      console.log(`🔥 Master Timer FIRED for lesson ${activeLesson.id}`);
      
      // 1. Mark current lesson complete
      onLessonProgressToggle(activeLesson.id, true);
      
      // 2. Check if the whole course is done
      checkCourseCompletion();

      // 3. Find the next lesson
      let nextLesson = null;
      let foundCurrent = false;
      for (const module of (course.content ?? [])) {
        for (const lesson of (module.lessons ?? [])) {
          if (foundCurrent) { nextLesson = lesson; break; }
          if (String(lesson.id) === String(activeLesson.id)) foundCurrent = true;
        }
        if (nextLesson) break;
      }

      // 4. Auto-play next lesson
      if (nextLesson) {
        console.log(`⏭️ Auto-playing next lesson: ${nextLesson.title}`);
        setActiveLesson(nextLesson);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, triggerMs);

    return () => clearTimeout(timer);
  }, [activeLesson?.id, activeLesson?.isCompleted, course.content]);
  const [screenshotFiles, setScreenshotFiles] = useState<Record<string, File[]>>({});
  const [screenshotPreviews, setScreenshotPreviews] = useState<Record<string, string[]>>({});
  const [submissionDescriptions, setSubmissionDescriptions] = useState<Record<string, string>>({});
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({});
  const [submittingProject, setSubmittingProject] = useState<string | null>(null);
  const [deadlines, setDeadlines] = useState<Record<string, any>>({});
  const [mySubmissions, setMySubmissions] = useState<Record<string, any>>({});

  const isOwnerOrAdmin = useMemo(
    () => !!user && (user.role === 'admin' || (user.role === 'instructor' && String(course.instructor_id) === String(user.id))),
    [user, course.instructor_id],
  );

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    if (!Array.isArray(course.projects) || course.projects.length === 0) return;
    const token = authStorage.getToken();
    if (!token) return;
    let cancelled = false;
    (async () => {
      const results: Record<string, any> = {};
      await Promise.all(course.projects.map(async (project: any) => {
        try {
          const res = await Api.projects.deadline(String(project.id), user.id, token);
          results[String(project.id)] = res;
        } catch (err) {}
      }));
      if (!cancelled) setDeadlines(results);
    })();
    return () => { cancelled = true; };
  }, [user?.id, course.id, course.projects?.length]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    const token = authStorage.getToken();
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res: any = await Api.projects.studentSubmissions(user.id, token);
        const list = Array.isArray(res) ? res : res?.data ?? [];
        const byProject: Record<string, any> = {};
        for (const s of list) {
          const pid = String(s.project_id);
          if (!byProject[pid] || new Date(s.submitted_at) > new Date(byProject[pid].submitted_at)) {
            byProject[pid] = s;
          }
        }
        if (!cancelled) setMySubmissions(byProject);
      } catch (err) {}
    })();
    return () => { cancelled = true; };
  }, [user?.id, course.id]);

  const totalLessons = useMemo(() => {
    if (!Array.isArray(course.content)) return 0;
    return course.content.reduce((acc: number, m: any) => acc + (m.lessons?.length ?? 0), 0);
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
  const durationLabel = totalDurationMin > 0 ? (totalDurationMin >= 60 ? `${Math.floor(totalDurationMin / 60)}h ${totalDurationMin % 60}m` : `${totalDurationMin}m`) : course.duration || 'Self-paced';

  const handleEnroll = async () => {
    try { await onEnrollmentSuccess(course.id); } catch (err) { alert('Payment succeeded but enrollment failed.'); }
  };

  const checkCourseCompletion = () => {
    if (isOwnerOrAdmin) return;
    const total = (course.content ?? []).reduce((acc: number, m: any) => acc + (m.lessons?.length ?? 0), 0);
    const completed = (course.content ?? []).reduce((acc: number, m: any) => acc + (m.lessons ?? []).filter((l: any) => l.isCompleted).length, 0);
    if (total > 0 && completed >= total) {
      const hasProjects = (course.projects ?? []).length > 0;
      setTimeout(() => {
        if (hasProjects) {
          if (window.confirm('🎉 All lessons complete!\n\nGo to Project Submission?')) {
            setActiveTab('Projects');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          alert('🎉 Course complete! Your certificate will be issued shortly.');
        }
      }, 800);
    }
  };

  const handleToggleLesson = (lessonId: number | string) => {
    onToggleLessonComplete(course.id, lessonId);
    setTimeout(() => checkCourseCompletion(), 900);
  };

  const handleScreenshotChange = (projectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 5);
    setScreenshotFiles((prev) => ({ ...prev, [projectId]: arr }));
    setScreenshotPreviews((prev) => ({ ...prev, [projectId]: arr.map((f) => URL.createObjectURL(f)) }));
  };

  const handleDescriptionChange = (projectId: string, text: string) => setSubmissionDescriptions((prev) => ({ ...prev, [projectId]: text }));
  const handleLinkChange = (projectId: string, link: string) => setSubmissionLinks((prev) => ({ ...prev, [projectId]: link }));
  const canSubmit = (projectId: string) => (submissionDescriptions[projectId] || '').trim().length > 0 && (screenshotFiles[projectId] ?? []).length > 0;

  const handleSubmitProject = async (projectId: string, projectTitle: string) => {
    const screenshots = screenshotFiles[projectId] ?? [];
    const description = (submissionDescriptions[projectId] || '').trim();
    const url = submissionLinks[projectId];
    if (!description) return alert('Please describe what you built before submitting.');
    if (screenshots.length === 0) return alert('Please upload at least one screenshot of your work.');

    setSubmittingProject(projectId);
    try {
      await onProjectSubmitWithFiles(course.id, projectId, { description, submissionUrl: url || undefined, screenshots });
      setScreenshotFiles((prev) => ({ ...prev, [projectId]: [] }));
      setScreenshotPreviews((prev) => ({ ...prev, [projectId]: [] }));
      setSubmissionDescriptions((prev) => ({ ...prev, [projectId]: '' }));
      setSubmissionLinks((prev) => ({ ...prev, [projectId]: '' }));
      if (user && user.role === 'student') {
        const token = authStorage.getToken();
        if (token) {
          const res: any = await Api.projects.studentSubmissions(user.id, token);
          const list = Array.isArray(res) ? res : res?.data ?? [];
          const byProject: Record<string, any> = {};
          for (const s of list) {
            const p = String(s.project_id);
            if (!byProject[p] || new Date(s.submitted_at) > new Date(byProject[p].submitted_at)) byProject[p] = s;
          }
          setMySubmissions(byProject);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit.');
    } finally {
      setSubmittingProject(null);
    }
  };

  const prerequisiteCourses = course.prerequisiteCourseIds ? allCourses.filter((c) => course.prerequisiteCourseIds!.some((id) => String(id) === String(c.id))) : [];

  if (!course.isEnrolled && !isOwnerOrAdmin) {
    return <CourseLandingPage user={user} course={course} onBack={onBack} onEnrollmentSuccess={onEnrollmentSuccess} />;
  }

  const renderVideoOrText = (lesson: any) => {
    const videoUrl = lesson.videoUrl || lesson.video_url || '';
    const isVideo = !!videoUrl;
    const resumeAt = Number(lesson.last_watched_position ?? 0);

    if (isVideo) {
      const yt = getYouTubeEmbed(videoUrl);
      const vimeo = getVimeoEmbed(videoUrl);
      return (
        <div className="space-y-4">
          <div className="bg-black rounded-xl overflow-hidden shadow-xl">
            <div className="aspect-video">
              {yt ? (
                <YouTubePlayer key={lesson.id} videoId={yt.split("/embed/")[1].split("?")[0]} startAt={resumeAt} />
              ) : vimeo ? (
                <VimeoPlayer key={lesson.id} videoUrl={vimeo} lessonId={lesson.id} startAt={resumeAt} />
              ) : (
                <video key={lesson.id} src={videoUrl} controls autoPlay muted playsInline className="w-full h-full" onLoadedMetadata={(e) => { if (resumeAt > 0 && resumeAt < e.currentTarget.duration - 1) e.currentTarget.currentTime = resumeAt; }} />
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-gray-900">{lesson.title}</h4>
                <p className="text-sm text-brand-muted mt-1">{durationLabelFor(lesson)}</p>
              </div>
              {!isOwnerOrAdmin && lesson.isCompleted && (
                <span className="text-xs font-bold text-brand-accent flex items-center gap-1 flex-shrink-0"><Icon name="checkCircle" className="w-4 h-4" /> Completed</span>
              )}
            </div>
          </div>
          <LessonAttachments attachments={lesson.attachments} />
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
            {!isOwnerOrAdmin && (
              <button onClick={() => handleToggleLesson(lesson.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex-shrink-0 ${lesson.isCompleted ? "bg-green-100 text-green-700" : "bg-brand-primary text-white hover:bg-brand-primary/90"}`}>
                {lesson.isCompleted ? "✓ Completed" : "Mark as complete"}
              </button>
            )}
          </div>
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: lesson.content || lesson.text_content || "<em>No content yet.</em>" }} />
        </div>
        <LessonAttachments attachments={lesson.attachments} />
      </div>
    );
  };

  const hasCertificate = !!(course as any).certificate;
  const inProjectPhase = !hasCertificate && course.progress >= 100;

  return (
    <div className="space-y-8">
      {isOwnerOrAdmin && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="info" className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900 flex-1"><span className="font-semibold">Instructor Preview.</span> You're seeing this page the way students do.</p>
          <button onClick={() => router.push('/instructor-courses')} className="text-sm font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap">Edit Course →</button>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden bg-cover bg-center text-white min-h-[360px] flex items-end" style={{ backgroundImage: `url(${course.imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        <div className="relative z-10 p-8 lg:p-10 w-full">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white mb-6 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm"><Icon name="chevronLeft" className="w-4 h-4" />{isOwnerOrAdmin ? 'Back to My Courses' : 'Back to Catalog'}</button>
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold tracking-wider uppercase text-brand-accent mb-3">{course.category}</span>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">{course.title}</h1>
            <p className="text-white/85 text-sm lg:text-base line-clamp-2 mb-6">{course.description}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2"><Icon name="star" className="w-4 h-4 text-yellow-400" /><span className="font-semibold">{course.rating.toFixed(1)}</span><span className="text-white/70">({course.reviews?.length ?? 0} reviews)</span></span>
              <span className="flex items-center gap-2"><Icon name="community" className="w-4 h-4" /><span className="font-semibold">{course.enrollmentCount.toLocaleString()}</span><span className="text-white/70">students</span></span>
              <span className="flex items-center gap-2"><Icon name="bookOpen" className="w-4 h-4" /><span className="font-semibold">{course.content?.length ?? 0}</span><span className="text-white/70">module{(course.content?.length ?? 0) === 1 ? '' : 's'}</span></span>
              <span className="flex items-center gap-2"><Icon name="bell" className="w-4 h-4" /><span className="font-semibold">{durationLabel}</span></span>
            </div>
          </div>
        </div>
      </div>

      {prerequisiteCourses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
          <Icon name="shield" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Prerequisites</p>
            <p className="text-sm text-amber-800 mt-1">We recommend completing these first: <span className="font-semibold">{prerequisiteCourses.map((p) => p.title).join(', ')}</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            <TabButton label="Curriculum" isActive={activeTab === 'Curriculum'} onClick={() => setActiveTab('Curriculum')} iconName="bookOpen" />
            <TabButton label="Projects" isActive={activeTab === 'Projects'} onClick={() => setActiveTab('Projects')} iconName="edit" />
            <TabButton label="AI Assistant" isActive={activeTab === 'AI Assistant'} onClick={() => setActiveTab('AI Assistant')} iconName="academicCap" />
            <TabButton label="Reviews" isActive={activeTab === 'Reviews'} onClick={() => setActiveTab('Reviews')} iconName="star" />
            {(course.isEnrolled || isOwnerOrAdmin) && <TabButton label="Webinars" isActive={activeTab === 'Webinars'} onClick={() => setActiveTab('Webinars')} iconName="videoCamera" />}
          </div>

          {activeTab === 'Curriculum' && (
            <div className="space-y-6">
              {activeLesson ? renderVideoOrText(activeLesson) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                  <Icon name="play" className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                  <p className="text-brand-muted">Select a lesson to start learning</p>
                </div>
              )}

              <div className="space-y-3">
                {(course.content ?? []).map((module: any, mi: number) => (
                  <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900"><span className="text-brand-muted text-sm mr-2">Module {mi + 1}</span>{module.title}</h3>
                      <span className="text-xs text-gray-500">{module.lessons?.length ?? 0} lesson{(module.lessons?.length ?? 0) === 1 ? '' : 's'}</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {(module.lessons ?? []).map((lesson: any) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isVideo = !!(lesson.videoUrl || lesson.video_url);
                        return (
                          <li key={lesson.id} className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors ${isActive ? 'bg-brand-primary/5' : 'hover:bg-gray-50'}`} onClick={() => setActiveLesson(lesson)}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}`}><Icon name={isVideo ? 'play' : 'document'} className="w-4 h-4" /></div>
                              <span className={`text-sm truncate ${isActive ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-gray-500">{durationLabelFor(lesson)}</span>
                              {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (<span className="inline-flex items-center gap-1 text-xs text-brand-muted bg-gray-100 px-2 py-0.5 rounded-full">📎 {lesson.attachments.length}</span>)}
                              {!isOwnerOrAdmin && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${lesson.isCompleted ? 'bg-brand-accent border-brand-accent' : 'border-gray-300 hover:border-brand-accent'}`} onClick={(e) => { e.stopPropagation(); handleToggleLesson(lesson.id); }}>
                                  {lesson.isCompleted && <Icon name="checkCircle" className="w-4 h-4 text-white" strokeWidth={3} />}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Projects' && (
            <div className="space-y-4">
              {(course.projects ?? []).map((project: any) => {
                const pid = String(project.id);
                const dl = deadlines[pid];
                const isLate = dl?.deadline ? new Date(dl.deadline) < new Date() : false;
                const isSubmitting = submittingProject === pid;
                const sub = mySubmissions[pid];
                const isSubmitted = !!sub;
                return (
                  <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      {!isOwnerOrAdmin && dl && (<span className={`text-xs font-semibold px-2 py-1 rounded-full ${dl.source === 'none' ? 'bg-gray-100 text-gray-600' : isLate ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{dl.source === 'none' ? 'Complete course to unlock' : isLate ? `Overdue: ${new Date(dl.deadline!).toLocaleDateString()}` : `Due: ${new Date(dl.deadline!).toLocaleDateString()}`}</span>)}
                    </div>
                    <p className="text-sm text-brand-muted mt-2">{project.description}</p>
                    {isSubmitted ? (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-2"><Icon name="checkCircle" className="w-5 h-5 text-brand-accent" /><span className="text-sm font-bold text-brand-accent">Submitted</span>{sub.is_late && <span className="text-xs text-red-600 font-semibold">(Late)</span>}</div>
                        {sub.grade != null ? (<><p className="text-sm font-semibold text-gray-800">Score: <span className="text-brand-accent">{sub.grade} / {project.points_possible ?? 100}</span></p>{sub.feedback && <p className="text-sm text-gray-600 mt-2 italic">"{sub.feedback}"</p>}</>) : (<p className="text-sm text-brand-muted italic">Your instructor hasn't graded this yet.</p>)}
                      </div>
                    ) : isOwnerOrAdmin ? (
                      <p className="mt-4 text-sm text-gray-500 italic">Students will submit their work here.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-brand-muted mb-1">Upload Screenshots (1–5) <span className="text-red-500">*</span></label>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotChange(pid, e.target.files)} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:font-semibold file:cursor-pointer hover:file:bg-brand-primary/90" disabled={isSubmitting} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brand-muted mb-1">Description <span className="text-red-500">*</span></label>
                          <textarea rows={4} value={submissionDescriptions[pid] || ''} onChange={(e) => handleDescriptionChange(pid, e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none" disabled={isSubmitting} />
                        </div>
                        <button onClick={() => handleSubmitProject(pid, project.title)} disabled={isSubmitting || !canSubmit(pid)} className="px-6 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting…' : 'Submit Project'}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'AI Assistant' && <InstructorAssistant course={course} onSendMessage={onSendCourseMessage} />}
          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Reviews</h3>
              <div className="grid gap-4">
                {course.reviews?.map((review: any) => (
                  <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                      <img src={review.avatarUrl || `https://i.pravatar.cc/80?u=${review.author}`} alt={review.author} className="w-12 h-12 rounded-full object-cover" />
                      <div><h4 className="font-bold text-gray-900">{review.author}</h4></div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {isOwnerOrAdmin ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900">Instructor Preview</h3>
                <p className="text-sm text-brand-muted mt-2">You're previewing this course.</p>
                <button onClick={() => router.push('/instructor-courses')} className="mt-4 w-full px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors">Edit This Course</button>
              </div>
            ) : course.isEnrolled ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
                <div className="flex justify-between items-center text-sm text-brand-muted mb-2"><span>Complete</span><span className="font-semibold text-gray-900">{course.progress}%</span></div>
                <ProgressBar progress={course.progress} />
                <p className="text-xs text-brand-muted mt-3 text-center">{hasCertificate ? 'Course completed! 🎉' : inProjectPhase ? '🎓 Lessons complete — submit your project' : `${totalLessons} lesson${totalLessons === 1 ? '' : 's'} total`}</p>
                {hasCertificate && (<a href={`/verify-certificate/${(course as any).certificate.verification_code}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><Icon name="award" className="w-5 h-5" />View Certificate</a>)}
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}</h3>
                <p className="text-xs text-brand-muted mb-4">One-time payment · Lifetime access</p>
                {user ? (course.price === 0 ? <button onClick={handleEnroll} className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all shadow-md">Enroll for Free</button> : <PaystackButton email={user.email} amount={course.price} onSuccess={handleEnroll} onClose={() => {}} metadata={{ course_id: course.id, user_id: user.id }} />) : <button onClick={() => (window.location.href = '/login')} className="w-full px-4 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all shadow-md">Sign in to Enroll</button>}
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Course Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><Icon name="academicCap" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Instructor:</span>{' '}<span className="font-semibold text-gray-900">{course.instructor}</span></span></li>
              <li className="flex items-center gap-3"><Icon name="bookOpen" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Modules:</span>{' '}<span className="font-semibold text-gray-900">{course.content?.length ?? 0}</span></span></li>
              <li className="flex items-center gap-3"><Icon name="document" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Lessons:</span>{' '}<span className="font-semibold text-gray-900">{lessonCountLabel.replace('lesson', '').trim()}</span></span></li>
              <li className="flex items-center gap-3"><Icon name="bell" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Duration:</span>{' '}<span className="font-semibold text-gray-900">{durationLabel}</span></span></li>
              <li className="flex items-center gap-3"><Icon name="community" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Students:</span>{' '}<span className="font-semibold text-gray-900">{course.enrollmentCount.toLocaleString()}</span></span></li>
              <li className="flex items-center gap-3"><Icon name="star" className="w-4 h-4 text-brand-muted" /><span><span className="text-brand-muted">Rating:</span>{' '}<span className="font-semibold text-gray-900">{course.rating.toFixed(1)}/5.0</span></span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const CourseDetails: React.FC<CourseDetailsProps> = (props) => (
  <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading course…</div>}>
    <CourseDetailsInner {...props} />
  </Suspense>
);