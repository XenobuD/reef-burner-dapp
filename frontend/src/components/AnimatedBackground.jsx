import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 100 + 50,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      color: [
        'rgba(112, 67, 255, 0.1)',
        'rgba(255, 67, 185, 0.1)',
        'rgba(67, 182, 255, 0.1)',
        'rgba(255, 107, 53, 0.1)'
      ][Math.floor(Math.random() * 4)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="animated-bg">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="floating-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color}, transparent)`,
            filter: 'blur(40px)'
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Fire particles rising from bottom */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`fire-${i}`}
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: `${20 + i * 20}%`,
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4), transparent)',
            borderRadius: '50%',
            filter: 'blur(10px)'
          }}
          animate={{
            y: [-50, -window.innerHeight],
            opacity: [1, 0],
            scale: [0.5, 1.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
