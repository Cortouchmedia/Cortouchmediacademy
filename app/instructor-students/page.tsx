"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../../components/Icon';
import { Api, authStorage } from '../../lib/api';

interface InstructorStudent {
  user_id: string;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  course_count: number;
  completed_count: number;
  avg_progress: number;
  course_ids: string[];
}

export default function InstructorStudentsPage() {
  const { currentUser } = useAppContext();
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messagingStudent, setMessagingStudent] = useState<InstructorStudent | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'instructor') return;
    const token = authStorage.getToken();
    if (!token) return;

    setLoading(true);
    Api.courses
      .instructorStudents(currentUser.id, token)
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load instructor students:', err);
        setError(err?.message ?? 'Failed to load students');
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  if (!currentUser || currentUser.role !== 'instructor') return null;

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = s.user?.full_name?.toLowerCase() ?? '';
    const email = s.user?.email?.toLowerCase() ?? '';
    return name.includes(q) || email.includes(q);
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messagingStudent) return;
    // Messaging backend not built yet — show honest feedback
    alert('Messaging is not yet available. Coming soon.');
    setMessageText('');
  };

  const handleExport = () => {
    const rows = [
      ['Name', 'Email', 'Courses', 'Completed', 'Avg Progress'],
      ...filteredStudents.map((s) => [
        s.user?.full_name ?? 'Unknown',
        s.user?.email ?? '',
        String(s.course_count),
        String(s.completed_count),
        `${s.avg_progress}%`,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Students</h1>
        <p className="text-gray-500 mt-1">Track student progress across your courses.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">
            Student List ({filteredStudents.length})
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#219BD5]"
            />
            <button
              onClick={handleExport}
              disabled={filteredStudents.length === 0}
              className="px-6 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Avg Progress</th>
                <th className="px-6 py-4">Completed</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 italic">
                    {error}
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {student.user?.avatar_url ? (
                        <img
                          src={student.user.avatar_url}
                          alt={student.user.full_name ?? 'Student'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {(student.user?.full_name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">
                          {student.user?.full_name ?? 'Unknown Student'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.user?.email ?? student.user_id.slice(0, 8)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {student.course_count}{' '}
                        {student.course_count === 1 ? 'Course' : 'Courses'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-[#219BD5] h-2 rounded-full"
                          style={{ width: `${student.avg_progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{student.avg_progress}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {student.completed_count} / {student.course_count}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setMessagingStudent(student)}
                        className="text-[#219BD5] font-bold text-sm hover:underline flex items-center gap-1"
                      >
                        <Icon name="messageSquare" className="w-4 h-4" />
                        Chat
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    {searchQuery
                      ? 'No students match your search.'
                      : 'No students enrolled in your courses yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {messagingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Message {messagingStudent.user?.full_name ?? 'Student'}
              </h2>
              <button
                onClick={() => setMessagingStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Messaging is not yet available. This feature is coming soon.
              </p>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                disabled
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Coming soon..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled
                className="p-3 bg-gray-300 text-white font-bold rounded-xl cursor-not-allowed"
              >
                <Icon name="send" className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}