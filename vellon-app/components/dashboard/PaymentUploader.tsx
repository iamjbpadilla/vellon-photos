"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Event, PaymentProof } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Upload, Receipt, AlertCircle } from "lucide-react";

interface Props {
  event: Event;
  rejectedProof: PaymentProof | null;
}

const GCASH_NUMBER = "09XX XXX XXXX";
const GCASH_NAME = "Vellon Photos";

export function PaymentUploader({ event, rejectedProof }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [refNumber, setRefNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!screenshotFile) {
      setError("Please attach your GCash screenshot.");
      return;
    }
    if (!refNumber.trim()) {
      setError("Please enter your GCash reference number.");
      return;
    }

    setSubmitting(true);
    setError("");

    const ext = screenshotFile.name.split(".").pop() ?? "jpg";
    const path = `payment-proofs/${event.id}/${Date.now()}.${ext}`;

    const { error: storageErr } = await supabase.storage
      .from("event-photos")
      .upload(path, screenshotFile, { contentType: screenshotFile.type });

    if (storageErr) {
      setError(`Upload failed: ${storageErr.message}`);
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("event-photos").getPublicUrl(path);

    const { error: dbErr } = await supabase.from("payment_proofs").insert({
      event_id: event.id,
      ref_number: refNumber.trim(),
      amount: 699,
      screenshot_path: path,
      screenshot_url: urlData.publicUrl,
      status: "pending",
    });

    if (dbErr) {
      setError(dbErr.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("events").update({ status: "pending" }).eq("id", event.id);

    setSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {rejectedProof && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 flex gap-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Previous submission rejected</p>
            {rejectedProof.admin_notes && (
              <p className="text-xs text-[#9CA3AF] mt-1">{rejectedProof.admin_notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="bg-[#FDFBF7] rounded-2xl p-5 border border-[#E5E7EB]">
        <div className="flex items-start gap-3">
          <Receipt size={18} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-[#1F2937] text-sm mb-2">GCash Payment Instructions</h3>
            <ol className="space-y-1.5 text-xs text-[#6B7280]">
              <li className="flex gap-2"><span className="text-[#C9A84C]">1.</span> Open GCash and tap <strong className="text-[#374151]">Send Money</strong></li>
              <li className="flex gap-2"><span className="text-[#C9A84C]">2.</span> Send <strong className="text-[#1F2937]">₱699.00</strong> to <strong className="text-[#1F2937] font-mono">{GCASH_NUMBER}</strong> ({GCASH_NAME})</li>
              <li className="flex gap-2"><span className="text-[#C9A84C]">3.</span> Take a screenshot of the success screen</li>
              <li className="flex gap-2"><span className="text-[#C9A84C]">4.</span> Paste the <strong className="text-[#374151]">Reference Number</strong> below</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Ref Number */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1.5">
          GCash Reference Number
        </label>
        <input
          type="text"
          required
          value={refNumber}
          onChange={(e) => setRefNumber(e.target.value)}
          placeholder="e.g. 1234567890"
          className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all font-mono"
        />
      </div>

      {/* Screenshot Upload */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1.5">
          GCash Screenshot
        </label>
        {screenshotPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB]">
            <img src={screenshotPreview} alt="Receipt" className="w-full max-h-64 object-contain bg-[#F9FAFB]" />
            <button
              type="button"
              onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
              className="absolute top-2 right-2 text-xs bg-white border border-[#E5E7EB] px-2 py-1 rounded-lg text-[#9CA3AF] hover:text-[#1F2937]"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl py-8 flex flex-col items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
          >
            <Upload size={20} />
            <span className="text-xs">Tap to upload screenshot</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
        Submit for Verification
      </Button>
    </form>
  );
}
