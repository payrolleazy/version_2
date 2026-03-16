'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { listCandidateDocumentFiles, uploadCandidateDocumentFiles, type CandidateUploadedFile } from '@/lib/candidate/files';

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return 'Recently uploaded';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently uploaded';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function CandidateDocumentUploadDialog({
  accessToken,
  isOpen,
  onClose,
  documentTypes,
  initialDocumentType,
  bucketTitle,
  onUploaded,
}: {
  accessToken: string;
  isOpen: boolean;
  onClose: () => void;
  documentTypes: string[];
  initialDocumentType?: string | null;
  bucketTitle?: string | null;
  onUploaded?: () => Promise<void> | void;
}) {
  const [documentType, setDocumentType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<CandidateUploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setUploadedFiles([]);
      setMessage(null);
      return;
    }

    if (initialDocumentType) {
      setDocumentType(initialDocumentType);
    } else if (documentTypes.length > 0) {
      setDocumentType(documentTypes[0]);
    } else {
      setDocumentType('');
    }
  }, [documentTypes, initialDocumentType, isOpen]);

  const refreshFiles = useCallback(async () => {
    if (!documentType) {
      setUploadedFiles([]);
      return;
    }

    setIsRefreshing(true);

    try {
      const nextFiles = await listCandidateDocumentFiles(accessToken, documentType);
      setUploadedFiles(nextFiles);
    } catch (error) {
      setUploadedFiles([]);
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not load uploaded files.',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, documentType]);

  useEffect(() => {
    if (!isOpen || !documentType) return;
    void refreshFiles();
  }, [documentType, isOpen, refreshFiles]);

  const selectedFilesLabel = useMemo(() => {
    if (files.length === 0) return 'No new files selected';
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  if (!isOpen) {
    return null;
  }

  async function handleUpload() {
    if (!documentType || files.length === 0) {
      setMessage({ tone: 'error', text: 'Select a document type and at least one file before uploading.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const payload = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ name: string; base64: string | ArrayBuffer | null; mimeType: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve({
                  name: file.name,
                  base64: event.target?.result ?? null,
                  mimeType: file.type,
                });
              };
              reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
              reader.readAsDataURL(file);
            }),
        ),
      );

      await uploadCandidateDocumentFiles(accessToken, documentType, payload);
      setFiles([]);
      setMessage({ tone: 'success', text: 'Files uploaded successfully.' });
      await refreshFiles();
      await onUploaded?.();
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Upload failed.',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      setFiles([]);
      return;
    }

    setFiles(Array.from(event.target.files));
  }

  function handleOpenFile(file: CandidateUploadedFile) {
    window.open(file.dataUrl, '_blank', 'noopener,noreferrer');
  }

  function handleDownloadFile(file: CandidateUploadedFile) {
    const anchor = document.createElement('a');
    anchor.href = file.dataUrl;
    anchor.download = file.originalName;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <SurfaceCard
        className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-slate-50/70 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Upload centre</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">
                {bucketTitle ? `${bucketTitle} bucket` : 'Document bucket'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload the missing files for this checklist bucket and review what you already submitted.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
            >
              Close
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Document type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {documentTypes.map((type) => {
                  const isActive = type === documentType;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocumentType(type)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                      }`.trim()}
                    >
                      {formatLabel(type)}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex min-h-[16rem] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-sky-300 bg-white px-6 py-8 text-center transition hover:border-sky-400 hover:bg-sky-50">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-sky-700">Choose file(s)</span>
              <span className="mt-3 text-sm text-slate-600">PDF, PNG or JPG</span>
              <span className="mt-4 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                {selectedFilesLabel}
              </span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="truncate rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    {file.name}
                  </div>
                ))}
              </div>
            ) : null}

            {message ? (
              <div className={`rounded-[1rem] px-4 py-3 text-sm font-semibold ${message.tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`.trim()}>
                {message.text}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={handleUpload} disabled={isUploading || !documentType}>
                {isUploading ? 'Uploading...' : 'Upload files'}
              </ActionButton>
              <ActionButton variant="secondary" onClick={onClose}>Done</ActionButton>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Uploaded files</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Review and download</h3>
              <p className="mt-2 text-sm text-slate-600">
                Files are shown for the selected document type only.
              </p>
            </div>
            <ActionButton variant="secondary" onClick={() => void refreshFiles()} disabled={isRefreshing || !documentType}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </ActionButton>
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            {documentType ? (
              uploadedFiles.length > 0 ? (
                <div className="space-y-3 pr-1">
                  {uploadedFiles.map((file) => (
                    <div key={`${file.originalName}-${file.dataUrl.slice(0, 24)}`} className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">{formatDate(file.uploadedAt)}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <ActionButton variant="secondary" onClick={() => handleOpenFile(file)}>Open</ActionButton>
                          <ActionButton onClick={() => handleDownloadFile(file)}>Download</ActionButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                  No uploaded files yet for {formatLabel(documentType)}.
                </div>
              )
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                Select a document type to review files.
              </div>
            )}
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
