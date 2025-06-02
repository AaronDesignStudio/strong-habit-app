'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Plus, UserCircle2 } from 'lucide-react';
import AddExerciseModal from '@/components/AddExerciseModal';
import ExerciseCard from '@/components/ExerciseCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import CompletionCelebration from '@/components/CompletionCelebration';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

// Import Supabase services
import {
  getCurrentUser,
  ensureUserAuthenticated,
  signInAnonymously,
  getExercises,
  createExercise,
  updateExerciseProgress,
  deleteExercise,
  resetExercisesForNewDay,
  getUserStats,
  updateUserStats,
  isNewDay,
  testSupabaseConnection,
  getUserProfile,
  signOut
} from '@/services/database';

// Local Storage Keys (for migration)
const STORAGE_KEY = 'stronghabit-exercises';
const LAST_RESET_KEY = 'stronghabit-last-reset';
const LAST_CELEBRATION_KEY = 'stronghabit-last-celebration';
const STREAK_KEY = 'stronghabit-streak';
const MIGRATION_KEY = 'stronghabit-migrated-to-supabase';

// Migration function to move localStorage data to Supabase
const migrateLocalStorageToSupabase = async (userId) => {
  try {
    // Check if already migrated
    if (typeof window !== 'undefined' && localStorage.getItem(MIGRATION_KEY)) {
      console.log('Data already migrated to Supabase');
      return;
    }

    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('localStorage not available, skipping migration');
      return;
    }

    // Test Supabase connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest) {
      console.error('Supabase connection failed, skipping migration');
      return;
    }

    console.log('Starting migration from localStorage to Supabase...');
    
    // Get existing localStorage data
    const savedExercises = localStorage.getItem(STORAGE_KEY);
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const lastCelebration = localStorage.getItem(LAST_CELEBRATION_KEY);
    const streak = localStorage.getItem(STREAK_KEY);

    console.log('Found localStorage data:', {
      exercises: savedExercises ? JSON.parse(savedExercises).length : 0,
      streak,
      lastReset,
      lastCelebration
    });

    // Migrate exercises if they exist
    if (savedExercises) {
      try {
        const exercises = JSON.parse(savedExercises);
        console.log(`Migrating ${exercises.length} exercises...`);
        
        for (const exercise of exercises) {
          try {
            console.log('Migrating exercise:', exercise.name);
            const newExercise = await createExercise(userId, {
              name: exercise.name,
              targetReps: exercise.targetReps || exercise.target_reps || 1
            });
            
            // Update progress if exists
            if ((exercise.currentReps || exercise.current_reps) && newExercise.id) {
              const currentReps = exercise.currentReps || exercise.current_reps;
              console.log(`Updating progress for ${exercise.name}: ${currentReps} reps`);
              await updateExerciseProgress(newExercise.id, currentReps);
            }
          } catch (exerciseError) {
            console.error('Error migrating exercise:', exercise.name, exerciseError);
            // Continue with other exercises even if one fails
          }
        }
      } catch (parseError) {
        console.error('Error parsing saved exercises:', parseError);
      }
    }

    // Migrate user stats - only if we have localStorage data to migrate
    if (streak || lastReset || lastCelebration) {
      try {
        // First check if user stats already exist
        const existingStats = await getUserStats(userId);
        
        // Only update if we have meaningful data from localStorage that's newer/different
        const localStreak = parseInt(streak || '0');
        const localLastReset = lastReset || new Date().toISOString();
        
        // Only update if localStorage has a higher streak or we have no existing stats
        if (localStreak > existingStats.streak || existingStats.streak === 0) {
          const stats = {
            streak: localStreak,
            lastReset: localLastReset,
            lastCelebration: lastCelebration
          };
          
          console.log('Migrating user stats:', stats);
          await updateUserStats(userId, stats);
          console.log('User stats migrated successfully');
        } else {
          console.log('Existing stats are newer/better, skipping stats migration');
        }
      } catch (statsError) {
        console.error('Error migrating user stats:', statsError);
        // Don't throw - stats can be recreated
      }
    } else {
      console.log('No localStorage stats to migrate');
    }

    // Mark migration as complete only if we got this far
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Error during migration:', error);
    // Don't throw the error - allow the app to continue with fresh data
  }
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showTestButton, setShowTestButton] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [nextDayTargets, setNextDayTargets] = useState({});
  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Initialize user and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app with Supabase...');
        
        // Test Supabase connection first
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
          console.error('Supabase connection failed. Please check your environment variables.');
          console.error('Make sure you have set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
          
          // Fall back to default state - user can still see UI
          setExercises([]);
          setUserStats({
            streak: 0,
            lastReset: new Date().toISOString(),
            lastCelebration: null
          });
          setStreak(0);
          return;
        }
        
        // Use the improved authentication that preserves sessions
        let currentUser;
        try {
          currentUser = await ensureUserAuthenticated();
        } catch (authError) {
          console.error('Failed to authenticate user:', authError);
          console.error('This might be because anonymous sign-ins are not enabled in your Supabase project.');
          console.error('Please enable anonymous sign-ins in Authentication > Settings in your Supabase dashboard.');
          
          // Fall back to default state
          setExercises([]);
          setUserStats({
            streak: 0,
            lastReset: new Date().toISOString(),
            lastCelebration: null
          });
          setStreak(0);
          return;
        }
        
        if (!currentUser || !currentUser.id) {
          console.error('Failed to get user ID');
          return;
        }
        
        console.log('User authenticated:', currentUser.id);
        setUser(currentUser);

        // Migrate localStorage data if needed
        await migrateLocalStorageToSupabase(currentUser.id);
        
        // Load exercises and stats from Supabase
        try {
          const [exercisesData, statsData] = await Promise.all([
            getExercises(currentUser.id),
            getUserStats(currentUser.id)
          ]);

          console.log('Loaded exercises from Supabase:', exercisesData);
          console.log('Loaded stats from Supabase:', statsData);

          // Transform exercises to match frontend format
          const transformedExercises = exercisesData.map(ex => ({
            id: ex.id,
            name: ex.name,
            targetReps: ex.target_reps,
            currentReps: ex.current_reps,
            createdAt: ex.created_at
          }));

          setExercises(transformedExercises);
          setUserStats(statsData);
          setStreak(statsData.streak);
        } catch (dataError) {
          console.error('Error loading data from Supabase:', dataError);
          
          // Fall back to default state
          setExercises([]);
          setUserStats({
            streak: 0,
            lastReset: new Date().toISOString(),
            lastCelebration: null
          });
          setStreak(0);
        }
        
        // Show PWA install prompt if conditions are met
        if (typeof window !== 'undefined') {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                               window.navigator.standalone === true;
          const hasShownPWAPrompt = localStorage.getItem('stronghabit-pwa-prompt-shown');
          
          if (!isStandalone && !hasShownPWAPrompt && exercises.length > 0) {
            setTimeout(() => {
              setShowPWAInstall(true);
            }, 5000);
          }
        }

      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('If you are seeing this error, please check:');
        console.error('1. Your .env.local file has the correct Supabase credentials');
        console.error('2. Your Supabase project is set up with the correct schema');
        console.error('3. Anonymous sign-ins are enabled in your Supabase project');
        
        // Fall back to empty state so user can still interact with UI
        setExercises([]);
        setUserStats({
          streak: 0,
          lastReset: new Date().toISOString(),
          lastCelebration: null
        });
        setStreak(0);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Check for completion and handle celebration
  useEffect(() => {
    if (exercises.length > 0 && !isLoading && user && userStats) {
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
        const lastCelebration = userStats.lastCelebration;
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
          
          // Update stats in Supabase
          const updatedStats = {
            ...userStats,
            streak: newStreak,
            lastCelebration: new Date().toISOString()
          };
          
          updateUserStats(user.id, updatedStats).then(() => {
            setUserStats(updatedStats);
          });
          
          // Show celebration
          setShowCelebration(true);
          console.log('Showing celebration!');
        }
      }
    }
  }, [exercises, isLoading, streak, user, userStats]);

  // Reset streak if a day was missed
  useEffect(() => {
    if (userStats && userStats.lastReset) {
      const lastResetDate = new Date(userStats.lastReset);
      const now = new Date();
      const daysDiff = Math.floor((now - lastResetDate) / (1000 * 60 * 60 * 24));
      
      // If more than one day has passed, reset streak
      if (daysDiff > 1) {
        const updatedStats = {
          ...userStats,
          streak: 0
        };
        
        setStreak(0);
        updateUserStats(user.id, updatedStats).then(() => {
          setUserStats(updatedStats);
        });
      }
    }
  }, [userStats, user]);

  // Function to simulate midnight
  const simulateMidnight = async () => {
    if (!user || !userStats) return;
    
    console.log('Simulating midnight reset...');
    
    try {
      // Perform the reset in Supabase
      const updatedExercises = await resetExercisesForNewDay(user.id, exercises, nextDayTargets);
      
      // Update exercises state
      setExercises(updatedExercises);
      
      // Clear next day targets
      setNextDayTargets({});
      
      // Update stats
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const updatedStats = {
        ...userStats,
        lastReset: tomorrow.toISOString(),
        lastCelebration: null // Clear last celebration for new day
      };
      
      await updateUserStats(user.id, updatedStats);
      setUserStats(updatedStats);
      
      console.log('Midnight simulation complete!');
    } catch (error) {
      console.error('Error during midnight simulation:', error);
    }
  };

  // Function to reset migration state (for debugging)
  const resetMigrationState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MIGRATION_KEY);
      console.log('Migration state reset. Refresh the page to retry migration.');
    }
  };

  // Check for day change and reset exercises
  useEffect(() => {
    const checkAndResetExercises = async () => {
      try {
        if (!user || !userStats) return;

        if (isNewDay(userStats.lastReset)) {
          console.log('New day detected! Resetting exercises...');
          
          // Perform the reset in Supabase
          const updatedExercises = await resetExercisesForNewDay(user.id, exercises, nextDayTargets);
          
          // Update exercises state
          setExercises(updatedExercises);
          
          // Clear next day targets
          setNextDayTargets({});
          
          // Update last reset date
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          const updatedStats = {
            ...userStats,
            lastReset: now.toISOString()
          };
          
          await updateUserStats(user.id, updatedStats);
          setUserStats(updatedStats);
          
          console.log('Reset complete!');
        }
      } catch (error) {
        console.error('Error checking for day change:', error);
      }
    };

    // Run check immediately
    checkAndResetExercises();

    // Set up interval to check every minute
    const intervalId = setInterval(checkAndResetExercises, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [exercises, nextDayTargets, user, userStats]);

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

  const handleSaveExercise = async (exercise) => {
    try {
      if (!user) {
        console.error('No user available for creating exercise');
        return;
      }

      const newExercise = await createExercise(user.id, exercise);
      
      setExercises(prevExercises => [...prevExercises, newExercise]);
      setIsModalOpen(false);
      
      console.log('Exercise created successfully:', newExercise);
    } catch (error) {
      console.error('Error saving new exercise:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteExercise = async (exerciseToDelete) => {
    try {
      await deleteExercise(exerciseToDelete.id);
      setExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== exerciseToDelete.id)
      );
      console.log('Exercise deleted successfully');
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleUpdateProgress = async (exercise, change) => {
    try {
      const newReps = Math.max(0, (exercise.currentReps || 0) + change);
      
      // Optimistically update UI
      setExercises(prevExercises => 
        prevExercises.map(ex => {
          if (ex.id === exercise.id) {
            return { ...ex, currentReps: newReps };
          }
          return ex;
        })
      );

      // Update in Supabase
      await updateExerciseProgress(exercise.id, newReps);
      
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      
      // Revert optimistic update on error
      setExercises(prevExercises => 
        prevExercises.map(ex => {
          if (ex.id === exercise.id) {
            return { ...ex, currentReps: exercise.currentReps };
          }
          return ex;
        })
      );
    }
  };

  // Handle PWA install prompt close
  const handlePWAInstallClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stronghabit-pwa-prompt-shown', 'true');
    }
    setShowPWAInstall(false);
  };

  // Load user profile after user is set
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          console.log('User profile:', profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to welcome page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
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
          
          {/* User Profile */}
          <div className="relative user-menu">
            <button 
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
            >
              {userProfile?.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircle2 className="w-8 h-8" />
              )}
              {userProfile && !userProfile.isAnonymous && (
                <span className="text-sm hidden sm:block">
                  {userProfile.name}
                </span>
              )}
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50"
                >
                  <div className="p-4">
                    {userProfile ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {userProfile.avatar ? (
                            <img 
                              src={userProfile.avatar} 
                              alt={userProfile.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <UserCircle2 className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{userProfile.name}</p>
                            {userProfile.email && (
                              <p className="text-sm text-gray-400">{userProfile.email}</p>
                            )}
                            <p className="text-xs text-gray-500 capitalize">
                              {userProfile.provider} account
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-t border-zinc-700 pt-3">
                          <div className="text-sm text-gray-400 mb-2">Your Progress</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-purple-400 font-medium">{streak}</div>
                              <div className="text-gray-500">Day Streak</div>
                            </div>
                            <div>
                              <div className="text-green-400 font-medium">{exercises.length}</div>
                              <div className="text-gray-500">Exercises</div>
                            </div>
                          </div>
                        </div>

                        {!userProfile.isAnonymous && (
                          <div className="border-t border-zinc-700 pt-3">
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Loading profile...</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        isOpen={showPWAInstall}
        onClose={handlePWAInstallClose}
      />
    </div>
  );
} 