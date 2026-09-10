'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileJson } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: unknown;
  filename?: string;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  filename = 'quiz.json',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      playSound('click');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      playSound('powerup');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
              <p className="text-xs text-zinc-500">Raw JSON representation of the quiz data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Code viewer */}
        <div className="my-4 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-emerald-400 shadow-inner">
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">
            {(jsonString.length / 1024).toFixed(1)} KB formatted JSON
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-500" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download .json</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
