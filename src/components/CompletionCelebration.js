'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';

export default function CompletionCelebration({ 
  isOpen, 
  onClose, 
  stats
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-zinc-900 rounded-2xl p-8 text-center"
        >
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <span className="text-4xl">🏆</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            You are the next<br />Rocky Balboa!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-purple-400 text-lg mb-4 flex items-center justify-center gap-2"
          >
            <span>🔥</span>
            Daily Exercises Completed!
            <span>🔥</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 mb-6"
          >
            You've crushed all your exercises for today!
          </motion.p>

          {/* Stats Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-950 rounded-xl p-4 mb-6 space-y-3"
          >
            <div className="flex items-center justify-between text-gray-300">
              <span>Today's Streak</span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⚡</span>
                {stats.streak} days
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Exercises Done</span>
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span>
                {stats.exercisesDone}/{stats.totalExercises}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Total Reps</span>
              <span className="flex items-center gap-1">
                <span className="text-purple-500">💪</span>
                {stats.totalReps}
              </span>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 italic text-sm mb-8"
          >
            "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward."
          </motion.p>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Close
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 