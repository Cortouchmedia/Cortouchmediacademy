// src/hooks/useCourses.ts
import { useEffect, useState } from 'react';
import { Api } from '../lib/api';
import type { CourseWithEnrollment } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithEnrollment[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Api.courses.list()
      .then((rows: any) => {
        if (cancelled) return;
        setCourses(Array.isArray(rows) ? rows.map(normalizeCourse) : []);
      })
      .catch((e) => {
        console.error('Failed to load courses:', e);
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { courses, loading };
}

function normalizeCourse(row: any): CourseWithEnrollment {
  return {
    id: row.id,
    title: row.title ?? 'Untitled',
    description: row.description ?? '',
    category: row.category ?? 'General',
    instructor: row.instructor ?? row.instructor_name ?? 'Instructor',
    imageUrl: row.imageUrl ?? row.image_url ?? '',
    price: Number(row.price ?? 0),
    rating: Number(row.rating ?? 0),
    enrollmentCount: Number(row.enrollmentCount ?? row.enrollment_count ?? 0),
    duration: row.duration ?? '',
    modules: row.modules ?? 0,
    progress: 0,
    completed: false,
    content: row.content ?? [],
    projects: row.projects ?? [],
    reviews: row.reviews ?? [],
    isEnrolled: false,
    whatYouWillLearn: row.whatYouWillLearn ?? [],
    requirements: row.requirements ?? [],
    instructorBio: row.instructorBio ?? '',
  };
}