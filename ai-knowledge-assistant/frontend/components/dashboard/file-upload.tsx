'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Layers,
  HardDrive,
} from 'lucide-react';

export interface DocumentItem {
  id: string;
  original_filename: string;
  file_size?: number;
  status: string;
  chunk_count: number;
  created_at?: string;
}

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
  documents?: DocumentItem[];
  onDeleteDocument?: (id: string) => Promise<void>;
}

export default function FileUpload({
  onUpload,
  isLoading = false,
  documents = [],
  onDeleteDocument,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Array<{ name: string; status: 'uploading' | 'completed' | 'error'; message?: string }>
  >([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents are supported.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File exceeds the 20MB maximum size limit.');
      return;
    }

    const fileEntry = { name: file.name, status: 'uploading' as const };
    setUploadedFiles((prev) => [fileEntry, ...prev]);

    try {
      await onUpload(file);
      setUploadedFiles((prev) =>
        prev.map((f) => (f.name === file.name ? { ...f, status: 'completed' } : f))
      );
      setTimeout(() => {
        setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
      }, 4000);
    } catch (err: any) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: 'error', message: err.message || 'Processing failed' }
            : f
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteDocument) return;
    setDeletingId(id);
    try {
      await onDeleteDocument(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      className="rounded-2xl border p-6 shadow-2xl backdrop-blur-xl space-y-6"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Knowledge Base Ingestion
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Upload PDF documents to chunk, embed, and index in ChromaDB
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Vector Embedded</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Drag & Drop Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700/60 hover:border-blue-500/60'
        }`}
        style={{
          backgroundColor: 'var(--card-inner)',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Drop your PDF files here, or <span className="text-blue-500 underline underline-offset-4">browse</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            PDF format up to 20MB • Auto-chunked & vectorized
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
          disabled={isLoading}
        />
      </motion.div>

      {/* Uploading progress items */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 rounded-xl border p-3 text-xs"
                style={{
                  backgroundColor: 'var(--card-inner)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  {file.status === 'uploading' && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-700">
                      <motion.div
                        className="h-full bg-blue-600"
                        animate={{ width: ['0%', '90%'] }}
                        transition={{ duration: 3, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>

                {file.status === 'uploading' && (
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Indexing...</span>
                  </div>
                )}
                {file.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Indexed</span>
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-400 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Document Library Section */}
      {documents.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Indexed Documents ({documents.length})
            </span>
            <span style={{ color: 'var(--text-muted)' }}>ChromaDB Vector Store</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-3 text-xs transition hover:border-slate-600"
                style={{
                  backgroundColor: 'var(--card-inner)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[220px] sm:max-w-[320px]" style={{ color: 'var(--text-primary)' }}>
                      {doc.original_filename}
                    </p>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span className="text-blue-500 font-mono">
                        {doc.chunk_count} chunks
                      </span>
                    </div>
                  </div>
                </div>

                {onDeleteDocument && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition disabled:opacity-50 flex-shrink-0"
                    title="Delete document and remove vector embeddings"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
