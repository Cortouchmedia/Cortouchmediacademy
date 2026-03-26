"use client";

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function InstructorRevenuePage() {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== 'instructor') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Revenue Overview</h1>
        <p className="text-gray-500 mt-1">Track your earnings and payouts from your courses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-gray-900">$12,450.00</p>
          <p className="text-xs text-green-600 font-bold mt-2">+15% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2">Available for Payout</h3>
          <p className="text-3xl font-bold text-gray-900">$3,200.00</p>
          <button className="mt-4 w-full py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all">Request Payout</button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2">Next Payout Date</h3>
          <p className="text-3xl font-bold text-gray-900">Oct 31, 2023</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Automatic payout enabled</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <div className="flex gap-4">
            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#219BD5]">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-mono">TXN-98234{i}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">Oct {20-i}, 2023</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-medium">Course Name {i+1}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-bold">${49.99 * (i+1)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Completed</span>
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
