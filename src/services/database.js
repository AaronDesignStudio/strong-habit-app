import { supabase } from '@/lib/supabase'

// User Management
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Supabase auth error:', error)
      throw error
    }
    console.log('Current user from session:', user?.id || 'No user')
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })
    
    if (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
    
    console.log('Google sign-in initiated')
    return data
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Sign out user
export const signOut = async () => {
  try {
    console.log('Signing out user...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      throw error
    }
    console.log('User signed out successfully')
    return true
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Enhanced sign in that tries to restore session first
export const ensureUserAuthenticated = async () => {
  try {
    console.log('Checking for existing user session...')
    
    // First, try to get the current user from the session
    let currentUser = await getCurrentUser()
    
    if (currentUser) {
      console.log('Found existing user session:', currentUser.id)
      console.log('User email:', currentUser.email || 'Anonymous')
      console.log('Auth provider:', currentUser.app_metadata?.provider || 'anonymous')
      return currentUser
    }
    
    // If no user session exists, create a new anonymous user
    console.log('No existing session found, creating new anonymous user...')
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      console.error('Anonymous sign-in error:', error)
      throw error
    }
    
    console.log('New anonymous user created:', data.user?.id)
    return data.user
  } catch (error) {
    console.error('Error ensuring user authentication:', error)
    throw error
  }
}

// Keep the old function for backward compatibility
export const signInAnonymously = async () => {
  try {
    console.log('Attempting anonymous sign-in...')
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Anonymous sign-in error:', error)
      throw error
    }
    console.log('Anonymous sign-in successful:', data.user?.id)
    return data.user
  } catch (error) {
    console.error('Error signing in anonymously:', error)
    throw error
  }
}

// Add function to check if user session is valid
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error checking session:', error)
      return false
    }
    return !!session?.user
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}

// Get user profile information
export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: user.app_metadata?.provider || 'anonymous',
      isAnonymous: !user.email
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Exercise Management
export const getExercises = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required')
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase query error (getExercises):', error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return []
  }
}

export const createExercise = async (userId, exercise) => {
  try {
    if (!userId) throw new Error('User ID is required')
    
    console.log('Creating exercise for user:', userId, exercise)
    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        user_id: userId,
        name: exercise.name,
        target_reps: exercise.targetReps,
        current_reps: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error (createExercise):', error)
      throw error
    }
    
    // Transform to match frontend format
    return {
      id: data.id,
      name: data.name,
      targetReps: data.target_reps,
      currentReps: data.current_reps,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error creating exercise:', error)
    throw error
  }
}

export const updateExerciseProgress = async (exerciseId, currentReps) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .update({ current_reps: currentReps })
      .eq('id', exerciseId)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error (updateExerciseProgress):', error)
      throw error
    }
    
    // Transform to match frontend format
    return {
      id: data.id,
      name: data.name,
      targetReps: data.target_reps,
      currentReps: data.current_reps,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error updating exercise progress:', error)
    throw error
  }
}

export const deleteExercise = async (exerciseId) => {
  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
    
    if (error) {
      console.error('Supabase delete error (deleteExercise):', error)
      throw error
    }
    return true
  } catch (error) {
    console.error('Error deleting exercise:', error)
    throw error
  }
}

export const updateExerciseTarget = async (exerciseId, targetReps) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .update({ target_reps: targetReps })
      .eq('id', exerciseId)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error (updateExerciseTarget):', error)
      throw error
    }
    
    // Transform to match frontend format
    return {
      id: data.id,
      name: data.name,
      targetReps: data.target_reps,
      currentReps: data.current_reps,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error updating exercise target:', error)
    throw error
  }
}

// Reset all exercises for new day
export const resetExercisesForNewDay = async (userId, exercises, nextDayTargets) => {
  try {
    if (!userId) throw new Error('User ID is required')
    
    const updates = exercises.map(exercise => {
      const wasCompleted = (exercise.currentReps || 0) >= exercise.targetReps
      const nextDayTarget = nextDayTargets[exercise.id]
      
      let newTargetReps = exercise.targetReps
      
      if (wasCompleted && nextDayTarget) {
        newTargetReps = nextDayTarget
      } else if (!wasCompleted) {
        newTargetReps = Math.max(1, (exercise.targetReps || 1) - 1)
      }
      
      return {
        id: exercise.id,
        current_reps: 0,
        target_reps: newTargetReps
      }
    })
    
    // Batch update all exercises
    const promises = updates.map(update => 
      supabase
        .from('exercises')
        .update({ 
          current_reps: update.current_reps,
          target_reps: update.target_reps 
        })
        .eq('id', update.id)
        .select()
        .single()
    )
    
    const results = await Promise.all(promises)
    
    // Check for errors in batch operations
    results.forEach(({ error }, index) => {
      if (error) {
        console.error(`Supabase batch update error for exercise ${updates[index].id}:`, error)
      }
    })
    
    // Transform results to match frontend format
    return results.map(({ data }) => ({
      id: data.id,
      name: data.name,
      targetReps: data.target_reps,
      currentReps: data.current_reps,
      createdAt: data.created_at
    }))
  } catch (error) {
    console.error('Error resetting exercises:', error)
    throw error
  }
}

// User Stats Management
export const getUserStats = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required')
    
    console.log('Fetching user stats for:', userId)
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase query error (getUserStats):', error)
      throw error
    }
    
    // Return default stats if no record exists
    if (!data) {
      console.log('No user stats found, returning defaults')
      return {
        streak: 0,
        lastReset: new Date().toISOString(),
        lastCelebration: null
      }
    }
    
    console.log('User stats found:', data)
    return {
      streak: data.streak || 0,
      lastReset: data.last_reset,
      lastCelebration: data.last_celebration
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      streak: 0,
      lastReset: new Date().toISOString(),
      lastCelebration: null
    }
  }
}

export const updateUserStats = async (userId, stats) => {
  try {
    if (!userId) {
      const error = new Error('User ID is required for updating stats')
      console.error('updateUserStats error:', error.message)
      throw error
    }
    
    if (!stats || typeof stats !== 'object') {
      const error = new Error('Valid stats object is required')
      console.error('updateUserStats error:', error.message, 'Received:', stats)
      throw error
    }
    
    console.log('Updating user stats for:', userId, 'with data:', stats)
    
    // Ensure we have valid values
    const statsToUpdate = {
      user_id: userId,
      streak: typeof stats.streak === 'number' ? stats.streak : 0,
      last_reset: stats.lastReset || new Date().toISOString(),
      last_celebration: stats.lastCelebration || null
    }
    
    console.log('Sanitized stats for update:', statsToUpdate)
    
    // Try upsert with conflict resolution
    const { data, error } = await supabase
      .from('user_stats')
      .upsert(statsToUpdate, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) {
      // If we get a duplicate key error, try to update the existing record instead
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        console.log('Duplicate key detected, trying update instead of upsert...')
        
        const { data: updateData, error: updateError } = await supabase
          .from('user_stats')
          .update({
            streak: statsToUpdate.streak,
            last_reset: statsToUpdate.last_reset,
            last_celebration: statsToUpdate.last_celebration
          })
          .eq('user_id', userId)
          .select()
          .single()
        
        if (updateError) {
          console.error('Supabase update error (updateUserStats):', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          })
          throw updateError
        }
        
        console.log('User stats updated successfully via update:', updateData)
        return {
          streak: updateData.streak || 0,
          lastReset: updateData.last_reset,
          lastCelebration: updateData.last_celebration
        }
      } else {
        console.error('Supabase upsert error (updateUserStats):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
    }
    
    console.log('User stats updated successfully:', data)
    
    return {
      streak: data.streak || 0,
      lastReset: data.last_reset,
      lastCelebration: data.last_celebration
    }
  } catch (error) {
    console.error('Error updating user stats:', {
      message: error.message,
      userId,
      stats,
      error
    })
    throw error
  }
}

// Utility function to check if it's a new day
export const isNewDay = (lastResetDate) => {
  if (!lastResetDate) return true
  
  const now = new Date()
  const last = new Date(lastResetDate)
  
  // Set both dates to start of day for comparison
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastStart = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  
  return nowStart > lastStart
}

// Add a function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('exercises').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
} 