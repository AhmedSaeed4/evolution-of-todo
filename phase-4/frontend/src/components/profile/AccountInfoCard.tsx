'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp, staggerContainer, scaleIn } from '@/motion/variants';
import { formatDateLong } from '@/lib/utils';
import { User, Mail, Calendar } from 'lucide-react';

export default function AccountInfoCard() {
  const { user } = useAuth();
  const [displayUser, setDisplayUser] = useState(user);

  // Update when user data changes
  useEffect(() => {
    setDisplayUser(user);
  }, [user]);

  if (!displayUser) {
    return null;
  }

  const infoItems = [
    {
      icon: <User className="w-5 h-5 text-accent" strokeWidth={2} />,
      label: 'Name',
      value: displayUser.name,
    },
    {
      icon: <Mail className="w-5 h-5 text-accent" strokeWidth={2} />,
      label: 'Email',
      value: displayUser.email,
    },
    {
      icon: <Calendar className="w-5 h-5 text-accent" strokeWidth={2} />,
      label: 'Member Since',
      value: displayUser.createdAt ? formatDateLong(displayUser.createdAt) : 'N/A',
    },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-surface border border-structure/10">
        <div className="space-y-4">
          {/* Header */}
          <div className="border-b border-structure/10 pb-3">
            <h2 className="font-serif text-2xl font-bold text-structure">
              Account Information
            </h2>
            <p className="text-sm text-text-secondary font-sans mt-1">
              Your account details and membership
            </p>
          </div>

          {/* Info List */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {infoItems.map((item, index) => (
              <motion.div
                key={item.label}
                variants={scaleIn}
                className="flex items-center gap-3 p-3 bg-background rounded-sm border border-structure/10"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05
                  }}
                >
                  {item.icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-structure/60">
                    {item.label}
                  </p>
                  <p className="font-sans text-sm text-structure font-medium">
                    {item.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Note */}
          <div className="bg-structure/5 p-3 rounded-sm">
            <p className="font-mono text-xs text-structure/60">
              These details are synced with your authentication profile
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}