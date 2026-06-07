"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { PaymentProof, Event } from "@/types/database";
import { CheckCircle, XCircle, ExternalLink, Camera, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type EventWithProfile = Event & {
  profiles: { name: string | null; email: string } | null;
};

interface Props {
  proof: PaymentProof;
  event: EventWithProfile;
}

export function VerifyPanel({ proof, event }: Props) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    setActivating(true);
    setError("");
    const res = await fetch(`/api/events/${event.id}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofId: proof.id }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Activation failed");
      setActivating(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  const handleReject = async () => {
    setRejecting(true);
    setError("");
    const res = await fetch(`/api/events/${event.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofId: proof.id, notes: rejectNotes }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Rejection failed");
      setRejecting(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Receipt Screenshot */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
      >
        <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-4">Payment Receipt</h3>
        {proof.screenshot_url ? (
          <div className="relative">
            <img
              src={proof.screenshot_url}
              alt="GCash receipt"
              className="w-full rounded-xl object-contain max-h-[500px] bg-[#F9FAFB]"
            />
            <a
              href={proof.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-2 bg-white border border-[#E5E7EB] rounded-lg text-[#9CA3AF] hover:text-[#C9A84C] transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          <div className="text-center py-12 text-[#9CA3AF] text-sm">
            No screenshot uploaded
          </div>
        )}

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Reference Number</span>
            <span className="font-mono text-[#1F2937]">{proof.ref_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Amount</span>
            <span className="text-[#C9A84C] font-semibold">₱{proof.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Submitted</span>
            <span className="text-[#374151]">{new Date(proof.created_at).toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Event Details */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
        >
          <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-4">Event Details</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[#9CA3AF]">Event</span>
              <span className="text-[#1F2937] font-medium text-right">{event.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF]">Code</span>
              <span className="font-mono text-[#C9A84C] tracking-wider">{event.event_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF]">Status</span>
              <Badge variant={event.status} theme="light" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <User size={12} /> Host
              </span>
              <div className="text-right">
                <p className="text-[#1F2937] text-xs">{event.profiles?.name ?? "—"}</p>
                <p className="text-[#9CA3AF] text-xs">{event.profiles?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <Camera size={12} /> Photos
              </span>
              <span className="text-[#1F2937]">{event.photo_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <Clock size={12} /> Created
              </span>
              <span className="text-[#6B7280] text-xs">{new Date(event.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3"
        >
          <h3 className="font-medium text-[#1F2937] text-sm mb-3">Admin Actions</h3>

          {error && (
            <p className="text-xs text-red-500 mb-2">{error}</p>
          )}

          <Button
            variant="primary"
            size="md"
            loading={activating}
            onClick={handleActivate}
            className="w-full"
          >
            <CheckCircle size={15} />
            Confirm & Activate (15 days)
          </Button>

          <AnimatePresence>
            {!showRejectForm ? (
              <motion.button
                key="reject-btn"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setShowRejectForm(true)}
                className="w-full py-2.5 rounded-xl text-sm text-red-500 border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={15} />
                Reject Submission
              </motion.button>
            ) : (
              <motion.div
                key="reject-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3 overflow-hidden"
              >
                <textarea
                rows={3}
                placeholder="Reason for rejection (shown to host)…"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full bg-white border border-red-200 rounded-xl px-3 py-2.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 py-2 rounded-xl text-xs border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] bg-white"
                >
                  Cancel
                </button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={rejecting}
                  onClick={handleReject}
                  className="flex-1"
                >
                  Confirm Reject
                </Button>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
