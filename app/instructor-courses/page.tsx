"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/navigation';

export default function InstructorCoursesPage() {
  const { currentUser, courses, handleCourseSelect } = useAppContext();
  const router = useRouter();

  if (!currentUser || currentUser.role !== 'instructor') return null;

  const instructorCourses = courses.filter(c => c.instructor === currentUser.name);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Courses</h1>
        <p className="text-gray-500 mt-1">Manage and edit your course content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructorCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            handleCourseSelect(course);
            router.push(`/course/${course.id}`);
          }}>
            <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{course.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{course.enrollmentCount.toLocaleString()} students</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button className="flex-1 py-2 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all">Edit</button>
                <button className="flex-1 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all">View</button>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-12 text-center hover:border-[#219BD5] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <span className="text-2xl text-[#219BD5]">+</span>
          </div>
          <h3 className="font-bold text-gray-900">Create New Course</h3>
          <p className="text-sm text-gray-500 mt-1">Start building your next masterpiece.</p>
        </div>
      </div>
    </div>
  );
}
