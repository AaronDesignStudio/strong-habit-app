// Notification Service for StrongHabit PWA
class NotificationService {
  constructor() {
    this.swRegistration = null;
    this.permissionStatus = 'default';
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
    this.reminderIntervalId = null;
  }

  // Initialize the notification service
  async init() {
    if (!this.isSupported) {
      console.log('Notifications not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Set up message listener for service worker communication
      this.setupServiceWorkerMessageListener();

      // Check current permission status
      this.permissionStatus = typeof window !== 'undefined' ? Notification.permission : 'default';
      
      // If permission is granted, automatically start smart reminders
      if (this.permissionStatus === 'granted') {
        console.log('Notification permission already granted, starting smart reminders');
        this.scheduleSmartReminders(9, 21);
      }
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Still return true if notifications are supported, just without service worker
      this.permissionStatus = typeof window !== 'undefined' ? Notification.permission : 'default';
      return this.isSupported;
    }
  }

  // Set up service worker message listener
  setupServiceWorkerMessageListener() {
    if (typeof window === 'undefined' || !navigator.serviceWorker) {
      return;
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Received message from service worker:', event.data);
      
      if (event.data.type === 'GET_EXERCISE_DATA') {
        // Send exercise data to service worker
        this.sendExerciseDataToServiceWorker();
      }
      
      if (event.data.type === 'UPDATE_LAST_NOTIFICATION_TIME') {
        // Update last notification time in localStorage
        localStorage.setItem('stronghabit-last-reminder', event.data.timestamp.toString());
      }
    });
  }

  // Send exercise data to service worker
  sendExerciseDataToServiceWorker() {
    try {
      if (typeof window === 'undefined') return;
      
      const exercises = JSON.parse(localStorage.getItem('stronghabit-exercises') || '[]');
      
      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({
          type: 'EXERCISE_DATA_RESPONSE',
          exercises: exercises
        });
      }
    } catch (error) {
      console.error('Error sending exercise data to service worker:', error);
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return 'unsupported';
    }

    if (this.permissionStatus === 'granted') {
      // If already granted, make sure smart reminders are running
      this.scheduleSmartReminders(9, 21);
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      
      // Store permission status in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('stronghabit-notification-permission', permission);
      }
      
      // If permission granted, start smart reminders
      if (permission === 'granted') {
        this.scheduleSmartReminders(9, 21);
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.isSupported && this.permissionStatus === 'granted';
  }

  // Ensure service worker is ready
  async ensureServiceWorkerReady() {
    if (!this.swRegistration) {
      await this.init();
    }
    
    if (this.swRegistration && !this.swRegistration.active) {
      try {
        await navigator.serviceWorker.ready;
      } catch (error) {
        console.warn('Service worker not ready, will use direct notifications');
      }
    }
  }

  // Get permission status
  getPermissionStatus() {
    return this.permissionStatus;
  }

  // Show immediate notification
  async showNotification(title, options = {}) {
    if (!this.isEnabled()) {
      console.log('Notifications not enabled');
      return false;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'stronghabit-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    const notificationOptions = { ...defaultOptions, ...options };

    try {
      // Wait for service worker to be ready
      if (this.swRegistration) {
        // Check if service worker is active
        if (this.swRegistration.active) {
          await this.swRegistration.showNotification(title, notificationOptions);
        } else {
          // Wait for service worker to become active
          await new Promise((resolve) => {
            if (this.swRegistration.installing) {
              this.swRegistration.installing.addEventListener('statechange', () => {
                if (this.swRegistration.active) {
                  resolve();
                }
              });
            } else if (this.swRegistration.waiting) {
              this.swRegistration.waiting.addEventListener('statechange', () => {
                if (this.swRegistration.active) {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          });
          
          if (this.swRegistration.active) {
            await this.swRegistration.showNotification(title, notificationOptions);
          } else {
            // Fallback to direct notification
            new Notification(title, notificationOptions);
          }
        }
      } else {
        // Fallback to direct notification if no service worker
        new Notification(title, notificationOptions);
      }
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      
      // Final fallback - try direct notification
      try {
        new Notification(title, notificationOptions);
        return true;
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
        return false;
      }
    }
  }

  // Schedule a notification with delay
  async scheduleNotification(title, body, delayMs, tag = 'scheduled') {
    if (!this.isEnabled()) {
      console.log('Notifications not enabled');
      return false;
    }

    try {
      await this.ensureServiceWorkerReady();

      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          payload: {
            title,
            body,
            delay: delayMs,
            tag,
            icon: '/icons/icon-192x192.png'
          }
        });
        return true;
      }

      // Fallback to setTimeout if service worker not available
      setTimeout(() => {
        this.showNotification(title, { body, tag });
      }, delayMs);

      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  // Cancel scheduled notifications
  cancelNotifications(tag) {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'CANCEL_NOTIFICATIONS',
        tag
      });
    }
  }

  // Schedule smart reminder notifications (only when exercises are incomplete)
  scheduleSmartReminders(startHour = 9, endHour = 21) {
    if (!this.isEnabled()) {
      return false;
    }

    // Clear any existing reminder intervals
    this.clearReminderInterval();

    // Start smart reminders in service worker (persistent)
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'START_SMART_REMINDERS',
        startHour,
        endHour
      });
      
      console.log('Smart reminders started in service worker:', {
        activeHours: `${startHour}:00 - ${endHour}:00`,
        interval: '10-15 seconds (TESTING MODE - when exercises incomplete)',
        persistent: true
      });
    } else {
      // Fallback to client-side reminders if service worker not available
      this.startSmartReminderInterval(startHour, endHour);
      
      console.log('Smart reminders started (client-side fallback):', {
        activeHours: `${startHour}:00 - ${endHour}:00`,
        interval: '10-15 seconds (TESTING MODE - when exercises incomplete)',
        persistent: false
      });
    }

    return true;
  }

     // Start the smart reminder interval system
   startSmartReminderInterval(startHour, endHour) {
     const checkAndNotify = () => {
       const now = new Date();
       const currentHour = now.getHours();

       console.log('Checking for notifications...', {
         currentHour,
         activeHours: `${startHour}-${endHour}`,
         isActiveTime: currentHour >= startHour && currentHour < endHour
       });

       // Only send reminders during active hours
       if (currentHour < startHour || currentHour >= endHour) {
         console.log('Outside active hours, skipping notification check');
         return;
       }

       // Check if exercises are incomplete
       this.checkExercisesAndNotify();
     };

    // Check immediately
    checkAndNotify();

         // Set up interval to check every 5 seconds (for testing)
     this.reminderIntervalId = setInterval(checkAndNotify, 5 * 1000);
  }

  // Check exercises and send notification if incomplete
  checkExercisesAndNotify() {
    try {
      if (typeof window === 'undefined') {
        return; // Skip on server-side
      }
      
      const exercises = JSON.parse(localStorage.getItem('stronghabit-exercises') || '[]');
      
      if (exercises.length === 0) {
        return; // No exercises to check
      }

             const incompleteExercises = exercises.filter(ex => (ex.currentReps || 0) < ex.targetReps);
       
       console.log('Exercise check:', {
         totalExercises: exercises.length,
         incompleteCount: incompleteExercises.length,
         exercises: exercises.map(ex => ({
           name: ex.name,
           current: ex.currentReps || 0,
           target: ex.targetReps,
           isComplete: (ex.currentReps || 0) >= ex.targetReps
         }))
       });
       
       if (incompleteExercises.length === 0) {
         console.log('All exercises complete - no reminder needed');
         return; // All exercises complete
       }

             // Check if enough time has passed since last notification
       const lastNotificationTime = localStorage.getItem('stronghabit-last-reminder');
       const now = Date.now();
       
              if (lastNotificationTime) {
         const timeSinceLastNotification = now - parseInt(lastNotificationTime);
          const minInterval = 10 * 1000; // 10 seconds minimum (for testing)
          const maxInterval = 15 * 1000; // 15 seconds maximum (for testing)
         
          // Random interval between 10-15 seconds (for testing)
         const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
         
         console.log('Timing check:', {
           timeSinceLastNotification: Math.round(timeSinceLastNotification / 1000) + 's',
           requiredInterval: Math.round(randomInterval / 1000) + 's',
           canSendNotification: timeSinceLastNotification >= randomInterval
         });
         
         if (timeSinceLastNotification < randomInterval) {
           console.log('Too soon for next reminder');
           return; // Too soon for next reminder
         }
       } else {
         console.log('No previous notification time - sending first notification');
       }

      // Send reminder notification
      const reminderMessages = [
        `${incompleteExercises.length} exercises waiting for you! 💪`,
        `Time to crush those ${incompleteExercises.length} remaining exercises! 🔥`,
        `Your strength journey continues - ${incompleteExercises.length} exercises to go! ⚡`,
        `Ready to complete your ${incompleteExercises.length} exercises? Let's go! 🚀`,
        `${incompleteExercises.length} exercises left - you've got this! 💎`
      ];

      const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];

      this.showNotification(
        'Workout Reminder 🏋️‍♂️',
        {
          body: randomMessage,
          tag: 'smart-reminder',
          requireInteraction: false
        }
      );

      // Update last notification time
      localStorage.setItem('stronghabit-last-reminder', now.toString());
      
      console.log('Smart reminder sent:', {
        incompleteCount: incompleteExercises.length,
        message: randomMessage
      });

    } catch (error) {
      console.error('Error checking exercises for smart reminder:', error);
    }
  }

  // Clear reminder interval
  clearReminderInterval() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }

  // Schedule daily reminder notifications (legacy method - kept for compatibility)
  scheduleDailyReminders(morningTime = '09:00', eveningTime = '18:00') {
    // Use smart reminders instead
    return this.scheduleSmartReminders(9, 21);
  }

  // Show streak milestone notification
  showStreakNotification(streakDays) {
    const milestones = {
      3: { emoji: '🔥', message: 'You\'re on fire!' },
      7: { emoji: '⚡', message: 'One week strong!' },
      14: { emoji: '💎', message: 'Two weeks of dedication!' },
      30: { emoji: '🏆', message: 'One month champion!' },
      50: { emoji: '🚀', message: 'Unstoppable force!' },
      100: { emoji: '👑', message: 'Century club member!' }
    };

    const milestone = milestones[streakDays];
    if (milestone) {
      this.showNotification(
        `${streakDays}-Day Streak! ${milestone.emoji}`,
        {
          body: milestone.message,
          tag: 'streak-milestone',
          requireInteraction: true
        }
      );
    }
  }

  // Show completion celebration notification
  showCompletionNotification(exerciseCount, totalReps) {
    this.showNotification(
      'All Exercises Complete! 🎉',
      {
        body: `Amazing! You completed ${exerciseCount} exercises with ${totalReps} total reps!`,
        tag: 'completion-celebration',
        requireInteraction: true
      }
    );
  }

  // Show encouragement notification for missed days
  showEncouragementNotification() {
    const encouragements = [
      'Every champion has off days. Let\'s get back to it! 🏆',
      'Progress isn\'t always linear. You\'ve got this! 💪',
      'One step back, two steps forward. Keep going! 🚀',
      'Your comeback story starts now! ⚡',
      'Consistency beats perfection. Let\'s restart! 🔥'
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    this.showNotification(
      'Ready for a Fresh Start? 🌟',
      {
        body: randomEncouragement,
        tag: 'encouragement',
        requireInteraction: false
      }
    );
  }

        // Update app badge (for supported browsers)
  updateBadge(count) {
    if (typeof window !== 'undefined' && 'setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.swRegistration) {
      const notifications = await this.swRegistration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService; 