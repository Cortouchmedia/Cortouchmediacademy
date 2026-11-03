

import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'instructor' | 'admin' | 'superadmin';
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRoleUpdateResponse {
  message: string;
  user: AdminUser;
}

export const ApiAdmin = {
  /**
   * Change another user's role. SUPERADMIN only.
   * The backend enforces this with SuperAdminGuard.
   * 
   * @param userId - The ID of the user whose role is being changed
   * @param role - The new role (STUDENT, INSTRUCTOR, ADMIN, or SUPERADMIN)
   * @param token - The caller's access token (must belong to a SUPERADMIN)
   */
  updateUserRole: (userId: string, role: string, token: string) =>
    api.put<UserRoleUpdateResponse>(
      `/auth/users/${userId}/role`,
      { role },
      token,
    ),

  /**
   * List all users. ADMIN or SUPERADMIN only.
   * Note: this requires a `GET /api/auth/users` route on the backend.
   * If that route doesn't exist yet, this call will return a 404.
   */
  listUsers: (token: string) =>
    api.get<AdminUser[]>('/auth/users', token),

  /**
   * Fetch a single user by ID. ADMIN or SUPERADMIN only.
   * Note: requires `GET /api/auth/users/:id` on the backend.
   */
  getUser: (userId: string, token: string) =>
    api.get<AdminUser>(`/auth/users/${userId}`, token),

 
   deleteUser: (userId: string, token: string) =>
   api.delete<{ message: string }>(`/auth/users/${userId}`, token),

   listPayouts: (token: string) =>
   api.get<Array<{ id: string; instructor_id: string; amount: number; status: string }>>(
    '/admin/payouts',
      token,
    ),

  approvePayout: (payoutId: string, token: string) =>
    api.post<{ message: string }>(`/admin/payouts/${payoutId}/approve`, {}, token),

    viewAuditLogs: (token: string) =>
    api.get<Array<{ id: string; action: string; type: string; details: string; created_at: string }>>(
      '/auth/users/audit-logs', 
      token,
    ),
};

export default ApiAdmin;