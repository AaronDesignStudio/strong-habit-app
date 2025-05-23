'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const generateParticles = (count, size, clickPosition) => {
  const CARD_WIDTH = 400;
  const HALF_CARD = CARD_WIDTH / 2;
  
  return Array.from({ length: count }, (_, i) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const spreadX = direction * (Math.random() * HALF_CARD + HALF_CARD * 0.3);
    
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: clickPosition?.x || 0,
      y: clickPosition?.y || 0,
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
  
  const cleanupCompletedSets = useCallback(() => {
    const now = Date.now();
    setParticleSets(prevSets => 
      prevSets.filter(set => {
        const setAge = now - set[0].createdAt;
        return setAge < 2800;
      })
    );
  }, []);

  useEffect(() => {
    if (trigger) {
      const newParticles = generateParticles(count, size, clickPosition);
      setParticleSets(prev => [...prev, newParticles]);
      
      const timer = setTimeout(cleanupCompletedSets, 2800);
      return () => clearTimeout(timer);
    }
  }, [trigger, count, size, clickPosition, cleanupCompletedSets]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 40 }}>
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
                fontSize: particle.size,
                pointerEvents: 'none',
                willChange: 'transform',
                zIndex: 40
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