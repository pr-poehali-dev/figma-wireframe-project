import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArchitectonWelcomeProps {
  onComplete: () => void;
}

export default function ArchitectonWelcome({ onComplete }: ArchitectonWelcomeProps) {
  const [stage, setStage] = useState<'appearing' | 'speaking' | 'fading'>('appearing');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const loadVoicesAndSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(
        'Добро пожаловать. Меня зовут Архитектон. Я — ваш партнер по проектированию. Вместе мы создадим нечто выдающееся.'
      );
      utterance.lang = 'ru-RU';
      utterance.rate = 0.95;
      utterance.pitch = 0.7;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => 
        voice.lang.startsWith('ru') && 
        (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('yuri'))
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
          setTimeout(onComplete, 300);
        }, 100);
      };

      utterance.onerror = () => {
        setTimeout(() => {
          setStage('fading');
          setTimeout(onComplete, 300);
        }, 100);
      };

      window.speechSynthesis.speak(utterance);
    };

    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 150);

    if (window.speechSynthesis.getVoices().length > 0) {
      setTimeout(loadVoicesAndSpeak, 300);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setTimeout(loadVoicesAndSpeak, 300);
      };
    }

    return () => {
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
        className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-black to-purple-900/20 flex items-center justify-center overflow-hidden"
      >
        {/* Фоновая сетка */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: stage === 'appearing' ? 1 : stage === 'speaking' ? [1, 1.02, 1] : 0.8,
              opacity: stage === 'fading' ? 0 : 1
            }}
            transition={{ 
              duration: stage === 'speaking' ? 2 : 1.2,
              repeat: stage === 'speaking' ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="relative h-96 w-96">
              {/* Внешнее свечение */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 blur-3xl"
              />

              {/* Среднее свечение */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                className="absolute inset-6 rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 blur-2xl"
              />

              {/* Центральное ядро */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Вращающееся кольцо */}
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-12"
                >
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="url(#gradient1)"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      opacity="0.5"
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

                {/* Контр-вращающееся кольцо */}
                <motion.div
                  animate={{
                    rotate: -360
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-16"
                >
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="75"
                      fill="none"
                      stroke="url(#gradient2)"
                      strokeWidth="1"
                      strokeDasharray="4 8"
                      opacity="0.4"
                    />
                    <defs>
                      <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Центральная сфера */}
                <motion.div
                  animate={{
                    scale: stage === 'speaking' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: stage === 'speaking' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="relative h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow-2xl shadow-purple-500/50"
                >
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 opacity-80" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-700 via-blue-700 to-cyan-700 opacity-60" />
                </motion.div>

                {/* Аудио-визуализация при говорении */}
                {stage === 'speaking' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-2.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: pulse === (i % 3) ? 90 : 45,
                            opacity: pulse === (i % 3) ? 1 : 0.4
                          }}
                          transition={{ duration: 0.15 }}
                          className="w-3.5 bg-gradient-to-t from-cyan-400 via-blue-400 to-purple-400 rounded-full shadow-lg shadow-blue-500/50"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Текст */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: stage === 'fading' ? 0 : 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent tracking-wide">
              ARCHITECTON
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === 'speaking' ? 1 : 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
                {stage === 'speaking' ? (
                  <>
                    Добро пожаловать, шеф.
                    <br />
                    <span className="text-lg text-white/70 mt-2 inline-block">
                      Я — ваш архитектурный партнер с глубоким пониманием
                      <br />
                      теории, инженерии и эмоционального интеллекта.
                    </span>
                    <br />
                    <span className="text-base text-purple-400/80 mt-3 inline-block font-medium">
                      Вместе мы создадим нечто выдающееся.
                    </span>
                  </>
                ) : (
                  <span className="text-white/30">Инициализация когнитивных модулей...</span>
                )}
              </p>
            </motion.div>
          </motion.div>

          {/* Плавающие частицы */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'speaking' ? 0.25 : 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
                className={`absolute h-1 w-1 rounded-full ${
                  i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-cyan-400'
                }`}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
