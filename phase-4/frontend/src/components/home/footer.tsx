'use client';

import { motion, Variants } from 'framer-motion';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { cardEntrance, viewportStagger } from '@/motion/patterns';

interface FooterNavigationItem {
  label: string;
  href: string;
}

interface SocialLink {
  platform: 'x' | 'linkedin' | 'github';
  url: string;
  icon: string;
}

interface FooterProps {
  brandName: string;
  navigation: FooterNavigationItem[];
  social: SocialLink[];
  copyright: string;
}

const iconMap = {
  Twitter: Twitter,
  Linkedin: Linkedin,
  Github: Github
};

export function Footer({ brandName, navigation, social, copyright }: FooterProps) {
  // Smooth scroll to element with editorial easing
  const smoothScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // Account for any fixed header spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  // Brand reveal animation (unchanged - keep big logo)
  const brandReveal: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // New: Technical line reveal animation for nav items
  const lineReveal: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // New: Text slide-up animation
  const textSlide: Variants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // New: Underline reveal on hover
  const underlineVariants: Variants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "100%",
      opacity: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <footer className="bg-[#F0EBE0] pt-24 pb-8 px-6 border-t border-[#2A1B12]/10 overflow-hidden">
      {/* Minimal background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-[#2A1B12]/5 bottom-0 absolute" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main container */}
        <motion.div
          variants={viewportStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-16"
        >
          {/* Navigation Title - Clean editorial design */}
          <motion.div
            variants={cardEntrance}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center justify-center py-8"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="flex items-center gap-4 mb-4"
            >
              <motion.div
                variants={lineReveal}
                className="h-px w-12 bg-[#FF6B4A] origin-left"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#2A1B12]/50">
                NAVIGATION
              </span>
              <motion.div
                variants={lineReveal}
                className="h-px w-12 bg-[#FF6B4A] origin-right"
              />
            </motion.div>

            <motion.h3
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={textSlide}
              className="font-serif text-4xl md:text-5xl font-bold text-[#2A1B12] tracking-tight"
            >
              Explore Our Platform
            </motion.h3>

            {/* Subtle technical grid accent below title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex gap-6"
            >
              {navigation.map((item, index) => {
                // Check link type
                const isHashLink = item.href.startsWith('#');
                const isExternal = item.href.startsWith('http');

                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      if (isHashLink) {
                        // Smooth scroll to internal section
                        const targetId = item.href.substring(1);
                        smoothScrollTo(targetId);
                      } else if (isExternal) {
                        // Open external link in new tab
                        window.open(item.href, '_blank', 'noopener,noreferrer');
                      } else {
                        // Internal page navigation
                        window.location.href = item.href;
                      }
                    }}
                    className="group relative px-3 py-2 font-sans text-sm text-[#2A1B12]/70 hover:text-[#2A1B12] transition-colors duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2 }}
                  >
                    {item.label}
                    <motion.span
                      className="absolute bottom-1 left-3 h-px bg-[#FF6B4A]"
                      initial={{ width: 0 }}
                      whileHover={{ width: "calc(100% - 1.5rem)" }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Bottom Bar - Unchanged */}
          <motion.div
            variants={cardEntrance}
            initial="initial"
            animate="animate"
            className="border-t border-[#2A1B12]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <motion.div
              variants={brandReveal}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <div className="font-serif text-[15vw] leading-none opacity-90 tracking-tight md:text-[10vw] overflow-hidden">
                {brandName}
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Social Links */}
              <motion.div
                variants={viewportStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex gap-4"
              >
                {social.map((link, index) => {
                  const IconComponent = iconMap[link.icon as keyof typeof iconMap];
                  return (
                    <motion.a
                      key={index}
                      variants={cardEntrance}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2A1B12]"
                      whileHover={{ color: '#FF6B4A' }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                      )}
                    </motion.a>
                  );
                })}
              </motion.div>

              {/* Copyright */}
              <motion.p
                variants={cardEntrance}
                initial="initial"
                animate="animate"
                className="text-sm text-[#5C4D45] font-sans opacity-80"
              >
                {copyright}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}