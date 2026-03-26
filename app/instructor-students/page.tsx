"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function InstructorStudentsPage() {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== 'instructor') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Students</h1>
        <p className="text-gray-500 mt-1">Track student progress and communicate with them.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Student List</h2>
          <div className="flex gap-4">
            <input type="text" placeholder="Search students..." className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#219BD5]" />
            <button className="px-6 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Enrolled Date</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Student" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">Student {i+1}</p>
                      <p className="text-xs text-gray-500">student{i+1}@example.com</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-medium">Course Name {i+1}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">Oct {10+i}, 2023</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                      <div className="bg-[#219BD5] h-2 rounded-full" style={{ width: `${20 * (i+1)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{20 * (i+1)}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#219BD5] font-bold text-sm hover:underline">Message</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
