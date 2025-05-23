'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function HighIncreaseModal({
  isOpen,
  onClose,
  onConfirm,
  currentTarget,
  newTarget
}) {
  if (!isOpen) return null;

  const increasePercentage = Math.round(((newTarget - currentTarget) / currentTarget) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 rounded-lg p-6 max-w-md w-full space-y-4"
        >
          <div className="flex items-center gap-3 text-yellow-500">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Ambitious Goal!</h3>
          </div>
          
          <p className="text-gray-300">
            You're setting a {increasePercentage}% increase from your current target. 
            While ambition is great, make sure this is achievable to maintain consistent progress.
          </p>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Current target: {currentTarget} reps</span>
            <span>New target: {newTarget} reps</span>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition-colors"
            >
              Adjust Target
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors"
            >
              I'm Sure
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 