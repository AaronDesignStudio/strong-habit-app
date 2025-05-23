'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const generateParticles = (count, size, clickPosition) => {
  const CARD_WIDTH = 400;
  const HALF_CARD = CARD_WIDTH / 2;
  const BUTTON_WIDTH = 60;  // Approximate button width
  const BUTTON_HEIGHT = 40; // Approximate button height
  
  return Array.from({ length: count }, (_, i) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const spreadX = direction * (Math.random() * HALF_CARD + HALF_CARD * 0.3);
    
    // Randomize starting position within button area
    const randomX = (Math.random() - 0.5) * BUTTON_WIDTH;
    const randomY = (Math.random() - 0.5) * BUTTON_HEIGHT;
    
    // Calculate final starting position
    const startX = (clickPosition?.x || 0) + randomX;
    const startY = (clickPosition?.y || 0) + randomY;
    
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: startX,
      y: startY,
      size,
      spreadX,
      maxRise: -100 - Math.abs(spreadX * 0.2),
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
      createdAt: Date.now()
    };
  });
};

export default function EmojiConfetti({ 
  trigger, 
  count = 3,
  size = 20,
  clickPosition = null
}) {
  const [particleSets, setParticleSets] = useState([]);
  
  // Cleanup function to remove completed particle sets
  const cleanupCompletedSets = useCallback(() => {
    const now = Date.now();
    setParticleSets(prevSets => 
      prevSets.filter(set => {
        // Keep sets that haven't completed their full animation (2.5s + max delay)
        const setAge = now - set[0].createdAt;
        return setAge < 2800; // 2.5s animation + 0.3s max delay
      })
    );
  }, []);

  useEffect(() => {
    if (trigger) {
      // Add new particle set
      const newParticles = generateParticles(count, size, clickPosition);
      setParticleSets(prev => [...prev, newParticles]);
      
      // Schedule cleanup
      const timer = setTimeout(cleanupCompletedSets, 2800);
      return () => clearTimeout(timer);
    }
  }, [trigger, count, size, clickPosition, cleanupCompletedSets]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particleSets.flatMap(particleSet =>
          particleSet.map(particle => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                scale: 0.5,
                x: particle.x,
                y: particle.y,
                rotate: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.8],
                x: [
                  particle.x,
                  particle.x + particle.spreadX * 0.2,
                  particle.x + particle.spreadX * 0.6,
                  particle.x + particle.spreadX
                ],
                y: [
                  particle.y,
                  particle.y + particle.maxRise * 0.7,
                  particle.y + particle.maxRise,
                  particle.y + particle.maxRise * 0.3
                ],
                rotate: [0, particle.rotation * 0.5, particle.rotation]
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: [0.2, 0.4, 0.2, 1],
                times: [0, 0.3, 0.7, 1],
                opacity: {
                  duration: 2,
                  times: [0, 0.2, 0.8, 1]
                }
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                fontSize: particle.size
              }}
            >
              💪🏼
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
} 