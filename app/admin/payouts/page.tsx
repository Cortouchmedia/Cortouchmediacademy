"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../../../components/Icon";
import { authStorage, ApiRevenue } from "../../../lib/api";
import { useAppContext } from "../../../context/AppContext";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const relativeTime = (iso?: string | null) => {
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
// Types
// ---------------------------------------------------------------
type PayoutStatus = "pending" | "processing" | "completed" | "failed";

type Payout = {
  id: string;
  instructor_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: PayoutStatus;
  reference: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
  instructor?: { id: string; full_name: string; email: string };
};

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export default function AdminPayoutsPage() {
  const router = useRouter();
  const { currentUser, isHydrated } = useAppContext();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | PayoutStatus>("all");

  // Action Modal State
  const [actionPayout, setActionPayout] = useState<Payout | null>(null);
  const [actionType, setActionType] = useState<"process" | "complete" | "fail" | null>(null);

  // View Details Modal State
  const [viewDetailsPayout, setViewDetailsPayout] = useState<Payout | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isHydrated) return;
    if (!currentUser) { router.replace("/login"); return; }
    const role = (currentUser.role ?? "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") { router.replace("/"); return; }
  }, [isHydrated, currentUser, router]);

  const fetchPayouts = async () => {
    const token = authStorage.getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await ApiRevenue.allPayouts(token);
      setPayouts(res?.payouts ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated || !currentUser) return;
    fetchPayouts();
  }, [isHydrated, currentUser?.id]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return payouts;
    return payouts.filter((p) => p.status === activeTab);
  }, [payouts, activeTab]);

  const counts = useMemo(() => {
    return {
      all: payouts.length,
      pending: payouts.filter((p) => p.status === "pending").length,
      processing: payouts.filter((p) => p.status === "processing").length,
      completed: payouts.filter((p) => p.status === "completed").length,
      failed: payouts.filter((p) => p.status === "failed").length,
    };
  }, [payouts]);

  const openAction = (payout: Payout, type: "process" | "complete" | "fail") => {
    setActionPayout(payout);
    setActionType(type);
  };

  const closeAction = () => {
    setActionPayout(null);
    setActionType(null);
  };

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Payout Requests</h1>
            <p className="text-gray-500 text-sm mt-1">
              Review and process instructor payout requests.
            </p>
          </div>
          <button
            onClick={fetchPayouts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="refresh" className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex gap-1 overflow-x-auto">
          {(["all", "pending", "processing", "completed", "failed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold rounded-lg capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-[#219BD5] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab} <span className="opacity-70">({counts[tab]})</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Net</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No {activeTab === "all" ? "" : activeTab} payouts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">
                          {p.instructor?.full_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.instructor?.email ?? p.instructor_id.slice(0, 8)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{fmtCurrency(p.amount)}</p>
                        <p className="text-xs text-gray-400">Fee: {fmtCurrency(p.fee)}</p>
                      </td>

                      <td className="px-6 py-4 font-bold text-green-700">
                        {fmtCurrency(p.net_amount)}
                      </td>

                      {/* 👈 UPDATED BANK COLUMN */}
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {p.bank_name && p.bank_name !== "Not provided" ? (
                          <div>
                            <p className="font-semibold text-gray-800">{p.bank_name}</p>
                            <p>{p.account_number || "No account number"}</p>
                            <button
                              onClick={() => setViewDetailsPayout(p)}
                              className="text-[#219BD5] hover:underline font-bold mt-1"
                            >
                              View Full Details
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">No bank on file</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        {relativeTime(p.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "pending" && (
                            <>
                              <button
                                onClick={() => openAction(p, "process")}
                                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => openAction(p, "fail")}
                                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Fail
                              </button>
                            </>
                          )}
                          {p.status === "processing" && (
                            <>
                              <button
                                onClick={() => openAction(p, "complete")}
                                className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => openAction(p, "fail")}
                                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Fail
                              </button>
                            </>
                          )}
                          {(p.status === "completed" || p.status === "failed") && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process/Complete/Fail Action Modal */}
      {actionPayout && actionType && (
        <ActionModal
          payout={actionPayout}
          type={actionType}
          adminId={currentUser?.id ?? ""}
          onClose={closeAction}
          onSuccess={() => { closeAction(); fetchPayouts(); }}
        />
      )}

      {/* 👈 VIEW DETAILS MODAL */}
      {viewDetailsPayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Payout Bank Details</h2>
              <button onClick={() => setViewDetailsPayout(null)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Bank Name</p>
                  <p className="text-sm font-bold text-gray-900">{viewDetailsPayout.bank_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Account Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{viewDetailsPayout.account_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Account Name</p>
                  <p className="text-sm font-bold text-gray-900">{viewDetailsPayout.account_name || "Not provided"}</p>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Instructor Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {viewDetailsPayout.notes || "No additional notes provided."}
                </p>
              </div>

              <button
                onClick={() => setViewDetailsPayout(null)}
                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------
function StatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------
// Action Modal
// ---------------------------------------------------------------
function ActionModal({
  payout,
  type,
  adminId,
  onClose,
  onSuccess,
}: {
  payout: Payout;
  type: "process" | "complete" | "fail";
  adminId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reference, setReference] = useState(payout.reference ?? "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = authStorage.getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      if (type === "process") {
        await ApiRevenue.processPayout(
          {
            payout_id: payout.id,
            admin_id: adminId,
            reference: reference || undefined,
          },
          token,
        );
      } else if (type === "complete") {
        if (!reference.trim()) {
          setError("Bank transaction reference is required");
          setSubmitting(false);
          return;
        }
        await ApiRevenue.completePayout(payout.id, reference.trim(), token);
      } else if (type === "fail") {
        if (!reason.trim()) {
          setError("Please enter a reason");
          setSubmitting(false);
          return;
        }
        await ApiRevenue.failPayout(payout.id, reason.trim(), token);
      }

      alert(
        type === "process"
          ? "Payout is now processing"
          : type === "complete"
            ? "Payout completed successfully"
            : "Payout marked as failed. Earnings returned to available balance.",
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? `Failed to ${type} payout`);
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    process: "Process Payout",
    complete: "Complete Payout",
    fail: "Fail Payout",
  };

  const descriptions = {
    process: "Mark this payout as processing. You can complete it once the bank transfer is done.",
    complete: "Confirm the bank transfer was successful. The instructor's earnings will be marked as paid.",
    fail: "Reject this payout. The instructor's earnings will be returned to their available balance.",
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900">{titles[type]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Instructor</span>
              <span className="font-bold text-gray-900">
                {payout.instructor?.full_name ?? "Unknown"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">{fmtCurrency(payout.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Net to instructor</span>
              <span className="font-bold text-green-700">{fmtCurrency(payout.net_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Bank</span>
              <span className="font-bold text-gray-900">{payout.bank_name || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account</span>
              <span className="font-mono text-gray-900">{payout.account_number || "N/A"}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">{descriptions[type]}</p>

          {type === "process" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Reference (optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Bank transaction reference"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
              />
            </div>
          )}

          {type === "complete" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Bank Reference *
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TRX-12345678"
                required
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none"
              />
            </div>
          )}

          {type === "fail" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="e.g. Invalid bank details"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#219BD5] focus:ring-1 focus:ring-[#219BD5] outline-none resize-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2.5 font-bold rounded-lg transition-colors disabled:opacity-50 ${
                type === "fail"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : type === "complete"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? "Processing…" : titles[type]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}