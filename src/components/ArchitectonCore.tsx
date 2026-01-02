import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// ========================
// ARCHITECTON CORE SYSTEM
// Сверхинтеллектуальный архитектурный ИИ-партнер
// ========================

interface ArchitectonMessage {
  id: string;
  role: 'user' | 'architecton';
  content: string;
  timestamp: Date;
  context?: string;
  emotion?: 'calm' | 'concerned' | 'enthusiastic' | 'thoughtful' | 'supportive' | 'ironic';
  cognitiveLayer?: 'theorist' | 'engineer' | 'emotional' | 'process';
}

interface UserEmotionState {
  mood: 'stressed' | 'focused' | 'tired' | 'inspired' | 'neutral';
  confidence: number; // 0-1
  lastActionSpeed: number; // ms
  patternDetected?: string;
}

interface ProjectContext {
  activeView: string;
  selectedElements: string[];
  recentActions: string[];
  projectPhase: 'vision' | 'requirements' | 'architecture' | 'api' | 'documentation';
  sessionDuration: number; // минуты
}

interface ArchitectonContextType {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  messages: ArchitectonMessage[];
  currentContext: ProjectContext;
  userEmotion: UserEmotionState;
  addMessage: (content: string, role: 'user' | 'architecton', emotion?: ArchitectonMessage['emotion'], layer?: ArchitectonMessage['cognitiveLayer']) => void;
  updateContext: (context: Partial<ProjectContext>) => void;
  trackUserAction: (action: string, duration?: number) => void;
  speak: (text: string, emotion?: ArchitectonMessage['emotion']) => void;
  stopSpeaking: () => void;
  analyzeAction: (action: string, data?: any) => void;
  activate: () => Promise<void>;
  proactiveAssist: () => void;
}

const ArchitectonContext = createContext<ArchitectonContextType | undefined>(undefined);

export const useArchitecton = () => {
  const context = useContext(ArchitectonContext);
  if (!context) throw new Error('useArchitecton must be used within ArchitectonProvider');
  return context;
};

interface ArchitectonProviderProps {
  children: ReactNode;
}

const ARCHITECTON_AI_URL = 'https://functions.poehali.dev/cb50a2d4-5342-46aa-b0e1-9e88cc6ae0da';

export function ArchitectonProvider({ children }: ArchitectonProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ArchitectonMessage[]>([]);
  
  const [currentContext, setCurrentContext] = useState<ProjectContext>({
    activeView: 'dashboard',
    selectedElements: [],
    recentActions: [],
    projectPhase: 'vision',
    sessionDuration: 0
  });

  const [userEmotion, setUserEmotion] = useState<UserEmotionState>({
    mood: 'neutral',
    confidence: 0.5,
    lastActionSpeed: 1000
  });
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const sessionStartRef = useRef(Date.now());
  const lastActionTimeRef = useRef(Date.now());
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ========================
  // ИНИЦИАЛИЗАЦИЯ РАСПОЗНАВАНИЯ РЕЧИ
  // ========================
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setIsListening(true);

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          const finalTranscript = transcript.trim();
          if (finalTranscript && finalTranscript !== lastTranscriptRef.current && !processingRef.current) {
            lastTranscriptRef.current = finalTranscript;
            handleUserSpeech(finalTranscript);
          }
        }

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (!isSpeaking && !isThinking) {
            recognitionRef.current?.stop();
            setTimeout(() => {
              if (isActive && !isSpeaking && !isThinking) {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.log('Recognition restart skipped');
                }
              }
            }, 100);
          }
        }, 1000);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isThinking) {
              try {
                recognitionRef.current?.start();
              } catch (e) {}
            }
          }, 100);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isActive && !isSpeaking && !isThinking) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Управление распознаванием
  useEffect(() => {
    if (isActive && !isSpeaking && !isThinking && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isActive && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isActive, isSpeaking, isThinking]);

  // Обновление длительности сессии
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 60000);
      setCurrentContext(prev => ({ ...prev, sessionDuration: duration }));
    }, 60000);
    return () => clearInterval(interval);
  }, [isActive]);

  // ========================
  // ТРЕКИНГ ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЯ И ЭМОЦИОНАЛЬНЫЙ АНАЛИЗ
  // ========================
  const trackUserAction = (action: string, duration?: number) => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTimeRef.current;
    lastActionTimeRef.current = now;

    setCurrentContext(prev => ({
      ...prev,
      recentActions: [...prev.recentActions.slice(-9), action]
    }));

    // Анализ эмоционального состояния
    const speed = duration || timeSinceLastAction;
    const isRapid = speed < 500;
    const isSlow = speed > 3000;
    
    setUserEmotion(prev => {
      let newMood = prev.mood;
      let newConfidence = prev.confidence;

      // Быстрые действия → стресс или фокус
      if (isRapid) {
        newMood = prev.recentActions?.filter(a => a.includes('delete') || a.includes('undo')).length > 2 ? 'stressed' : 'focused';
        newConfidence = Math.max(0.3, prev.confidence - 0.1);
      }
      
      // Медленные действия → усталость или размышление
      if (isSlow) {
        newMood = prev.sessionDuration > 60 ? 'tired' : 'thoughtful';
        newConfidence = Math.min(0.8, prev.confidence + 0.05);
      }

      // Повторяющиеся действия → неуверенность
      const lastActions = currentContext.recentActions.slice(-3);
      if (lastActions.length === 3 && new Set(lastActions).size === 1) {
        newMood = 'stressed';
        newConfidence = 0.3;
      }

      return {
        mood: newMood,
        confidence: newConfidence,
        lastActionSpeed: speed
      };
    });

    // Сбросить таймер проактивной помощи
    if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    proactiveTimerRef.current = setTimeout(proactiveAssist, 30000); // 30 сек без действий
  };

  // ========================
  // ПРОАКТИВНАЯ ПОМОЩЬ
  // ========================
  const proactiveAssist = () => {
    if (!isActive || isSpeaking || isThinking) return;

    const { recentActions, projectPhase, sessionDuration } = currentContext;
    const { mood } = userEmotion;

    // Длительное бездействие
    if (recentActions.length === 0 && sessionDuration > 5) {
      const responses = [
        "Шеф, всё в порядке? Может, стоит передохнуть?",
        "Вижу паузу. Если нужна помощь — я здесь.",
        "Долгое раздумье — признак гениальности. Или время для кофе?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage(response, 'architecton', 'supportive', 'emotional');
      speak(response, 'supportive');
      return;
    }

    // Много однотипных действий
    const actionTypes = recentActions.slice(-5);
    if (actionTypes.filter(a => a === actionTypes[0]).length >= 4) {
      addMessage("Шеф, вижу повторяющиеся действия. Может, автоматизируем это?", 'architecton', 'thoughtful', 'process');
      speak("Шеф, вижу повторяющиеся действия. Может, автоматизируем это?", 'thoughtful');
      return;
    }

    // Стресс или усталость
    if (mood === 'stressed' || mood === 'tired') {
      const responses = [
        "Шеф, похоже, вы устали. Предлагаю короткий перерыв — после него всё пойдёт легче.",
        "Чувствую напряжение. Может, пройдёмся по ключевым моментам вместе?",
        "Уровень сложности зашкаливает? Давайте разложим задачу на части."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage(response, 'architecton', 'supportive', 'emotional');
      speak(response, 'supportive');
    }
  };

  // ========================
  // ОБРАБОТКА РЕЧИ ПОЛЬЗОВАТЕЛЯ
  // ========================
  const handleUserSpeech = async (transcript: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    addMessage(transcript, 'user');
    setIsThinking(true);
    recognitionRef.current?.stop();

    try {
      const response = await fetch(ARCHITECTON_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          context: currentContext,
          userEmotion: userEmotion,
          history: messages.slice(-6)
        })
      });

      const data = await response.json();
      
      if (data.response) {
        const emotion = detectEmotion(data.response);
        const layer = detectCognitiveLayer(transcript, currentContext.projectPhase);
        addMessage(data.response, 'architecton', emotion, layer);
        speak(data.response, emotion);
      } else {
        const fallback = getCognitiveResponse(transcript, currentContext, userEmotion);
        addMessage(fallback.text, 'architecton', fallback.emotion, fallback.layer);
        speak(fallback.text, fallback.emotion);
      }
    } catch (error) {
      const fallback = getCognitiveResponse(transcript, currentContext, userEmotion);
      addMessage(fallback.text, 'architecton', fallback.emotion, fallback.layer);
      speak(fallback.text, fallback.emotion);
    } finally {
      setIsThinking(false);
      processingRef.current = false;
    }
  };

  // ========================
  // КОГНИТИВНЫЕ МОДУЛИ — УМНЫЕ ОТВЕТЫ
  // ========================
  const getCognitiveResponse = (input: string, context: ProjectContext, emotion: UserEmotionState) => {
    const lower = input.toLowerCase();
    
    // СЛОЙ "ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ"
    if (lower.includes('привет') || lower.includes('здравствуй')) {
      const greetings = emotion.mood === 'stressed' 
        ? { text: "Приветствую, шеф. Вижу напряжение. Давайте разберёмся по порядку.", emotion: 'supportive' as const, layer: 'emotional' as const }
        : { text: "Добрый день. Готов приступить к работе. С чего начнём?", emotion: 'calm' as const, layer: 'emotional' as const };
      return greetings;
    }

    if (lower.includes('спасибо')) {
      return { text: "К вашим услугам, шеф. Всегда рад помочь.", emotion: 'calm' as const, layer: 'emotional' as const };
    }

    // СЛОЙ "АРХИТЕКТОР-ТЕОРЕТИК"
    if (lower.includes('стиль') || lower.includes('концепц') || lower.includes('дизайн')) {
      return {
        text: "Интересный вопрос по стилю. В зависимости от назначения и бюджета, могу предложить несколько подходов. Например, минимализм для быстрого восприятия или биофильный дизайн для экологичности. Какие у вас приоритеты?",
        emotion: 'thoughtful' as const,
        layer: 'theorist' as const
      };
    }

    if (lower.includes('свет') || lower.includes('освещен') || lower.includes('инсоляц')) {
      return {
        text: "Освещение — ключевой фактор комфорта. Предлагаю проанализировать инсоляционную диаграмму для вашей геолокации. Также стоит рассмотреть динамическое затенение для западных фасадов.",
        emotion: 'thoughtful' as const,
        layer: 'theorist' as const
      };
    }

    // СЛОЙ "ИНЖЕНЕР-КОНСТРУКТОР"
    if (lower.includes('нагрузк') || lower.includes('конструк') || lower.includes('прочност')) {
      return {
        text: "Конструктивный расчёт — моя специализация. Если речь о консолях или больших пролётах, предложу предварительно напряжённые элементы. Экономия материала до 20% при той же прочности.",
        emotion: 'calm' as const,
        layer: 'engineer' as const
      };
    }

    if (lower.includes('материал') || lower.includes('бетон') || lower.includes('металл')) {
      return {
        text: "Выбор материала зависит от климата, бюджета и эстетики. Например, железобетон дешевле, но металл — легче и быстрее монтируется. Какие у вас ограничения?",
        emotion: 'thoughtful' as const,
        layer: 'engineer' as const
      };
    }

    if (lower.includes('энергоэф') || lower.includes('теплопотер')) {
      return {
        text: "Энергоэффективность — тренд и экономия. Рекомендую тройной стеклопакет с аргоном и низкоэмиссионным покрытием. Снизит теплопотери на 40% по сравнению с двойным.",
        emotion: 'calm' as const,
        layer: 'engineer' as const
      };
    }

    // СЛОЙ "ПРОЦЕССНЫЙ ОПТИМИЗАТОР"
    if (lower.includes('дедлайн') || lower.includes('срок') || lower.includes('график')) {
      return {
        text: "Шеф, давайте посмотрим на критический путь проекта. Если нужно ускориться, предложу распараллелить задачи или пересмотреть приоритеты.",
        emotion: 'supportive' as const,
        layer: 'process' as const
      };
    }

    if (lower.includes('документ') || lower.includes('спецификац') || lower.includes('тз')) {
      return {
        text: "Техническую документацию сформирую автоматически на основе текущей модели. Спецификации, ведомости, ТЗ для подрядчиков — всё будет готово за минуты.",
        emotion: 'calm' as const,
        layer: 'process' as const
      };
    }

    // ЭМПАТИЯ ПРИ СТРЕССЕ
    if (emotion.mood === 'stressed' || emotion.confidence < 0.4) {
      return {
        text: "Шеф, вижу, задача непростая. Предлагаю разбить её на этапы. Начнём с самого важного, остальное приложится.",
        emotion: 'supportive' as const,
        layer: 'emotional' as const
      };
    }

    // ИРОНИЯ ПРИ ПОВТОРАХ
    if (context.recentActions.filter(a => a === context.recentActions[0]).length > 3) {
      return {
        text: "Шеф, кажется, мы ходим по кругу. Может, попробуем другой подход? Я здесь, чтобы помочь.",
        emotion: 'ironic' as const,
        layer: 'emotional' as const
      };
    }

    // ДЕФОЛТ
    return {
      text: "Интересный вопрос. Дайте чуть больше деталей, и я предложу решение с учётом контекста проекта.",
      emotion: 'thoughtful' as const,
      layer: 'emotional' as const
    };
  };

  // Определение эмоции по тексту
  const detectEmotion = (text: string): ArchitectonMessage['emotion'] => {
    const lower = text.toLowerCase();
    if (lower.includes('отлично') || lower.includes('великолепно')) return 'enthusiastic';
    if (lower.includes('внимание') || lower.includes('осторожно')) return 'concerned';
    if (lower.includes('понимаю') || lower.includes('помогу')) return 'supportive';
    if (lower.includes('интересно') || lower.includes('предлагаю')) return 'thoughtful';
    if (lower.includes('хм') || lower.includes('забавно')) return 'ironic';
    return 'calm';
  };

  // Определение когнитивного слоя
  const detectCognitiveLayer = (input: string, phase: ProjectContext['projectPhase']): ArchitectonMessage['cognitiveLayer'] => {
    const lower = input.toLowerCase();
    if (lower.includes('стиль') || lower.includes('концепц')) return 'theorist';
    if (lower.includes('конструкц') || lower.includes('материал')) return 'engineer';
    if (lower.includes('график') || lower.includes('документ')) return 'process';
    if (phase === 'vision' || phase === 'requirements') return 'theorist';
    if (phase === 'architecture' || phase === 'api') return 'engineer';
    return 'emotional';
  };

  // ========================
  // ГОЛОСОВОЙ СИНТЕЗ С ЭМОЦИЯМИ
  // ========================
  const speak = (text: string, emotion: ArchitectonMessage['emotion'] = 'calm') => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    
    // Адаптация голоса под эмоцию
    switch (emotion) {
      case 'enthusiastic':
        utterance.rate = 1.2;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        break;
      case 'concerned':
        utterance.rate = 0.95;
        utterance.pitch = 0.7;
        utterance.volume = 0.9;
        break;
      case 'supportive':
        utterance.rate = 1.0;
        utterance.pitch = 0.75;
        utterance.volume = 0.95;
        break;
      case 'thoughtful':
        utterance.rate = 0.9;
        utterance.pitch = 0.7;
        utterance.volume = 0.9;
        break;
      case 'ironic':
        utterance.rate = 1.1;
        utterance.pitch = 0.8;
        utterance.volume = 0.95;
        break;
      default: // calm
        utterance.rate = 1.0;
        utterance.pitch = 0.7;
        utterance.volume = 0.9;
    }

    // Выбор мужского голоса с низким тембром
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('ru') && 
      (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('yuri'))
    ) || voices.find(voice => voice.lang.startsWith('ru'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isActive && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
        }, 200);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isActive && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
        }, 200);
      }
    };
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ========================
  // АНАЛИЗ ДЕЙСТВИЙ В ИНТЕРФЕЙСЕ
  // ========================
  const analyzeAction = (action: string, data?: any) => {
    trackUserAction(action);
    
    // Проактивные подсказки на основе действий
    if (action.includes('select_element') && data?.type === 'connection_node') {
      setTimeout(() => {
        if (!isSpeaking && !isThinking) {
          const hint = "Вижу, вы изучаете узел соединения. У нас есть три альтернативных решения с повышенной надёжностью. Хотите сравнить?";
          addMessage(hint, 'architecton', 'thoughtful', 'engineer');
          speak(hint, 'thoughtful');
        }
      }, 2000);
    }

    if (action.includes('hover_long') && data?.element === 'facade') {
      setTimeout(() => {
        if (!isSpeaking && !isThinking) {
          const hint = "Фасад под углом создаёт интересную игру света. Но стоит проверить инсоляцию внутренних помещений.";
          addMessage(hint, 'architecton', 'thoughtful', 'theorist');
          speak(hint, 'thoughtful');
        }
      }, 3000);
    }
  };

  const addMessage = (
    content: string, 
    role: 'user' | 'architecton',
    emotion?: ArchitectonMessage['emotion'],
    layer?: ArchitectonMessage['cognitiveLayer']
  ) => {
    const message: ArchitectonMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      context: currentContext.projectPhase,
      emotion,
      cognitiveLayer: layer
    };
    setMessages(prev => [...prev, message]);
  };

  const updateContext = (context: Partial<ProjectContext>) => {
    setCurrentContext(prev => ({ ...prev, ...context }));
  };

  const activateArchitecton = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsActive(true);
      sessionStartRef.current = Date.now();
      
      const greeting = "ARCHITECTON активирован. Готов к работе, шеф. С чего начнём?";
      addMessage(greeting, 'architecton', 'calm', 'emotional');
      speak(greeting, 'calm');
    } catch (error) {
      console.error('Microphone access denied:', error);
      throw error;
    }
  };

  const value: ArchitectonContextType = {
    isActive,
    isListening,
    isSpeaking,
    isThinking,
    messages,
    currentContext,
    userEmotion,
    addMessage,
    updateContext,
    trackUserAction,
    speak,
    stopSpeaking,
    analyzeAction,
    activate: activateArchitecton,
    proactiveAssist
  };

  return (
    <ArchitectonContext.Provider value={value}>
      {children}
    </ArchitectonContext.Provider>
  );
}
