'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Terminal, ExternalLink, Cpu, Layers } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      playSound('click');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const renderYamlContent = `services:
  - type: web
    name: ai-quiz-generator
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: GEMINI_API_KEY
        sync: false # Set securely in your Render dashboard`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">Render Deployment Blueprint</h3>
            <p className="text-xs text-zinc-500">How to deploy this Next.js 15 app seamlessly to Render.com</p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-zinc-700">
          {/* Step 1: Web Service Settings */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
              <Cpu className="h-4 w-4" /> 1. Render Web Service Parameters
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-200">
                <span className="text-zinc-500">Environment / Runtime:</span>
                <span className="font-bold text-zinc-900">Node</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-200">
                <span className="text-zinc-500">Build Command:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">npm install &amp;&amp; npm run build</span>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build', 'build')}
                    className="text-zinc-400 hover:text-indigo-600"
                  >
                    {copiedKey === 'build' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-200">
                <span className="text-zinc-500">Start Command:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">npm run start</span>
                  <button
                    onClick={() => copyToClipboard('npm run start', 'start')}
                    className="text-zinc-400 hover:text-indigo-600"
                  >
                    {copiedKey === 'start' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> 2. Environment Variables Checklist
            </h4>
            <p className="text-xs text-zinc-600 mb-3">
              Add these environment variables under the <strong>Environment</strong> tab in your Render dashboard:
            </p>
            <div className="space-y-2">
              <div className="rounded-xl bg-white p-3 border border-zinc-200">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-zinc-900">GEMINI_API_KEY</span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                    Required for AI
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Your Google Gemini API Key from Google AI Studio.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-zinc-200">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-zinc-900">NODE_ENV</span>
                  <span className="text-zinc-500 font-mono">production</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 border border-zinc-200">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-zinc-900">PORT</span>
                  <span className="text-zinc-500 font-mono">3000 (or Render default)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Infrastructure Blueprint File */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-zinc-600" /> render.yaml Blueprint (Included in Project Root)
              </h4>
              <button
                onClick={() => copyToClipboard(renderYamlContent, 'yaml')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                {copiedKey === 'yaml' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'yaml' ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-200 overflow-x-auto">
              {renderYamlContent}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
