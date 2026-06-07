'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Camera, Share2, Download, Shield, Clock, Heart } from 'lucide-react'
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
            Never Miss a Memory
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: easing }}
            className="text-lg md:text-xl text-[#F8FAFC]/80 mb-8 max-w-2xl mx-auto font-sans"
          >
            Premium event photo galleries. One price. Every moment.
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
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-12 px-8 py-3 text-base font-medium text-[#F8FAFC] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 transition-all active:scale-95"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
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
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Create Event',
                description: 'Generate a unique event code in seconds. No setup required.',
              },
              {
                icon: Share2,
                title: 'Share Code',
                description: 'Guests scan the QR code or enter the code to upload photos.',
              },
              {
                icon: Download,
                title: 'Collect Photos',
                description: 'All photos in one beautiful gallery. Download everything at once.',
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

      {/* Features */}
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
            Why Vellon?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Secure Storage', description: 'Your photos are encrypted and stored securely.' },
              { icon: Clock, title: '15-Day Gallery', description: 'Perfect for events. Auto-purge after 15 days.' },
              { icon: Heart, title: 'Branded Experience', description: 'Elegant navy and gold theme for your special moments.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: easing }}
                className="flex items-start gap-4 p-6"
              >
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">{feature.title}</h3>
                  <p className="text-[#F8FAFC]/70 font-sans text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 px-4 bg-[#020617]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easing }}
            className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-3xl p-12 backdrop-blur-sm"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-[#F8FAFC] mb-4" style={{ letterSpacing: '-0.02em' }}>
              One Price. Every Moment.
            </h2>
            <p className="text-5xl md:text-6xl font-serif text-[#D4AF37] mb-6">₱699</p>
            <p className="text-[#F8FAFC]/70 mb-8 font-sans">For 15 days of seamless memory gathering.</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center min-h-12 px-8 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Start Your Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#020617] border-t border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#F8FAFC]/50 font-sans text-sm">
            © 2024 Vellon.photos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
