"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { createClient } from "@/lib/supabase/client";
import type { Event, Photo } from "@/types/database";
import { Camera, Upload, X, CheckCircle, Download, ZoomIn } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";

interface Props {
  event: Event;
  initialPhotos: Photo[];
}

const MAX_UPLOADS = 4;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function GuestGalleryClient({ event, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isArchived = event.status === "archived";
  const isExpired = event.expires_at ? new Date(event.expires_at) < new Date() : false;
  const isLocked = isArchived || isExpired;
  const remainingUploads = MAX_UPLOADS - uploadCount;

  useEffect(() => {
    const channel = supabase
      .channel(`gallery:${event.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "photos",
        filter: `event_id=eq.${event.id}`,
      }, (payload) => {
        setPhotos((prev) => [payload.new as Photo, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [event.id, supabase]);

  const triggerFilePicker = () => {
    if (isLocked || remainingUploads <= 0) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const valid = files.filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    ).slice(0, remainingUploads);

    if (!valid.length) {
      setUploadError("Please select valid image files under 15MB.");
      return;
    }

    if (!uploaderName) {
      setPendingFiles(valid);
      setShowNamePrompt(true);
    } else {
      uploadFiles(valid);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    setUploadError("");

    const { data: anonData } = await supabase.auth.getSession();
    if (!anonData.session) {
      await supabase.auth.signInAnonymously();
    }

    let successCount = 0;

    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${event.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from("event-photos")
        .upload(path, file, { contentType: file.type });

      if (storageError) {
        setUploadError(`Upload failed: ${storageError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from("photos").insert({
        event_id: event.id,
        storage_path: path,
        storage_url: urlData.publicUrl,
        uploader_name: uploaderName || "Guest",
        file_size: file.size,
        mime_type: file.type,
      });

      if (!dbError) successCount++;
    }

    setUploading(false);
    if (successCount > 0) {
      setUploadCount((c) => c + successCount);
      setShowSuccess(true);
    }
  }, [event.id, supabase, uploaderName]);

  const handleNameConfirm = () => {
    setShowNamePrompt(false);
    if (pendingFiles.length) {
      uploadFiles(pendingFiles);
      setPendingFiles([]);
    }
  };

  const breakpointCols = { default: 3, 1100: 3, 700: 2, 500: 2 };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="glass border-b border-gold/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Badge variant={event.status} />
            {!isLocked && (
              <span className="text-sm text-slate-500">
                {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Event Title */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          {event.title}
        </h1>
        {event.description && (
          <p className="text-slate-400 text-sm max-w-xl mx-auto">{event.description}</p>
        )}
        {isLocked && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 text-sm">
            This gallery has ended. Photos are no longer available for download.
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4">
        {photos.length === 0 ? (
          <div className="text-center py-24">
            <Camera size={40} className="text-gold/30 mx-auto mb-4" />
            <p className="text-slate-400 text-base">Be the first to share a moment.</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointCols}
            className="flex gap-2 sm:gap-3"
            columnClassName="flex flex-col gap-2 sm:gap-3"
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i < 12 ? i * 0.04 : 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-navy-800"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={photo.storage_url}
                  alt={photo.caption ?? "Event photo"}
                  className="w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-white/80">{photo.uploader_name ?? "Guest"}</span>
                    <ZoomIn size={14} className="text-white/80" />
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
        )}
      </div>

      {/* Upload Button — pinned bottom center (thumb zone) */}
      {!isLocked && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4">
          <button
            onClick={triggerFilePicker}
            disabled={uploading || remainingUploads <= 0}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl gold-gradient text-navy-800 font-semibold text-sm shadow-2xl shadow-gold/30 hover:shadow-gold/50 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Camera size={18} />
                {remainingUploads <= 0 ? "Max photos reached" : `Share a Moment (${remainingUploads} left)`}
              </>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Error */}
      {uploadError && (
        <div className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto bg-red-900/80 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-200 flex items-center justify-between z-50">
          {uploadError}
          <button onClick={() => setUploadError("")}><X size={14} /></button>
        </div>
      )}

      {/* Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-gold/15"
            >
              <h3 className="font-serif text-xl font-semibold text-white mb-1">
                What&apos;s your name?
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Your name will appear next to your photos in the gallery.
              </p>
              <input
                type="text"
                autoFocus
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-navy-800/60 border border-slate-700 rounded-xl px-4 py-3.5 text-[16px] text-white placeholder-slate-600 focus:outline-none focus:border-gold/50 transition-colors mb-4"
                onKeyDown={(e) => e.key === "Enter" && handleNameConfirm()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowNamePrompt(false); setPendingFiles([]); }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 glass border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm gold-gradient text-navy-800 font-semibold"
                >
                  Upload Photos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-8 w-full max-w-sm border border-gold/20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle size={28} className="text-gold" />
              </motion.div>
              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Photos Shared!
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Your moments are now live in the gallery.
              </p>
              {remainingUploads > 0 ? (
                <button
                  onClick={() => { setShowSuccess(false); triggerFilePicker(); }}
                  className="w-full py-3.5 rounded-xl gold-gradient text-navy-800 font-semibold text-sm mb-3"
                >
                  <Camera size={16} className="inline mr-2" />
                  Capture More Moments
                </button>
              ) : (
                <p className="text-sm text-slate-400 mb-3">
                  You&apos;ve reached the maximum of {MAX_UPLOADS} photos.
                </p>
              )}
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-2.5 rounded-xl text-sm text-slate-400 glass border border-white/10"
              >
                View Gallery
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-gold transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={18} />
            </button>
            <a
              href={lightbox.storage_url}
              download
              className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-gold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={18} />
            </a>
            <motion.img
              src={lightbox.storage_url}
              alt="Full size"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox.uploader_name && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/60 glass px-3 py-1.5 rounded-full">
                Shared by {lightbox.uploader_name}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
