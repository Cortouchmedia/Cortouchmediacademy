"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { Course, User, CourseWithEnrollment } from '../types';
import { CertificateModal } from './CertificateModal';
import { Api, authStorage } from '../lib/api';

interface CertificatesProps {
  user: User;
  courses: CourseWithEnrollment[];
}

interface RealCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issue_date: string;
  verification_code: string;
}

export const Certificates: React.FC<CertificatesProps> = ({ user, courses }) => {
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);
  const [certificates, setCertificates] = useState<RealCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    Api.certificates
      .mine(user.id, token)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setCertificates(list);
      })
      .catch((err) => {
        console.error('Failed to load certificates:', err);
        setCertificates([]);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const issuedByCourseId = new Map(
    certificates.map((c) => [String(c.course_id), c]),
  );

  const earnedCourses = courses.filter((c) =>
    issuedByCourseId.has(String(c.id)),
  );

  return (
    <>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Certificates &amp; Achievements
          </h1>
          <p className="text-brand-muted mt-1">
            Showcase your skills and milestones.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            My Certificates
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-brand-muted">Loading certificates…</p>
              </div>
            ) : earnedCourses.length > 0 ? (
              earnedCourses.map((course) => {
                const cert = issuedByCourseId.get(String(course.id));
                const issuedDate = cert?.issue_date
                  ? new Date(cert.issue_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—';
                return (
                  <div
                    key={course.id}
                    className="bg-white p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        {course.category}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued {issuedDate}
                        {cert?.certificate_number && (
                          <> · Cert # {cert.certificate_number}</>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCertificateCourse(course)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
                      >
                        <Icon name="award" className="w-4 h-4" />
                        <span>View Certificate</span>
                      </button>

                      {cert?.verification_code && (
                        <a
                          href={`/verify-certificate/${cert.verification_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-primary text-brand-primary text-sm font-semibold rounded-lg hover:bg-brand-primary/5 transition-colors whitespace-nowrap"
                          title="Share this URL with employers to verify the certificate"
                        >
                          <Icon name="share" className="w-4 h-4" />
                          <span>Share Link</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Icon
                  name="certificates"
                  className="w-12 h-12 text-brand-muted mx-auto mb-4"
                />
                <p className="text-brand-muted">
                  You have not earned any certificates yet.
                </p>
                <p className="text-sm text-brand-muted mt-1">
                  Complete a course to earn your first one!
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            My Badges
          </h2>
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Icon name="award" className="w-12 h-12 text-brand-muted mx-auto mb-4" />
            <p className="text-brand-muted">Badges coming soon.</p>
            <p className="text-sm text-brand-muted mt-1">
              Keep learning to unlock new achievements.
            </p>
          </div>
        </section>
      </div>

      {/* 👈 HERE IS THE FIX: Pass the certificate object */}
      {certificateCourse && (
        <CertificateModal
          user={user}
          course={certificateCourse}
          certificate={issuedByCourseId.get(String(certificateCourse.id))}
          onClose={() => setCertificateCourse(null)}
        />
      )}
    </>
  );
};