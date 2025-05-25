'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Plus, UserCircle2, Bell, TestTube } from 'lucide-react';
import AddExerciseModal from '@/components/AddExerciseModal';
import ExerciseCard from '@/components/ExerciseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import CompletionCelebration from '@/components/CompletionCelebration';
import NotificationPermission from '@/components/NotificationPermission';
import notificationService from '@/services/notificationService';

// Local Storage Keys
const STORAGE_KEY = 'stronghabit-exercises';
const LAST_RESET_KEY = 'stronghabit-last-reset';
const LAST_CELEBRATION_KEY = 'stronghabit-last-celebration';
const STREAK_KEY = 'stronghabit-streak';

// Initialize localStorage if needed
const initializeLocalStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Initialize exercises
      const savedExercises = localStorage.getItem(STORAGE_KEY);
      if (!savedExercises) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
      
      // Initialize last reset date if not exists
      const lastReset = localStorage.getItem(LAST_RESET_KEY);
      if (!lastReset) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        localStorage.setItem(LAST_RESET_KEY, now.toISOString());
      }

      // Initialize streak if not exists
      if (!localStorage.getItem(STREAK_KEY)) {
        localStorage.setItem(STREAK_KEY, '0');
      }

      const parsedExercises = savedExercises ? JSON.parse(savedExercises) : [];
      return Array.isArray(parsedExercises) ? parsedExercises : [];
    }
    return [];
  } catch (error) {
    console.error('Error initializing localStorage:', error);
    return [];
  }
};

// Check if it's a new day
const isNewDay = (lastResetDate) => {
  const now = new Date();
  const last = new Date(lastResetDate);
  
  // Set both dates to start of day for comparison
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStart = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  
  return nowStart > lastStart;
};

// Function to perform the reset
const performReset = (exercises, nextDayTargets) => {
  const updatedExercises = exercises.map(exercise => {
    const wasCompleted = (exercise.currentReps || 0) >= exercise.targetReps;
    const nextDayTarget = nextDayTargets[exercise.id];

    console.log('Resetting exercise:', {
      name: exercise.name,
      wasCompleted,
      currentTarget: exercise.targetReps,
      nextDayTarget
    });

    if (wasCompleted && nextDayTarget) {
      // If exercise was completed and has a next day target
      return {
        ...exercise,
        currentReps: 0,
        targetReps: nextDayTarget,
      };
    } else if (!wasCompleted) {
      // If exercise was not completed, reduce target by 1
      return {
        ...exercise,
        currentReps: 0,
        targetReps: Math.max(1, (exercise.targetReps || 1) - 1),
      };
    }
    // If completed but no next day target set, keep the same target
    return {
      ...exercise,
      currentReps: 0,
    };
  });

  return updatedExercises;
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showTestButton, setShowTestButton] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);

  // Add new state for next day targets
  const [nextDayTargets, setNextDayTargets] = useState({});
  const [streak, setStreak] = useState(0);

  // Reset only click count after 1 second of no clicks
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Check for triple click
  useEffect(() => {
    if (clickCount === 3) {
      setShowTestButton(true);
    }
  }, [clickCount]);

  const handleHeaderClick = () => {
    setClickCount(prev => prev + 1);
  };

  // Initialize on mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        const initialExercises = initializeLocalStorage();
        setExercises(initialExercises);
        setStreak(parseInt(localStorage.getItem(STREAK_KEY) || '0'));
        
        // Initialize notification service
        await notificationService.init();
        
        // Check if we should show notification permission modal
        const hasAskedForPermission = localStorage.getItem('stronghabit-notification-asked');
        const permissionStatus = notificationService.getPermissionStatus();
        
        // Start smart reminders if permission is granted
        if (permissionStatus === 'granted') {
          notificationService.scheduleSmartReminders(9, 21); // 9 AM to 9 PM
        }
        
        // Show permission modal if:
        // 1. User hasn't been asked before
        // 2. Permission is not granted
        // 3. User has exercises (not first time)
        if (!hasAskedForPermission && permissionStatus !== 'granted' && initialExercises.length > 0) {
          setTimeout(() => {
            setShowNotificationPermission(true);
          }, 2000); // Show after 2 seconds
        }
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

  // Check for completion and handle celebration
  useEffect(() => {
    if (exercises.length > 0 && !isLoading) {
      const allCompleted = exercises.every(ex => (ex.currentReps || 0) >= ex.targetReps);
      
      console.log('Checking completion:', {
        exercisesCount: exercises.length,
        allCompleted,
        exercises: exercises.map(ex => ({
          name: ex.name,
          current: ex.currentReps,
          target: ex.targetReps,
          isCompleted: (ex.currentReps || 0) >= ex.targetReps
        }))
      });

              if (allCompleted) {
          const lastCelebration = localStorage.getItem(LAST_CELEBRATION_KEY);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          console.log('All exercises completed:', {
            lastCelebration,
            shouldShow: !lastCelebration || isNewDay(lastCelebration)
          });
          
          // Only show celebration if not already shown today
          if (!lastCelebration || isNewDay(lastCelebration)) {
            // Update streak
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem(STREAK_KEY, String(newStreak));
            
            // Save celebration timestamp
            localStorage.setItem(LAST_CELEBRATION_KEY, new Date().toISOString());
            
            // Show celebration
            setShowCelebration(true);
            console.log('Showing celebration!');
            
            // Send completion notification
            const totalReps = exercises.reduce((total, ex) => total + (ex.currentReps || 0), 0);
            notificationService.showCompletionNotification(exercises.length, totalReps);
            
            // Show streak milestone notification if applicable
            notificationService.showStreakNotification(newStreak);
            
            // Update app badge
            notificationService.updateBadge(0); // Clear badge when all exercises complete
          }
        } else {
          // Update badge with remaining exercises
          const remainingExercises = exercises.filter(ex => (ex.currentReps || 0) < ex.targetReps).length;
          notificationService.updateBadge(remainingExercises);
        }
    }
  }, [exercises, isLoading, streak]);

  // Reset streak if a day was missed
  useEffect(() => {
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    if (lastReset) {
      const lastResetDate = new Date(lastReset);
      const now = new Date();
      const daysDiff = Math.floor((now - lastResetDate) / (1000 * 60 * 60 * 24));
      
      // If more than one day has passed, reset streak
      if (daysDiff > 1) {
        setStreak(0);
        localStorage.setItem(STREAK_KEY, '0');
      }
    }
  }, []);

  // Function to simulate midnight
  const simulateMidnight = () => {
    console.log('Simulating midnight reset...');
    
    // Clear last celebration before performing reset
    localStorage.removeItem(LAST_CELEBRATION_KEY);
    
    // Perform the reset
    const updatedExercises = performReset(exercises, nextDayTargets);
    
    // Update exercises
    setExercises(updatedExercises);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExercises));
    
    // Clear next day targets
    setNextDayTargets({});
    
    // Update last reset date to next day at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem(LAST_RESET_KEY, tomorrow.toISOString());
    
    console.log('Midnight simulation complete!');

    // Force check completion after reset
    setTimeout(() => {
      const allCompleted = updatedExercises.every(ex => (ex.currentReps || 0) >= ex.targetReps);
      console.log('Post-reset completion check:', {
        exercisesCount: updatedExercises.length,
        allCompleted,
        exercises: updatedExercises.map(ex => ({
          name: ex.name,
          current: ex.currentReps,
          target: ex.targetReps,
          isCompleted: (ex.currentReps || 0) >= ex.targetReps
        }))
      });
    }, 0);
  };

  // Check for day change and reset exercises
  useEffect(() => {
    const checkAndResetExercises = () => {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return;

        const lastReset = localStorage.getItem(LAST_RESET_KEY);
        if (!lastReset) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          localStorage.setItem(LAST_RESET_KEY, now.toISOString());
          return;
        }

        if (isNewDay(lastReset)) {
          console.log('New day detected! Resetting exercises...');
          
          // Perform the reset
          const updatedExercises = performReset(exercises, nextDayTargets);
          
          // Update exercises
          setExercises(updatedExercises);
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExercises));
          
          // Clear next day targets
          setNextDayTargets({});
          
          // Update last reset date
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          localStorage.setItem(LAST_RESET_KEY, now.toISOString());
          
          console.log('Reset complete!');
        }
      } catch (error) {
        console.error('Error checking for day change:', error);
      }
    };

    // Run check immediately on mount
    checkAndResetExercises();

    // Set up interval to check every minute
    const intervalId = setInterval(checkAndResetExercises, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [exercises, nextDayTargets]); // Added exercises to dependencies

  // Function to set next day target for a completed exercise
  const handleSetNextDayTarget = (exerciseId, target) => {
    setNextDayTargets(prev => ({
      ...prev,
      [exerciseId]: parseInt(target, 10)
    }));
  };

  // Calculate stats for the celebration modal
  const celebrationStats = {
    streak,
    exercisesDone: exercises.filter(ex => (ex.currentReps || 0) >= ex.targetReps).length,
    totalExercises: exercises.length,
    totalReps: exercises.reduce((total, ex) => total + (ex.currentReps || 0), 0)
  };

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

  // Handle notification permission granted
  const handleNotificationPermissionGranted = () => {
    localStorage.setItem('stronghabit-notification-asked', 'true');
    setShowNotificationPermission(false);
  };

  // Handle notification permission modal close
  const handleNotificationPermissionClose = () => {
    localStorage.setItem('stronghabit-notification-asked', 'true');
    setShowNotificationPermission(false);
  };

  // Test notification function
  const handleTestNotification = async () => {
    try {
      // Ensure service worker is ready
      await notificationService.ensureServiceWorkerReady();
      
      // Check if permission is granted
      if (notificationService.getPermissionStatus() !== 'granted') {
        // Show permission modal if not granted
        setShowNotificationPermission(true);
        return;
      }

      // Show test notification
      const success = await notificationService.showNotification(
        'Test Notification! 🧪',
        {
          body: 'This is a test notification from StrongHabit. If you see this, notifications are working!',
          tag: 'test-notification',
          requireInteraction: false
        }
      );

      if (!success) {
        console.error('Test notification failed');
        // Could show an error message to user here
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  };

  // Separate exercises into ongoing and completed
  const completedExercises = exercises.filter(ex => (ex.currentReps || 0) >= ex.targetReps);
  const ongoingExercises = exercises.filter(ex => (ex.currentReps || 0) < ex.targetReps);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header 
        className="relative flex items-center justify-between px-4 py-3 bg-zinc-900 cursor-pointer"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">StrongHabit</span>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {showTestButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  simulateMidnight();
                }}
                className="px-3 py-1 text-sm bg-purple-600 rounded hover:bg-purple-700 transition-colors"
              >
                Test Midnight Reset
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTestNotification();
            }}
            className="text-gray-400 hover:text-green-400 transition-colors"
            title="Test Notification"
          >
            <TestTube className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotificationPermission(true);
            }}
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Notification Settings"
          >
            <Bell className="w-6 h-6" />
          </button>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <UserCircle2 className="w-8 h-8" />
          </button>
        </div>
        <AnimatePresence>
          {showClock && <Clock />}
        </AnimatePresence>
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
                      onSetNextDayTarget={handleSetNextDayTarget}
                      nextDayTarget={nextDayTargets[exercise.id]}
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

      {/* Completion Celebration */}
      <CompletionCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        stats={celebrationStats}
      />

      {/* Notification Permission Modal */}
      <NotificationPermission
        isOpen={showNotificationPermission}
        onClose={handleNotificationPermissionClose}
        onPermissionGranted={handleNotificationPermissionGranted}
      />
    </div>
  );
} 