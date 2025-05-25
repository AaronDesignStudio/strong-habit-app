'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Download } from 'lucide-react';

export default function PWAInstallPrompt({ isOpen, onClose }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if it's iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);
      
      // Check if already installed (standalone mode)
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
      setIsStandalone(standalone);
    }
  }, []);

  if (!isOpen || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-zinc-900 rounded-t-2xl p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
              <Download className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            Install StrongHabit
          </h2>

          {/* Description */}
          <p className="text-gray-400 mb-6 text-center">
            Add StrongHabit to your home screen for the best experience and reliable notifications!
          </p>

          {/* Instructions */}
          {isIOS ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Tap the Share button</span>
                <div className="w-6 h-6 border border-gray-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Tap "Add" to install</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Tap the menu button (⋮)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Select "Add to Home Screen"</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Tap "Install" or "Add"</span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">Benefits:</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Reliable push notifications</li>
              <li>• Faster app loading</li>
              <li>• Full-screen experience</li>
              <li>• Works offline</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Got it!
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 