"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";
import { EditCourse } from "../../../components/EditCourse";
import { Icon } from "../../../components/Icon";
import { api, authStorage } from "../../../lib/api"; 

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const instructorId = searchParams.get("instructor");
  const editCourseId = searchParams.get("edit");

  const {
    currentUser,
    courses,
    editingCourse,
    setEditingCourse,
    users,
    handleCourseUpdate,
    handleCourseDelete,
    handleModuleAdd,
    handleLessonAdd,
    handleCourseApprove,
    handleLessonDelete,
    handleWebinarAdd,
    handleWebinarDelete,
    handleInstructorCourseAdd,
    handleProjectAdd,
    handleProjectDelete,
    handleAIGrade,
    handleApproveGrade,
  } = useAppContext();

  // Approving state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Auto-open the Edit Modal if ?edit=courseId is in the URL
  useEffect(() => {
    if (editCourseId && courses.length > 0) {
      const courseToEdit = courses.find(c => String(c.id) === String(editCourseId));
      if (courseToEdit) {
        setEditingCourse(courseToEdit);
      }
    }
  }, [editCourseId, courses, setEditingCourse]);

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    return <div className="p-12 text-center text-gray-500 bg-[#f8fafc] min-h-screen">You do not have permission.</div>;
  }

    // Handle Approve Action
    const handleApprove = async (courseId: string | number) => {
      const stringId = String(courseId);
      setApprovingId(stringId);
  
      try {
        await handleCourseApprove(stringId);
        alert("Course approved successfully! It is now live.");
        // ✅ No reload — context state update re-renders this page automatically
      } catch (err: any) {
        alert(`Failed to approve course: ${err.message}`);
      } finally {
        setApprovingId(null);   // ✅ ALWAYS clear the "Approving..." spinner
      }
    };


  const filteredCourses = instructorId 
    ? courses.filter(c => String(c.instructor_id) === String(instructorId))
    : courses;


    const pendingCourses = filteredCourses.filter(
      (c) => !c.is_published && c.status?.toUpperCase() !== 'PUBLISHED'
    );
    
    const publishedCourses = filteredCourses.filter(
      (c) => c.is_published || c.status?.toUpperCase() === 'PUBLISHED'
    );


  // If editing, show the full EditCourse component
  if (editingCourse) {
    return (
      <div className="bg-[#f8fafc] min-h-screen">
        <EditCourse
          course={editingCourse}
          allCourses={courses}
          onUpdateCourse={handleCourseUpdate}
          onAddModule={handleModuleAdd}
          onAddLesson={handleLessonAdd}
          onDeleteLesson={handleLessonDelete}
          onAddWebinar={handleWebinarAdd}
          onDeleteWebinar={handleWebinarDelete}
          onAddProject={handleProjectAdd}
          onDeleteProject={handleProjectDelete}
          onAIGrade={handleAIGrade}
          onApproveGrade={handleApproveGrade}
          onBack={() => {
            setEditingCourse(null);
            if (editCourseId) router.push('/admin/courses');
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Course Management & Approvals</h1>
            <p className="text-gray-500 text-sm mt-1">Review instructor uploads and manage platform courses.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100">
               {pendingCourses.length} Pending
             </div>
             <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold border border-green-100">
               {publishedCourses.length} Published
             </div>
          </div>
        </div>

        {/* Filter Banner */}
        {instructorId && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                 <Icon name="filter" className="w-5 h-5" />
               </div>
               <div>
                 <p className="font-bold text-blue-900">Filtered View</p>
                 <p className="text-sm text-blue-700">Showing courses for this specific instructor.</p>
               </div>
             </div>
             <button 
               onClick={() => router.push('/admin/courses')} 
               className="px-4 py-2 bg-white border border-blue-200 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors shadow-sm whitespace-nowrap"
             >
               Clear Filter
             </button>
          </div>
        )}

        {/* PENDING APPROVALS SECTION */}
        {pendingCourses.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
              <Icon name="alertCircle" className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-amber-900">Pending Approvals</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingCourses.map(course => (
                <div key={course.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <Icon name="courses" className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                      <p className="text-sm text-gray-500">Instructor ID: {course.instructor_id?.slice(0,8)}... • {course.category || 'General'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEditingCourse(course)}
                      className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Review Content
                    </button>
                    <button 
                      onClick={() => handleApprove(course.id)}
                      disabled={approvingId === String(course.id)} 
                      className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {approvingId === String(course.id) ? "Approving..." : "Approve Course"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PUBLISHED COURSES SECTION */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Published Courses</h2>
          </div>
          
          {publishedCourses.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No published courses yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrollments</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {publishedCourses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.imageUrl ? (
                            <img src={course.imageUrl} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <Icon name="courses" className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{course.title}</p>
                            <p className="text-xs text-gray-500">ID: {String(course.id).slice(0,8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {course.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#219BD5]">
                          {course.enrollment_count || 0} Students
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingCourse(course)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button 
                           onClick={() => handleCourseDelete(String(course.id))}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Course"
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
          )}
        </div>
      </div>
    </div>
  );
}