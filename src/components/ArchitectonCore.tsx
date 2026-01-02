import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// ========================
// ARCHITECTON CORE SYSTEM
// Текстовый ИИ-помощник с проактивными подсказками
// ========================

interface ArchitectonMessage {
  id: string;
  role: 'user' | 'architecton';
  content: string;
  timestamp: Date;
  context?: string;
  type?: 'suggestion' | 'warning' | 'tip' | 'congratulation';
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
  isThinking: boolean;
  messages: ArchitectonMessage[];
  currentContext: ProjectContext;
  userEmotion: UserEmotionState;
  addMessage: (content: string, role: 'user' | 'architecton', type?: ArchitectonMessage['type'], layer?: ArchitectonMessage['cognitiveLayer']) => void;
  updateContext: (context: Partial<ProjectContext>) => void;
  trackUserAction: (action: string, duration?: number) => void;
  analyzeAction: (action: string, data?: any) => void;
  activate: () => Promise<void>;
  proactiveAssist: () => void;
  speakWelcome: () => void;
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

export function ArchitectonProvider({ children }: ArchitectonProviderProps) {
  const [isActive, setIsActive] = useState(false);
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
  
  const sessionStartRef = useRef(Date.now());
  const lastActionTimeRef = useRef(Date.now());
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, []);

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
        newMood = currentContext.recentActions.filter(a => a.includes('delete') || a.includes('undo')).length > 2 ? 'stressed' : 'focused';
        newConfidence = Math.max(0.3, prev.confidence - 0.1);
      }
      
      // Медленные действия → усталость или размышление
      if (isSlow) {
        newMood = currentContext.sessionDuration > 60 ? 'tired' : 'neutral';
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
    proactiveTimerRef.current = setTimeout(proactiveAssist, 45000); // 45 сек без действий
  };

  // ========================
  // ПРОАКТИВНАЯ ПОМОЩЬ (ТЕКСТОВЫЕ ПОДСКАЗКИ)
  // ========================
  const proactiveAssist = () => {
    if (!isActive) return;

    const { recentActions, projectPhase, sessionDuration } = currentContext;
    const { mood } = userEmotion;

    // Длительное бездействие
    if (recentActions.length === 0 && sessionDuration > 5) {
      const suggestions = [
        "Может, нужна помощь с текущей задачей?",
        "Если возникли трудности — спросите меня.",
        "Застряли? Предложу несколько вариантов решения."
      ];
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      addMessage(suggestion, 'architecton', 'tip', 'emotional');
      return;
    }

    // Много однотипных действий
    const actionTypes = recentActions.slice(-5);
    if (actionTypes.filter(a => a === actionTypes[0]).length >= 4) {
      addMessage("Вижу повторяющиеся действия. Могу подсказать более эффективный способ.", 'architecton', 'suggestion', 'process');
      return;
    }

    // Стресс или усталость
    if (mood === 'stressed') {
      addMessage("Похоже, задача сложная. Предлагаю разбить её на части — так будет проще.", 'architecton', 'tip', 'emotional');
    } else if (mood === 'tired') {
      addMessage("Вижу, вы работаете долго. Короткий перерыв повысит продуктивность.", 'architecton', 'tip', 'emotional');
    }
  };

  // ========================
  // КОГНИТИВНЫЕ МОДУЛИ — УМНЫЕ ПОДСКАЗКИ
  // ========================
  const getCognitiveSuggestion = (context: ProjectContext, emotion: UserEmotionState): ArchitectonMessage | null => {
    const { projectPhase, recentActions } = context;
    
    // Подсказки по фазам проекта
    if (projectPhase === 'vision' && recentActions.length > 10) {
      return {
        id: Date.now().toString(),
        role: 'architecton',
        content: 'В разделе Vision хорошо бы зафиксировать целевую аудиторию и метрики успеха. Это поможет в дальнейшем.',
        timestamp: new Date(),
        type: 'suggestion',
        cognitiveLayer: 'theorist'
      };
    }

    if (projectPhase === 'requirements' && recentActions.filter(a => a.includes('story')).length > 5) {
      return {
        id: Date.now().toString(),
        role: 'architecton',
        content: 'User Stories активно добавляются. Не забудьте связать их с Use Cases для полной картины.',
        timestamp: new Date(),
        type: 'suggestion',
        cognitiveLayer: 'process'
      };
    }

    if (projectPhase === 'architecture' && recentActions.includes('add_component')) {
      return {
        id: Date.now().toString(),
        role: 'architecton',
        content: 'При добавлении компонентов учитывайте их взаимодействие и зависимости. Рекомендую C4 Context диаграмму.',
        timestamp: new Date(),
        type: 'tip',
        cognitiveLayer: 'engineer'
      };
    }

    // Подсказки при стрессе
    if (emotion.mood === 'stressed' && emotion.confidence < 0.4) {
      return {
        id: Date.now().toString(),
        role: 'architecton',
        content: 'Чувствую неуверенность. Предложу пошаговый план для текущей задачи — так будет проще.',
        timestamp: new Date(),
        type: 'tip',
        cognitiveLayer: 'emotional'
      };
    }

    return null;
  };

  // ========================
  // АНАЛИЗ ДЕЙСТВИЙ В ИНТЕРФЕЙСЕ
  // ========================
  const analyzeAction = (action: string, data?: any) => {
    trackUserAction(action);
    
    // Проактивные подсказки на основе действий
    if (action.includes('select_element') && data?.type === 'connection_node') {
      setTimeout(() => {
        const hint = "Анализирую выбранный узел. Есть несколько альтернативных решений с лучшими характеристиками.";
        addMessage(hint, 'architecton', 'suggestion', 'engineer');
      }, 3000);
    }

    if (action.includes('delete') && currentContext.recentActions.filter(a => a.includes('delete')).length > 2) {
      setTimeout(() => {
        const hint = "Много удалений. Возможно, стоит пересмотреть подход к задаче?";
        addMessage(hint, 'architecton', 'warning', 'emotional');
      }, 2000);
    }

    // Периодические подсказки по когнитивным модулям
    if (Math.random() < 0.1) { // 10% вероятность при каждом действии
      const suggestion = getCognitiveSuggestion(currentContext, userEmotion);
      if (suggestion) {
        setTimeout(() => {
          setMessages(prev => [...prev, suggestion]);
        }, 4000);
      }
    }
  };

  const addMessage = (
    content: string, 
    role: 'user' | 'architecton',
    type?: ArchitectonMessage['type'],
    layer?: ArchitectonMessage['cognitiveLayer']
  ) => {
    const message: ArchitectonMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      context: currentContext.projectPhase,
      type,
      cognitiveLayer: layer
    };
    setMessages(prev => [...prev, message]);
  };

  const updateContext = (context: Partial<ProjectContext>) => {
    setCurrentContext(prev => ({ ...prev, ...context }));
  };

  // ========================
  // ГОЛОСОВОЕ ПРИВЕТСТВИЕ (ТОЛЬКО ОДИН РАЗ ПРИ ВХОДЕ)
  // ========================
  const speakWelcome = () => {
    const utterance = new SpeechSynthesisUtterance(
      'Добро пожаловать в систему Архитектон. Я ваш интеллектуальный помощник.'
    );
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9; // Медленный, размеренный
    utterance.pitch = 0.6; // Очень низкий, строгий мужской голос
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => 
      voice.lang.startsWith('ru') && 
      voice.name.toLowerCase().includes('male')
    ) || voices.find(voice => voice.lang.startsWith('ru'));
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const activateArchitecton = async () => {
    setIsActive(true);
    sessionStartRef.current = Date.now();
    
    // Приветственное сообщение (текст)
    const greeting = "Система активирована. Готов помогать с архитектурой проекта.";
    addMessage(greeting, 'architecton', 'congratulation', 'emotional');
  };

  const value: ArchitectonContextType = {
    isActive,
    isThinking,
    messages,
    currentContext,
    userEmotion,
    addMessage,
    updateContext,
    trackUserAction,
    analyzeAction,
    activate: activateArchitecton,
    proactiveAssist,
    speakWelcome
  };

  return (
    <ArchitectonContext.Provider value={value}>
      {children}
    </ArchitectonContext.Provider>
  );
}
