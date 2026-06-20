"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Background scales up and moves slightly down as you scroll down
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  // Text content fades out and moves up
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative w-full h-[85vh] flex items-center justify-center bg-[#1C1917] text-[var(--color-text-inverse)] overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        style={{ y, scale }} 
        className="absolute inset-0 w-full h-full"
      >
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="/assets/hero-mosaic-01.png"
            alt="Artisanal crafts"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
          />
        </motion.div>
      </motion.div>

      {/* Floating Content */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6"
      >
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="font-display text-[var(--text-hero)] leading-tight text-white drop-shadow-md"
        >
          Curated Artisanal Masterpieces
        </motion.h1>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="font-body text-[var(--text-subtitle)] max-w-2xl text-white/90 drop-shadow"
        >
          Discover one-of-a-kind handcrafted pieces from independent creators around the world.
        </motion.p>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/shop"
            className="mt-4 px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-[var(--radius-sm)] font-medium transition-colors inline-block"
          >
            Explore Collection
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
