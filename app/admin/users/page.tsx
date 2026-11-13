"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Icon } from '../../../components/Icon';
import { api, authStorage } from '../../../lib/api';
import { ApiAdmin } from '../../../lib/ApiAdmin';
import { useAppContext } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { currentUser } = useAppContext();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'student' | 'instructor'>('all');
  
  // Modals State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const fetchData = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }

    try {
      const [data, coursesData]: any = await Promise.all([
        ApiAdmin.listUsers(token),
        api.get('/courses').catch(() => [])
      ]);
      
      setUsers(Array.isArray(data) ? data : data.users || []);
      
      const courseList = Array.isArray(coursesData) ? coursesData : coursesData?.data ?? coursesData?.courses ?? [];
      setCourses(courseList);
      
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    const token = authStorage.getToken();
    if (!token) return;
  
    const students = users.filter(u => (u.role ?? '').toUpperCase() === 'STUDENT');
    if (students.length === 0) return;
  
    let cancelled = false;
  
    Promise.all(
      students.map(async (u) => {
        try {
          const res: any = await api.get(`/courses/users/${u.id}/enrollments`, token);
          const list = Array.isArray(res) ? res : res?.data ?? [];
          return { id: u.id, count: list.length };
        } catch {
          return { id: u.id, count: 0 };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      results.forEach(r => { map[r.id] = r.count; });
      setEnrollmentCounts(map);
    });
  
    return () => { cancelled = true; };
  }, [users]);

  // Calculate Course Count & List per Instructor
  const coursesByInstructor = useMemo(() => {
    const counts: Record<string, number> = {};
    const lists: Record<string, any[]> = {};
    courses.forEach((c) => {
      if (c.instructor_id) {
        counts[c.instructor_id] = (counts[c.instructor_id] || 0) + 1;
        if (!lists[c.instructor_id]) lists[c.instructor_id] = [];
        lists[c.instructor_id].push(c);
      }
    });
    return { counts, lists };
  }, [courses]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>;
  }

  // ---- ACTIONS ----

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authStorage.getToken();
    if (!token || !editingUser) return;

    try {
      await ApiAdmin.updateUserRole(editingUser.id, editingUser.role.toUpperCase(), token);
      await fetchData(); 
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleSuspend = async (user: any) => {
    const token = authStorage.getToken();
    if (!token) return;
    if (!window.confirm(`Are you sure you want to suspend ${user.full_name}?`)) return;

    try {
      await ApiAdmin.updateUserRole(user.id, 'SUSPENDED', token);
      await fetchData();
    } catch (err: any) {
      alert(`Failed to suspend user: ${err.message}`);
    }
  };

  const handleDelete = async (user: any) => {
    const token = authStorage.getToken();
    if (!token) return;
    if (!window.confirm(`Are you sure you want to DELETE ${user.full_name}? This cannot be undone.`)) return;

    try {
      await ApiAdmin.deleteUser(user.id, token);
      await fetchData();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleOpenUserProfile = async (user: any) => {
    const isStudent = (user.role ?? '').toUpperCase() === 'STUDENT';
    
    setStudentEnrollments([]);
    setLoadingEnrollments(isStudent);   // 👈 moved up
    setViewingUser(user);
  
    if (!isStudent) return;
  
    try {
      const token = authStorage.getToken();
      if (!token) return;
      
      const res: any = await api.get(`/courses/users/${user.id}/enrollments`, token);
      console.log('[DEBUG] raw response:', res);          // 👈 add this
      console.log('[DEBUG] first course:', courses[0]);    // 👈 add this
      
      const list = Array.isArray(res) ? res : res?.data ?? [];
      console.log('[DEBUG] parsed list:', list);           // 👈 add this
      setStudentEnrollments(list);
    } catch (err: any) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };


  // Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || u.role.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage permissions, review instructor uploads, and monitor student progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 flex items-center gap-2">
              <Icon name="community" className="w-4 h-4" />
              {users.length} Total Users
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Tabs */}
              <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-fit">
                {(['all', 'student', 'instructor'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                      activeTab === tab ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    }`}
                  >
                    {tab}s
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search users by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#219BD5] focus:ring-2 focus:ring-[#219BD5]/20 transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Activity & Stats</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                        
                        {/* 👈 User Details (Now clickable) */}
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleOpenUserProfile(user)}
                            className="flex items-center gap-4 text-left group/user"
                          >
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm group-hover/user:ring-2 group-hover/user:ring-[#219BD5]/30 transition-all" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#219BD5] to-[#1a7bb0] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover/user:ring-2 group-hover/user:ring-[#219BD5]/30 transition-all">
                                {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm group-hover/user:text-[#219BD5] transition-colors flex items-center gap-1.5">
                                {user.full_name || 'Unknown User'}
                                <Icon name="externalLink" className="w-3.5 h-3.5 opacity-0 group-hover/user:opacity-100 transition-opacity" />
                              </p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </button>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            user.role.toUpperCase() === 'SUPERADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            user.role.toUpperCase() === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            user.role.toUpperCase() === 'INSTRUCTOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            user.role.toUpperCase() === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Activity & Stats */}
                        <td className="px-6 py-4">
                          {user.role.toUpperCase() === 'INSTRUCTOR' ? (
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Uploads</span>
                                <span className="text-sm font-black text-gray-900">{coursesByInstructor.counts[user.id] || 0} Courses</span>
                              </div>
                              <button 
                                onClick={() => router.push(`/admin/courses?instructor=${user.id}`)}
                                className="text-xs font-bold text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                Review <Icon name="arrowRight" className="w-3 h-3" />
                              </button>
                            </div>
                          ) : user.role.toUpperCase() === 'STUDENT' ? (
                            <div className="flex items-center gap-3">
                             <div className="bg-white text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 shadow-sm flex items-center gap-1.5">
  <Icon name="bookOpen" className="w-3.5 h-3.5 text-green-500" />
  {enrollmentCounts[user.id] ?? user.enrollment_count ?? 0} Enrolled
</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingUser({ ...user });
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Edit Role"
                            >
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => handleSuspend(user)}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                              title="Suspend User"
                            >
                              <Icon name="lock" className="w-4 h-4" />
                            </button>

                            <button 
                              onClick={() => handleDelete(user)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Delete User"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- 👈 NEW: USER PROFILE MODAL --- */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="relative h-32 bg-gradient-to-r from-[#219BD5] to-[#1a7bb0]">
              <button 
                onClick={() => setViewingUser(null)} 
                className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-colors"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 pb-6">
              
              {/* Avatar & Name */}
              <div className="flex justify-between items-end -mt-12 mb-6">
                <div className="flex items-end gap-4">
                  {viewingUser.avatar_url ? (
                    <img src={viewingUser.avatar_url} alt="avatar" className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md bg-white" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-[#219BD5] text-white flex items-center justify-center text-3xl font-black shadow-md">
                      {viewingUser.full_name?.charAt(0) || viewingUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="pb-1">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{viewingUser.full_name || 'Unknown'}</h2>
                    <p className="text-sm text-gray-500">{viewingUser.email}</p>
                  </div>
                </div>
                <div className="pb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                    viewingUser.role.toUpperCase() === 'SUPERADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    viewingUser.role.toUpperCase() === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    viewingUser.role.toUpperCase() === 'INSTRUCTOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {viewingUser.role}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">User ID</p>
                  <p className="text-xs font-mono text-gray-700 truncate">{viewingUser.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Joined</p>
                  <p className="text-sm font-bold text-gray-900">
                    {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* 🔥 Role Specific Details (Courses) */}
              {viewingUser.role.toUpperCase() === 'INSTRUCTOR' && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon name="courses" className="w-4 h-4 text-blue-500" />
                    Uploaded Courses ({coursesByInstructor.counts[viewingUser.id] || 0})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {coursesByInstructor.lists[viewingUser.id]?.map(course => (
                      <div key={course.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <span className="text-sm font-bold text-gray-800 truncate pr-4">{course.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                    {(!coursesByInstructor.lists[viewingUser.id] || coursesByInstructor.lists[viewingUser.id].length === 0) && (
                      <p className="text-sm text-gray-500 italic">No courses uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Student Details */}
{viewingUser.role.toUpperCase() === 'STUDENT' && (
  <div>
    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon name="bookOpen" className="w-4 h-4 text-green-500" />
      Enrolled Courses ({studentEnrollments.length})
    </h3>

    {loadingEnrollments ? (
      <div className="space-y-2">
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    ) : studentEnrollments.length === 0 ? (
      <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl">
        This student is not enrolled in any courses yet.
      </p>
    ) : (
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {studentEnrollments.map((enr, idx) => {
          // Match the enrollment to the course list to get title/image
          const courseMeta = courses.find(
            (c) => String(c.id) === String(enr.course_id)
          );
          const progress = Math.round(Number(enr.progress_percentage ?? 0));
          const completed = progress >= 100 || !!enr.completed_at;

          return (
            <div
              key={enr.id ?? enr.course_id ?? idx}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                {courseMeta?.image_url || courseMeta?.imageUrl ? (
                  <img
                    src={courseMeta.image_url ?? courseMeta.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <Icon name="courses" className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {courseMeta?.title ?? 'Unknown Course'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${completed ? 'bg-green-500' : 'bg-[#219BD5]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                      {progress}%
                    </span>
                  </div>
                </div>
                {completed && (
                  <span className="text-[9px] font-black uppercase px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md">
                    Done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (Kept from before) --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Edit User Role</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.full_name || ''}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={editingUser.role.toUpperCase()}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Superadmin</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7bb0] transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}