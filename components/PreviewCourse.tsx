"use client";

import React, { useState } from 'react';
import type { Course } from '../types';
import { Icon } from './Icon';

interface PreviewCourseProps {
  course: Course;
  onBack: () => void;
  onEdit: () => void;
}

export const PreviewCourse: React.FC<PreviewCourseProps> = ({ course, onBack, onEdit }) => {
  const modules = Array.isArray(course?.content) ? course.content : [];
  const [activeLesson, setActiveLesson] = useState<any>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-brand-primary mb-4"
        >
          <Icon name="chevronLeft" className="w-5 h-5" />
          Back to Admin Panel
        </button>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preview: {course.title}</h1>
            <p className="text-brand-muted mt-1">
              This is what students will see. Click any lesson to play or read it.
            </p>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80"
          >
            <Icon name="edit" className="w-4 h-4" />
            Edit Course
          </button>
        </div>
      </div>

      {/* Course hero */}
      <div
        className="relative rounded-lg overflow-hidden p-8 flex items-end min-h-[220px] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${course.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 w-full">
          <p className="text-sm font-semibold text-brand-accent">{course.category}</p>
          <h2 className="text-3xl font-bold mt-1">{course.title}</h2>
          <p className="mt-2 max-w-2xl text-white/90 line-clamp-3">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: player + curriculum */}
        <div className="lg:col-span-2 space-y-6">
        {activeLesson ? (
  (() => {
    // Detect type from URL: video if videoUrl is present, else text
    const videoUrl = activeLesson.videoUrl || activeLesson.video_url || '';
    const isVideo = !!videoUrl;

    if (isVideo) {
      // YouTube handling: convert page URL into embed URL
      const ytMatch = videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
      );

      return (
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          <div className="aspect-video">
            {ytMatch ? (
              <iframe
                key={activeLesson.id}
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={activeLesson.id}
                src={videoUrl}
                controls
                className="w-full h-full"
              />
            )}
          </div>
          <div className="p-4 bg-brand-surface border-t border-gray-200">
            <h4 className="font-bold text-gray-900">{activeLesson.title}</h4>
            <p className="text-sm text-brand-muted">
              Playing now • {activeLesson.duration || activeLesson.video_duration || '—'}
            </p>
          </div>
        </div>
      );
    }

    // Text lesson
    return (
      <div className="bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{activeLesson.title}</h3>
        <div
          className="prose prose-sm max-w-none text-brand-muted"
          dangerouslySetInnerHTML={{
            __html: activeLesson.content || activeLesson.text_content || '<em>No content yet.</em>',
          }}
        />
      </div>
    );
  })()
) : (
  <div className="bg-brand-surface p-8 rounded-xl border border-dashed border-gray-300 text-center">
    <Icon name="play" className="w-10 h-10 text-brand-muted mx-auto mb-3" />
    <p className="text-brand-muted">Select a lesson below to play or read it.</p>
  </div>
)}

          {/* Curriculum */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Course Content</h2>
            {modules.length === 0 && (
              <p className="text-sm text-brand-muted italic">
                No modules yet. Use Edit Course to add modules and lessons.
              </p>
            )}
            {modules.map((module: any) => (
              <div key={module.id} className="bg-brand-surface p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800">{module.title}</h3>
                <ul className="mt-2 space-y-1">
                  {(module.lessons ?? []).map((lesson: any) => {
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <li
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-brand-secondary/10 border-l-4 border-brand-secondary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                        <Icon
  name={(lesson.type === 'video' || lesson.videoUrl || lesson.video_url) ? 'play' : 'document'}
  className={`w-5 h-5 ${isActive ? 'text-brand-secondary' : 'text-brand-muted'}`}
/>
                          <span className={`text-sm ${isActive ? 'font-bold text-brand-secondary' : 'text-brand-muted'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
  {lesson.duration || (lesson.video_duration ? `${lesson.video_duration} min` : '')}
</span>
                      </li>
                    );
                  })}
                  {(module.lessons ?? []).length === 0 && (
                    <p className="text-sm text-brand-muted italic pl-2">No lessons yet.</p>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-brand-surface p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Icon name="academicCap" className="w-5 h-5 text-brand-muted" />
                <span><span className="font-semibold">Instructor:</span> {course.instructor}</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="courses" className="w-5 h-5 text-brand-muted" />
                <span><span className="font-semibold">Modules:</span> {modules.length}</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="bell" className="w-5 h-5 text-brand-muted" />
                <span><span className="font-semibold">Duration:</span> {course.duration}</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="community" className="w-5 h-5 text-brand-muted" />
                <span><span className="font-semibold">Students:</span> {course.enrollmentCount?.toLocaleString?.() ?? 0}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};