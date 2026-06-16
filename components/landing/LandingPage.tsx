"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Eye, EyeOff, QrCode, Images, Sparkles, Check, ArrowRight, Menu, ChevronDown,
  Heart, Cake, Building2, Smartphone, PartyPopper,
} from "lucide-react";
import Navigation from "@/components/Navigation";

type ModalTab = "signin" | "signup";

interface Props {
  user: { id: string } | null;
  displayName: string | null;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
  "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1600&q=80",
];

function HeroBackground() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={HERO_IMAGES[index]}
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
    </div>
  );
}

export function LandingPage({ user: serverUser, displayName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use client-side user state for real-time auth changes
  const [user, setUser] = useState<{ id: string } | null>(serverUser);

  // Sync with server user prop
  useEffect(() => {
    setUser(serverUser);
  }, [serverUser]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [modal, setModal] = useState<ModalTab | null>(null);
  const [tab, setTab] = useState<ModalTab>("signin");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);

  // Auto-open modal with signup tab if query param is present
  useEffect(() => {
    const modalParam = searchParams.get("modal");
    // Only open modal if user is NOT logged in
    if (modalParam === "signup" && !user) {
      setModal("signup");
      setTab("signup");
      // Clean URL by removing the query param
      router.replace("/", { scroll: false });
    }
  }, [searchParams, user, router]);

  // Close modal if user logs in
  useEffect(() => {
    if (user && modal) {
      setModal(null);
    }
  }, [user, modal]);

  // --- sign-in state ---
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass]   = useState("");
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);

  // --- sign-up state ---
  const [suName, setSuName]   = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass]   = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);

  const openModal = useCallback((t: ModalTab) => {
    if (user) {
      router.push('/dashboard');
      return;
    }
    setModal(t);
    setTab(t);
    setSiError(""); setSuError("");
  }, [user, router]);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setSiLoading(true); setSiError("");
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPass });
    if (error) {
      setSiError(
        error.message.toLowerCase().includes("invalid")
          ? "Incorrect email or password."
          : error.message
      );
      setSiLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (suPass.length < 8) { setSuError("Password must be at least 8 characters."); return; }
    setSuLoading(true); setSuError("");
    
    const { data, error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPass,
      options: {
        data: {
          full_name: suName,
        }
      }
    });
    
    if (error) { setSuError(error.message); setSuLoading(false); return; }
    
    // Create profile after signup
    try {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user?.id, email: suEmail, fullName: suName }),
      });
      if (!res.ok) {
        const result = await res.json();
        setSuError(result.error ?? "Profile creation failed.");
        setSuLoading(false);
        return;
      }
    } catch (err) {
      setSuError("Profile creation failed.");
      setSuLoading(false);
      return;
    }
    
    router.push("/dashboard");
    router.refresh();
  };

  const inputCls = "w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-[16px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all placeholder-[#9CA3AF]";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">

      {/* ── Nav ── */}
      <Navigation showScrollLinks />

      <main>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Background slideshow */}
          <HeroBackground />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.07),transparent_65%)] pointer-events-none z-[1]" />
          <div className="relative z-[2] max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs sm:text-sm font-medium text-[#6B7280] mb-8 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              No app needed
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="font-serif text-7xl font-bold leading-[1.08] tracking-tight text-[#1F2937] mb-5"
            >
              Every photo,<br />
              <span className="italic font-normal text-[#C9A84C]">one beautiful story.</span>
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              className="w-16 h-px bg-[#C9A84C] mx-auto mb-7 opacity-60 origin-center"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="text-lg sm:text-xl text-[#6B7280] max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Your guests scan a QR code and instantly upload photos. You get a stunning shared event that tells your story beautifully.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => user ? router.push('/dashboard') : openModal("signup")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors shadow-md"
              >
                Create Your Event <ArrowRight size={15} />
              </motion.button>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E5E7EB] bg-white/80 backdrop-blur-sm text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:border-[#C9A84C]/40 hover:shadow-sm transition-all"
              >
                Try a Demo Event
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Value Props strip ── */}
        <section className="border-y border-[#E5E7EB] bg-white py-10 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "◎", title: "Beautiful Design",   desc: "Elegant layouts that look like a magazine." },
              { icon: "✦", title: "With Music",         desc: "Add your favorite songs to set the mood." },
              { icon: "⟳", title: "Super Easy",         desc: "No apps to download. Just scan and share." },
              { icon: "▦", title: "Works Everywhere",       desc: "Perfect on phones, tablets, and computers." },
            ].map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                className="flex gap-4 items-start"
              >
                <span className="text-[#C9A84C] text-xl mt-0.5 flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937] mb-1">{title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 px-5 sm:px-8 bg-[#FDFBF7]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">How It Works</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937]">From setup to live in minutes.</h2>
            </motion.div>
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: "1", icon: Sparkles, title: "Setup in Seconds",          desc: "Create your event, customize your story, and receive your unique QR code instantly." },
                { num: "2", icon: QrCode,   title: "Seamless Guest Experience", desc: "Place your QR code on tables or share the link. Guests scan with their phone camera to upload—no downloads required." },
                { num: "3", icon: Images,   title: "Relive the Magic",           desc: "Watch your digital album come to life. Guests can view and share photos instantly, and you get everything in full resolution." },
              ].map(({ num, icon: Icon, title, desc }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3, delay: i * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative bg-white rounded-2xl p-7 border border-[#E5E7EB] hover:border-[#C9A84C]/40 hover:shadow-md transition-shadow group"
                >
                  <div className="absolute top-5 right-6 font-serif text-6xl font-bold text-[#F3F4F6] select-none group-hover:text-[#FDF6E3] transition-colors">{num}</div>
                  <div className="w-11 h-11 rounded-xl bg-[#FDFBF7] border border-[#E5E7EB] flex items-center justify-center mb-5">
                    <Icon size={19} className="text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">{title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 sm:px-8"><div className="h-px bg-[#E5E7EB]" /></div>

        {/* ── Why Vellon / Use Cases ── */}
        <section className="py-24 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center mb-4"
            >
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Why Vellon.photos</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
                Built for every celebration.
              </h2>
              <p className="text-[#6B7280] max-w-xl mx-auto text-base">
                Discover why events across the Philippines trust Vellon.photos to gather their best moments.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              {[
                { icon: Heart, title: "Weddings",  desc: "Curate every candid angle from the aisle to the after-party.", slug: "wedding-photo-sharing-philippines" },
                { icon: Sparkles, title: "Debuts",    desc: "Perfect for 18th-birthday milestones and celebrations.",       slug: "debut-photo-sharing" },
                { icon: Cake, title: "Birthdays", desc: "Capture the joy of every family milestone.",                   slug: "birthday-photo-sharing" },
                { icon: Building2, title: "Corporate", desc: "Elevate launches, team building, and company events.",         slug: "corporate-event-photo-sharing" },
                { icon: Smartphone, title: "The No-App Experience", desc: "Designed specifically for effortless, browser-based sharing.", slug: "no-download-photo-sharing" },
                { icon: PartyPopper, title: "Reunions & Gatherings", desc: "From barkada trips to family reunions — collect every candid, group shot, and silly moment in one private event.", slug: "event-photo-sharing" },
              ].map(({ icon: Icon, title, desc, slug }, i) => (
                <Link key={title} href={`/guides/${slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className={[
                      "bg-white rounded-2xl p-6 border border-[#E5E7EB] hover:border-[#C9A84C]/40 hover:shadow-sm transition-shadow group cursor-pointer h-full flex flex-col",
                      i >= 4 && !showAllMobile ? "hidden sm:block" : "",
                    ].join(" ")}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                      <Icon size={24} className="text-[#C9A84C]" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-2">{title}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-4 flex-grow">{desc}</p>
                    <span className="text-sm font-semibold text-[#C9A84C] hover:text-[#B8963E] transition-colors inline-flex items-center gap-1">
                      Read the Guide <ArrowRight size={11} />
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Show more (mobile only) */}
            {!showAllMobile && (
              <div className="mt-6 flex justify-center sm:hidden">
                <button
                  onClick={() => setShowAllMobile(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
                >
                  Show more <ChevronDown size={15} />
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 sm:px-8"><div className="h-px bg-[#E5E7EB]" /></div>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-5 sm:px-8 bg-[#FDFBF7]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className="text-sm font-semibold tracking-widest uppercase text-[#C9A84C] mb-3">Pricing</p>
              <h2 className="font-serif text-4xl font-bold text-[#1F2937] mb-2">Simple, Transparent Pricing.</h2>
              <p className="text-[#6B7280] text-sm mb-12">Choose the plan that fits your needs.</p>
            </motion.div>
            
            <div className="max-w-md mx-auto">
              {/* Heritage Event - B2C */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-8 right-8 h-px bg-[#C9A84C] opacity-50" />
                <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Your Life, Published</p>
                <p className="text-sm text-[#6B7280] mb-2">A permanent multi-sensory link for emotional recall</p>
                <div className="font-serif text-6xl font-bold text-[#1F2937] mb-1">₱999</div>
                <p className="text-sm text-[#9CA3AF] mb-1">one-time payment per event</p>
                <ul className="space-y-3 text-sm text-left mb-8">
                  {[
                    "Permanent multi-sensory heirloom link",
                    "3 curated editorial typography presets",
                    "Ambient audio for cinematic storytelling",
                    "Automated print-ready QR kit generation",
                    "Up to 2,000 photos per event",
                  ].map((f, i) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: 0.15 + i * 0.04, ease: "easeOut" }}
                      className="flex items-center gap-2.5 text-[#374151]"
                    >
                      <Check size={14} className="text-[#C9A84C] flex-shrink-0" strokeWidth={2.5} />
                      {f}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => user ? router.push('/dashboard') : openModal("signup")}
                  className="block w-full py-3.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm text-center hover:bg-[#374151] transition-colors"
                >
                  Get Started →
                </motion.button>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-5 sm:px-8 bg-[#1F2937]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-12 h-px bg-[#C9A84C] mx-auto mb-8 opacity-60 origin-center"
            />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Ready to capture the moments that matter?
            </h2>
            <p className="text-[#9CA3AF] mb-8 text-base">Start free. No downloads. No setup. Just a beautiful event.</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => user ? router.push('/dashboard') : openModal("signup")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C9A84C] text-white font-semibold text-sm hover:bg-[#B8963E] transition-colors shadow-lg"
            >
              Start Your Event <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#1A1F2E] text-[#9CA3AF] py-14 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <span className="font-serif font-bold text-xl text-[#C9A84C]">
                Vellon.photos
              </span>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Captured by You — Powered by Vellon.photos
              </p>
            </div>
            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#6B7280] mb-4">Quick Links</p>
              <ul className="space-y-2">
                {[
                  { label: "Pricing", href: "/pricing" },
                  { label: "About",   href: "/about" },
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms",   href: "/terms" },
                  { label: "Refunds", href: "/refunds" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Guides */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#6B7280] mb-4">Popular Guides</p>
              <ul className="space-y-2">
                {[
                  ["Event Photo Sharing",              "/guides/event-photo-sharing"],
                  ["QR Photo Sharing",                 "/guides/qr-photo-sharing"],
                  ["Wedding Photo Sharing",            "/guides/wedding-photo-sharing"],
                  ["Wedding Photo Sharing PH",         "/guides/wedding-photo-sharing-philippines"],
                  ["Debut Photo Sharing",              "/guides/debut-photo-sharing"],
                  ["Birthday Photo Sharing",           "/guides/birthday-photo-sharing"],
                  ["Corporate Event PH",               "/guides/corporate-event-photo-sharing"],
                  ["QR Photo Sharing App",             "/guides/qr-photo-sharing-app"],
                  ["No-Download Photo Sharing",        "/guides/no-download-photo-sharing-app"],
                  ["Affordable Event Photo Sharing",   "/guides/affordable-event-photo-sharing"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-[#4B5563]">© {new Date().getFullYear()} Vellon.photos. All rights reserved.</p>
            {!user && (
              <button onClick={() => openModal("signup")} className="text-sm hover:text-white transition-colors">Sign in</button>
            )}
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {!user && modal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Drag handle (mobile) */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#E5E7EB] mx-auto mt-3 mb-1" />
            {/* Header */}
            <div className="pt-5 sm:pt-7 pb-0 px-6 sm:px-8 text-center">
              <span className="font-serif text-2xl font-bold">
                <span className="text-[#C9A84C]">Vellon</span>
                <span className="text-[#6B7280] font-light">.photos</span>
              </span>
              <p className="mt-1 text-xs tracking-widest text-[#9CA3AF] uppercase font-medium">
                Share photos. No app needed.
              </p>
            </div>

            <hr className="mx-6 sm:mx-8 mt-4 border-[#E5E7EB]" />

            <div className="px-6 sm:px-8 pt-5 pb-6 sm:pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {/* Tab switcher */}
              <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6">
                {(["signin", "signup"] as ModalTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setSiError(""); setSuError(""); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      tab === t
                        ? "bg-[#1F2937] text-white shadow-sm"
                        : "text-[#9CA3AF] hover:text-[#6B7280]"
                    }`}
                  >
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Sign In form */}
              {tab === "signin" && (
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
                    <input
                      type="email" required autoComplete="email"
                      value={siEmail} onChange={(e) => setSiEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-[#374151]">Password</label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!siEmail) { setSiError("Enter your email first."); return; }
                          await supabase.auth.resetPasswordForEmail(siEmail);
                          setSiError("Password reset email sent — check your inbox.");
                        }}
                        className="text-sm text-[#C9A84C] hover:text-[#B8963E] transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={siShowPw ? "text" : "password"} required autoComplete="current-password"
                        value={siPass} onChange={(e) => setSiPass(e.target.value)}
                        placeholder="••••••••"
                        className={inputCls + " pr-9"}
                      />
                      <button type="button" onClick={() => setSiShowPw(!siShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                        {siShowPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  {siError && <p className="text-sm text-red-500">{siError}</p>}
                  <button
                    type="submit"
                    disabled={siLoading}
                    className="w-full py-3 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors disabled:opacity-50"
                  >
                    {siLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              )}

              {/* Sign Up form */}
              {tab === "signup" && (
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Name</label>
                    <input
                      type="text" required autoComplete="name"
                      value={suName} onChange={(e) => setSuName(e.target.value)}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
                    <input
                      type="email" required autoComplete="email"
                      value={suEmail} onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={suShowPw ? "text" : "password"} required autoComplete="new-password"
                        value={suPass} onChange={(e) => setSuPass(e.target.value)}
                        placeholder="••••••••"
                        className={inputCls + " pr-9"}
                      />
                      <button type="button" onClick={() => setSuShowPw(!suShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                        {suShowPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  {suError && <p className="text-sm text-red-500">{suError}</p>}
                  <button
                    type="submit"
                    disabled={suLoading}
                    className="w-full py-3 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors disabled:opacity-50"
                  >
                    {suLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
