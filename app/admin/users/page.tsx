"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { api, authStorage } from '../../../lib/api';
import { ApiAdmin } from '../../../lib/ApiAdmin'; // 👈 Imported ApiAdmin for editing/deleting
import { useAppContext } from '../../../context/AppContext';

export default function AdminUsersPage() {
  const { currentUser } = useAppContext();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the Edit Modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUsers = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }

    try {
      const data: any = await ApiAdmin.listUsers(token);
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Allow BOTH admin and superadmin
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>;
  }

  // ---- ACTIONS ----

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authStorage.getToken();
    if (!token || !editingUser) return;

    try {
      // 1. Update the role on the backend
      await ApiAdmin.updateUserRole(editingUser.id, editingUser.role.toUpperCase(), token);
      
      // 2. Refresh the list to show the new data
      await fetchUsers();
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
      // Set role to a suspended state (or you can delete them)
      await ApiAdmin.updateUserRole(user.id, 'SUSPENDED', token);
      await fetchUsers(); // Refresh
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
      await fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-brand-muted mt-1 font-medium">Manage students, instructors, and administrators.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded border border-red-400">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#219BD5] text-white flex items-center justify-center font-bold">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                        user.role.toUpperCase() === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role.toUpperCase() === 'ADMIN' ? 'bg-orange-100 text-orange-700' :
                        user.role.toUpperCase() === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                        user.role.toUpperCase() === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser({ ...user });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Icon name="edit" className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleSuspend(user)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <Icon name="lock" className="w-4 h-4" /> {/* Need a lock icon in your Icon component */}
                        </button>

                        <button 
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Edit User Role</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.full_name || ''}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={editingUser.role.toUpperCase()}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-[#219BD5] focus:ring-0 outline-none"
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
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7bb0]"
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