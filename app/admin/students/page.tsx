"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "../../../components/Icon";
import { authStorage, ApiAdmin, api } from "../../../lib/api";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

export default function ManageStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for the details modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const token = authStorage.getToken();
      if (!token) { router.push("/login"); return; }

      try {
        const users = await ApiAdmin.listUsers(token);
        // Filter only students
        const studentList = users.filter(u => u.role.toLowerCase() === "student");
        setStudents(studentList);
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [router]);

  const filteredStudents = students.filter(s => 
    (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manage Students</h1>
          <p className="text-gray-500 text-sm mt-1">View student progress, enrolled courses, and reset passwords.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5] mx-auto" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No students found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#219BD5] to-[#1a7bb0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {(student.full_name || student.email || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{student.full_name || "Unnamed Student"}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.created_at ? new Date(student.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-xs font-bold text-white bg-[#219BD5] hover:bg-[#1a7bb0] px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Student Details Modal (Courses, Certificates, Reset Password)
// ---------------------------------------------------------------
function StudentDetailsModal({ student, onClose }: { student: Student, onClose: () => void }) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = authStorage.getToken();
      if (!token) return;

      try {
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
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student.id]);

  const handleResetPassword = async () => {
    if (!confirm(`Send a password reset link to ${student.email}?`)) return;
    const token = authStorage.getToken();
    if (!token) return;

    setResetting(true);
    try {
      await ApiAdmin.resetPassword(student.id, token);
      alert(`✅ Password reset link sent to ${student.email}`);
    } catch (err: any) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5]" />
            </div>
          ) : (
            <>
              {/* Courses */}
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
      <p className="font-bold text-gray-900 text-sm">{cert.course?.title || cert.metadata?.course_title || "Certificate"}</p>
      <p className="text-xs text-gray-500">Issued: {new Date(cert.issue_date || cert.created_at).toLocaleDateString()}</p>
      <p className="text-xs text-gray-400 font-mono">#{cert.certificate_number}</p>
    </div>
    

    <a 
      href={`/verify-certificate/${cert.verification_code}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-xs font-bold text-[#219BD5] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
    >
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