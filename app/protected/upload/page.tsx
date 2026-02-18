'use client';

import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const API_BASE = 'https://api.almostcrackd.ai/pipeline';

interface Caption {
  id: string;
  content?: string;
  [key: string]: unknown;
}

export default function UploadPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Upload Image</h1>
      <p className="text-sm text-gray-500">
        Signed in as: {email ?? 'Not signed in'}
      </p>

      <div className="space-y-3">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <div>
          <button
            type="button"
            disabled={!file || running}
            onClick={handleGenerate}
            className="px-4 py-2 border rounded disabled:opacity-50 inline-flex items-center gap-2"
          >
            {running && (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {running ? 'Generating…' : 'Generate captions'}
          </button>
        </div>
      </div>

      {preview && (
        <img
          src={preview}
          alt="Selected preview"
          className="w-64 h-64 object-cover rounded border"
        />
      )}

      {status && <p className="text-sm text-blue-600">{status}</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}

      {captions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-green-600">
            Successfully generated {captions.length} captions.
          </p>
          <h2 className="text-xl font-semibold">Generated Captions</h2>
          <ul className="space-y-2">
            {captions.map((caption, i) => (
              <li
                key={caption.id ?? i}
                className="border rounded-lg p-4 shadow-sm"
              >
                {caption.content ?? JSON.stringify(caption)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
