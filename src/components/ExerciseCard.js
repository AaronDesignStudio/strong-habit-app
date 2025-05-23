'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import DeleteExerciseModal from './DeleteExerciseModal';
import HighIncreaseModal from './HighIncreaseModal';
import EmojiConfetti from './EmojiConfetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExerciseCard({ 
  exercise, 
  onDelete, 
  onUpdateProgress, 
  isCompleted,
  onSetNextDayTarget,
  nextDayTarget
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHighIncreaseModalOpen, setIsHighIncreaseModalOpen] = useState(false);
  const [nextTarget, setNextTarget] = useState(nextDayTarget || '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [clickPosition, setClickPosition] = useState(null);
  const [confettiSize, setConfettiSize] = useState(20);
  const [confettiCount, setConfettiCount] = useState(3);
  const { name, targetReps: target, currentReps = 0 } = exercise;
  
  // Calculate progress percentage
  const progress = Math.min((currentReps / target) * 100, 100);

  // Set initial next target when exercise is completed
  useEffect(() => {
    if (isCompleted && !nextTarget) {
      setNextTarget(String(target + 1));
    }
  }, [isCompleted, target, nextTarget]);

  // Reset collapse state when exercise changes
  useEffect(() => {
    setIsCollapsed(false);
  }, [exercise.id]);

  // Set collapsed state when nextDayTarget changes
  useEffect(() => {
    if (nextDayTarget) {
      setIsCollapsed(true);
    }
  }, [nextDayTarget]);
  
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(exercise);
    setIsDeleteModalOpen(false);
  };

  const handleNextTargetChange = (e) => {
    const value = e.target.value;
    const minTarget = target + 1;
    
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= minTarget)) {
      setNextTarget(value);
    }
  };

  const handleTargetIncrement = () => {
    const currentValue = parseInt(nextTarget) || target;
    setNextTarget(String(currentValue + 1));
  };

  const handleTargetDecrement = () => {
    const currentValue = parseInt(nextTarget) || target + 1;
    const minTarget = target + 1;
    if (currentValue > minTarget) {
      setNextTarget(String(currentValue - 1));
    }
  };

  const checkAndSetTarget = () => {
    const newTarget = parseInt(nextTarget || target + 1);
    const increase = ((newTarget - target) / target) * 100;

    if (increase > 30) {
      setIsHighIncreaseModalOpen(true);
    } else {
      handleSaveNextTarget(newTarget);
    }
  };

  const handleSaveNextTarget = (confirmedTarget) => {
    const minTarget = target + 1;
    const newTarget = confirmedTarget || Math.max(minTarget, parseInt(nextTarget || minTarget));
    onSetNextDayTarget(exercise.id, newTarget);
    setIsCollapsed(true);
    setIsHighIncreaseModalOpen(false);
  };

  const handleIncrementClick = (increment, event) => {
    // Get click position relative to viewport
    const rect = event.currentTarget.getBoundingClientRect();
    setClickPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });

    // Set confetti properties based on increment
    if (increment === 1) {
      setConfettiSize(20);
      setConfettiCount(3);
    } else {
      setConfettiSize(60);
      setConfettiCount(5);
    }

    // Trigger confetti
    setConfettiTrigger(prev => prev + 1);

    // Update progress
    onUpdateProgress(exercise, increment);
  };
  
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isCollapsed ? 0.7 : 1,
          y: 0 
        }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
        whileHover={{ 
          scale: 1.02,
          opacity: 1
        }}
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
          <div className="flex items-center gap-3">
            {isCollapsed && nextDayTarget && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-green-500"
              >
                <Check className="w-4 h-4" />
                <span>+{nextDayTarget - target}</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteClick}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
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
              onClick={(e) => handleIncrementClick(1, e)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              +1
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleIncrementClick(5, e)}
              className="bg-zinc-800 text-gray-400 py-1 rounded hover:bg-zinc-700 transition-colors"
            >
              +5
            </motion.button>
          </motion.div>
        )}

        {/* Set Tomorrow's Target (Only for completed exercises and when not collapsed) */}
        <AnimatePresence>
          {isCompleted && !isCollapsed && (
            <motion.div 
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-green-500 text-sm">Set tomorrow's target:</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTargetDecrement}
                  className="bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                <div className="relative flex-1 max-w-[120px]">
                  <input
                    type="number"
                    min={target + 1}
                    value={nextTarget}
                    onChange={handleNextTargetChange}
                    placeholder={String(target + 1)}
                    className="bg-zinc-800 text-white rounded-lg px-3 py-2 w-full text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    reps
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTargetIncrement}
                  className="bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkAndSetTarget}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex-1"
                >
                  Set Target
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Emoji Confetti */}
      <EmojiConfetti 
        trigger={confettiTrigger}
        clickPosition={clickPosition}
        size={confettiSize}
        count={confettiCount}
      />

      {/* Delete Confirmation Modal */}
      <DeleteExerciseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        exerciseName={name}
      />

      {/* High Increase Warning Modal */}
      <HighIncreaseModal
        isOpen={isHighIncreaseModalOpen}
        onClose={() => setIsHighIncreaseModalOpen(false)}
        onConfirm={() => handleSaveNextTarget(parseInt(nextTarget))}
        currentTarget={target}
        newTarget={parseInt(nextTarget || target + 1)}
      />
    </>
  );
} 