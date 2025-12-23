import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function JarvisAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Привет! Я Джарвис — твой персональный AI-ассистент по архитектуре. Я буду следить за твоим проектом, задавать вопросы и помогать строить лучшие системы. Готов начать?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setInput(transcript);

        if (event.results[event.results.length - 1].isFinal) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setInput('');
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setIsListening(false);
    recognitionRef.current?.stop();

    setTimeout(() => {
      const aiResponses = [
        'Отличная идея! Давай обсудим, как это лучше реализовать. Какие компоненты нам понадобятся?',
        'Хороший вопрос! Я бы предложил использовать микросервисную архитектуру здесь. Что думаешь?',
        'Подожди, а ты учел масштабируемость этого решения? Может, стоит добавить кэширование?',
        'Интересно! А как насчет безопасности? Нужно подумать об аутентификации и авторизации.',
        'Понял! Давай добавим это в архитектуру. Какие связи у этого компонента с другими системами?',
        'Отлично движемся! Я вижу, что архитектура становится более четкой. Продолжай!',
        'Хороший выбор технологии! А подумал о том, как это будет работать под нагрузкой?',
        'Я бы рекомендовал разделить это на несколько слоев. Так будет проще поддерживать код.'
      ];

      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      speak(response);
    }, 1500);
  };

  return (
    <Card className="flex flex-col h-[600px] border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <div className="p-4 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Icon name="Bot" size={20} className="text-white" />
              </div>
              {isSpeaking && (
                <div className="absolute -right-1 -bottom-1">
                  <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Джарвис</h3>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? 'Говорю...' : isListening ? 'Слушаю...' : isProcessing ? 'Думаю...' : 'Онлайн'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Icon name="Sparkles" size={12} className="mr-1" />
              AI Assistant
            </Badge>
            {isSpeaking && (
              <Button size="sm" variant="ghost" onClick={stopSpeaking}>
                <Icon name="Volume2" size={16} className="text-orange-400" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}
            >
              <Icon name={message.role === 'user' ? 'User' : 'Bot'} size={16} className="text-white" />
            </div>
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
              <div
                className={`inline-block rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                    : 'bg-muted border border-border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Icon name="Bot" size={16} className="text-white" />
            </div>
            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isListening ? 'Слушаю...' : 'Напиши сообщение или используй голос...'}
            className="min-h-[50px] max-h-[100px] resize-none"
            disabled={isListening || isProcessing}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              onClick={toggleListening}
              className={isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}
            >
              <Icon name={isListening ? 'MicOff' : 'Mic'} size={18} />
            </Button>
            <Button
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isProcessing || isListening}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {recognitionRef.current ? '🎤 Голосовой ввод активен' : '⚠️ Голосовой ввод недоступен в этом браузере'}
        </p>
      </div>
    </Card>
  );
}
