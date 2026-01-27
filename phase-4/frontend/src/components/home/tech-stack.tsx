'use client';

import { motion } from 'framer-motion';
import { Code, Server, Database, Lock, ArrowRight } from 'lucide-react';

interface TechItem {
  name: string;
  description: string;
  icon: string;
  link?: string;
}

interface TechStackProps extends React.HTMLAttributes<HTMLElement> {
  heading: string;
  technologies: TechItem[];
}

const iconMap = {
  Code: Code,
  Server: Server,
  Database: Database,
  Lock: Lock
};

// 🎯 CLEAN ANIMATION PATTERNS - Surgical Precision
const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Main container entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Header animation (lines + text)
const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Tech item entrance
const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Bottom line animation
const bottomLineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 0.6,
    transition: { duration: 1.2, ease: SMOOTH_EASE, delay: 0.3 }
  }
};

// Interactive states
const interactiveSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5
};

export function TechStack({ heading, technologies, ...props }: TechStackProps) {
  return (
    <section className="py-32 px-6 bg-[#F9F7F2] border-y border-[#2A1B12]/10 overflow-hidden" {...props}>
      {/* Minimal background accent - Single subtle line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-[#2A1B12]/5 top-1/3 absolute" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main container with clean cascade */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-16"
        >
          {/* Header - Clean symmetrical design */}
          <motion.div variants={headerVariants} className="flex items-center justify-center gap-4">
            <motion.div
              variants={lineVariants}
              className="h-px bg-[#FF6B4A] w-12"
            />
            <motion.h2
              className="font-serif text-4xl md:text-6xl text-[#2A1B12] tracking-tight"
              whileHover={{ scale: 1.01 }}
              transition={interactiveSpring}
            >
              {heading}
            </motion.h2>
            <motion.div
              variants={lineVariants}
              className="h-px bg-[#FF6B4A] w-12"
            />
          </motion.div>

          {/* Tech Grid - Clean cascade */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A1B12]/10 border border-[#2A1B12]/10 overflow-hidden"
          >
            {technologies.map((tech, index) => {
              const IconComponent = iconMap[tech.icon as keyof typeof iconMap];
              const isClickable = tech.link;

              const itemContent = (
                <motion.div
                  variants={itemVariants}
                  className="group relative p-8 bg-[#F9F7F2] h-full flex flex-col"
                  whileHover={{
                    backgroundColor: '#F0EBE0',
                    transition: { duration: 0.4, ease: SMOOTH_EASE }
                  }}
                >
                  {/* Corner accent - Micro interaction */}
                  <motion.div
                    className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#2A1B12]/20"
                    whileHover={{
                      borderColor: '#FF6B4A',
                      width: 4,
                      height: 4,
                      transition: interactiveSpring
                    }}
                  />

                  {/* Icon - Clean color transition */}
                  <motion.div
                    whileHover={isClickable ? { scale: 1.01 } : {}}
                    whileTap={isClickable ? { scale: 0.99 } : {}}
                    transition={interactiveSpring}
                    className="mb-6"
                  >
                    {IconComponent && (
                      <IconComponent
                        className="w-8 h-8 text-[#2A1B12] transition-colors duration-300 group-hover:text-[#FF6B4A]"
                        strokeWidth={1.5}
                      />
                    )}
                  </motion.div>

                  {/* Tech Name - Subtle shift */}
                  <motion.h3
                    className="font-mono text-sm uppercase tracking-widest text-[#2A1B12] mb-2 group-hover:text-[#FF6B4A] transition-colors duration-300"
                    whileHover={{ x: 1 }}
                    transition={interactiveSpring}
                  >
                    {tech.name}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-[#5C4D45] font-sans text-xs leading-relaxed mb-4 flex-grow">
                    {tech.description}
                  </p>

                  {/* Link indicator - Clean reveal */}
                  {isClickable && (
                    <motion.div
                      initial={{ opacity: 0, x: -2 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: SMOOTH_EASE }}
                      className="flex items-center gap-2 text-[#FF6B4A] font-mono text-xs uppercase tracking-wider"
                    >
                      Learn More
                      <motion.span
                        whileHover={{ x: 2 }}
                        transition={interactiveSpring}
                      >
                        <ArrowRight className="w-3 h-3" strokeWidth={2} />
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Connection line (desktop only) */}
                  {index < technologies.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-[#2A1B12]/20"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: SMOOTH_EASE, delay: index * 0.05 }}
                    />
                  )}
                </motion.div>
              );

              return isClickable ? (
                <a
                  key={index}
                  href={tech.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  {itemContent}
                </a>
              ) : (
                <div key={index} className="h-full">
                  {itemContent}
                </div>
              );
            })}
          </motion.div>

          {/* Bottom accent line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="h-px bg-gradient-to-r from-transparent via-[#2A1B12]/20 to-transparent"
          >
            <motion.div
              className="h-full bg-[#FF6B4A] w-1/3 mx-auto opacity-60"
              variants={bottomLineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}