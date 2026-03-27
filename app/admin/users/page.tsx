"use client";

import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Icon } from '../../../components/Icon';
import type { User } from '../../../types';

export default function AdminUsersPage() {
  const { 
    currentUser, users, courses, handleUserUpdate, handleUserDelete, handleUserAdd
  } = useAppContext();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'instructor' | 'admin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'
  });

  if (!currentUser || currentUser.role !== 'admin') return null;

  const getEnrolledCoursesForUser = (user: User) => {
    return courses.filter(course => user.enrolledCourseIds.includes(course.id));
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      handleUserUpdate(editingUser);
      setIsEditModalOpen(false);
      setEditingUser(null);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserAdd(newUser);
    setIsAddModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'
    });
  };

  const handleDeleteClick = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      handleUserDelete(userId);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-brand-muted mt-1 font-medium">Manage students, instructors, and administrators.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Icon name="plus" className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Enrollments</th>
              <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-brand-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-brand-accent/10 text-brand-accent' 
                      : 'bg-[#219BD5]/10 text-[#219BD5]'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-gray-900">{user.enrolledCourseIds.length} Courses</p>
                    <div className="flex flex-wrap gap-1">
                      {getEnrolledCoursesForUser(user).map(course => (
                        <span key={course.id} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {course.title.split(' ')[0]}...
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user.id)}
                      className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Edit User</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Avatar URL</label>
                <input 
                  type="text" 
                  value={editingUser.avatarUrl}
                  onChange={(e) => setEditingUser({ ...editingUser, avatarUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Add New User</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Avatar Seed (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. user123"
                  onChange={(e) => setNewUser({ ...newUser, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.target.value}` })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary focus:ring-0 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
