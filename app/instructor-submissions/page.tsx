"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../../components/Icon';
import { Api, authStorage } from '../../lib/api';

type StatusFilter = 'pending' | 'graded' | 'all';

interface InstructorSubmission {
  id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_rubric: any[] | null;
  ai_grade_status: string | null;
  is_late: boolean;
  submitted_at: string;
  description: string | null;
  screenshot_urls: string[] | null;
  submission_url: string | null;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  project: { id: string; title: string; course_id: string } | null;
  course: { id: string; title: string } | null;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function InstructorSubmissionsPage() {
  const { currentUser, handleAIGrade, handleApproveGrade } = useAppContext();

  const [submissions, setSubmissions] = useState<InstructorSubmission[]>([]);
  const [counts, setCounts] = useState({ pending: 0, graded: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Per-submission editing state used by the modal
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [aiDrafts, setAiDrafts] = useState<
    Record<string, { score: number; feedback: string; rubric: any[] }>
  >({});
  const [editedGrades, setEditedGrades] = useState<
    Record<string, { grade: number; feedback: string }>
  >({});
  const [gradingInProgress, setGradingInProgress] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!currentUser) return;
    const token = authStorage.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res: any = await Api.projects.instructorSubmissions(
        currentUser.id,
        { status: statusFilter, courseId: courseFilter || undefined },
        token,
      );

      const list: InstructorSubmission[] = Array.isArray(res?.submissions)
        ? res.submissions
        : [];
      setSubmissions(list);
      setCounts(res?.counts ?? { pending: 0, graded: 0, total: 0 });

      // Pre-populate AI drafts from existing submissions
      const drafts: Record<string, { score: number; feedback: string; rubric: any[] }> = {};
      const grades: Record<string, { grade: number; feedback: string }> = {};
      list.forEach((s) => {
        if (s.ai_score != null || s.ai_feedback) {
          drafts[s.id] = {
            score: Number(s.ai_score ?? 0),
            feedback: String(s.ai_feedback ?? ''),
            rubric: Array.isArray(s.ai_rubric) ? s.ai_rubric : [],
          };
          grades[s.id] = {
            grade: Number(s.grade ?? s.ai_score ?? 0),
            feedback: String(s.feedback ?? s.ai_feedback ?? ''),
          };
        }
      });
      setAiDrafts(drafts);
      setEditedGrades(grades);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError(err?.message ?? 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, statusFilter, courseFilter]);

  // Unique courses for the filter dropdown (from the loaded submissions)
  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => {
      if (s.course?.id) map.set(s.course.id, s.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [submissions]);

  const handleGradeWithAI = async (submissionId: string) => {
    setGradingInProgress(submissionId);
    setError(null);
    try {
      const result = await handleAIGrade(submissionId);
      setAiDrafts((prev) => ({ ...prev, [submissionId]: result }));
      setEditedGrades((prev) => ({
        ...prev,
        [submissionId]: { grade: result.score, feedback: result.feedback },
      }));
    } catch (err: any) {
      console.error('AI grading failed:', err);
      setError(err instanceof Error ? err.message : 'AI grading failed');
    } finally {
      setGradingInProgress(null);
    }
  };

  const handlePublish = async (submissionId: string) => {
    const edited = editedGrades[submissionId];
    if (!edited) return;
    setApprovingId(submissionId);
    setError(null);
    try {
      await handleApproveGrade(submissionId, edited.grade, edited.feedback);
      setReviewingId(null);
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Publish failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish grade');
    } finally {
      setApprovingId(null);
    }
  };

  const reviewingSubmission = useMemo(
    () => submissions.find((s) => s.id === reviewingId) ?? null,
    [submissions, reviewingId],
  );

  if (!currentUser || currentUser.role !== 'instructor') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Submissions</h1>
        <p className="text-gray-500 mt-1">
          Review project submissions across all your courses. Publish AI grades
          to students.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(['pending', 'graded', 'all'] as StatusFilter[]).map((sf) => (
            <button
              key={sf}
              onClick={() => setStatusFilter(sf)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                statusFilter === sf
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sf === 'pending' && `Pending (${counts.pending})`}
              {sf === 'graded' && `Graded (${counts.graded})`}
              {sf === 'all' && `All (${counts.total})`}
            </button>
          ))}
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">All Courses</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-12 text-center text-gray-500">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="p-12 text-center text-gray-500 italic">
            {statusFilter === 'pending'
              ? 'No pending submissions. Great work!'
              : 'No submissions found.'}
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => {
                const isGraded = s.status === 'graded';
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {s.student?.full_name ?? 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.student?.email ?? ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {s.course?.title ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {s.project?.title ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatRelativeTime(s.submitted_at)}
                      {s.is_late && (
                        <span className="ml-2 text-red-600 font-semibold">
                          LATE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isGraded ? (
                        <span className="px-2 py-1 text-xs font-bold bg-green-50 text-green-700 rounded-full">
                          Graded: {s.grade}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold bg-yellow-50 text-yellow-700 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setReviewingId(s.id)}
                        className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors"
                      >
                        {isGraded ? 'View' : 'Review'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {reviewingSubmission.student?.full_name ?? 'Student'} —{' '}
                  {reviewingSubmission.project?.title ?? 'Project'}
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  {reviewingSubmission.course?.title ?? ''} ·{' '}
                  {formatRelativeTime(reviewingSubmission.submitted_at)}
                </p>
              </div>
              <button
                onClick={() => setReviewingId(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Description */}
              {reviewingSubmission.description && (
                <div>
                  <p className="text-xs font-bold text-brand-muted uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {reviewingSubmission.description}
                  </p>
                </div>
              )}

              {/* Screenshots */}
              {Array.isArray(reviewingSubmission.screenshot_urls) &&
                reviewingSubmission.screenshot_urls.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-brand-muted uppercase mb-2">
                      Screenshots
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {reviewingSubmission.screenshot_urls.map((url, i) => (
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

              {/* URL */}
              {reviewingSubmission.submission_url && (
                <div>
                  <p className="text-xs font-bold text-brand-muted uppercase mb-1">
                    URL
                  </p>
                  <a
                    href={reviewingSubmission.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary hover:underline break-all"
                  >
                    {reviewingSubmission.submission_url}
                  </a>
                </div>
              )}

              {/* Already graded */}
              {reviewingSubmission.status === 'graded' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-bold text-green-800">
                    Final Grade: {reviewingSubmission.grade}
                  </p>
                  {reviewingSubmission.feedback && (
                    <p className="text-sm text-green-700 mt-1 italic">
                      {reviewingSubmission.feedback}
                    </p>
                  )}
                </div>
              )}

              {/* AI grading section */}
              {reviewingSubmission.status !== 'graded' && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {!aiDrafts[reviewingSubmission.id] && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm text-brand-muted italic">
                        AI grading hasn't finished yet. You can trigger it now.
                      </p>
                      <button
                        onClick={() => handleGradeWithAI(reviewingSubmission.id)}
                        disabled={gradingInProgress === reviewingSubmission.id}
                        className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Icon name="academicCap" className="w-4 h-4" />
                        {gradingInProgress === reviewingSubmission.id
                          ? 'Grading…'
                          : 'Grade with AI'}
                      </button>
                    </div>
                  )}

                  {aiDrafts[reviewingSubmission.id] &&
                    editedGrades[reviewingSubmission.id] && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            name="academicCap"
                            className="w-4 h-4 text-brand-primary"
                          />
                          <p className="text-sm font-bold text-gray-900">
                            AI Grading Report
                          </p>
                          <span className="text-xs text-brand-muted italic">
                            — review and publish
                          </span>
                        </div>

                        {aiDrafts[reviewingSubmission.id].rubric?.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-900 uppercase mb-2">
                              Rubric Breakdown
                            </p>
                            <ul className="space-y-1">
                              {aiDrafts[reviewingSubmission.id].rubric.map(
                                (r: any, i: number) => (
                                  <li
                                    key={i}
                                    className="text-xs text-blue-900"
                                  >
                                    <span className="font-semibold">
                                      {r.criterion}:
                                    </span>{' '}
                                    {r.awarded}/{r.max} — {r.notes}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                            Grade (editable)
                          </label>
                          <input
                            type="number"
                            value={editedGrades[reviewingSubmission.id].grade}
                            onChange={(e) =>
                              setEditedGrades((prev) => ({
                                ...prev,
                                [reviewingSubmission.id]: {
                                  ...prev[reviewingSubmission.id],
                                  grade: Number(e.target.value),
                                },
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
                            value={editedGrades[reviewingSubmission.id].feedback}
                            onChange={(e) =>
                              setEditedGrades((prev) => ({
                                ...prev,
                                [reviewingSubmission.id]: {
                                  ...prev[reviewingSubmission.id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handlePublish(reviewingSubmission.id)
                            }
                            disabled={
                              approvingId === reviewingSubmission.id
                            }
                            className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                          >
                            {approvingId === reviewingSubmission.id
                              ? 'Publishing…'
                              : 'Publish to Student'}
                          </button>
                          <button
                            onClick={() =>
                              handleGradeWithAI(reviewingSubmission.id)
                            }
                            disabled={
                              gradingInProgress === reviewingSubmission.id
                            }
                            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
                          >
                            {gradingInProgress === reviewingSubmission.id
                              ? 'Re-grading…'
                              : 'Re-run AI'}
                          </button>
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}