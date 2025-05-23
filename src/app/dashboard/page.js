'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Plus, UserCircle2 } from 'lucide-react';
import AddExerciseModal from '@/components/AddExerciseModal';
import ExerciseCard from '@/components/ExerciseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// Local Storage Key
const STORAGE_KEY = 'stronghabit-exercises';

// Initialize localStorage if needed
const initializeLocalStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedExercises = localStorage.getItem(STORAGE_KEY);
      if (!savedExercises) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      const parsedExercises = JSON.parse(savedExercises);
      return Array.isArray(parsedExercises) ? parsedExercises : [];
    }
    return [];
  } catch (error) {
    console.error('Error initializing localStorage:', error);
    return [];
  }
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        // Simulate a small delay to prevent flash of loading state
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Initialize and load exercises
        const initialExercises = initializeLocalStorage();
        setExercises(initialExercises);
      } catch (error) {
        console.error('Error loading exercises:', error);
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Save exercises to localStorage whenever they change
  useEffect(() => {
    const saveExercises = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
        }
      } catch (error) {
        console.error('Error saving exercises:', error);
      }
    };

    // Only save if we're not in the loading state
    if (!isLoading) {
      saveExercises();
    }
  }, [exercises, isLoading]);

  const handleAddExercise = () => {
    setIsModalOpen(true);
  };

  const handleSaveExercise = (exercise) => {
    try {
      const newExercise = {
        ...exercise,
        id: Date.now(), // Add unique ID for each exercise
        currentReps: 0,
        createdAt: new Date().toISOString()
      };
      setExercises(prevExercises => [...prevExercises, newExercise]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving new exercise:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteExercise = (exerciseToDelete) => {
    try {
      setExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== exerciseToDelete.id)
      );
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleUpdateProgress = (exercise, change) => {
    try {
      setExercises(prevExercises => 
        prevExercises.map(ex => {
          if (ex.id === exercise.id) {
            const newReps = Math.max(0, (ex.currentReps || 0) + change);
            return { ...ex, currentReps: newReps };
          }
          return ex;
        })
      );
    } catch (error) {
      console.error('Error updating exercise progress:', error);
    }
  };

  // Separate exercises into ongoing and completed
  const completedExercises = exercises.filter(ex => (ex.currentReps || 0) >= ex.targetReps);
  const ongoingExercises = exercises.filter(ex => (ex.currentReps || 0) < ex.targetReps);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">StrongHabit</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <UserCircle2 className="w-8 h-8" />
        </button>
      </header>

      {isLoading ? (
        <LoadingSpinner />
      ) : exercises.length === 0 ? (
        // Empty State Content
        <main className="flex flex-col items-center justify-center px-4 py-12 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8">
            <Dumbbell className="w-12 h-12 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Welcome! Let's get started.</h1>
          <p className="text-gray-400 mb-8">
            Add your first exercise to begin your journey.
          </p>

          <button
            onClick={handleAddExercise}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Exercise
          </button>

          <p className="text-gray-500 text-sm mt-4">
            Start with something simple like push-ups or squats.
          </p>
        </main>
      ) : (
        // Exercise List View
        <main className="p-4 max-w-md mx-auto space-y-6">
          {/* Today's Exercises Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today's Exercises</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddExercise}
                className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-500 transform transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {ongoingExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onDelete={handleDeleteExercise}
                    onUpdateProgress={handleUpdateProgress}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Completed Section */}
          {completedExercises.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">Completed</h2>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {completedExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onDelete={handleDeleteExercise}
                      onUpdateProgress={handleUpdateProgress}
                      isCompleted
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </main>
      )}

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExercise}
      />
    </div>
  );
} 