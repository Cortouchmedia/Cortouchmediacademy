"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Api, api } from "../../../lib/api";
import { Icon } from "../../../components/Icon";
import { Certificate } from "../../../components/Certificate";

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  
  const certificateRef = useRef<HTMLDivElement>(null);

  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) return;
    
    // 🎯 1. Fetch the certificate
    Api.certificates.verify(code)
      .then(async (res: any) => {
        const data = res?.certificate || res?.data || res;
        if (!data || !data.certificate_number) {
          setError("Certificate not found or invalid.");
          return;
        }
        
        setCertificate(data);

        // 🎯 2. Fetch the complete Course data
        // This is the exact same data the AppContext uses, which includes the instructor object.
        try {
          if (data.course_id) {
            const fullCourse: any = await api.get(`/courses/${data.course_id}`);
            setCertificate((prev: any) => ({
              ...prev,
              fullCourseData: fullCourse, // Attach the full course
            }));
          }
        } catch (err) {
          console.warn("Could not fetch full course data for instructor name", err);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Certificate not found or invalid.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const newScale = Math.min(width / 1000, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [loading]);

  const handleDownload = () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    toPng(certificateRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#ffffff",
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `CMA-Certificate-${certificate.certificate_number || "download"}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(() => alert("Sorry, could not generate image."))
      .finally(() => setIsDownloading(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219BD5] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 max-w-md w-full overflow-hidden">
          <div className="bg-red-500 p-6 text-center text-white">
            <Icon name="xCircle" className="w-12 h-12 mx-auto mb-2" />
            <h1 className="text-xl font-black">Invalid Certificate</h1>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 3. Construct exactly what the <Certificate> component expects.
  // We use the fullCourseData if it loaded, otherwise fallback to the cert data.
  const fullCourse = certificate.fullCourseData;
  
  const certificateUser = {
    id: certificate.user_id || certificate.user?.id || "",
    name:
      certificate.user?.full_name ||
      certificate.metadata?.user_name ||
      "Unknown User",
    email: certificate.user?.email || "",
    avatarUrl: certificate.user?.avatar_url || "",
    role: "student" as const,
    enrolledCourseIds: [],
  };

  const certificateCourse = {
    id: certificate.course_id,
    title:
      fullCourse?.title ||
      certificate.course?.title ||
      certificate.metadata?.course_title ||
      "Unknown Course",
    category: fullCourse?.category || certificate.course?.category || "",
    // 👈 THE CRITICAL FIX: Ensure instructor is a string
    instructor: 
      fullCourse?.instructor?.full_name || 
      fullCourse?.instructor || 
      certificate.course?.instructor?.full_name || 
      certificate.course?.instructor || 
      certificate.metadata?.instructor_name ||
      "Cortouch Media Academy",
    instructor_id: fullCourse?.instructor_id || certificate.course?.instructor_id || "",
    duration: fullCourse?.duration || certificate.course?.duration || "Self-paced",
    description: fullCourse?.description || "",
    imageUrl: fullCourse?.image_url || "",
    price: 0,
    rating: 0,
    enrollmentCount: 0,
    modules: 0,
    content: [],
    projects: [],
    progress: 100,
    completed: true,
    reviews: [],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 py-10">
      
      <div className="w-full max-w-[1000px] flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Certificate Verification
          </p>
          <p className="text-sm text-gray-700 font-mono mt-1">
            {certificate.verification_code}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#219BD5] text-white text-sm font-semibold rounded-lg hover:bg-[#1a7bb0] transition-colors disabled:opacity-60 shadow-sm"
        >
          {isDownloading ? (
            <>Generating…</>
          ) : (
            <>
              <Icon name="download" className="w-4 h-4" />
              Download PNG
            </>
          )}
        </button>
      </div>

      <div 
        className="w-full max-w-[1000px] bg-white shadow-2xl rounded-sm overflow-hidden"
        ref={containerRef}
        style={{
          aspectRatio: '1000 / 707',
        }}
      >
        <div
          style={{
            width: '1000px',
            height: '707px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          ref={certificateRef}
        >
          <Certificate
            user={certificateUser}
            course={certificateCourse}
            certificateRef={null} 
            certificate={certificate} 
          />
        </div>
      </div>

      <a
        href="/"
        className="mt-6 text-sm font-semibold text-[#219BD5] hover:text-[#1a7bb0]"
      >
        ← Back to Cortouch Media Academy
      </a>
    </div>
  );
}