"use client";

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../../components/Icon';

export default function InstructorRevenuePage() {
  const { currentUser, courses, payoutRequests, handlePayoutRequest } = useAppContext();
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutData, setPayoutData] = useState({
    amount: 0,
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'instructor') return null;

  const instructorCourses = courses.filter(c => c.instructor === currentUser.name);
  const totalRevenue = instructorCourses.reduce((acc, curr) => acc + (curr.price * curr.enrollmentCount), 0);
  const instructorShare = totalRevenue * 0.3;
  const paidOut = payoutRequests
    .filter(r => r.instructorId === currentUser.id && r.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const availableBalance = instructorShare - paidOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutData.amount <= 0 || payoutData.amount > availableBalance) {
      setError('Invalid payout amount.');
      return;
    }
    handlePayoutRequest({
      ...payoutData,
    });
    setIsRequestingPayout(false);
    setPayoutData({ amount: 0, bankName: '', accountNumber: '', accountName: '' });
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Revenue Overview</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payouts from your courses.</p>
        </div>
        <button 
          onClick={() => setIsRequestingPayout(true)}
          disabled={availableBalance <= 0}
          className={`px-6 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${
            availableBalance > 0 
              ? 'bg-[#219BD5] text-white hover:bg-[#1a7fb0]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Icon name="creditCard" className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Total Earnings (30%)</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₦{instructorShare.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-bold mt-2">Based on ₦{totalRevenue.toLocaleString()} total sales</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Available for Payout</h3>
          <p className="text-3xl font-bold text-[#219BD5] mt-2">₦{availableBalance.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Minimum payout: ₦5,000</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Next Payout Date</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">Oct 31, 2023</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Automatic payout enabled</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Revenue History</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Last 7 Days</button>
            <button className="px-3 py-1 text-xs font-bold bg-[#219BD5] text-white rounded-lg">Last 30 Days</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Your Share (30%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {instructorCourses.length > 0 ? instructorCourses.flatMap(course => 
                // Mocking some sales for each course
                Array.from({ length: Math.min(course.enrollmentCount, 3) }).map((_, i) => ({
                  id: `${course.id}-${i}`,
                  courseTitle: course.title,
                  studentName: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown'][Math.floor(Math.random() * 4)],
                  date: new Date(Date.now() - Math.random() * 1000000000).toLocaleDateString(),
                  price: course.price,
                  share: course.price * 0.3
                }))
              ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{sale.courseTitle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{sale.studentName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">{sale.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">₦{sale.price.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-green-600">₦{sale.share.toLocaleString()}</p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No sales history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Bank Details</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payoutRequests.filter(r => r.instructorId === currentUser.id).length > 0 ? (
                payoutRequests.filter(r => r.instructorId === currentUser.id).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-500">#{String(request.id).slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{new Date(request.timestamp).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">₦{request.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.bankName}</p>
                      <p className="text-xs text-gray-500">{request.accountNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        request.status === 'approved' ? 'bg-green-50 text-green-600' :
                        request.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No payout requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRequestingPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Request Payout</h2>
              <button onClick={() => setIsRequestingPayout(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">
                  {error}
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  Available Balance: <span className="font-bold">₦{availableBalance.toLocaleString()}</span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Amount to Withdraw (NGN)</label>
                <input 
                  type="number" 
                  required 
                  min={5000}
                  max={availableBalance}
                  value={payoutData.amount}
                  onChange={e => setPayoutData({...payoutData, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Bank Name</label>
                <input 
                  type="text" 
                  required 
                  value={payoutData.bankName}
                  onChange={e => setPayoutData({...payoutData, bankName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                  placeholder="e.g. GTBank"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Account Number</label>
                <input 
                  type="text" 
                  required 
                  value={payoutData.accountNumber}
                  onChange={e => setPayoutData({...payoutData, accountNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                  placeholder="10-digit account number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Account Name</label>
                <input 
                  type="text" 
                  required 
                  value={payoutData.accountName}
                  onChange={e => setPayoutData({...payoutData, accountName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                  placeholder="Full name on account"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsRequestingPayout(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#219BD5] text-white font-bold rounded-xl hover:bg-[#1a7fb0] transition-all">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
