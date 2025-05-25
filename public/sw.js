const CACHE_NAME = 'stronghabit-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];





// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'StrongHabit',
    body: 'Time to build strength! 💪',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'stronghabit-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  // If push event has data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.log('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
  );
});

// Background sync event (for offline scenarios)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'stronghabit-sync') {
    event.waitUntil(
      // Handle any pending sync operations
      Promise.resolve()
    );
  }
});

// Global variables for service worker
let reminderIntervalId = null;
let isReminderActive = false;

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATIONS') {
    cancelScheduledNotifications(event.data.tag);
  }
  
  if (event.data && event.data.type === 'START_SMART_REMINDERS') {
    startSmartReminders(event.data.startHour, event.data.endHour);
  }
  
  if (event.data && event.data.type === 'STOP_SMART_REMINDERS') {
    stopSmartReminders();
  }
  
  if (event.data && event.data.type === 'EXERCISE_DATA_RESPONSE') {
    handleExerciseData(event.data.exercises);
  }
});

// Start smart reminders in service worker
function startSmartReminders(startHour = 9, endHour = 21) {
  console.log('Service Worker: Starting smart reminders', { startHour, endHour });
  
  // Stop any existing reminders
  stopSmartReminders();
  
  isReminderActive = true;
  
  // Store reminder settings for persistence
  self.reminderSettings = { startHour, endHour };
  
  const checkAndNotify = () => {
    if (!isReminderActive) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    console.log('Service Worker: Checking for notifications...', {
      currentHour,
      activeHours: `${startHour}-${endHour}`,
      isActiveTime: currentHour >= startHour && currentHour < endHour
    });
    
    // Only send reminders during active hours
    if (currentHour < startHour || currentHour >= endHour) {
      console.log('Service Worker: Outside active hours, skipping notification check');
      return;
    }
    
    // Check exercises and send notification if needed
    checkExercisesAndNotify();
  };
  
  // Check immediately
  checkAndNotify();
  
  // Set up interval to check every 5 seconds (testing)
  reminderIntervalId = setInterval(checkAndNotify, 5 * 1000);
  
  // Set up a periodic check to ensure reminders stay active (every 30 seconds)
  if (self.persistenceCheckId) {
    clearInterval(self.persistenceCheckId);
  }
  
  self.persistenceCheckId = setInterval(() => {
    if (Notification.permission === 'granted' && !isReminderActive) {
      console.log('Service Worker: Restarting inactive reminders');
      startSmartReminders(startHour, endHour);
    }
  }, 30 * 1000);
}

// Stop smart reminders
function stopSmartReminders() {
  console.log('Service Worker: Stopping smart reminders');
  isReminderActive = false;
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
  if (self.persistenceCheckId) {
    clearInterval(self.persistenceCheckId);
    self.persistenceCheckId = null;
  }
}

// Check exercises and send notification if incomplete
function checkExercisesAndNotify() {
  try {
    // Get exercises from IndexedDB or localStorage simulation
    // Since we can't access localStorage directly in service worker,
    // we'll use a different approach
    
    // For now, we'll send a message to all clients to get exercise data
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        // Send message to get exercise data
        clients[0].postMessage({
          type: 'GET_EXERCISE_DATA'
        });
      } else {
        // No clients available, try to get data from cache or storage
        console.log('Service Worker: No clients available for exercise data');
      }
    });
    
  } catch (error) {
    console.error('Service Worker: Error checking exercises:', error);
  }
}

// Handle exercise data response from client
function handleExerciseData(exercises) {
  try {
    if (!exercises || exercises.length === 0) {
      return; // No exercises to check
    }
    
    const incompleteExercises = exercises.filter(ex => (ex.currentReps || 0) < ex.targetReps);
    
    console.log('Service Worker: Exercise check:', {
      totalExercises: exercises.length,
      incompleteCount: incompleteExercises.length
    });
    
    if (incompleteExercises.length === 0) {
      console.log('Service Worker: All exercises complete - no reminder needed');
      return; // All exercises complete
    }
    
    // Check timing for notifications using a simple in-memory approach
    // Since we can't access localStorage directly in service worker
    const now = Date.now();
    
    // Use a global variable to track last notification time in service worker
    if (!self.lastNotificationTime) {
      self.lastNotificationTime = 0;
    }
    
    if (self.lastNotificationTime) {
      const timeSinceLastNotification = now - self.lastNotificationTime;
      const minInterval = 10 * 1000; // 10 seconds minimum (testing)
      const maxInterval = 15 * 1000; // 15 seconds maximum (testing)
      
      // Random interval between 10-15 seconds (testing)
      const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
      
      console.log('Service Worker: Timing check:', {
        timeSinceLastNotification: Math.round(timeSinceLastNotification / 1000) + 's',
        requiredInterval: Math.round(randomInterval / 1000) + 's',
        canSendNotification: timeSinceLastNotification >= randomInterval
      });
      
      if (timeSinceLastNotification < randomInterval) {
        console.log('Service Worker: Too soon for next reminder');
        return; // Too soon for next reminder
      }
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
    
    self.registration.showNotification('Workout Reminder 🏋️‍♂️', {
      body: randomMessage,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'smart-reminder',
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
    });
    
    // Update last notification time in service worker and client
    self.lastNotificationTime = now;
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_LAST_NOTIFICATION_TIME',
          timestamp: now
        });
      });
    });
    
    console.log('Service Worker: Smart reminder sent:', {
      incompleteCount: incompleteExercises.length,
      message: randomMessage
    });
    
  } catch (error) {
    console.error('Service Worker: Error handling exercise data:', error);
  }
}

// Activate event - clean up old caches and auto-start reminders
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and claiming clients');
      
      // Auto-start smart reminders if notifications are enabled
      if (Notification.permission === 'granted') {
        console.log('Service Worker: Auto-starting smart reminders on activation');
        // Use stored settings if available, otherwise default to 9-21
        const settings = self.reminderSettings || { startHour: 9, endHour: 21 };
        startSmartReminders(settings.startHour, settings.endHour);
      }
      
      return self.clients.claim();
    })
  );
});

// Also start reminders when service worker installs (for first time)
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => {
        console.log('Service Worker installed and caching complete');
        
        // Auto-start smart reminders if notifications are enabled
        if (Notification.permission === 'granted') {
          console.log('Service Worker: Auto-starting smart reminders on install');
          startSmartReminders(9, 21);
        }
        
        return self.skipWaiting();
      })
  );
});

// Helper function to schedule notifications
function scheduleNotification(payload) {
  const { title, body, delay, tag, icon } = payload;
  
  setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: tag || 'stronghabit-scheduled',
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
    });
  }, delay);
}

// Helper function to cancel scheduled notifications
function cancelScheduledNotifications(tag) {
  self.registration.getNotifications({ tag })
    .then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
} 