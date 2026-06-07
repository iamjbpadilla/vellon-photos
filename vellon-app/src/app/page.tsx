'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Camera, Share2, Download } from 'lucide-react'
import Link from 'next/link'

const easing = [0.16, 1, 0.3, 1] as const

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easing }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F8FAFC] mb-6 leading-tight tracking-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            Every angle, one gallery.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: easing }}
            className="text-lg md:text-xl text-[#F8FAFC]/80 mb-8 max-w-2xl mx-auto font-sans"
          >
            The premium, app-free photo sharing service. Gather every perspective of your celebration in one beautifully organized, live-updating collection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: easing }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center min-h-12 px-8 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Start Your Free Trial</span>
              <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Vellon Difference */}
      <section className="py-24 px-4 bg-[#020617]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easing }}
            className="font-serif text-4xl md:text-5xl text-[#F8FAFC] text-center mb-16"
            style={{ letterSpacing: '-0.02em' }}
          >
            The Vellon Difference
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'No Apps, No Friction.',
                description: 'Your guests don\'t need to download anything. They scan your QR code and start capturing. It\'s that simple.',
              },
              {
                title: 'Your Event, Curated.',
                description: 'Stop chasing friends for photos on Messenger. Get every guest\'s perspective delivered to one, elegant, live-updating gallery.',
              },
              {
                title: 'Sophisticated Keepsake.',
                description: 'A high-end digital experience that matches the elegance of your wedding or celebration.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: easing }}
                className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-2xl p-8 backdrop-blur-sm"
              >
                <h3 className="font-serif text-2xl text-[#F8FAFC] mb-4">{feature.title}</h3>
                <p className="text-[#F8FAFC]/70 font-sans leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-[#020617]/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easing }}
            className="font-serif text-4xl md:text-5xl text-[#F8FAFC] text-center mb-16"
            style={{ letterSpacing: '-0.02em' }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Generate',
                description: 'Create your Vellon event and get your unique QR code instantly.',
              },
              {
                icon: Share2,
                title: 'Display',
                description: 'Print your QR codes and place them at your tables or invite guests via link.',
              },
              {
                icon: Download,
                title: 'Gather',
                description: 'Watch your gallery come to life in real-time as guests upload their favorite shots.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: easing }}
                className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-2xl p-8 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center mb-6">
                  <step.icon className="h-6 w-6 text-[#020617]" />
                </div>
                <h3 className="font-serif text-2xl text-[#F8FAFC] mb-3">{step.title}</h3>
                <p className="text-[#F8FAFC]/70 font-sans">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-[#020617]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easing }}
            className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-3xl p-12 backdrop-blur-sm"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#F8FAFC] mb-4" style={{ letterSpacing: '-0.02em' }}>
              Simplicity at its best.
            </h2>
            <p className="text-[#F8FAFC]/70 mb-6 font-sans">One price. Unlimited uploads. 15-day gallery access.</p>
            <p className="text-6xl md:text-7xl font-serif text-[#D4AF37] mb-4">₱699</p>
            <p className="text-[#F8FAFC]/70 mb-8 font-sans">One-time fee for the entire event. No hidden costs, no tiered plans.</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center min-h-12 px-8 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-[#020617] border-t border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easing }}
            className="font-serif text-3xl md:text-4xl text-[#F8FAFC] mb-8"
            style={{ letterSpacing: '-0.02em' }}
          >
            Elevate your event.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease: easing }}
            className="mb-8"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center min-h-12 px-8 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2, ease: easing }}
            className="flex items-center justify-center gap-6 text-[#F8FAFC]/50 font-sans text-sm"
          >
            <Link href="#" className="hover:text-[#D4AF37] transition-colors">FAQ</Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#D4AF37] transition-colors">Contact</Link>
          </motion.div>
          <p className="text-[#F8FAFC]/30 font-sans text-sm mt-8">
            © 2024 Vellon.photos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
