'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import DeleteExerciseModal from './DeleteExerciseModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExerciseCard({ exercise, onDelete, onUpdateProgress, isCompleted }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { name, targetReps: target, currentReps = 0 } = exercise;
  
  // Calculate progress percentage
  const progress = Math.min((currentReps / target) * 100, 100);
  
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(exercise);
    setIsDeleteModalOpen(false);
  };
  
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
        whileHover={{ scale: 1.02 }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className="bg-zinc-900 rounded-lg p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <motion.h3 
            layout="position"
            className="font-semibold text-white flex items-center gap-2"
          >
            {name}
            {isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-yellow-400"
              >
                ★
              </motion.span>
            )}
          </motion.h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteClick}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-purple-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Daily Goal</span>
          <motion.span 
            layout
            className="text-white"
          >
            {currentReps} / {target}
          </motion.span>
        </div>

        {/* Quick Update Buttons */}
        {!isCompleted && (
          <motion.div 
            layout
            className="grid grid-cols-4 gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateProgress(exercise, -5)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              -5
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateProgress(exercise, -1)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              -1
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateProgress(exercise, 1)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              +1
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateProgress(exercise, 5)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              +5
            </motion.button>
          </motion.div>
        )}

        {/* Set Tomorrow's Target (Only for completed exercises) */}
        {isCompleted && (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-green-500 text-sm">Great job!</p>
            <div className="flex gap-2">
              <input
                type="number"
                className="bg-zinc-800 text-white rounded px-3 py-1 w-20"
                placeholder="30"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 transition-colors"
              >
                Save
              </motion.button>
            </div>
            <p className="text-gray-500 text-sm">Set tomorrow's target:</p>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteExerciseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        exerciseName={name}
      />
    </>
  );
} 