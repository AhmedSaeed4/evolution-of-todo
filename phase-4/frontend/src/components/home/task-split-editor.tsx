'use client';

import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

export function TaskSplitEditor() {
  const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const [currentLine, setCurrentLine] = useState(0);

  // Simulate code typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => (prev < 8 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Container animation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Editor entrance
  const editorVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: SMOOTH_EASE }
    }
  };

  // Preview entrance
  const previewVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: SMOOTH_EASE, delay: 0.2 }
    }
  };

  // Line animation
  const lineVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: SMOOTH_EASE, delay }
    })
  };

  // Code lines data
  const codeLines = [
    '// TaskStack Configuration',
    'const task = {',
    '  title: "Build auth",',
    '  priority: "high",',
    '  status: "in-progress",',
    '  assignee: "you"',
    '};',
    'await api.tasks.create(task);'
  ];

  // Preview card animation
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: SMOOTH_EASE, delay }
    })
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative w-full h-[500px] bg-[#F9F7F2] border border-[#2A1B12]/10 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
    >
      {/* Split Screen Layout */}
      <div className="grid grid-cols-2 h-full">

        {/* Left: Code Editor */}
        <motion.div
          variants={editorVariants}
          className="bg-[#2A1B12] text-[#F9F7F2] font-mono text-sm p-6 overflow-y-auto border-r border-[#2A1B12]/20"
        >
          {/* Editor Header */}
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-xs">taskstack.config.js</span>
          </div>

          {/* Code Lines */}
          <div className="space-y-2">
            {codeLines.map((line, index) => {
              // Determine colors based on line content
              let lineClass = "text-[#D8DEE9]"; // default
              let displayText = line;

              if (line.includes('//')) {
                lineClass = "text-[#6B7280] italic"; // comments
              } else if (line.includes('const') || line.includes('await') || line.includes('api') || line.includes('create')) {
                lineClass = "text-[#FF6B4A]"; // keywords
              } else if (line.includes('title') || line.includes('priority') || line.includes('status') || line.includes('assignee')) {
                lineClass = "text-[#A3BE8C]"; // property names
              } else if (line.includes('"Build auth"') || line.includes('"high"') || line.includes('"in-progress"') || line.includes('"you"')) {
                lineClass = "text-[#EBCB8B]"; // string values
              } else if (line.includes('{') || line.includes('}') || line.includes(';')) {
                lineClass = "text-[#88C0D0]"; // symbols
              }

              return (
                <motion.div
                  key={index}
                  variants={lineVariants}
                  custom={0.3 + (index * 0.08)}
                  initial="hidden"
                  animate="visible"
                  className="whitespace-pre font-mono"
                  style={{
                    opacity: currentLine >= index ? 1 : 0.3
                  }}
                >
                  <span className={lineClass}>{displayText}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Cursor */}
          {currentLine < codeLines.length && (
            <motion.div
              className="w-2 h-4 bg-[#FF6B4A] mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Right: Live Preview */}
        <motion.div
          variants={previewVariants}
          className="bg-[#F9F7F2] p-6 overflow-y-auto"
        >
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono text-[#2A1B12]/50 uppercase tracking-widest">Live Preview</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-[#27c93f]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1.5 }}
            />
          </div>

          {/* Task Card Preview */}
          {currentLine >= 6 && (
            <motion.div
              variants={cardVariants}
              custom={1.8}
              initial="hidden"
              animate="visible"
              className="bg-white border border-[#2A1B12]/10 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <motion.h3
                    className="font-serif text-lg text-[#2A1B12] mb-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.4 }}
                  >
                    Build auth
                  </motion.h3>
                  <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2, duration: 0.4 }}
                  >
                    <span className="text-[10px] font-mono bg-[#FF6B4A]/10 text-[#FF6B4A] px-2 py-0.5 rounded border border-[#FF6B4A]/20">
                      HIGH
                    </span>
                    <span className="text-[10px] font-mono bg-[#FFD700]/10 text-[#B8860B] px-2 py-0.5 rounded border border-[#B8860B]/20">
                      IN-PROGRESS
                    </span>
                  </motion.div>
                </div>
                <motion.div
                  className="w-8 h-8 rounded-full bg-[#2A1B12]/5 flex items-center justify-center text-[10px] font-mono text-[#2A1B12]/60"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 2.4 }}
                >
                  YOU
                </motion.div>
              </div>

              {/* Progress Bar */}
              <motion.div
                className="w-full h-1.5 bg-[#2A1B12]/10 rounded-full overflow-hidden mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6, duration: 0.4 }}
              >
                <motion.div
                  className="h-full bg-[#FF6B4A]"
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: 2.8 }}
                />
              </motion.div>

              {/* Timestamp */}
              <motion.div
                className="text-[10px] font-mono text-[#2A1B12]/40 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 3.0, duration: 0.4 }}
              >
                Created: Just now • Updated: 2m ago
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {currentLine < 6 && (
            <motion.div
              className="h-32 border-2 border-dashed border-[#2A1B12]/10 rounded-lg flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-[#2A1B12]/30 font-mono text-xs">
                Waiting for code...
              </span>
            </motion.div>
          )}

          {/* Success Message */}
          {currentLine >= 7 && (
            <motion.div
              className="mt-4 p-3 bg-[#A3BE8C]/10 border border-[#A3BE8C]/20 rounded text-[#A3BE8C] text-xs font-mono"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 3.2 }}
            >
              ✓ Task created successfully
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-8 bg-[#2A1B12]/10"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />

      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.0 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#2A1B12]/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#2A1B12]/20" />
      </motion.div>

      {/* Technical Badge */}
      <motion.div
        className="absolute bottom-3 right-3 font-mono text-[10px] text-[#2A1B12]/40 tracking-widest"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        LIVE EDITOR
      </motion.div>
    </motion.div>
  );
}
