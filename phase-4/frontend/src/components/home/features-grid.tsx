'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { Zap, Cloud, Shield } from 'lucide-react';
import { cardEntrance, hoverScale, tapScale, lineDraw, viewportStagger } from '@/motion/patterns';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesGridProps extends HTMLMotionProps<'section'> {
  features: FeatureCard[];
  heading: string;
  subtitle: string;
}

const iconMap = {
  Zap: Zap,
  Cloud: Cloud,
  Shield: Shield
};

export function FeaturesGrid({ features, heading, subtitle, ...props }: FeaturesGridProps) {
  // Card hover with proper spring physics (high damping to prevent bounce)
  const cardSpring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 30,  // Increased from 22 to prevent bounce per skill
    mass: 0.6
  };

  return (
    <motion.section
      className="relative py-24 px-6 bg-[#F9F7F2] border-y border-[#2A1B12]/10"
      {...props}
    >
      <div className="max-w-7xl mx-auto">
        {/* Optimized Cascade Container */}
        <motion.div
          variants={viewportStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px", amount: 0.3 }}
          className="flex flex-col gap-16"
        >
          {/* Header - Enhanced with smooth line draw */}
          <motion.div
            variants={cardEntrance}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <h2 className="font-serif text-4xl md:text-5xl text-[#2A1B12]">
                {heading}
              </h2>
              <motion.p
                className="font-mono text-xs uppercase tracking-widest text-[#FF6B4A]"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Orange Line Draw Divider - Slow entrance animation */}
            <motion.div
              className="h-px bg-[#2A1B12]/20 w-full overflow-hidden"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 1.8,  // Very slow for smoothness
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
                opacity: { duration: 0.8, delay: 0.3 }
              }}
            >
              <motion.div
                className="h-full bg-[#FF6B4A] w-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.8,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.4
                }}
              />
            </motion.div>
          </motion.div>

          {/* Feature Grid - Slower stagger for smooth cascade */}
          <motion.div
            variants={viewportStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px", amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];

              return (
                <motion.div
                  key={index}
                  variants={cardEntrance}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, margin: "-50px" }}
                  className="group"
                >
                  {/* Technical Card - Fixed spring physics */}
                  <motion.div
                    whileHover={{
                      scale: 1.02,  // Changed from 1.01 to 1.02 per skill
                      y: -1,  // Reduced from -2 to -1 per skill
                      transition: cardSpring
                    }}
                    className="relative p-6 border border-[#2A1B12]/20 bg-[#F9F7F2] overflow-hidden"
                  >
                    {/* Background hover effect - Fixed easing */}
                    <motion.div
                      className="absolute inset-0 bg-[#F0EBE0] opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Icon - Enhanced with spring physics and color transition */}
                    <motion.div
                      whileHover={hoverScale}
                      whileTap={tapScale}
                      transition={cardSpring}
                      className="mb-4 w-10 h-10 flex items-center justify-center relative z-10"
                    >
                      {IconComponent && (
                        <IconComponent
                          className="w-8 h-8 text-[#FF6B4A] transition-colors duration-300 group-hover:text-[#2A1B12]"
                          strokeWidth={2}
                        />
                      )}
                    </motion.div>

                    {/* Title - Fixed with smooth easing (not spring for color) */}
                    <motion.h3
                      className="font-serif text-xl text-[#2A1B12] mb-2 leading-tight relative z-10"
                      whileHover={{
                        x: 2,  // Reduced from 3 to 2 per skill
                        color: '#FF6B4A'
                      }}
                      transition={{
                        x: cardSpring,
                        color: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                      }}
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Description - Stable text */}
                    <p className="font-mono text-[13px] text-[#5C4D45] leading-relaxed tracking-wide relative z-10">
                      {feature.description}
                    </p>

                    {/* Hover Indicator - Fixed with high damping spring */}
                    <motion.div
                      className="h-px bg-[#FF6B4A] mt-4 origin-left relative z-10"
                      initial={{ scaleX: 0 }}
                      whileHover={{
                        scaleX: 1,
                        transition: {
                          type: "spring" as const,
                          stiffness: 400,
                          damping: 30,  // Increased from 20 to prevent bounce
                          delay: 0.05
                        }
                      }}
                    />

                    {/* Technical corner accent - Fixed spring */}
                    <motion.div
                      className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#2A1B12]/20"
                      whileHover={{
                        borderColor: '#FF6B4A',
                        width: 6,
                        height: 6,
                        transition: {
                          type: "spring" as const,
                          stiffness: 350,
                          damping: 30,  // High damping per skill
                          mass: 0.6
                        }
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}