"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Link from "next/link";
import { Camera, X, ZoomIn, Info, CheckCircle, Upload, Send, ArrowLeft } from "lucide-react";
const DEMO_EVENT = {
  title: "Sarah & Marco's Wedding",
  description: "The big day! From the ceremony to the last dance — every angle matters. Share your favorite moments with us.",
  status: "active" as const,
  event_code: "DEMO12",
};

type Photo = { id: string; storage_url: string; uploader_name: string; caption?: string };

const INITIAL_PHOTOS: Photo[] = [
  { id: "1",  storage_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=900&fit=crop&q=80",  uploader_name: "Tita Lorna",     caption: "Walking down the aisle" },
  { id: "2",  storage_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=800&fit=crop&q=80",  uploader_name: "Kuya Boyet",      caption: "The vows" },
  { id: "3",  storage_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=750&fit=crop&q=80",  uploader_name: "Ate Marie",       caption: "Bridal bouquet detail" },
  { id: "4",  storage_url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=850&fit=crop&q=80",  uploader_name: "Cousin Jake",     caption: "Reception glow" },
  { id: "5",  storage_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=700&fit=crop&q=80",  uploader_name: "Sarah",           caption: "Getting ready" },
  { id: "6",  storage_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=650&fit=crop&q=80",  uploader_name: "Marco",           caption: "The groomsmen" },
  { id: "7",  storage_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=800&fit=crop&q=80",  uploader_name: "Tito Ben",        caption: "First dance under lights" },
  { id: "8",  storage_url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=700&fit=crop&q=80",  uploader_name: "Maid of Honor",   caption: "Wedding rings" },
  { id: "9",  storage_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=850&fit=crop&q=80",  uploader_name: "Photographer",    caption: "Cake cutting" },
  { id: "10", storage_url: "https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=600&h=750&fit=crop&q=80",  uploader_name: "Guest",           caption: "Sparkler send-off" },
  { id: "11", storage_url: "https://images.unsplash.com/photo-1469406396016-013bfae5d83e?w=600&h=700&fit=crop&q=80",  uploader_name: "Cousin Lisa",     caption: "Dancing the night away" },
  { id: "12", storage_url: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&h=800&fit=crop&q=80",  uploader_name: "Uncle Mike",      caption: "The happy couple" },
  { id: "13", storage_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop&q=80",  uploader_name: "Ninang Gina",     caption: "Ceremony arch" },
  { id: "14", storage_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&h=650&fit=crop&q=80",  uploader_name: "Best Man",        caption: "Champagne toast" },
  { id: "15", storage_url: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=600&h=750&fit=crop&q=80",  uploader_name: "Flower Girl",     caption: "Tossing petals" },
  { id: "16", storage_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80",  uploader_name: "DJ Carlo",        caption: "Party lights" },
  { id: "17", storage_url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&h=700&fit=crop&q=80",  uploader_name: "Tita Baby",       caption: "Table centerpiece" },
  { id: "18", storage_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=850&fit=crop&q=80",  uploader_name: "Lolo Peds",       caption: "Sunset portrait" },
  { id: "19", storage_url: "https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=600&h=700&fit=crop&q=80",  uploader_name: "Ate Lucy",        caption: "Bridesmaids laughing" },
  { id: "20", storage_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=850&fit=crop&q=80",  uploader_name: "Kuya Boyet",      caption: "Father daughter dance" },
  { id: "21", storage_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=800&fit=crop&q=80",  uploader_name: "Tita Lorna",      caption: "Candlelit dinner" },
  { id: "22", storage_url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=750&fit=crop&q=80",  uploader_name: "Sarah",           caption: "Bouquet toss" },
  { id: "23", storage_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=850&fit=crop&q=80",  uploader_name: "Marco",           caption: "Entourage photo" },
  { id: "24", storage_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=700&fit=crop&q=80",  uploader_name: "Best Man",        caption: "Groom getting ready" },
  { id: "25", storage_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=650&fit=crop&q=80",  uploader_name: "Maid of Honor",   caption: "Makeup session" },
  { id: "26", storage_url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=800&fit=crop&q=80",  uploader_name: "Photographer",    caption: "Detail shots" },
  { id: "27", storage_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=750&fit=crop&q=80",  uploader_name: "Cousin Jake",     caption: "Reception entrance" },
  { id: "28", storage_url: "https://images.unsplash.com/photo-1469406396016-013bfae5d83e?w=600&h=850&fit=crop&q=80",  uploader_name: "Ninang Gina",     caption: "Couple portrait" },
  { id: "29", storage_url: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&h=700&fit=crop&q=80",  uploader_name: "Uncle Mike",      caption: "Kids on the dance floor" },
  { id: "30", storage_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop&q=80",  uploader_name: "Flower Girl",     caption: "Garden ceremony" },
  { id: "31", storage_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&h=850&fit=crop&q=80",  uploader_name: "Tito Ben",        caption: "Late night snack bar" },
  { id: "32", storage_url: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=600&h=750&fit=crop&q=80",  uploader_name: "DJ Carlo",        caption: "Group selfie" },
  { id: "33", storage_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=700&fit=crop&q=80",  uploader_name: "Cousin Lisa",     caption: "Fireworks send-off" },
  { id: "34", storage_url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&h=800&fit=crop&q=80",  uploader_name: "Tita Baby",       caption: "Place cards" },
  { id: "35", storage_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=650&fit=crop&q=80",  uploader_name: "Lolo Peds",       caption: "Family portrait" },
  { id: "36", storage_url: "https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=600&h=850&fit=crop&q=80",  uploader_name: "Ate Marie",       caption: "Sisters moment" },
  { id: "37", storage_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=750&fit=crop&q=80",  uploader_name: "Guest",           caption: "Toast speech" },
  { id: "38", storage_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=700&fit=crop&q=80",  uploader_name: "Kuya Boyet",      caption: "After-party vibes" },
  { id: "39", storage_url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=800&fit=crop&q=80",  uploader_name: "Sarah",           caption: "Walking out together" },
  { id: "40", storage_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=650&fit=crop&q=80",  uploader_name: "Marco",           caption: "One last dance" },
];

const MAX_UPLOADS = 4;

const breakpointCols = { default: 3, 1100: 3, 700: 2, 500: 2 };

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: iPhone 16 Pro Max frame */}
      <div className="hidden md:flex justify-center items-center min-h-screen bg-[#e5e5e5] p-6">
        {/* Side buttons left */}
        <div className="relative">
          <div className="absolute -left-[3px] top-32 w-[3px] h-7 bg-[#2a2a2c] rounded-l" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-14 bg-[#2a2a2c] rounded-l" />
          <div className="absolute -left-[3px] top-60 w-[3px] h-14 bg-[#2a2a2c] rounded-l" />
          {/* Side button right */}
          <div className="absolute -right-[3px] top-40 w-[3px] h-20 bg-[#2a2a2c] rounded-r" />

          {/* Phone shell — transform creates containing block for fixed children */}
          <div className="relative w-[430px] h-[932px] rounded-[55px] border-[14px] border-[#1c1c1e] overflow-hidden shadow-[0_0_0_2px_#3a3a3c,0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-[#1c1c1e] transform">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 z-[60] flex items-end justify-between px-8 pb-2 pointer-events-none select-none">
              <span className="text-[11px] font-semibold text-white/80">9:41</span>
              <div className="flex items-center gap-1">
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><rect width="14" height="9" rx="2" fill="white" fillOpacity="0.6"/><rect x="1.5" y="1.5" width="11" height="6" rx="1" fill="#1c1c1e"/></svg>
              </div>
            </div>

            {/* Screen */}
            <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#FAFAFA] relative pt-12">
              {children}
            </div>

            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-[70] pointer-events-none" />

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/20 rounded-full z-[70] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile: render as-is */}
      <div className="md:hidden">
        {children}
      </div>
    </>
  );
}

export default function TestGalleryPage() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const goPrev = () => {
    if (lightboxIndex !== null) setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : photos.length - 1);
  };
  const goNext = () => {
    if (lightboxIndex !== null) setLightboxIndex(lightboxIndex < photos.length - 1 ? lightboxIndex + 1 : 0);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(t);
  }, [showSuccess]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < photos.length) {
          setVisibleCount((c) => Math.min(c + 20, photos.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, photos.length]);

  const remainingUploads = MAX_UPLOADS - uploadCount;

  const openUploadModal = () => {
    if (remainingUploads <= 0) return;
    setNote("");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, remainingUploads);
    if (!files.length) return;
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!uploaderName.trim() || !selectedFiles.length) return;
    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newPhotos = selectedFiles.map((file, i) => ({
        id: `guest-${Date.now()}-${i}`,
        storage_url: previewUrls[i],
        uploader_name: uploaderName.trim(),
        caption: note.trim() || undefined,
      }));
      setPhotos((prev) => [...newPhotos, ...prev]);
      setUploadCount((c) => c + selectedFiles.length);
      setUploading(false);
      setShowUploadModal(false);
      setShowSuccess(true);
    }, 1500);
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] pb-28">
      {/* Demo Alert — bottom snackbar */}
      <AnimatePresence>
        {showDemoNotice && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
          >
            <div className="bg-[#1F2937] text-white rounded-2xl px-4 py-3 shadow-xl shadow-black/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs leading-relaxed">
                <Info size={14} className="text-[#C9A84C] flex-shrink-0" />
                <span>This is a demo — experience what your guests will see</span>
              </div>
              <button onClick={() => setShowDemoNotice(false)} className="text-white/40 hover:text-white flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header — visible when scrolled */}
      <AnimatePresence>
        {scrolled && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]"
          >
            <div className="px-4 h-12 flex items-center justify-between">
              <h2 className="font-serif text-sm font-bold text-[#1F2937] truncate max-w-[60%]">
                {DEMO_EVENT.title}
              </h2>
              <span className="text-xs text-[#9CA3AF]">{photos.length} photos · {new Set(photos.map((p) => p.uploader_name)).size} guests</span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Back to home */}
      <div className="px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#1F2937] transition-colors">
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>

      {/* Event Title */}
      <div className="px-4 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] text-[#C9A84C] text-xs font-medium tracking-wider uppercase mb-3">
          DEMO · {DEMO_EVENT.event_code}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] mb-2">
          {DEMO_EVENT.title}
        </h1>
        {DEMO_EVENT.description && (
          <p className="text-[#6B7280] text-sm max-w-xl mx-auto">{DEMO_EVENT.description}</p>
        )}
        <p className="text-xs text-[#9CA3AF] mt-3">
          {photos.length} photos · {new Set(photos.map((p) => p.uploader_name)).size} guests
        </p>
      </div>

      {/* Gallery */}
      <div className="px-2 sm:px-4 py-4">
        <Masonry
          breakpointCols={breakpointCols}
          className="flex gap-2 sm:gap-3"
          columnClassName="flex flex-col gap-2 sm:gap-3"
        >
          {photos.slice(0, visibleCount).map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="relative group cursor-pointer rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#C9A84C]/30 transition-colors"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={photo.storage_url}
                alt={photo.caption ?? "Event photo"}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-white/80">{photo.uploader_name}</span>
                  <ZoomIn size={14} className="text-white/80" />
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>

        {/* Infinite scroll sentinel */}
        {visibleCount < photos.length && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Button — pinned bottom center */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4">
        <button
          onClick={openUploadModal}
          disabled={remainingUploads <= 0}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#1F2937] text-white font-semibold text-sm shadow-xl shadow-[#1F2937]/20 hover:bg-[#374151] hover:shadow-[#1F2937]/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Camera size={18} />
          {remainingUploads <= 0 ? "Max photos reached" : "Share a Moment"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] transition-colors z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={18} />
            </button>

            {/* Prev */}
            <button
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            {/* Next */}
            <button
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            {/* Image with swipe */}
            <motion.div
              key={lightboxPhoto.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                (e.currentTarget as HTMLElement).dataset.touchStartX = String(touch.clientX);
              }}
              onTouchEnd={(e) => {
                const startX = Number((e.currentTarget as HTMLElement).dataset.touchStartX);
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (diff > 50) goNext();
                if (diff < -50) goPrev();
              }}
            >
              <img
                src={lightboxPhoto.storage_url}
                alt="Full size"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
              <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                <span>{lightboxIndex! + 1} / {photos.length}</span>
                {lightboxPhoto.uploader_name && (
                  <span>· Shared by {lightboxPhoto.uploader_name}</span>
                )}
                {lightboxPhoto.caption && (
                  <span>· {lightboxPhoto.caption}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E5E7EB] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl font-semibold text-[#1F2937]">Share a Moment</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <X size={18} />
                </button>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="e.g. Tita Lorna"
                  className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
                />
              </div>

              {/* Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Leave a Note <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A quick message for the couple..."
                  className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
                />
              </div>

              {/* Photo picker */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Photos <span className="text-[#9CA3AF] font-normal">· Choose up to 4 images</span>
                </label>
                {previewUrls.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl py-8 flex flex-col items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                  >
                    <Upload size={22} />
                    <span className="text-sm">Tap to choose photos</span>
                    <span className="text-xs text-[#9CA3AF]">Up to {remainingUploads} remaining</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB]">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePreview(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {previewUrls.length < remainingUploads && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 flex flex-col items-center justify-center gap-1 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                      >
                        <Upload size={16} />
                        <span className="text-xs">Add more</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!uploaderName.trim() || !selectedFiles.length || uploading}
                className="w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Share to Gallery
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-sm border border-[#E5E7EB] shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle size={28} className="text-[#C9A84C]" />
              </motion.div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">
                Photos Shared!
              </h3>
              <p className="text-[#6B7280] text-sm mb-6">
                Your moments are now live in the gallery.
              </p>
              {remainingUploads > 0 ? (
                <button
                  onClick={() => { setShowSuccess(false); openUploadModal(); }}
                  className="w-full py-3.5 rounded-xl bg-[#1F2937] text-white font-semibold text-sm mb-3 hover:bg-[#374151] transition-colors"
                >
                  <Camera size={16} className="inline mr-2" />
                  Share More Moments
                </button>
              ) : (
                <p className="text-xs text-[#9CA3AF] mb-3">
                  You&apos;ve reached the maximum of {MAX_UPLOADS} photos.
                </p>
              )}
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-2.5 rounded-xl text-sm text-[#9CA3AF] border border-[#E5E7EB] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors"
              >
                View Gallery
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] mt-12">
        <div className="px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-serif font-bold text-xl tracking-tight">
            <span className="text-[#C9A84C]">Vellon</span>
            <span className="text-[#6B7280] font-light">.photos</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            Every angle, one gallery.
          </p>
        </div>
      </footer>
    </div>
    </PhoneFrame>
  );
}
