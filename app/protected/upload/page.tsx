'use client';

import { useEffect, useMemo, useState } from 'react';

import Navbar from '@/app/components/Navbar';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const API_BASE = 'https://api.almostcrackd.ai/pipeline';

interface Caption {
  id: string;
  content?: string;
  [key: string]: unknown;
}

const STEPS = [
  'Getting upload URL…',
  'Uploading image…',
  'Registering image…',
  'Generating captions…',
];

export default function UploadPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [stepIndex, setStepIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createSupabaseBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setEmail(data.session?.user?.email ?? null);
    };
    init();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setCaptions([]);
    setError(null);
    setStatus('');
    setStepIndex(-1);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    if (!supabase) throw new Error('Supabase client not available');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Not authenticated — no access token');
    return token;
  };

  const handleGenerate = async () => {
    if (!file) return;

    setRunning(true);
    setError(null);
    setCaptions([]);

    try {
      // Step 1: Get presigned URL
      setStepIndex(0);
      setStatus('Step 1/4: Getting presigned upload URL…');
      const token = await getAccessToken();

      const step1Res = await fetch(`${API_BASE}/generate-presigned-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!step1Res.ok) {
        throw new Error(`Step 1 failed (${step1Res.status}): ${await step1Res.text()}`);
      }
      const { presignedUrl, cdnUrl: cdn } = await step1Res.json();

      // Step 2: Upload file to presigned URL
      setStepIndex(1);
      setStatus('Step 2/4: Uploading image…');
      const step2Res = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!step2Res.ok) {
        throw new Error(`Step 2 failed (${step2Res.status}): ${await step2Res.text()}`);
      }

      // Step 3: Register image
      setStepIndex(2);
      setStatus('Step 3/4: Registering image…');
      const step3Res = await fetch(`${API_BASE}/upload-image-from-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: cdn, isCommonUse: false }),
      });
      if (!step3Res.ok) {
        throw new Error(`Step 3 failed (${step3Res.status}): ${await step3Res.text()}`);
      }
      const { imageId: imgId } = await step3Res.json();

      // Step 4: Generate captions
      setStepIndex(3);
      setStatus('Step 4/4: Generating captions…');
      const step4Res = await fetch(`${API_BASE}/generate-captions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId: imgId }),
      });
      if (!step4Res.ok) {
        throw new Error(`Step 4 failed (${step4Res.status}): ${await step4Res.text()}`);
      }
      const captionData = await step4Res.json();
      const captionList = Array.isArray(captionData) ? captionData : captionData.captions ?? [];
      setCaptions(captionList);
      setStatus('');
      setStepIndex(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('');
      setStepIndex(-1);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar email={email} showUploadLink={false} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Image</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a photo to generate AI-powered captions
          </p>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select an image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm">
                  {file ? file.name : 'Click to browse or drag & drop'}
                </span>
                {file && (
                  <span className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={preview}
                alt="Selected preview"
                className="w-full max-h-80 object-contain"
              />
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            disabled={!file || running}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {running ? 'Generating…' : 'Generate captions'}
          </button>

          {/* Progress steps */}
          {running && (
            <div className="space-y-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-sm">
                  {i < stepIndex ? (
                    <svg
                      className="w-4 h-4 text-green-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i === stepIndex ? (
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span
                    className={
                      i < stepIndex
                        ? 'text-gray-400 line-through'
                        : i === stepIndex
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-400'
                    }
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Status / Error */}
          {status && !running && (
            <p className="text-sm text-blue-600">{status}</p>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {captions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">
                {captions.length} captions generated
              </h2>
            </div>

            <ul className="space-y-3">
              {captions.map((caption, i) => (
                <li
                  key={caption.id ?? i}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {caption.content ?? JSON.stringify(caption)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
