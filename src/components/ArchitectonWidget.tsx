import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useArchitecton } from '@/components/ArchitectonCore';

export default function ArchitectonWidget() {
  const { isThinking, messages, currentContext } = useArchitecton();
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Автоматически показываем последнее сообщение от ИИ
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'architecton') {
      setIsExpanded(true);
      // Автоматически скрываем через 10 секунд
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const recentMessages = messages.slice(-3);
  const lastMessage = messages[messages.length - 1];

  // Цвета для типов сообщений
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'suggestion': return 'border-blue-500/50 bg-blue-500/10';
      case 'warning': return 'border-orange-500/50 bg-orange-500/10';
      case 'tip': return 'border-purple-500/50 bg-purple-500/10';
      case 'congratulation': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-purple-500/50 bg-purple-500/10';
    }
  };

  // Иконка для типа сообщения
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'suggestion': return 'Lightbulb';
      case 'warning': return 'AlertTriangle';
      case 'tip': return 'Info';
      case 'congratulation': return 'CheckCircle';
      default: return 'MessageCircle';
    }
  };

  // Если нет сообщений, не показываем виджет
  if (messages.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px]"
          >
            <Card className="border border-purple-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
              <div className="p-3 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Icon name="Bot" size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">ARCHITECTON</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {isThinking ? 'Думаю...' : 'Помощник'}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)} className="h-7 w-7 p-0">
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-3 space-y-2">
                {recentMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      message.role === 'architecton' 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      <Icon 
                        name={message.role === 'architecton' ? getTypeIcon(message.type) : 'User'} 
                        size={12} 
                        className="text-white" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-2.5 text-sm border ${
                        message.role === 'architecton' 
                          ? getTypeColor(message.type)
                          : 'border-blue-500/30 bg-blue-500/10'
                      }`}>
                        {message.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-2 border-t border-border bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={10} />
                  <span>Сессия: {currentContext.sessionDuration}м</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Layers" size={10} />
                  <span className="capitalize">{currentContext.projectPhase}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Компактный индикатор */}
      {!isExpanded && lastMessage && lastMessage.role === 'architecton' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 max-w-[320px] group"
        >
          <Card className={`p-3 border cursor-pointer hover:shadow-lg transition-all ${getTypeColor(lastMessage.type)}`}>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Icon name={getTypeIcon(lastMessage.type)} size={14} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-foreground/90 line-clamp-2">
                  {lastMessage.content}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Нажмите, чтобы раскрыть
                </p>
              </div>
              {isThinking && (
                <div className="flex gap-0.5 items-center">
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1 w-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </Card>
        </motion.button>
      )}
    </>
  );
}
