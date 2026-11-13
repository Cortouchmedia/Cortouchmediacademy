"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";
import { useRouter } from "next/navigation";
import { api, authStorage, ApiAdmin } from "../lib/api";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "student" | "instructor" | "admin" | "superadmin";
  avatar_url?: string | null;
  created_at?: string;
};

type Course = {
  id: string | number;
  title: string;
  category?: string;
  price?: number;
  enrollment_count?: number;
  instructor_id?: string;
};

type AuditLog = {
  id: string;
  action: string;
  type: string;
  details: string | null;
  created_at: string;
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const relativeTime = (iso?: string) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ---------------------------------------------------------------
// UI Atoms
// ---------------------------------------------------------------
const StatCard = ({ title, value, sub, icon, accent, onClick }: any) => (
  <div
    className={`bg-brand-surface p-6 rounded-xl border border-gray-200 shadow-sm transition-all ${
      onClick ? "cursor-pointer hover:shadow-md hover:border-gray-300" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${accent.bg}`}>
        <Icon name={icon} className={`w-5 h-5 ${accent.text}`} />
      </div>
      <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
        {onClick ? "View →" : "Metric"}
      </span>
    </div>
    <h3 className="text-3xl font-black text-gray-900 leading-none">{value}</h3>
    <p className="text-sm font-semibold text-gray-700 mt-2">{title}</p>
    {sub && <p className="text-xs text-brand-muted mt-1">{sub}</p>}
  </div>
);

const Card = ({ title, action, children }: any) => (
  <div className="bg-brand-surface rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="p-6 flex-1">{children}</div>
  </div>
);


const BarChart = ({ data, maxBars = 6 }: any) => {
  const trimmed = data.slice(0, maxBars);
  const max = Math.max(...trimmed.map((d: any) => d.value), 1);
  return (
    <div className="space-y-3">
      {trimmed.map((d: any) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
            <span className="truncate pr-2">{d.label}</span>
            <span className="text-brand-muted">{fmtCompact(d.value)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#219BD5] to-[#1a7bb0] rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {trimmed.length === 0 && <p className="text-sm text-brand-muted">No data yet.</p>}
    </div>
  );
};

const Donut = ({ segments, total, centerLabel }: any) => {
  let acc = 0;
  const stops = segments
    .map((s: any) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6 h-full">
      <div
        className="relative w-32 h-32 rounded-full shrink-0"
        style={{ background: total > 0 ? `conic-gradient(${stops})` : "#e5e7eb" }}
      >
        <div className="absolute inset-4 bg-brand-surface rounded-full flex flex-col items-center justify-center">
          <span className="text-xl font-black text-gray-900">{total}</span>
          <span className="text-[10px] font-bold text-brand-muted uppercase">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1 min-w-0">
        {segments.map((s: any) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-gray-700 flex-1 truncate">{s.label}</span>
            <span className="font-bold text-gray-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------
export const AdminDashboard: React.FC = () => {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  
  // 👈 Student Management State
  const [manageStudent, setManageStudent] = useState<AdminUser | null>(null);

  const fetchData = async () => {
    const token = authStorage.getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    const errs: string[] = [];
    
    // Fetch users, courses, and logs
    const [usersRes, coursesRes, logsRes] = await Promise.allSettled([
      ApiAdmin.listUsers(token),
      api.get<any>(`/courses?t=${Date.now()}`),
      ApiAdmin.viewAuditLogs(token).catch(() => []),
    ]);

    if (usersRes.status === "fulfilled") setUsers(usersRes.value ?? []);
    else { errs.push("Could not load users"); }

    if (coursesRes.status === "fulfilled") {
      const raw: any = coursesRes.value;
      setCourses(Array.isArray(raw) ? raw : raw?.data ?? raw?.courses ?? []);
    } else { errs.push("Could not load courses"); }

    if (logsRes.status === "fulfilled") setAuditLogs(logsRes.value ?? []);

    setErrors(errs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // ---------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    const token = authStorage.getToken();
    if (!token) return;
    
    try {
      await ApiAdmin.updateUserRole(userId, newRole, token);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      alert("Role updated successfully!");
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${userName}?`)) return;
    const token = authStorage.getToken();
    if (!token) return;
    
    try {
      await ApiAdmin.deleteUser(userId, token);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  // ---------------------------------------------------------------
  // Derived Metrics
  // ---------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalCourses = courses.length;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const newUsers7d = users.filter((u) => u.created_at && now - new Date(u.created_at).getTime() < 7 * day).length;
    const totalEnrollments = courses.reduce((acc, c) => acc + Number(c.enrollment_count ?? 0), 0);
    const totalRevenue = courses.reduce((acc, c) => acc + Number(c.price ?? 0) * Number(c.enrollment_count ?? 0), 0);

    const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
      const r = (u.role || "student").toLowerCase();
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    }, {});

    const topCourses = [...courses]
      .filter((c) => Number(c.enrollment_count ?? 0) > 0)
      .sort((a, b) => Number(b.enrollment_count ?? 0) - Number(a.enrollment_count ?? 0))
      .slice(0, 6)
      .map((c) => ({ label: c.title, value: Number(c.enrollment_count ?? 0) }));

    const categoryCounts = courses.reduce<Record<string, number>>((acc, c) => {
      const k = c.category || "Uncategorized";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    const recentUsers = [...users]
      .filter((u) => u.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 6);

    const coursesByInstructor = courses.reduce((acc, c) => {
      if (c.instructor_id) {
        acc[c.instructor_id] = (acc[c.instructor_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers, totalCourses, newUsers7d, totalEnrollments, totalRevenue,
      roleCounts, topCourses, topCategories, recentUsers, coursesByInstructor,
    };
  }, [users, courses]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const roleSegments = [
    { label: "Students", value: metrics.roleCounts.student ?? 0, color: "#219BD5" },
    { label: "Instructors", value: metrics.roleCounts.instructor ?? 0, color: "#10B981" },
    { label: "Admins", value: metrics.roleCounts.admin ?? 0, color: "#F59E0B" },
    { label: "Superadmins", value: metrics.roleCounts.superadmin ?? 0, color: "#EF4444" },
  ].filter((s) => s.value > 0);

  const filteredUsers = users.filter(u => 
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 10);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-brand-muted mt-1 font-medium">Live overview of your academy — updated whenever you refresh.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Icon name="refresh" className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
          <strong>Partial data: </strong>{errors.join(" · ")}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={fmtCompact(metrics.totalUsers)} sub={`+${metrics.newUsers7d} in last 7 days`} icon="community" accent={{ bg: "bg-[#219BD5]/10", text: "text-[#219BD5]" }} onClick={() => router.push("/admin/users")} />
        <StatCard title="Total Courses" value={fmtCompact(metrics.totalCourses)} sub={`${metrics.topCategories[0]?.label ?? "—"} is top category`} icon="courses" accent={{ bg: "bg-[#10B981]/10", text: "text-[#10B981]" }} onClick={() => router.push("/admin/courses")} />
        <StatCard title="Total Enrollments" value={fmtCompact(metrics.totalEnrollments)} sub="Across all courses" icon="bookOpen" accent={{ bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" }} />
        <StatCard title="Total Revenue" value={fmtCurrency(metrics.totalRevenue)} sub="Course sales (gross)" icon="trendingUp" accent={{ bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" }} onClick={() => router.push("/admin/reports")} />
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">User Management & Approvals</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage students, instructors, and course uploads.</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] transition-all"
              />
            </div>
            <button 
              onClick={() => setShowAllUsers(!showAllUsers)} 
              className="text-sm font-bold text-[#219BD5] hover:text-[#1a7bb0] whitespace-nowrap px-3 py-2 border border-[#219BD5]/20 bg-[#219BD5]/5 rounded-lg transition-colors"
            >
              {showAllUsers ? "Collapse List" : `View All (${users.length})`}
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Instructor Approvals</th>
                <th className="px-6 py-4">Student Progress</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#219BD5] to-[#1a7bb0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{u.full_name || "Unnamed User"}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                      u.role === "superadmin" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                      u.role === "admin" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      u.role === "instructor" ? "bg-blue-100 text-blue-700 border border-blue-200" : 
                      "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {u.role === "instructor" ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                          <Icon name="upload" className="w-3.5 h-3.5" />
                          {metrics.coursesByInstructor[u.id] || 0} Uploaded
                        </div>
                        <button 
                          onClick={() => router.push(`/admin/courses?instructor=${u.id}`)}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          Review
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {u.role === "student" ? (
                      <button 
                        onClick={() => setManageStudent(u)}
                        className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1.5 hover:bg-green-100 transition-colors"
                      >
                        <Icon name="bookOpen" className="w-3.5 h-3.5" />
                        View Progress
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const newRole = prompt(`Enter new role for ${u.full_name || u.email} (STUDENT, INSTRUCTOR, ADMIN, SUPERADMIN):`, u.role.toUpperCase());
                          if (newRole) handleUpdateRole(u.id, newRole.toUpperCase());
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                        title="Edit Role"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" 
                        title="Delete User"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Icon name="search" className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card title="Top Courses by Enrollment" action={<button onClick={() => router.push("/admin/courses")} className="text-xs font-bold text-[#219BD5] hover:underline">View all →</button>}>
            <BarChart data={metrics.topCourses} maxBars={6} />
          </Card>
        </div>
        <Card title="Users by Role">
          <Donut segments={roleSegments} total={metrics.totalUsers} centerLabel="Users" />
        </Card>
      </div>

      {/* Second row — recent users + top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Users" action={<button onClick={() => router.push("/admin/users")} className="text-xs font-bold text-[#219BD5] hover:underline">View all →</button>}>
            {metrics.recentUsers.length === 0 ? (
              <p className="text-sm text-brand-muted">No users yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {metrics.recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold shrink-0">
                      {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{u.full_name || "Unnamed"}</p>
                      <p className="text-xs text-brand-muted truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-brand-muted hidden sm:inline">{relativeTime(u.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card title="Courses by Category">
          <BarChart data={metrics.topCategories} maxBars={5} />
        </Card>
      </div>

      {/* Recent activity */}
      {auditLogs.length > 0 && (
        <Card title="Recent Activity" action={<button onClick={() => router.push("/admin/audit-log")} className="text-xs font-bold text-[#219BD5] hover:underline">Full log →</button>}>
          <ul className="space-y-3">
            {auditLogs.slice(0, 8).map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#219BD5] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{log.action}</p>
                  <p className="text-xs text-brand-muted truncate">{log.details || "No details provided"}</p>
                </div>
                <span className="text-xs text-brand-muted shrink-0">{relativeTime(log.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 👈 STUDENT DETAILS MODAL */}
      {manageStudent && (
        <StudentDetailsModal 
          student={manageStudent} 
          onClose={() => setManageStudent(null)} 
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// Student Details Modal
// ---------------------------------------------------------------
function StudentDetailsModal({ student, onClose }: { student: AdminUser, onClose: () => void }) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = authStorage.getToken();
      if (!token) return;

      try {
        // Fetch enrollments and certificates in parallel
        const [enrollmentsRes, certsRes] = await Promise.allSettled([
          api.get<any>(`/courses/users/${student.id}/enrollments`, token),
          api.get<any>(`/certificates/my-certificates?userId=${student.id}`, token)
        ]);

        if (enrollmentsRes.status === "fulfilled") {
          const list = Array.isArray(enrollmentsRes.value) ? enrollmentsRes.value : enrollmentsRes.value?.data ?? [];
          setEnrollments(list);
        }

        if (certsRes.status === "fulfilled") {
          const list = Array.isArray(certsRes.value) ? certsRes.value : certsRes.value?.data ?? [];
          setCertificates(list);
        }
      } catch (err) {
        console.error("Failed to load student details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student.id]);

  const handleResetPassword = async () => {
    if (!confirm(`Are you sure you want to send a password reset email to ${student.email}?`)) return;
    const token = authStorage.getToken();
    if (!token) return;

    setResetting(true);
    try {
      await ApiAdmin.resetPassword(student.id, token);
      alert(`✅ Password reset link sent successfully to ${student.email}`);
    } catch (err: any) {
      alert(`❌ Failed to reset password: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
             {student.avatar_url ? (
                <img src={student.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#219BD5] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {(student.full_name || student.email || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student.full_name || "Unnamed Student"}</h2>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5]" />
            </div>
          ) : (
            <>
              {/* Courses Enrolled */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon name="bookOpen" className="w-4 h-4 text-[#219BD5]" />
                  Enrolled Courses ({enrollments.length})
                </h3>
                {enrollments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">No courses enrolled yet.</p>
                ) : (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {enrollments.map((enr: any) => (
                      <div key={enr.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{enr.course?.title || enr.course_title || "Unknown Course"}</p>
                          <p className="text-xs text-gray-500">Progress: {enr.progress || 0}%</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${enr.completed_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {enr.completed_at ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon name="award" className="w-4 h-4 text-[#F59E0B]" />
                  Certificates Earned ({certificates.length})
                </h3>
                {certificates.length === 0 ? (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">No certificates earned yet.</p>
                ) : (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {certificates.map((cert: any) => (
                      <div key={cert.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{cert.course_title || cert.course?.title || "Certificate"}</p>
                          <p className="text-xs text-gray-500">Issued: {new Date(cert.issue_date || cert.created_at).toLocaleDateString()}</p>
                        </div>
                        <a href={cert.certificate_url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#219BD5] hover:underline">
                          View Certificate
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleResetPassword}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-bold text-sm rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Icon name="refresh" className="w-4 h-4" />
            {resetting ? "Sending..." : "Reset Password"}
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}