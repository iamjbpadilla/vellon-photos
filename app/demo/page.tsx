"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Link from "next/link";
import { Camera, X, ZoomIn, CheckCircle, Upload, Send, ArrowLeft, Sparkles, Download, Play, Pause, Music } from "lucide-react";

const DEMO_EVENT = {
  title: "Sarah & Marco's Wedding",
  description: "The big day! From the ceremony to the last dance — every angle matters. Share your favorite moments with us.",
  status: "active" as const,
  event_code: "WED-7X9K",
};

type Photo = { id: string; storage_url: string; uploader_name: string; caption?: string };

const DEFAULT_PHOTOS: Photo[] = [
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

const breakpointCols = { default: 4, 1400: 5, 1100: 4, 768: 3, 500: 2 };

export default function TestGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxDirection, setLightboxDirection] = useState<"next" | "prev" | null>(null);
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  useEffect(() => {
    setPhotos(DEFAULT_PHOTOS);
    sessionStorage.removeItem("demo_photos");
  }, []);

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxDirection("prev");
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : photos.length - 1);
    }
  };
  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxDirection("next");
      setLightboxIndex(lightboxIndex < photos.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  const toggleSlideshow = () => {
    if (isSlideshow) {
      setIsSlideshow(false);
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    } else {
      setIsSlideshow(true);
      slideshowIntervalRef.current = setInterval(() => {
        goNext();
      }, 3000);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
    setDownloadError("");
  };

  const handleDownloadSubmit = async () => {
    if (!downloadEmail.trim() || !downloadCode.trim()) {
      setDownloadError("Please enter both email and download code.");
      return;
    }
    if (!downloadEmail.includes("@")) {
      setDownloadError("Please enter a valid email address.");
      return;
    }
    if (!lightboxPhoto) return;
    try {
      const response = await fetch(lightboxPhoto.storage_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vellon-${DEMO_EVENT.event_code}-${lightboxIndex}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDownloadModal(false);
      setDownloadEmail("");
      setDownloadCode("");
    } catch (error) {
      setDownloadError("Download failed. Please try again.");
    }
  };

  useEffect(() => {
    if (lightboxIndex === null) {
      setIsSlideshow(false);
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    }
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === " ") {
        e.preventDefault();
        toggleSlideshow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [saveName, setSaveName] = useState(true);
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadEmail, setDownloadEmail] = useState("");
  const [downloadCode, setDownloadCode] = useState("");
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("vellon_uploader_name");
    if (savedName) {
      setUploaderName(savedName);
      setSaveName(true);
    }
  }, []);

  useEffect(() => {
    if (saveName && uploaderName) {
      localStorage.setItem("vellon_uploader_name", uploaderName);
    } else if (!saveName) {
      localStorage.removeItem("vellon_uploader_name");
    }
  }, [uploaderName, saveName]);

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

  const openUploadModal = () => {
    setNote("");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_UPLOADS);
    if (!files.length) return;
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!uploaderName.trim() || !selectedFiles.length) return;
    setUploading(true);

    setTimeout(() => {
      const newPhotos = selectedFiles.map((file, i) => ({
        id: `guest-${Date.now()}-${i}`,
        storage_url: previewUrls[i],
        uploader_name: uploaderName.trim(),
        caption: note.trim() || undefined,
      }));
      setPhotos((prev: Photo[]) => [...newPhotos, ...prev]);
      setUploading(false);
      setShowUploadModal(false);
      setShowSuccess(true);
    }, 1500);
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
    setPreviewUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] pb-28">
      <AnimatePresence>
        {scrolled && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]"
          >
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 h-12 flex items-center justify-between">
              <h2 className="font-serif text-sm font-bold text-[#1F2937] truncate max-w-[60%]">
                {DEMO_EVENT.title}
              </h2>
              <span className="text-xs text-[#9CA3AF]">{photos.length} photos · {new Set(photos.map((p) => p.uploader_name)).size} guests</span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        <AnimatePresence>
          {showDemoNotice && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="pt-6"
            >
              <div className="bg-[#1F2937] text-white rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-sm leading-relaxed">
                  <Sparkles size={16} className="text-[#C9A84C] flex-shrink-0" />
                  <span>Try it out — upload a photo to see how your guests will experience your gallery</span>
                </div>
                <button onClick={() => setShowDemoNotice(false)} className="text-white/40 hover:text-white flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#1F2937] transition-colors">
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>

        <div className="pt-6 pb-4 text-center max-w-4xl mx-auto">
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
            {photos.length} photos · {new Set(photos.map((p: Photo) => p.uploader_name)).size} guests
          </p>
        </div>

        <div className="py-4">
          <Masonry
            breakpointCols={breakpointCols}
            className="flex gap-2 sm:gap-3"
            columnClassName="flex flex-col gap-2 sm:gap-3"
          >
            {photos.slice(0, visibleCount).map((photo: Photo, i: number) => (
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

          {visibleCount < photos.length && (
            <div ref={sentinelRef} className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          )}
        </div>

        <audio
          ref={audioRef}
          loop
          src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-piano-12345.mp3"
        />

        <button
          onClick={openUploadModal}
          disabled={uploading}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-base shadow-lg shadow-[#C9A84C]/20 hover:bg-[#B8943D] hover:shadow-[#C9A84C]/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Camera size={20} />
          Share a Moment
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <AnimatePresence>
          {lightboxPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] transition-colors z-10"
                onClick={() => setLightboxIndex(null)}
              >
                <X size={18} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); toggleSlideshow(); }}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full border flex items-center justify-center transition-colors z-10 ${
                  isSlideshow
                    ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
                    : 'bg-white/10 border-white/20 text-white hover:text-[#C9A84C]'
                }`}
              >
                {isSlideshow ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="absolute top-4 left-16 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
              >
                <Download size={18} />
              </button>

              <button
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <button
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>

              <motion.div
                key={lightboxPhoto.id}
                initial={{
                  opacity: 0,
                  x: lightboxDirection === "next" ? 10 : lightboxDirection === "prev" ? -10 : 0
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onAnimationComplete={() => setLightboxDirection(null)}
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

                {uploading ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4">
                      <span className="w-6 h-6 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Uploading your photos...</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Please keep this page open while uploading</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        <strong>Don't close this browser</strong> or your upload may be interrupted
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={uploaderName}
                          onChange={(e) => setUploaderName(e.target.value)}
                          placeholder="e.g. Tita Lorna"
                          className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all pr-10"
                        />
                        {uploaderName && (
                          <button
                            type="button"
                            onClick={() => { setUploaderName(""); setSaveName(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                        <input
                          type="checkbox"
                          checked={saveName}
                          onChange={(e) => setSaveName(e.target.checked)}
                          className="rounded border-[#D1D5DB] text-[#C9A84C] focus:ring-[#C9A84C]"
                        />
                        Remember my name for future uploads
                      </label>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Leave a Note <span className="text-[#9CA3AF] font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="A quick message for the couple..."
                        className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
                      />
                    </div>

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
                          <span className="text-xs text-[#9CA3AF]">Up to 4 at a time</span>
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
                          {previewUrls.length < MAX_UPLOADS && (
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
                      <Send size={14} />
                      Share to Gallery
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <button
                  onClick={() => { setShowSuccess(false); openUploadModal(); }}
                  className="w-full py-3.5 rounded-xl bg-[#1F2937] text-white font-semibold text-sm mb-3 hover:bg-[#374151] transition-colors"
                >
                  <Camera size={16} className="inline mr-2" />
                  Share More Moments
                </button>
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

        <AnimatePresence>
          {showDownloadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md"
              onClick={() => setShowDownloadModal(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="sm:hidden w-10 h-1 rounded-full bg-[#E5E7EB] mx-auto mt-3 mb-1" />

                <div className="pt-5 sm:pt-7 pb-0 px-6 sm:px-8 text-center">
                  <h2 className="font-serif text-xl font-bold text-[#1F2937] mb-1">Download Photo</h2>
                  <p className="text-sm text-[#6B7280]">Enter your email and download code to continue</p>
                </div>

                <hr className="mx-6 sm:mx-8 mt-4 border-[#E5E7EB]" />

                <form onSubmit={(e) => { e.preventDefault(); handleDownloadSubmit(); }} className="px-6 sm:px-8 pt-5 pb-6 sm:pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom)]">
                  {downloadError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {downloadError}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={downloadEmail}
                      onChange={(e) => setDownloadEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Download Code
                    </label>
                    <input
                      type="text"
                      required
                      value={downloadCode}
                      onChange={(e) => setDownloadCode(e.target.value)}
                      placeholder="Enter your code"
                      className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
                  >
                    Download Photo
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="border-t border-[#E5E7EB] mt-12">
          <div className="px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="font-serif font-bold text-xl tracking-tight text-[#C9A84C]">
              Vellon.photos
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Every angle, one gallery.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
