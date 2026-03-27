"use client";

import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Icon } from '../../../components/Icon';
import { motion } from 'framer-motion';

export default function AuditLogPage() {
  const { auditLogs, currentUser } = useAppContext();
  const [filter, setFilter] = useState<string>('all');

  if (!currentUser || currentUser.role !== 'admin') return null;

  const filteredLogs = filter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'course': return 'bg-green-100 text-green-700';
      case 'auth': return 'bg-purple-100 text-purple-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit Log</h1>
          <p className="text-brand-muted mt-1 font-medium">Track system events and administrative actions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {['all', 'user', 'course', 'auth', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === t 
                  ? 'bg-brand-accent text-white shadow-md' 
                  : 'text-brand-muted hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-brand-surface rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-brand-muted font-medium">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                        {log.userName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-brand-muted max-w-xs truncate" title={log.details}>
                      {log.details}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="settings" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-brand-muted font-medium">No audit logs found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
