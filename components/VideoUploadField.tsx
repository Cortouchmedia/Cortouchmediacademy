"use client";

import React, { useRef, useState } from "react";
import { Api, authStorage } from "../lib/api"; 

export interface VideoUploadResult {
  video_url: string;
  video_public_id: string;
  video_duration_seconds: number;
  video_bytes: number;
}

// ✅ Added the missing fields that your backend returns
interface UploadSignatureResponse {
  timestamp: number;
  signature: string;
  folder: string;
  resource_type: string;
  api_key: string;
  cloud_name: string;
  upload_url: string;
}

interface VideoUploadFieldProps {
  value?: string | null;
  publicId?: string | null;
  onChange: (result: VideoUploadResult | null) => void;
  label?: string;
}

const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  value,
  publicId,
  onChange,
  label = "Lesson Video",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // ✅ 1. Grab the token from YOUR app, not Supabase
      const token = authStorage.getToken();
      
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      // ✅ 2. Request signature from your NestJS backend
      const sig: UploadSignatureResponse = await Api.courses.uploadSignature(token);

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.api_key);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);


      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", sig.upload_url);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body?.error?.message ?? "Upload failed"));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(form);
      });

      onChange({
        video_url: result.secure_url,
        video_public_id: result.public_id,
        video_duration_seconds: result.duration ?? 0,
        video_bytes: result.bytes ?? file.size,
      });
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value && !uploading ? (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">▶</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {publicId ?? value.split("/").pop()}
            </p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline">
              Preview →
            </a>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setError(null); }}
            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer ${
            uploading
              ? "border-brand-primary bg-brand-primary/5 cursor-wait"
              : "border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5"
          }`}
        >
          {uploading ? (
            <>
              <p className="text-sm font-medium text-gray-700 mb-2">Uploading… {progress}%</p>
              <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <span className="text-3xl text-gray-400 mb-2">⬆</span>
              <p className="text-sm font-medium text-gray-700">Click to upload a video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, MOV, WebM — uploaded straight to Cloudinary</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          if (inputRef.current) inputRef.current.value = "";
        }}
        className="hidden"
        disabled={uploading}
      />

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
    </div>
  );
};

export default VideoUploadField;