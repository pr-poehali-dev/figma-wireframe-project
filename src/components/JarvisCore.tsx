import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface JarvisMessage {
  id: string;
  role: 'user' | 'jarvis';
  content: string;
  timestamp: Date;
  context?: string;
}

interface JarvisContextType {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  messages: JarvisMessage[];
  currentContext: string;
  addMessage: (content: string, role: 'user' | 'jarvis', context?: string) => void;
  setContext: (context: string) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  analyzeAction: (action: string, data?: any) => void;
}

const JarvisContext = createContext<JarvisContextType | undefined>(undefined);

export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (!context) throw new Error('useJarvis must be used within JarvisProvider');
  return context;
};

interface JarvisProviderProps {
  children: ReactNode;
}

export function JarvisProvider({ children }: JarvisProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<JarvisMessage[]>([]);
  const [currentContext, setCurrentContext] = useState('general');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          if (transcript.trim() && transcript !== lastTranscriptRef.current) {
            lastTranscriptRef.current = transcript;
            handleUserSpeech(transcript);
          }
        }

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (!isSpeaking) {
            recognitionRef.current?.stop();
            setTimeout(() => {
              if (isActive && !isSpeaking) {
                recognitionRef.current?.start();
              }
            }, 100);
          }
        }, 2000);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setTimeout(() => {
            if (isActive && !isSpeaking) {
              recognitionRef.current?.start();
            }
          }, 100);
        } else {
          console.error('Speech recognition error:', event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isActive && !isSpeaking) {
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isSpeaking) {
      recognitionRef.current?.start();
    } else if (!isActive) {
      recognitionRef.current?.stop();
    }
  }, [isActive, isSpeaking]);

  const handleUserSpeech = (transcript: string) => {
    addMessage(transcript, 'user');
    const response = generateResponse(transcript, currentContext);
    setTimeout(() => {
      addMessage(response, 'jarvis', currentContext);
      speak(response);
    }, 500);
  };

  const generateResponse = (userInput: string, context: string): string => {
    const input = userInput.toLowerCase();

    const contextResponses: Record<string, Record<string, string[]>> = {
      welcome: {
        default: [
          'Добро пожаловать! Я Джарвис, ваш персональный архитектурный ассистент. Я буду с вами на протяжении всего процесса проектирования.',
          'Приветствую! Меня зовут Джарвис. Я помогу вам создать лучшую архитектуру для вашего проекта.'
        ]
      },
      architecture: {
        help: [
          'Конечно! Для начала определите контекст системы - это самый высокий уровень C4 модели. Кто будет пользователями?',
          'Давайте начнем с контекстной диаграммы. Какие внешние системы будут взаимодействовать с вашим приложением?'
        ],
        add: [
          'Отличная идея добавить этот компонент! Подумайте о его ответственности. Какую одну задачу он должен решать?',
          'Хороший выбор! А как этот элемент будет взаимодействовать с остальной системой?'
        ],
        connect: [
          'Связь установлена! Не забудьте указать протокол взаимодействия. REST API? gRPC? Message Queue?',
          'Отлично! Подумайте о том, синхронное это взаимодействие или асинхронное?'
        ],
        microservice: [
          'Микросервисы - отличный выбор для масштабируемости! Но помните про сложность в управлении. Вы готовы к распределенной трассировке?',
          'Хороший паттерн! Подумайте об API Gateway для единой точки входа и про Service Discovery.'
        ],
        database: [
          'База данных! Важный компонент. SQL или NoSQL? Какой характер данных - транзакционный или аналитический?',
          'Отлично! Не забудьте про репликацию и backup стратегию. Какая допустимая потеря данных в вашем случае?'
        ],
        scale: [
          'Масштабируемость - критично! Рассмотрите horizontal scaling, кэширование и балансировку нагрузки.',
          'Хороший вопрос! Давайте добавим Redis для кэша и настроим автоскейлинг для пиковых нагрузок.'
        ],
        security: [
          'Безопасность превыше всего! OAuth 2.0 для аутентификации? JWT токены? Не забудьте про HTTPS везде.',
          'Отличное внимание к безопасности! Рассмотрите принцип наименьших привилегий и шифрование данных в покое.'
        ]
      },
      general: {
        greeting: [
          'Привет! Рад снова общаться. Над чем будем работать сегодня?',
          'Здравствуйте! Готов помочь с архитектурными решениями. Что проектируем?'
        ],
        thanks: [
          'Всегда пожалуйста! Я здесь, чтобы помочь создать лучшую систему.',
          'Рад помочь! Вместе мы построим надежную архитектуру.'
        ],
        joke: [
          'Знаете, что общего у микросервисов и подростков? Они оба не слушаются родителей и делают что хотят!',
          'Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25!',
          'Два базы данных встретились в баре. Третья подошла и спросила: "Могу я присоединиться к вам?"'
        ]
      }
    };

    if (input.includes('привет') || input.includes('здравствуй')) {
      return getRandomResponse(contextResponses.general.greeting);
    }
    if (input.includes('спасибо') || input.includes('благодар')) {
      return getRandomResponse(contextResponses.general.thanks);
    }
    if (input.includes('шутк') || input.includes('рассмеш') || input.includes('анекдот')) {
      return getRandomResponse(contextResponses.general.joke);
    }

    if (context === 'architecture' || context === 'studio') {
      if (input.includes('помощь') || input.includes('помог') || input.includes('как')) {
        return getRandomResponse(contextResponses.architecture.help);
      }
      if (input.includes('добав') || input.includes('создать') || input.includes('новый')) {
        return getRandomResponse(contextResponses.architecture.add);
      }
      if (input.includes('связ') || input.includes('соедин') || input.includes('подключ')) {
        return getRandomResponse(contextResponses.architecture.connect);
      }
      if (input.includes('микросервис') || input.includes('сервис')) {
        return getRandomResponse(contextResponses.architecture.microservice);
      }
      if (input.includes('база') || input.includes('данн') || input.includes('хранилище')) {
        return getRandomResponse(contextResponses.architecture.database);
      }
      if (input.includes('масштаб') || input.includes('нагрузк') || input.includes('производ')) {
        return getRandomResponse(contextResponses.architecture.scale);
      }
      if (input.includes('безопас') || input.includes('защит') || input.includes('аутент')) {
        return getRandomResponse(contextResponses.architecture.security);
      }
    }

    const genericResponses = [
      'Интересная мысль! Расскажите подробнее, я помогу развить эту идею.',
      'Хороший вопрос! Давайте разберем это по шагам.',
      'Понимаю вашу задачу. Предлагаю начать с декомпозиции требований.',
      'Отличное направление! Какие технические ограничения нужно учесть?',
      'Я вижу потенциал в этом решении. Продумали ли вы сценарии отказа?',
      'Хороший подход! А как это будет работать под высокой нагрузкой?',
      'Понял! Давайте обсудим, как это интегрируется с остальной системой.'
    ];

    return getRandomResponse(genericResponses);
  };

  const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const russianVoice = voices.find(voice => 
      voice.lang.startsWith('ru') && voice.name.includes('Male')
    ) || voices.find(voice => voice.lang.startsWith('ru'));
    
    if (russianVoice) {
      utterance.voice = russianVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isActive && recognitionRef.current) {
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 500);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isActive && recognitionRef.current) {
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 500);
      }
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const addMessage = (content: string, role: 'user' | 'jarvis', context?: string) => {
    const message: JarvisMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      context: context || currentContext
    };
    setMessages(prev => [...prev, message]);
  };

  const setContext = (context: string) => {
    setCurrentContext(context);
  };

  const analyzeAction = (action: string, data?: any) => {
    const actionComments: Record<string, string[]> = {
      'element-added': [
        'Вижу, вы добавили новый элемент! Отличное начало. Не забудьте определить его интерфейсы.',
        'Новый компонент на диаграмме! Продумайте его зависимости.',
        'Элемент добавлен! Какую ответственность он будет нести?'
      ],
      'element-connected': [
        'Связь установлена! Какой протокол взаимодействия планируете использовать?',
        'Интересная связь! Это синхронное или асинхронное взаимодействие?',
        'Хорошо! Подумайте о handling ошибок в этой связи.'
      ],
      'element-moved': [
        'Организуете диаграмму - отлично! Визуальная ясность важна.',
        'Хорошая структура! Логически связанные элементы рядом - правильный подход.'
      ],
      'level-changed': [
        'Переключаем уровень детализации! C4 модель в действии.',
        'Отлично! Разные уровни абстракции помогают видеть полную картину.'
      ],
      'stage-changed': [
        'Новый этап проектирования! Что будем исследовать?',
        'Переходим дальше! Я с вами на каждом шаге.'
      ]
    };

    if (actionComments[action]) {
      const comment = getRandomResponse(actionComments[action]);
      setTimeout(() => {
        addMessage(comment, 'jarvis', currentContext);
        speak(comment);
      }, 800);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  const value: JarvisContextType = {
    isActive,
    isListening,
    isSpeaking,
    messages,
    currentContext,
    addMessage,
    setContext,
    speak,
    stopSpeaking,
    analyzeAction
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  );
}
