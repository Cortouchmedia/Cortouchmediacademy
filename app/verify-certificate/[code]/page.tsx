"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Api } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    
    Api.certificates.verify(code)
      .then((res: any) => {
        console.log("Certificate Data Received:", res); // 👈 Check console
        
        // The backend returns: { valid: true, certificate: { ... } }
        // We need to extract the inner "certificate" object
        const data = res?.certificate || res?.data || res;
        
        if (!data || !data.certificate_number) {
          setError("Certificate not found or invalid.");
        } else {
          setCertificate(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Certificate not found or invalid.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Verifying certificate...</div>;
  }

  if (error) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <Icon name="xCircle" className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Invalid Certificate</h2>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#219BD5] to-[#1a7bb0] p-8 text-center text-white">
          <Icon name="award" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-black">Certificate Verified</h1>
          <p className="text-sm text-white/80 mt-1">This certificate is authentic.</p>
        </div>
        <div className="p-8 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Awarded To</p>
            <p className="text-lg font-bold text-gray-900">
              {certificate.user?.full_name 
                || certificate.metadata?.user_name 
                || "Unknown User"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Course Completed</p>
            <p className="text-lg font-bold text-gray-900">
              {certificate.course?.title 
                || certificate.metadata?.course_title 
                || "Unknown Course"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Date Issued</p>
            <p className="text-lg font-bold text-gray-900">
              {certificate.issue_date 
                ? new Date(certificate.issue_date).toLocaleDateString() 
                : "Unknown Date"}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Certificate No.</p>
              <p className="text-sm font-mono text-gray-700">{certificate.certificate_number || "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Verification Code</p>
              <p className="text-sm font-mono text-gray-700">{certificate.verification_code || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}