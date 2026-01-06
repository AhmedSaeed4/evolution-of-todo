'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TaskSplitEditor } from './task-split-editor';

interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  headline: string;
  subtext: string;
  ctaPrimary: string;
  ctaSecondary: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function HeroSection({
  headline,
  subtext,
  ctaPrimary,
  ctaSecondary,
  onPrimaryClick,
  onSecondaryClick,
  ...props
}: HeroSectionProps) {
  // 🎯 SMOOTH ANIMATION PATTERNS - Surgical Precision
  const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

  // Main container cascade
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  // Text entrance
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: SMOOTH_EASE }
    }
  };

  // Button entrance
  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: SMOOTH_EASE }
    }
  };

  // Interactive spring
  const interactiveSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.5
  };

  return (
    <section className="relative py-24 px-6 border-b border-[#2A1B12]/10 overflow-hidden" {...props}>
      {/* Minimal background accent - Single subtle line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-[#2A1B12]/5 top-1/3 absolute" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-8"
          >
            {/* Headline - Clean word-by-word reveal */}
            <motion.h1
              variants={textVariants}
              className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.85] tracking-tighter text-[#2A1B12] overflow-hidden"
            >
              {headline.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  variants={textVariants}
                  className="inline-block mr-[0.2em]"
                  style={{ display: 'inline-block' }}
                >
                  {word === 'TODAY' ? (
                    <motion.span
                      className="text-[#FF6B4A] ml-[0.1em]"
                      whileHover={{ scale: 1.01 }}
                      transition={interactiveSpring}
                    >
                      {word}
                    </motion.span>
                  ) : word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={textVariants}
              className="max-w-xl text-lg text-[#5C4D45] font-sans border-l-2 border-[#FF6B4A] pl-6"
            >
              {subtext}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={buttonVariants}
              className="mt-4 flex gap-6 flex-wrap items-center"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={interactiveSpring}
              >
                <Button variant="primary" size="lg" onClick={onPrimaryClick}>
                  {ctaPrimary}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={interactiveSpring}
              >
                <Button variant="secondary" size="lg" onClick={onSecondaryClick}>
                  {ctaSecondary}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column - Split Screen Editor */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:pl-8"
          >
            <TaskSplitEditor />
          </motion.div>
        </div>
      </div>
    </section>
  );
}