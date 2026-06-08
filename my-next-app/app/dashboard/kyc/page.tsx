"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal Info", status: "completed" },
  { id: 2, label: "ID Document", status: "completed" },
  { id: 3, label: "Selfie", status: "pending" },
  { id: 4, label: "Review", status: "waiting" },
];

export default function KYCPage() {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Complete KYC to unlock full platform features.
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="h-10 w-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
          <Clock className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <div className="font-medium text-amber-400">Verification In Progress</div>
          <div className="text-sm text-[#9ca3af]">
            2 of 4 steps completed. Please submit your selfie to continue.
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                step.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : step.status === "pending"
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800/60 text-[#6b7280]"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle className="h-4 w-4" />
              ) : step.status === "pending" ? (
                <span className="h-4 w-4 rounded-full bg-white text-purple-600 flex items-center justify-center text-xs font-bold">
                  {step.id}
                </span>
              ) : (
                <span className="h-4 w-4 rounded-full bg-zinc-700 text-[#6b7280] flex items-center justify-center text-xs font-bold">
                  {step.id}
                </span>
              )}
              {step.label}
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-4 h-px ${
                  step.status === "completed" ? "bg-emerald-500/40" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info (completed) */}
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Personal Information</h3>
                <p className="text-sm text-[#6b7280]">Verified on 15 Jun 2026</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
                <div className="text-xs text-[#6b7280] mb-1">Full Name</div>
                <div className="text-sm text-[#d1d5db]">Aryan Sharma</div>
              </div>
              <div className="p-3 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
                <div className="text-xs text-[#6b7280] mb-1">Date of Birth</div>
                <div className="text-sm text-[#d1d5db]">12 Aug 2000</div>
              </div>
              <div className="p-3 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
                <div className="text-xs text-[#6b7280] mb-1">Nationality</div>
                <div className="text-sm text-[#d1d5db]">Indian</div>
              </div>
              <div className="p-3 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
                <div className="text-xs text-[#6b7280] mb-1">Phone</div>
                <div className="text-sm text-[#d1d5db]">+91 98765 43210</div>
              </div>
            </div>
          </div>

          {/* ID Document (completed) */}
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ID Document</h3>
                <p className="text-sm text-[#6b7280]">Aadhaar card uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f]/40 rounded-xl border border-[#1a1a2e]/40">
              <div className="h-10 w-10 bg-purple-500/15 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#d1d5db]">aadhaar-front.pdf</div>
                <div className="text-xs text-[#6b7280]">2.4 MB · Uploaded</div>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          {/* Selfie (pending) */}
          <div className="bg-[#0a0a0f] border border-purple-500/30 rounded-2xl p-6 ring-1 ring-purple-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
                <Camera className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Selfie Verification</h3>
                <p className="text-sm text-[#6b7280]">Take a clear photo of your face</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-[#1a1a2e] rounded-2xl p-10 text-center hover:border-purple-500/40 transition-colors cursor-pointer">
              <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-[#6b7280]" />
              </div>
              <div className="text-sm text-[#d1d5db] mb-1">Upload or capture selfie</div>
              <div className="text-xs text-[#6b7280]">JPG or PNG, max 5MB</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#d1d5db] uppercase tracking-wider mb-4">
              Requirements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-[#d1d5db]">Government-issued ID</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-[#d1d5db]">Valid phone number</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-[#d1d5db]">Clear selfie photo</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-zinc-600 shrink-0" />
                <span className="text-[#6b7280]">Review (24-48 hrs)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#d1d5db] uppercase tracking-wider mb-4">
              Why KYC?
            </h3>
            <div className="space-y-3 text-sm text-[#9ca3af]">
              <p>Required by RBI regulations for cloud service providers handling payments.</p>
              <p>Unlocks higher VM limits, priority support, and enterprise features.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
