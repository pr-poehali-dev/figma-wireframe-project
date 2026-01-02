import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ArchitectonWelcomeNewProps {
  onComplete: () => void;
}

export default function ArchitectonWelcomeNew({ onComplete }: ArchitectonWelcomeNewProps) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const smokeTimer = setTimeout(() => setShowText(true), 1500);
    const completeTimer = setTimeout(onComplete, 4500);
    
    return () => {
      clearTimeout(smokeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
    >
      {/* Particles/Smoke Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, 
                rgba(139, 92, 246, ${Math.random() * 0.2}) 0%, 
                rgba(59, 130, 246, ${Math.random() * 0.1}) 50%, 
                transparent 100%)`
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              filter: 'blur(20px)'
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 2],
              filter: ['blur(20px)', 'blur(40px)', 'blur(60px)'],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * -300]
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 1,
              repeat: 1,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      {/* Central Glow */}
      <motion.div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 30%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Welcome Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: [30, 0, 0, -20],
            filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(5px)']
          }}
          transition={{ 
            duration: 3,
            times: [0, 0.2, 0.8, 1],
            ease: 'easeOut'
          }}
          className="relative z-10 text-center"
        >
          <h1 
            className="text-6xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 25%, #60a5fa 50%, #818cf8 75%, #a78bfa 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(139, 92, 246, 0.6), 0 0 120px rgba(139, 92, 246, 0.4)',
              animation: 'shimmer 3s linear infinite'
            }}
          >
            Добро пожаловать в Архитектор
          </h1>

          {/* Animated Underline */}
          <motion.div
            className="mx-auto mt-6 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: ['0%', '80%', '80%', '0%'],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.3, 0.7, 1],
              ease: 'easeInOut'
            }}
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)'
            }}
          />
        </motion.div>
      )}

      {/* Rotating Rings */}
      <motion.div
        className="absolute"
        style={{
          width: 400,
          height: 400,
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '50%'
        }}
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      />

      <motion.div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '50%'
        }}
        animate={{
          rotate: -360
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </motion.div>
  );
}
