'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check, AlertCircle } from 'lucide-react';
// Dynamic import for notificationService to avoid SSR issues

export default function NotificationPermission({ 
  isOpen, 
  onClose, 
  onPermissionGranted,
  showAsModal = true 
}) {
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true);

  useEffect(() => {
    const checkPermissionStatus = async () => {
      if (typeof window !== 'undefined') {
        const { default: notificationService } = await import('@/services/notificationService');
        await notificationService.init();
        setPermissionStatus(notificationService.getPermissionStatus());
      }
    };

    if (isOpen) {
      checkPermissionStatus();
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      if (typeof window === 'undefined') {
        return;
      }

      const { default: notificationService } = await import('@/services/notificationService');
      const result = await notificationService.requestPermission();
      setPermissionStatus(result);
      
      if (result === 'granted') {
        // Schedule smart reminders (only when exercises are incomplete)
        notificationService.scheduleSmartReminders(9, 21); // 9 AM to 9 PM
        
        // Show success notification after a short delay
        setTimeout(() => {
          notificationService.showNotification(
            'Notifications Enabled! 🎉',
            {
              body: 'You\'ll receive smart reminders only when you have incomplete exercises!',
              tag: 'permission-success'
            }
          );
        }, 1000);
        
        if (onPermissionGranted) {
          onPermissionGranted();
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const benefits = [
    {
      icon: '⏰',
      title: 'Smart Reminders',
      description: 'Get gentle nudges only when you have incomplete exercises (60-90 min intervals)'
    },
    {
      icon: '🔥',
      title: 'Streak Celebrations',
      description: 'Celebrate your achievements and milestone streaks'
    },
    {
      icon: '💪',
      title: 'Motivation Boosts',
      description: 'Receive encouraging messages to keep you going'
    },
    {
      icon: '📊',
      title: 'Progress Updates',
      description: 'Stay informed about your fitness journey'
    }
  ];

  const getStatusContent = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          icon: <Check className="w-8 h-8 text-green-500" />,
          title: 'Notifications Enabled! 🎉',
          description: 'You\'re all set to receive helpful workout reminders.',
          showBenefits: false,
          buttonText: 'Close',
          buttonAction: onClose,
          buttonStyle: 'bg-green-600 hover:bg-green-700'
        };
      
      case 'denied':
        return {
          icon: <BellOff className="w-8 h-8 text-red-500" />,
          title: 'Notifications Blocked',
          description: 'To enable notifications, please allow them in your browser settings.',
          showBenefits: false,
          buttonText: 'Close',
          buttonAction: onClose,
          buttonStyle: 'bg-gray-600 hover:bg-gray-700'
        };
      
      case 'unsupported':
        return {
          icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
          title: 'Notifications Not Supported',
          description: 'Your browser doesn\'t support notifications, but you can still use the app!',
          showBenefits: false,
          buttonText: 'Close',
          buttonAction: onClose,
          buttonStyle: 'bg-gray-600 hover:bg-gray-700'
        };
      
      default:
        return {
          icon: <Bell className="w-8 h-8 text-purple-500" />,
          title: 'Enable Notifications',
          description: 'Stay motivated and consistent with helpful workout reminders.',
          showBenefits: true,
          buttonText: isRequesting ? 'Requesting...' : 'Enable Notifications',
          buttonAction: handleRequestPermission,
          buttonStyle: 'bg-purple-600 hover:bg-purple-700',
          disabled: isRequesting
        };
    }
  };

  const content = getStatusContent();

  const PermissionContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        {content.icon}
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-3">
        {content.title}
      </h2>

      {/* Description */}
      <p className="text-gray-400 mb-6">
        {content.description}
      </p>

      {/* Benefits */}
      {content.showBenefits && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 text-left"
            >
              <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={content.buttonAction}
        disabled={content.disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${content.buttonStyle} ${
          content.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {content.buttonText}
      </motion.button>

      {/* Skip Option */}
      {permissionStatus === 'default' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="w-full mt-3 py-2 px-4 text-gray-400 hover:text-white transition-colors"
        >
          Maybe Later
        </motion.button>
      )}
    </motion.div>
  );

  if (!showAsModal) {
    return <PermissionContent />;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <PermissionContent />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 