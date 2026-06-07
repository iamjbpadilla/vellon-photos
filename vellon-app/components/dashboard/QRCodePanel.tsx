"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type { Event } from "@/types/database";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  event: Event;
  galleryUrl: string;
}

export function QRCodePanel({ event, galleryUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const copyLink = async () => {
    await navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `vellon-${event.event_code}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-4">QR Code & Share Link</h3>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex-shrink-0 p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm"
        >
          <QRCodeCanvas
            value={galleryUrl}
            size={160}
            level="H"
            includeMargin={false}
            fgColor="#1F2937"
            bgColor="#ffffff"
          />
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Gallery Link</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={galleryUrl}
                className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#374151] font-mono focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="flex-shrink-0 p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Event Code</label>
            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-[#FDF6E3] border border-[#F0E6CC]">
              <span className="font-mono text-xl font-bold text-[#C9A84C] tracking-[0.3em]">
                {event.event_code}
              </span>
            </div>
          </div>

          <button
            onClick={downloadQR}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors w-full justify-center"
          >
            <Download size={14} />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
