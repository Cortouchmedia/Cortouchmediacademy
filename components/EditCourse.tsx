"use client";

import React, { useState, useEffect } from 'react';
import type { Course, Lesson, Webinar } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';

interface EditCourseProps {
  course: Course;
  allCourses: Course[];
  onBack: () => void;
  onUpdateCourse: (courseId: number | string, updatedDetails: Partial<Course>) => Promise<void>;
  onAddModule: (courseId: number | string, title: string) => Promise<{ id: string | number; title: string } | null>;
  onAddLesson: (
    courseId: number | string,
    moduleId: number | string,
    lessonData: Omit<Lesson, 'id' | 'isCompleted'> & {
      description?: string;
      durationMinutes?: number;
      isFree?: boolean;
    },
  ) => Promise<void>;
  onDeleteLesson: (courseId: number | string, lessonId: number | string) => Promise<void>;
  onAddWebinar: (courseId: number | string, webinarData: Omit<Webinar, 'id'>) => void;
  onDeleteWebinar: (courseId: number | string, webinarId: number | string) => void;
  onAddProject: (
    courseId: number | string,
    projectData: {
      title: string;
      description: string;
      instructions?: string;
      dueDate?: string;
      maxSubmissions?: number;
      pointsPossible?: number;
    },
  ) => Promise<void>;
  onDeleteProject: (courseId: number | string, projectId: number | string) => Promise<void>;
  onAIGrade: (submissionId: string) => Promise<{ score: number; feedback: string; rubric: any[] }>;
  onApproveGrade: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

const initialLessonState = {
  title: '',
  duration: '',
  type: 'video' as 'video' | 'text',
  videoUrl: '',
  content: '',
  description: '',
  isFree: false,
};

const initialWebinarState = {
  title: '',
  date: '',
  status: 'upcoming' as 'live' | 'upcoming' | 'ended',
};

const initialProjectState = {
  title: '',
  description: '',
  instructions: '',
  dueDate: '',
  maxSubmissions: 1,
  pointsPossible: 100,
};

export const EditCourse: React.FC<EditCourseProps> = ({
  course,
  allCourses,
  onBack,
  onUpdateCourse,
  onAddModule,
  onAddLesson,
  onDeleteLesson,
  onAddWebinar,
  onDeleteWebinar,
  onAddProject,
  onDeleteProject,
  onAIGrade,
  onApproveGrade,
}) => {
  const { logAuditEvent, currentUser } = useAppContext();

  const [details, setDetails] = useState({
    title: course?.title ?? '',
    category: course?.category ?? '',
    instructor: course?.instructor ?? '',
    duration: course?.duration ?? '',
    description: course?.description ?? '',
    imageUrl: course?.imageUrl ?? '',
    price: course?.price ?? 0,
    prerequisiteCourseIds: Array.isArray(course?.prerequisiteCourseIds) ? course.prerequisiteCourseIds : [],
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | string | null>(null);
  const [newLessonData, setNewLessonData] = useState(initialLessonState);
  const [newWebinarData, setNewWebinarData] = useState(initialWebinarState);
  const [newProjectData, setNewProjectData] = useState(initialProjectState);

    const [reviewingProjectId, setReviewingProjectId] = useState<string | null>(null);
    const [reviewingProjectTitle, setReviewingProjectTitle] = useState<string>('');
    const [projectSubmissions, setProjectSubmissions] = useState<any[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [gradingInProgress, setGradingInProgress] = useState<string | null>(null);
    const [aiDrafts, setAiDrafts] = useState<Record<string, { score: number; feedback: string; rubric: any[] }>>({});
    const [editedGrades, setEditedGrades] = useState<Record<string, { grade: number; feedback: string }>>({});
    const [approvingId, setApprovingId] = useState<string | null>(null);

  // Local copy of modules so the UI updates immediately, even if the backend is slow or broken
  const [localModules, setLocalModules] = useState<any[]>(() =>
    Array.isArray(course?.content) ? course.content : []
  );

  // Sync with course prop when it changes / when real data arrives
  useEffect(() => {
    if (Array.isArray(course?.content) && course.content.length > 0) {
      setLocalModules(course.content);
    }
  }, [course?.id, course?.content]);

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onUpdateCourse(course.id, details);
      logAuditEvent('Course Updated', `Updated details for course: ${details.title}`, 'course');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setError(null);
    setIsSaving(true);

    const tempId = `local-${Date.now()}`;
    const titleToSave = newModuleTitle;
    const optimisticModule = {
      id: tempId,
      title: titleToSave,
      lessons: [],
      order_number: localModules.length,
      __optimistic: true,
    };

    // 1. Show it immediately
    setLocalModules((prev) => [...prev, optimisticModule]);
    setNewModuleTitle('');

    // 2. Persist to backend
    try {
      const created = await onAddModule(course.id, titleToSave);
      logAuditEvent('Module Added', `Added module "${titleToSave}" to ${course.title}`, 'course');
    
      // Replace the optimistic temp id with the real DB id from the server
      if (created?.id) {
        setLocalModules((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, id: created.id, __optimistic: false } : m,
          ),
        );
      }
    } catch (err) {
      console.error('Module add failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add module');
      // Remove the optimistic module so the UI matches reality
      setLocalModules((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonData.title.trim() || !addingLessonToModuleId) return;
    setError(null);
    setIsSaving(true);

    const moduleId = addingLessonToModuleId;
    const lessonPayload = {
      id: `local-lesson-${Date.now()}`,
      title: newLessonData.title,
      duration: newLessonData.duration,
      type: newLessonData.type,
      videoUrl: newLessonData.videoUrl,
      content: newLessonData.content,
      description: newLessonData.description,
      isFree: newLessonData.isFree,
      __optimistic: true,
    };

    // 1. Show it immediately
    setLocalModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...(m.lessons ?? []), lessonPayload] } : m,
      ),
    );

    // 2. Persist to backend
    try {
      await onAddLesson(course.id, moduleId, {
        title: newLessonData.title,
        duration: newLessonData.duration,
        type: newLessonData.type,
        videoUrl: newLessonData.videoUrl,
        content: newLessonData.content,
        description: newLessonData.description,
        durationMinutes: parseInt(newLessonData.duration) || undefined,
        isFree: newLessonData.isFree,
      });
      logAuditEvent('Lesson Added', `Added lesson "${newLessonData.title}" to ${course.title}`, 'course');
    } catch (err) {
      console.error('Lesson add failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add lesson');
    } finally {
      setNewLessonData(initialLessonState);
      setAddingLessonToModuleId(null);
      setIsSaving(false);
    }
  };

  const handleNewLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewLessonData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewWebinarChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewWebinarData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinarData.title.trim() || !newWebinarData.date.trim()) return;
    onAddWebinar(course.id, newWebinarData);
    setNewWebinarData(initialWebinarState);
  };

  const handleNewProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewProjectData((prev) => ({
      ...prev,
      [name]:
        name === 'maxSubmissions' || name === 'pointsPossible'
          ? Number(value)
          : value,
    }));
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.title.trim() || !newProjectData.description.trim()) return;
    setError(null);
    setIsSaving(true);
    try {
      await onAddProject(course.id, {
        ...newProjectData,
        dueDate: newProjectData.dueDate.trim() || undefined,
      });
      logAuditEvent(
        'Project Added',
        `Added project "${newProjectData.title}" to ${course.title}`,
        'course',
      );
      setNewProjectData(initialProjectState);
    } catch (err) {
      console.error('Project add failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProjectClick = async (
    projectId: number | string,
    title: string,
  ) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    setError(null);
    try {
      await onDeleteProject(course.id, projectId);
      logAuditEvent(
        'Project Deleted',
        `Deleted project "${title}" from ${course.title}`,
        'course',
      );
    } catch (err) {
      console.error('Project delete failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };


  const openSubmissions = async (projectId: string | number, projectTitle: string) => {
    if (!currentUser) return;
    setReviewingProjectId(String(projectId));
    setReviewingProjectTitle(projectTitle);
    setLoadingSubmissions(true);
    setProjectSubmissions([]);
    setAiDrafts({});
    setEditedGrades({});

    try {
      const token = (await import('../lib/api')).authStorage.getToken();
      if (!token) throw new Error('Not signed in');

      const { Api } = await import('../lib/api');
      const submissions = await Api.projects.projectSubmissions(
        String(projectId),
        currentUser.id,
        token,
      );

      const list = Array.isArray(submissions) ? submissions : [];
      setProjectSubmissions(list);

      // Pre-populate AI drafts from existing submissions
      const drafts: Record<string, { score: number; feedback: string; rubric: any[] }> = {};
      const grades: Record<string, { grade: number; feedback: string }> = {};

      list.forEach((s: any) => {
        const sid = String(s.id);

        if (s.ai_score != null || s.ai_feedback) {
          drafts[sid] = {
            score: Number(s.ai_score ?? 0),
            feedback: String(s.ai_feedback ?? ''),
            rubric: Array.isArray(s.ai_rubric) ? s.ai_rubric : [],
          };

          if (s.grade != null) {
            grades[sid] = {
              grade: Number(s.grade),
              feedback: String(s.feedback ?? ''),
            };
          } else {
            grades[sid] = {
              grade: Number(s.ai_score ?? 0),
              feedback: String(s.ai_feedback ?? ''),
            };
          }
        }
      });

      setAiDrafts(drafts);
      setEditedGrades(grades);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const closeSubmissions = () => {
    setReviewingProjectId(null);
    setReviewingProjectTitle('');
    setProjectSubmissions([]);
    setAiDrafts({});
    setEditedGrades({});
  };

  const handleGradeWithAI = async (submissionId: string) => {
    setGradingInProgress(submissionId);
    setError(null);
    try {
      const result = await onAIGrade(submissionId);
      setAiDrafts((prev) => ({ ...prev, [submissionId]: result }));
      setEditedGrades((prev) => ({
        ...prev,
        [submissionId]: { grade: result.score, feedback: result.feedback },
      }));
    } catch (err) {
      console.error('AI grading failed:', err);
      setError(err instanceof Error ? err.message : 'AI grading failed');
    } finally {
      setGradingInProgress(null);
    }
  };

  const handleApproveAIGrade = async (submissionId: string) => {
    const edited = editedGrades[submissionId];
    if (!edited) return;
    setApprovingId(submissionId);
    setError(null);
    try {
      await onApproveGrade(submissionId, edited.grade, edited.feedback);
      // Update local state so the submission shows as graded
      setProjectSubmissions((prev) =>
        prev.map((s) =>
          String(s.id) === submissionId
            ? { ...s, grade: edited.grade, feedback: edited.feedback, status: 'graded' }
            : s,
        ),
      );
    } catch (err) {
      console.error('Approve failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve grade');
    } finally {
      setApprovingId(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Editing: {course.title}</h1>
        <p className="text-brand-muted mt-1">Update course details and manage content.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Edit Details */}
      <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Course Details</h2>
        <form onSubmit={handleDetailsSubmit} className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brand-muted mb-2">Course Title</label>
              <input type="text" id="title" name="title" value={details.title} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-2">Category</label>
              <input type="text" id="category" name="category" value={details.category} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-brand-muted mb-2">Instructor</label>
              <input type="text" id="instructor" name="instructor" value={details.instructor} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-brand-muted mb-2">Duration</label>
              <input type="text" id="duration" name="duration" value={details.duration} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-brand-muted mb-2">Description</label>
            <textarea id="description" name="description" value={details.description} onChange={handleDetailsChange} required rows={4} className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-muted mb-2">Image URL</label>
              <input type="text" id="imageUrl" name="imageUrl" value={details.imageUrl} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-brand-muted mb-2">Price (NGN)</label>
              <input type="number" id="price" name="price" value={details.price} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
            {isSaved && (
              <span className="text-brand-accent text-sm font-medium flex items-center gap-2">
                <Icon name="checkCircle" className="w-5 h-5" /> Course details saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Manage Content */}
      <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Course Content</h2>
        <div className="space-y-4">
        {localModules.map((module) => (
            <div key={module.id} className="bg-brand-bg/60 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800">{module.title}</h3>
              <ul className="mt-2 space-y-2 pl-4">
              {(module.lessons ?? []).map((lesson: any) => (
                  <li key={lesson.id} className="flex items-center justify-between gap-2 text-sm text-brand-muted hover:bg-white/50 p-1 rounded-md">
                    <div className="flex items-center gap-2">
                      <Icon name={lesson.type === 'video' ? 'play' : 'document'} className="w-4 h-4 text-brand-secondary" />
                      <span>
                        {lesson.title} ({lesson.duration})
                        {lesson.isCompleted ? ' • completed' : ''}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
                        setError(null);
                        try {
                          await onDeleteLesson(course.id, lesson.id);
                          setLocalModules((prev) =>
                            prev.map((m) =>
                              m.id === module.id
                                ? { ...m, lessons: (m.lessons ?? []).filter((l: any) => l.id !== lesson.id) }
                                : m,
                            ),
                          );
                          logAuditEvent('Lesson Deleted', `Deleted lesson "${lesson.title}" from ${course.title}`, 'course');
                        } catch (err) {
                          console.error('Lesson delete failed:', err);
                          setError(err instanceof Error ? err.message : 'Failed to delete lesson');
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </li>
                ))}
                {(module.lessons ?? []).length === 0 && (
                  <p className="text-sm text-brand-muted italic">No lessons in this module yet.</p>
                )}
              </ul>

              {addingLessonToModuleId === module.id ? (
                <form onSubmit={handleAddLesson} className="mt-4 p-4 bg-white border border-brand-primary/20 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-800">Add New Lesson</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" value={newLessonData.title} onChange={handleNewLessonChange} placeholder="Lesson Title" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                    <select name="type" value={newLessonData.type} onChange={handleNewLessonChange} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm">
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <textarea name="description" value={newLessonData.description} onChange={handleNewLessonChange} placeholder="Short description of what this lesson covers (optional)" rows={2} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="duration" value={newLessonData.duration} onChange={handleNewLessonChange} placeholder="Duration (e.g., 15 min)" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                    <label className="flex items-center gap-2 text-sm text-gray-700 px-2">
                      <input type="checkbox" checked={newLessonData.isFree} onChange={(e) => setNewLessonData((p) => ({ ...p, isFree: e.target.checked }))} className="rounded" />
                      Free preview lesson
                    </label>
                  </div>

                  {newLessonData.type === 'video' ? (
                    <div className="space-y-2">
                      <input type="text" name="videoUrl" value={newLessonData.videoUrl} onChange={handleNewLessonChange} placeholder="Video URL (YouTube embed, mp4, or Cloudinary)" className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                      <p className="text-xs text-gray-500">
                        For YouTube, use the embed URL format: https://www.youtube.com/embed/VIDEO_ID
                      </p>
                    </div>
                  ) : (
                    <textarea name="content" value={newLessonData.content} onChange={handleNewLessonChange} placeholder="Lesson text content..." rows={4} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                  )}

                  <div className="flex gap-2">
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80 disabled:opacity-50">
                      {isSaving ? 'Saving…' : 'Save Lesson'}
                    </button>
                    <button type="button" onClick={() => setAddingLessonToModuleId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setAddingLessonToModuleId(module.id)} className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-brand-secondary/20 text-brand-secondary text-sm font-semibold rounded-md hover:bg-brand-secondary/30 transition-colors">
                  <Icon name="plus" className="w-4 h-4" /> Add Lesson
                </button>
              )}
            </div>
          ))}

          {localModules.length === 0 && (
            <p className="text-sm text-brand-muted italic py-4">
              No modules yet. Add one below using the "New module title..." field.
            </p>
          )}
        </div>

        <form onSubmit={handleAddModule} className="mt-6 flex items-center gap-3 pt-6 border-t border-gray-200">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="New module title..."
            className="flex-1 bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4"
          />
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50">
            {isSaving ? 'Adding…' : 'Add Module'}
          </button>
        </form>
      </div>

      {/* Manage Webinars */}
      <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Webinars</h2>
        <div className="space-y-3 mb-6">
          {(course.webinars || []).map((webinar) => (
            <div key={webinar.id} className="flex items-center justify-between bg-brand-bg/60 p-3 rounded-md border">
              <div>
                <p className="font-semibold text-gray-800">{webinar.title}</p>
                <p className="text-sm text-brand-muted">
                  {webinar.date} — <span className="capitalize font-medium">{webinar.status}</span>
                </p>
              </div>
              <button onClick={() => onDeleteWebinar(course.id, webinar.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <Icon name="trash" className="w-5 h-5" />
              </button>
            </div>
          ))}
          {(course.webinars || []).length === 0 && (
            <p className="text-center text-brand-muted py-4">No webinars scheduled yet.</p>
          )}
        </div>

        <form onSubmit={handleAddWebinar} className="p-4 bg-white border border-brand-primary/20 rounded-lg space-y-4">
          <h4 className="font-semibold text-gray-800">Add New Webinar</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="title" value={newWebinarData.title} onChange={handleNewWebinarChange} placeholder="Webinar Title" required className="md:col-span-2 w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
            <input type="text" name="date" value={newWebinarData.date} onChange={handleNewWebinarChange} placeholder="Date & Time" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="status" value={newWebinarData.status} onChange={handleNewWebinarChange} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm">
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
            </select>
            <button type="submit" className="md:col-span-2 px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80 w-full">
              Add Webinar
            </button>
          </div>
        </form>
      </div>

           {/* Manage Projects */}
           <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Manage Projects</h2>
        <p className="text-sm text-brand-muted mb-6">
          Each student gets a personalized 3-week deadline starting the day
          they complete the course. The suggested date below is only shown to
          students before they finish.
        </p>

        {/* Existing projects */}
        <div className="space-y-3 mb-6">
          {(course.projects || []).map((project: any) => (
            <div
              key={project.id}
              className="flex items-start justify-between bg-brand-bg/60 p-4 rounded-md border gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{project.title}</p>
                <p className="text-sm text-brand-muted line-clamp-2 mt-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-brand-muted">
                  {project.due_date && (
                    <span>
                      Suggested: {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {project.points_possible != null && (
                    <span>{project.points_possible} pts</span>
                  )}
                  {project.max_submissions != null && (
                    <span>{project.max_submissions} submission(s) allowed</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                <button
                  onClick={() => openSubmissions(project.id, project.title)}
                  className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors flex items-center gap-1"
                  title="View submissions"
                >
                  <Icon name="eye" className="w-4 h-4" />
                  Submissions
                </button>
                <button
                  onClick={() => handleDeleteProjectClick(project.id, project.title)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  title="Delete project"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(course.projects || []).length === 0 && (
            <p className="text-center text-brand-muted py-4">
              No projects yet. Add one below.
            </p>
          )}
        </div>

        {/* Add new project form */}
        <form
          onSubmit={handleAddProject}
          className="p-4 bg-white border border-brand-primary/20 rounded-lg space-y-4"
        >
          <h4 className="font-semibold text-gray-800">Add New Project</h4>

          <input
            type="text"
            name="title"
            value={newProjectData.title}
            onChange={handleNewProjectChange}
            placeholder="Project title (e.g., Build a Portfolio Site)"
            required
            className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
          />

          <textarea
            name="description"
            value={newProjectData.description}
            onChange={handleNewProjectChange}
            placeholder="What should the student build? Include requirements."
            rows={3}
            required
            className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
          />

          <textarea
            name="instructions"
            value={newProjectData.instructions}
            onChange={handleNewProjectChange}
            placeholder="Detailed instructions (optional)"
            rows={2}
            className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
          />

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Suggested Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={newProjectData.dueDate}
                onChange={handleNewProjectChange}
                className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
              />
              <p className="text-[10px] text-brand-muted mt-1 leading-tight">
                Shown as a hint only. Each student's real deadline is 21 days after they finish the course.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Max Submissions
              </label>
              <input
                type="number"
                name="maxSubmissions"
                min={1}
                value={newProjectData.maxSubmissions}
                onChange={handleNewProjectChange}
                className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Points Possible
              </label>
              <input
                type="number"
                name="pointsPossible"
                min={0}
                value={newProjectData.pointsPossible}
                onChange={handleNewProjectChange}
                className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80 disabled:opacity-50"
          >
            {isSaving ? 'Adding…' : 'Add Project'}
            </button>
        </form>
      </div>

      {/* Submissions Review Modal */}
      {reviewingProjectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Submissions: {reviewingProjectTitle}
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  {projectSubmissions.length} submission{projectSubmissions.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={closeSubmissions}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {loadingSubmissions && (
                <p className="text-center text-brand-muted py-8">Loading submissions…</p>
              )}

              {!loadingSubmissions && projectSubmissions.length === 0 && (
                <p className="text-center text-brand-muted py-8 italic">
                  No submissions yet for this project.
                </p>
              )}

              {!loadingSubmissions && projectSubmissions.map((submission: any) => {
                const sid = String(submission.id);
                const draft = aiDrafts[sid];
                const edited = editedGrades[sid];
                const isGrading = gradingInProgress === sid;
                const isApproving = approvingId === sid;
                const isApproved = submission.status === 'graded';
                const screenshots: string[] = Array.isArray(submission.screenshot_urls)
                  ? submission.screenshot_urls
                  : [];

                return (
                  <div key={sid} className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">
                          {submission.student?.full_name ?? 'Unknown Student'}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {submission.student?.email ?? ''}
                        </p>
                        <p className="text-xs text-brand-muted mt-1">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          {submission.is_late && (
                            <span className="text-red-600 font-semibold ml-2">LATE</span>
                          )}
                        </p>
                      </div>
                      {isApproved && (
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Graded: {submission.grade}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {submission.description && (
                      <div>
                        <p className="text-xs font-bold text-brand-muted uppercase mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {submission.description}
                        </p>
                      </div>
                    )}

                    {/* Screenshots */}
                    {screenshots.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-brand-muted uppercase mb-2">
                          Screenshots
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {screenshots.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={url}
                                alt={`screenshot ${i + 1}`}
                                className="w-32 h-32 rounded-lg object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission URL */}
                    {submission.submission_url && (
                      <div>
                        <p className="text-xs font-bold text-brand-muted uppercase mb-1">
                          URL
                        </p>
                        <a
                          href={submission.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-primary hover:underline break-all"
                        >
                          {submission.submission_url}
                        </a>
                      </div>
                    )}

                    {/* Existing grade */}
                    {isApproved && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-bold text-green-800">
                          Final Grade: {submission.grade}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-green-700 mt-1 italic">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}

                                        {/* AI grading section */}
                                        {!isApproved && (
                      <div className="border-t border-gray-200 pt-4 space-y-3">
                        {/* Case 1: No AI draft yet — offer manual trigger */}
                        {!draft && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-sm text-brand-muted italic">
                              AI grading hasn't finished yet. You can trigger it now.
                            </p>
                            <button
                              onClick={() => handleGradeWithAI(sid)}
                              disabled={isGrading}
                              className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                              <Icon name="academicCap" className="w-4 h-4" />
                              {isGrading ? 'Grading…' : 'Grade with AI'}
                            </button>
                          </div>
                        )}

                        {/* Case 2: AI report exists — show it, editable, with publish button */}
                        {draft && edited && (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="academicCap" className="w-4 h-4 text-brand-primary" />
                              <p className="text-sm font-bold text-gray-900">
                                AI Grading Report
                              </p>
                              <span className="text-xs text-brand-muted italic">
                                — review and publish
                              </span>
                            </div>

                            {draft.rubric && draft.rubric.length > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs font-bold text-blue-900 uppercase mb-2">
                                  Rubric Breakdown
                                </p>
                                <ul className="space-y-1">
                                  {draft.rubric.map((r: any, i: number) => (
                                    <li key={i} className="text-xs text-blue-900">
                                      <span className="font-semibold">{r.criterion}:</span>{' '}
                                      {r.awarded}/{r.max} — {r.notes}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                                Grade (editable)
                              </label>
                              <input
                                type="number"
                                value={edited.grade}
                                onChange={(e) =>
                                  setEditedGrades((prev) => ({
                                    ...prev,
                                    [sid]: { ...prev[sid], grade: Number(e.target.value) },
                                  }))
                                }
                                className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                                Feedback (editable)
                              </label>
                              <textarea
                                rows={6}
                                value={edited.feedback}
                                onChange={(e) =>
                                  setEditedGrades((prev) => ({
                                    ...prev,
                                    [sid]: { ...prev[sid], feedback: e.target.value },
                                  }))
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveAIGrade(sid)}
                                disabled={isApproving}
                                className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                              >
                                {isApproving ? 'Publishing…' : 'Publish to Student'}
                              </button>
                              <button
                                onClick={() => handleGradeWithAI(sid)}
                                disabled={isGrading}
                                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
                              >
                                {isGrading ? 'Re-grading…' : 'Re-run AI'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};