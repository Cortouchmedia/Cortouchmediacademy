"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../../../components/Icon";
import { api, authStorage, ApiAdmin, ApiRevenue } from "../../../lib/api";
import { useAppContext } from "../../../context/AppContext";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

type Instructor = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url?: string | null;
};

type Summary = {
  total_earnings: number;
  total_platform_fees: number;
  available_balance: number;
  pending_balance: number;
  paid_balance: number;
  this_month_earnings: number;
  top_courses: Array<{ course_id: string; title: string; earnings: number }>;
  total_transactions: number;
};

type Stats = {
  total_platform_fees: number;
  total_payouts_processed: number;
  pending_payouts: number;
  active_instructors: number;
};

export default function AdminEarningsPage() {
  const router = useRouter();
  const { currentUser, isHydrated } = useAppContext();

  const [stats, setStats] = useState<Stats | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loading, setLoading] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [initiateOpen, setInitiateOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentUser) { router.replace("/login"); return; }
    const role = (currentUser.role ?? "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") { router.replace("/"); return; }
  }, [isHydrated, currentUser, router]);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    (async () => {
      try {
        const [platformStats, users] = await Promise.all([
          ApiRevenue.platformStats(token).catch(() => null),
          ApiAdmin.listUsers(token),
        ]);
        setStats(platformStats);
        const instructorList = (users || [])
          .filter((u: any) => (u.role ?? "").toUpperCase() === "INSTRUCTOR")
          .map((u: any) => ({
            id: u.id,
            full_name: u.full_name ?? u.email,
            email: u.email,
            avatar_url: u.avatar_url ?? null,
          }));
        setInstructors(instructorList);
      } catch (err: any) {
        setError(err.message ?? "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (instructors.length === 0) return;
    const token = authStorage.getToken();
    if (!token) return;

    setLoadingSummaries(true);
    let cancelled = false;

    Promise.all(
      instructors.map(async (i) => {
        try {
          const s = await ApiRevenue.instructorSummary(i.id, token);
          return { id: i.id, summary: s };
        } catch {
          return { id: i.id, summary: null };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, Summary> = {};
      results.forEach((r) => { if (r.summary) map[r.id] = r.summary; });
      setSummaries(map);
      setLoadingSummaries(false);
    });

    return () => { cancelled = true; };
  }, [instructors]);

  const filtered = useMemo(
    () =>
      instructors.filter(
        (i) =>
          (i.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [instructors, searchQuery],
  );

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#219BD5]" />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Instructor Earnings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Track what each instructor earned and pay them out.
            </p>
          </div>
          <button
            onClick={() => setInitiateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7bb0] transition-colors shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" /> Initiate Payout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Icon name="trendingUp" className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase">Platform Revenue</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {fmtCurrency(stats?.total_platform_fees ?? 0)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon name="check" className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Paid Out</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {fmtCurrency(stats?.total_payouts_processed ?? 0)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Icon name="clock" className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase">Pending Payouts</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {fmtCurrency(stats?.pending_payouts ?? 0)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Icon name="community" className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase">Active Instructors</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {stats?.active_instructors ?? 0}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#219BD5] focus:ring-2 focus:ring-[#219BD5]/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Earned</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Platform Fee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pending</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No instructors found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((i) => {
                    const s = summaries[i.id];
                    return (
                      <tr key={i.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {i.avatar_url ? (
                              <img src={i.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#219BD5] text-white flex items-center justify-center font-bold">
                                {(i.full_name || i.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{i.full_name}</p>
                              <p className="text-xs text-gray-500">{i.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {loadingSummaries && !s ? "…" : fmtCurrency(s?.total_earnings ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                          {loadingSummaries && !s ? "…" : fmtCurrency(s?.total_platform_fees ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-700 font-bold">
                          {loadingSummaries && !s ? "…" : fmtCurrency(s?.available_balance ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-amber-700 font-semibold">
                          {loadingSummaries && !s ? "…" : fmtCurrency(s?.pending_balance ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-700 font-semibold">
                          {loadingSummaries && !s ? "…" : fmtCurrency(s?.paid_balance ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedInstructor(i)}
                              className="text-xs font-bold text-gray-700 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => { setSelectedInstructor(i); setInitiateOpen(true); }}
                              disabled={!s || s.available_balance <= 0}
                              className="text-xs font-bold text-white bg-[#219BD5] px-3 py-1.5 rounded-lg hover:bg-[#1a7bb0] transition-colors disabled:opacity-40"
                            >
                              Pay
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedInstructor && !initiateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedInstructor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">{selectedInstructor.full_name}</h2>
              <button onClick={() => setSelectedInstructor(null)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const s = summaries[selectedInstructor.id];
                if (!s) return <p className="text-gray-500 text-sm">Loading…</p>;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total</p>
                        <p className="text-lg font-black">{fmtCurrency(s.total_earnings)}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Available</p>
                        <p className="text-lg font-black text-green-700">{fmtCurrency(s.available_balance)}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Pending</p>
                        <p className="text-lg font-black text-amber-700">{fmtCurrency(s.pending_balance)}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Paid</p>
                        <p className="text-lg font-black text-blue-700">{fmtCurrency(s.paid_balance)}</p>
                      </div>
                    </div>

                    {s.top_courses.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Top Courses</p>
                        <div className="space-y-2">
                          {s.top_courses.map((c) => (
                            <div key={c.course_id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-800 truncate">{c.title}</span>
                              <span className="text-sm font-bold text-gray-900">{fmtCurrency(c.earnings)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setInitiateOpen(true)}
                      disabled={s.available_balance <= 0}
                      className="w-full py-2.5 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7bb0] transition-colors disabled:opacity-50"
                    >
                      Initiate Payout ({fmtCurrency(s.available_balance)})
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Initiate payout modal */}
      {initiateOpen && (
        <InitiatePayoutModal
          instructors={instructors}
          preselected={selectedInstructor}
          summaries={summaries}
          onClose={() => { setInitiateOpen(false); setSelectedInstructor(null); }}
          onSuccess={() => { setInitiateOpen(false); setSelectedInstructor(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function InitiatePayoutModal({
  instructors, preselected, summaries, onClose, onSuccess,
}: {
  instructors: Instructor[];
  preselected: Instructor | null;
  summaries: Record<string, Summary>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [instructorId, setInstructorId] = useState(preselected?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSummary = summaries[instructorId];
  const max = selectedSummary?.available_balance ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = authStorage.getToken();
    if (!token) return;
    const amt = Number(amount);
    if (!instructorId) return setError("Select an instructor");
    if (!amt || amt <= 0) return setError("Amount must be greater than 0");
    if (amt > max) return setError(`Amount exceeds available balance (${max})`);

    setSubmitting(true);
    try {
      await ApiRevenue.adminInitiatePayout(
        { instructor_id: instructorId, amount: amt, reference: reference || undefined, notes: notes || undefined },
        token,
      );
      alert("Payout initiated successfully");
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to initiate payout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900">Initiate Payout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructor</label>
            <select
              value={instructorId}
              onChange={(e) => { setInstructorId(e.target.value); setAmount(""); }}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
            >
              <option value="">Select instructor…</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name} ({i.email})</option>
              ))}
            </select>
          </div>

          {selectedSummary && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-semibold">
                Available balance: <span className="font-black">{fmtCurrency(max)}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              max={max}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
            />
            {selectedSummary && (
              <button
                type="button"
                onClick={() => setAmount(String(max))}
                className="mt-1 text-xs font-bold text-[#219BD5] hover:underline"
              >
                Use full balance
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reference (optional)</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Bank transaction ref"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-bold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7bb0] disabled:opacity-50">
              {submitting ? "Processing…" : "Initiate Payout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}