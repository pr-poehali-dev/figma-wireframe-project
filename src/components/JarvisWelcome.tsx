import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JarvisWelcomeProps {
  onComplete: () => void;
}

export default function JarvisWelcome({ onComplete }: JarvisWelcomeProps) {
  const [stage, setStage] = useState<'appearing' | 'speaking' | 'fading'>('appearing');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(
      'Добро пожаловать в Архитектор. Меня зовут Джарвис, и я буду сопровождать вас на всём протяжении проектирования, приводя к самому лучшему результату.'
    );
    utterance.lang = 'ru-RU';
    utterance.rate = 1.15;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const russianVoice = voices.find(voice => 
      voice.lang.startsWith('ru') && (voice.name.includes('Male') || voice.name.includes('Yuri') || voice.name.includes('Google'))
    ) || voices.find(voice => voice.lang.startsWith('ru'));
    
    if (russianVoice) {
      utterance.voice = russianVoice;
    }

    utterance.onstart = () => {
      setStage('speaking');
    };

    utterance.onend = () => {
      setTimeout(() => {
        setStage('fading');
        setTimeout(onComplete, 800);
      }, 500);
    };

    const timer = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 1000);

    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 150);

    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
      window.speechSynthesis.cancel();
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'fading' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: stage === 'appearing' ? 1 : stage === 'speaking' ? [1, 1.05, 1] : 0.8,
              opacity: stage === 'fading' ? 0 : 1
            }}
            transition={{ 
              duration: stage === 'speaking' ? 1 : 1.2,
              repeat: stage === 'speaking' ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="relative h-80 w-80">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 blur-3xl"
              />

              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 blur-2xl"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-8"
                >
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#gradient1)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {stage === 'speaking' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: pulse === (i % 3) ? 80 : 40,
                            opacity: pulse === (i % 3) ? 1 : 0.4
                          }}
                          transition={{ duration: 0.15 }}
                          className="w-3 bg-gradient-to-t from-cyan-400 via-blue-400 to-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: stage === 'fading' ? 0 : 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Джарвис
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {stage === 'speaking' ? (
                <>
                  Добро пожаловать в <span className="font-semibold text-white">Архитектор</span>.
                  <br />
                  Я буду сопровождать вас на всём протяжении проектирования,
                  <br />
                  приводя к самому лучшему результату.
                </>
              ) : (
                <span className="text-white/40">Инициализация...</span>
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'speaking' ? 0.3 : 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
                className="absolute h-1 w-1 rounded-full bg-cyan-400"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}