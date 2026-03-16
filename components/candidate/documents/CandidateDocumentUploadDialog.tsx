'use client';

import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import { listCandidateDocumentFiles, CandidateUploadedFile, uploadCandidateDocumentFiles } from '@/lib/candidate/files';

type CandidateUploadSession = Pick<Session, 'access_token'> | null;

type UploadFilePayload = {
  name: string;
  base64: string | ArrayBuffer | null;
  mimeType: string;
};

interface CandidateDocumentUploadDialogProps {
  session: CandidateUploadSession;
  isOpen: boolean;
  onClose: () => void;
  documentTypes: string[];
  initialDocumentType?: string | null;
  bucketTitle?: string | null;
  onUploaded?: () => void;
}

function formatTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return 'Recently uploaded';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function CandidateDocumentUploadDialog({
  session,
  isOpen,
  onClose,
  documentTypes,
  initialDocumentType,
  bucketTitle,
  onUploaded,
}: CandidateDocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<CandidateUploadedFile[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
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

  const selectedFilesLabel = useMemo(() => {
    if (files.length === 0) return 'No new files selected';
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  const loadUploadedFiles = useCallback(
    async (targetDocumentType: string) => {
      if (!session?.access_token || !targetDocumentType) {
        setUploadedFiles([]);
        return;
      }

      setIsLoadingFiles(true);

      try {
        const nextFiles = await listCandidateDocumentFiles(session.access_token, targetDocumentType);
        setUploadedFiles(nextFiles);
      } catch (error) {
        const err = error instanceof Error ? error.message : 'Failed to load uploaded files for review.';
        setUploadedFiles([]);
        setMessage({
          type: 'error',
          text: err,
        });
      } finally {
        setIsLoadingFiles(false);
      }
    },
    [session?.access_token],
  );

  useEffect(() => {
    if (isOpen && documentType) {
      void loadUploadedFiles(documentType);
    }
  }, [documentType, isOpen, loadUploadedFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !documentType) {
      setMessage({
        type: 'error',
        text: 'Select a document type and at least one file before uploading.',
      });
      return;
    }

    if (!session?.access_token) {
      setMessage({
        type: 'error',
        text: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const filesData = await Promise.all(
        files.map(
          (file) =>
            new Promise<UploadFilePayload>((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = (event: ProgressEvent<FileReader>) => {
                resolve({
                  name: file.name,
                  base64: event.target?.result ?? null,
                  mimeType: file.type,
                });
              };

              reader.onerror = () => reject(reader.error ?? new Error('Could not read the selected file.'));
              reader.readAsDataURL(file);
            }),
        ),
      );

      await uploadCandidateDocumentFiles(session.access_token, documentType, filesData);

      setFiles([]);
      setMessage({ type: 'success', text: 'Files uploaded successfully.' });
      await loadUploadedFiles(documentType);
      onUploaded?.();
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Upload failed.';
      setMessage({ type: 'error', text: err });
    } finally {
      setIsUploading(false);
    }
  };

  const openFile = (file: CandidateUploadedFile) => {
    window.open(file.dataUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadFile = (file: CandidateUploadedFile) => {
    const anchor = document.createElement('a');
    anchor.href = file.dataUrl;
    anchor.download = file.originalName;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 shadow-2xl shadow-slate-950/15 dark:border-white/5 dark:bg-slate-950/95"
          >
            <div className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
                    Upload Centre
                  </p>
                  <h2 className="mt-3 truncate whitespace-nowrap text-2xl font-black text-slate-950 dark:text-white">
                    {bucketTitle ? `${bucketTitle} bucket` : 'Document bucket'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
                  aria-label="Close upload dialog"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-2">
              <div className="border-b border-slate-200/80 p-6 dark:border-slate-800 lg:border-b-0 lg:border-r">
                <div className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        Upload
                      </p>
                      <h3 className="mt-3 truncate whitespace-nowrap text-xl font-black text-slate-950 dark:text-white">
                        Add files
                      </h3>
                    </div>
                    <span className="whitespace-nowrap rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200">
                      {documentTypes.length} type{documentTypes.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Document type
                    </label>
                    <div className="mt-2 overflow-x-auto pb-1">
                      <div className="inline-flex min-w-full gap-2">
                        {documentTypes.map((type) => {
                          const isActive = type === documentType;

                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setDocumentType(type)}
                              className={`inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-2xl border px-4 text-sm font-semibold transition-colors ${
                                isActive
                                  ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20 dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:bg-slate-900'
                              }`}
                            >
                              {formatTitle(type)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor="candidate-document-upload-input"
                    className="mt-5 flex min-h-[15rem] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-sky-300 bg-white/80 px-5 py-8 text-center transition-colors hover:border-sky-400 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-950/80 dark:hover:border-sky-700 dark:hover:bg-slate-900"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="mt-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                      Choose file(s)
                    </p>
                    <p className="mt-2 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                      PDF, PNG or JPG
                    </p>
                    <input
                      id="candidate-document-upload-input"
                      type="file"
                      multiple
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        Selected
                      </p>
                      {message ? (
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                            message.type === 'success'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200'
                          }`}
                        >
                          {message.type === 'success' ? 'Uploaded' : 'Issue'}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedFilesLabel}
                    </p>
                    {files.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {files.map((file) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="truncate rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {message ? (
                      <p
                        className={`mt-3 text-sm font-medium ${
                          message.type === 'success'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {message.text}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <CandidateActionButton onClick={handleUpload} isLoading={isUploading} disabled={!documentType}>
                      {isUploading ? 'Uploading...' : 'Upload files'}
                    </CandidateActionButton>
                    <CandidateActionButton variant="outline" onClick={onClose}>
                      Done
                    </CandidateActionButton>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        Download
                      </p>
                      <h3 className="mt-3 truncate whitespace-nowrap text-xl font-black text-slate-950 dark:text-white">
                        Review files
                      </h3>
                    </div>
                    <CandidateActionButton
                      variant="ghost"
                      size="sm"
                      onClick={() => documentType && loadUploadedFiles(documentType)}
                      isLoading={isLoadingFiles}
                      disabled={!documentType}
                    >
                      Refresh
                    </CandidateActionButton>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Document type
                    </label>
                    <div className="mt-2 h-12 rounded-2xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex h-full items-center">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {documentType ? formatTitle(documentType) : 'No type selected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="space-y-3">
                      {!documentType ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          Select a document type on the upload side first.
                        </div>
                      ) : isLoadingFiles ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          Refreshing file list...
                        </div>
                      ) : uploadedFiles.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          No uploaded files yet for this document type.
                        </div>
                      ) : (
                        uploadedFiles.map((file) => (
                          <div
                            key={`${file.originalName}-${file.dataUrl.slice(0, 20)}`}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className="truncate text-sm font-bold text-slate-950 dark:text-white"
                                  title={file.originalName}
                                >
                                  {file.originalName}
                                </p>
                                <p className="mt-1 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                  {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <CandidateActionButton variant="outline" size="sm" onClick={() => openFile(file)}>
                                  Open
                                </CandidateActionButton>
                                <CandidateActionButton size="sm" onClick={() => downloadFile(file)}>
                                  Download
                                </CandidateActionButton>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
