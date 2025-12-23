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
  isThinking: boolean;
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

const JARVIS_AI_URL = 'https://functions.poehali.dev/cb50a2d4-5342-46aa-b0e1-9e88cc6ae0da';

export function JarvisProvider({ children }: JarvisProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<JarvisMessage[]>([]);
  const [currentContext, setCurrentContext] = useState('general');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

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
          const finalTranscript = transcript.trim();
          if (finalTranscript && finalTranscript !== lastTranscriptRef.current && !processingRef.current) {
            lastTranscriptRef.current = finalTranscript;
            handleUserSpeech(finalTranscript);
          }
        }

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (!isSpeaking && !isThinking) {
            recognitionRef.current?.stop();
            setTimeout(() => {
              if (isActive && !isSpeaking && !isThinking) {
                recognitionRef.current?.start();
              }
            }, 50);
          }
        }, 1500);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setTimeout(() => {
            if (isActive && !isSpeaking && !isThinking) {
              recognitionRef.current?.start();
            }
          }, 50);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isActive && !isSpeaking && !isThinking) {
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 50);
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
    if (isActive && !isSpeaking && !isThinking) {
      recognitionRef.current?.start();
    } else if (!isActive) {
      recognitionRef.current?.stop();
    }
  }, [isActive, isSpeaking, isThinking]);

  const handleUserSpeech = async (transcript: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    addMessage(transcript, 'user');
    setIsThinking(true);
    recognitionRef.current?.stop();

    try {
      const response = await fetch(JARVIS_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          context: currentContext,
          history: messages.slice(-4)
        })
      });

      const data = await response.json();
      
      if (data.response) {
        addMessage(data.response, 'jarvis', currentContext);
        speak(data.response);
      } else {
        const fallback = getFallbackResponse(transcript, currentContext);
        addMessage(fallback, 'jarvis', currentContext);
        speak(fallback);
      }
    } catch (error) {
      const fallback = getFallbackResponse(transcript, currentContext);
      addMessage(fallback, 'jarvis', currentContext);
      speak(fallback);
    } finally {
      setIsThinking(false);
      processingRef.current = false;
    }
  };

  const getFallbackResponse = (input: string, context: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes('привет') || lower.includes('здравствуй')) {
      return 'Приветствую! Готов помочь с архитектурными решениями.';
    }
    if (lower.includes('спасибо')) {
      return 'К вашим услугам, сэр.';
    }
    if (lower.includes('микросервис')) {
      return 'Микросервисы? Не забудьте API Gateway и distributed tracing.';
    }
    if (lower.includes('база')) {
      return 'SQL или NoSQL? Помните про транзакции.';
    }
    
    return 'Интересная задача! Дайте больше деталей.';
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.15;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('ru') && (
        voice.name.includes('Male') || 
        voice.name.includes('Yuri') ||
        voice.name.includes('Google')
      )
    ) || voices.find(voice => voice.lang.startsWith('ru'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
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
        }, 300);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isActive && recognitionRef.current) {
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 300);
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

  const analyzeAction = async (action: string, data?: any) => {
    if (processingRef.current) return;

    const actionMessages: Record<string, string> = {
      'element-added': `Пользователь добавил элемент: ${data?.element?.name || 'новый компонент'}`,
      'element-connected': 'Пользователь создал связь между компонентами',
      'level-changed': `Пользователь переключился на уровень ${data?.level || 'другой'}`,
      'stage-changed': `Пользователь перешел на этап ${data?.stage || 'новый'}`
    };

    const actionMessage = actionMessages[action];
    if (!actionMessage) return;

    processingRef.current = true;
    setIsThinking(true);

    try {
      const response = await fetch(JARVIS_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: actionMessage,
          context: currentContext,
          history: messages.slice(-2)
        })
      });

      const result = await response.json();
      
      if (result.response) {
        setTimeout(() => {
          addMessage(result.response, 'jarvis', currentContext);
          speak(result.response);
        }, 400);
      }
    } catch (error) {
      console.error('Failed to analyze action:', error);
    } finally {
      setIsThinking(false);
      processingRef.current = false;
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
    isThinking,
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