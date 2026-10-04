"use client";

import { useEffect, useState } from 'react';
import type { User } from '../types';
import { Api, authStorage } from '../lib/api';

export interface PendingSubmission {
  id: string;
  submitted_at: string;
  is_late: boolean;
  student: { id: string; full_name: string | null; email: string | null } | null;
  project: { id: string; title: string } | null;
  course: { id: string; title: string } | null;
}

/**
 * Fetches pending submissions for an instructor, refreshed every 60s.
 * Shared between the sidebar badge and the header notification bell
 * so both stay in sync.
 */
export function usePendingSubmissions(user: User | null) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      setCount(0);
      setItems([]);
      setLoading(false);
      return;
    }

    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCount = () => {
      Api.projects
        .instructorSubmissions(user.id, { status: 'pending' }, token)
        .then((res: any) => {
          if (cancelled) return;
          const list: PendingSubmission[] = Array.isArray(res?.submissions)
            ? res.submissions
            : [];
          setItems(list);
          setCount(res?.counts?.pending ?? list.length);
        })
        .catch(() => {
          // Silent fail — badge keeps its last value
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id, user?.role]);

  return { count, items, loading };
}