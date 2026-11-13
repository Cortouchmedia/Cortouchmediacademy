"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../../components/Icon';
import { authStorage, ApiRevenue } from '../../lib/api';

export default function InstructorRevenuePage() {
  const { currentUser, courses } = useAppContext();
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [payoutData, setPayoutData] = useState({
    amount: 0,
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Real data states
  const [realEarnings, setRealEarnings] = useState({ total: 0, available: 0, paid: 0 });
  const [realPayouts, setRealPayouts] = useState<any[]>([]); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 👈 Fetch real data
  const fetchData = async () => {
    const token = authStorage.getToken();
    if (!token || !currentUser?.id) {
      setIsLoadingData(false);
      return;
    }

    try {
      const summary = await ApiRevenue.instructorSummary(currentUser.id, token);
      const payoutsRes = await ApiRevenue.getPayouts(currentUser.id, token);
      
      setRealEarnings({
        total: summary.total_earnings || 0,
        available: summary.available_balance || 0,
        // 👈 Prevent the paid amount from flickering to 0
        paid: summary.paid_balance ?? 0, 
      });
      setRealPayouts(payoutsRes.payouts || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.id]);

  if (!currentUser || currentUser.role !== 'instructor') return null;

  const instructorCourses = courses.filter(c => c.instructor === currentUser.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const safeAmount = Math.floor(Number(payoutData.amount));

    if (!safeAmount || isNaN(safeAmount) || safeAmount <= 0 || safeAmount > realEarnings.available) {
      setError('Invalid payout amount. Please enter a valid number.');
      return;
    }

    const token = authStorage.getToken();
    if (!token) {
      setError('You are not logged in.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await ApiRevenue.requestPayout({
        instructor_id: currentUser.id,
        amount: safeAmount,
        notes: `Bank: ${payoutData.bankName}, Acct: ${payoutData.accountNumber}, Name: ${payoutData.accountName}`
      }, token);

      // 👈 Optimistic Update: Immediately deduct the balance on the screen
      setRealEarnings(prev => ({
        ...prev,
        available: prev.available - safeAmount,
      }));

      setSuccessMessage('✅ Payout requested successfully!');
      setPayoutData({ amount: 0, bankName: '', accountNumber: '', accountName: '' });
      
      // 👈 Wait 1.5 seconds before fetching the real data so Supabase finishes writing
      setTimeout(() => {
        fetchData(); 
      }, 1500);
      
      setTimeout(() => {
        setIsRequestingPayout(false);
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit payout request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="p-8 text-center text-gray-500">Loading real revenue data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Revenue Overview</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payouts from your courses.</p>
        </div>
        <button 
          onClick={() => setIsRequestingPayout(true)}
          disabled={realEarnings.available <= 0}
          className={`px-6 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${
            realEarnings.available > 0 
              ? 'bg-[#219BD5] text-white hover:bg-[#1a7fb0]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Icon name="creditCard" className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Total Earnings (30%)</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₦{realEarnings.total.toLocaleString()}</p>
          <p className="text-xs text-green-600 font-bold mt-2">Calculated from real sales</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Available for Payout</h3>
          <p className="text-3xl font-bold text-[#219BD5] mt-2">₦{realEarnings.available.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Minimum payout: ₦5,000</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Paid Out</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₦{realEarnings.paid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-bold mt-2">Completed payouts</p>
        </div>
      </div>

      {/* Revenue History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Revenue History</h2>
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
                  <td className="px-6 py-4"><p className="text-sm font-bold text-gray-900">{sale.courseTitle}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">{sale.studentName}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-500">{sale.date}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">₦{sale.price.toLocaleString()}</p></td>
                  <td className="px-6 py-4"><p className="text-sm font-bold text-green-600">₦{sale.share.toLocaleString()}</p></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No sales history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REAL PAYOUT HISTORY TABLE */}
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
              {realPayouts.length > 0 ? (
                realPayouts.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><p className="text-sm font-mono text-gray-500">#{String(request.id).slice(0, 8)}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p></td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-gray-900">₦{request.amount.toLocaleString()}</p></td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.bank_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{request.account_number || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        request.status === 'completed' ? 'bg-green-50 text-green-600' :
                        request.status === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No payout requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">{error}</div>}
              {successMessage && <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-sm font-medium rounded-xl">{successMessage}</div>}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">Real Available Balance: <span className="font-bold">₦{realEarnings.available.toLocaleString()}</span></p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Amount to Withdraw (NGN)</label>
                <input type="number" required min={5000} max={realEarnings.available} value={payoutData.amount === 0 ? '' : payoutData.amount} onChange={e => setPayoutData({...payoutData, amount: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Bank Name</label>
                <input type="text" required value={payoutData.bankName} onChange={e => setPayoutData({...payoutData, bankName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none" placeholder="e.g. GTBank" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Account Number</label>
                <input type="text" required value={payoutData.accountNumber} onChange={e => setPayoutData({...payoutData, accountNumber: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none" placeholder="10-digit account number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Account Name</label>
                <input type="text" required value={payoutData.accountName} onChange={e => setPayoutData({...payoutData, accountName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none" placeholder="Full name on account" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsRequestingPayout(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#219BD5] text-white font-bold rounded-xl hover:bg-[#1a7fb0] transition-all disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}