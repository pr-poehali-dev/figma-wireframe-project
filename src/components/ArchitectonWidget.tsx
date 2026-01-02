import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useArchitecton } from '@/components/ArchitectonCore';
import { Badge } from '@/components/ui/badge';

export default function ArchitectonWidget() {
  const { isListening, isSpeaking, isThinking, messages, userEmotion, currentContext, stopSpeaking } = useArchitecton();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulse, setPulse] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setPulse(prev => (prev + 1) % 3);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const recentMessages = messages.slice(-5);

  // Эмоциональные цвета для сообщений
  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'enthusiastic': return 'from-green-500 to-emerald-500';
      case 'concerned': return 'from-orange-500 to-yellow-500';
      case 'supportive': return 'from-blue-500 to-cyan-500';
      case 'thoughtful': return 'from-purple-500 to-indigo-500';
      case 'ironic': return 'from-pink-500 to-rose-500';
      default: return 'from-purple-500 to-blue-500';
    }
  };

  // Иконка когнитивного слоя
  const getLayerIcon = (layer?: string) => {
    switch (layer) {
      case 'theorist': return 'Lightbulb';
      case 'engineer': return 'Wrench';
      case 'process': return 'Calendar';
      case 'emotional': return 'Heart';
      default: return 'Bot';
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-0 w-[480px]"
            >
              <Card className="border-2 border-purple-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
                <div className="p-4 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Icon name="Bot" size={24} className="text-white" />
                        {(isListening || isSpeaking || isThinking) && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-purple-500/30"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">ARCHITECTON</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            {isSpeaking ? 'Говорю...' : isThinking ? 'Думаю...' : isListening ? 'Слушаю...' : 'Активен'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                            {currentContext.projectPhase}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSpeaking && (
                        <Button size="sm" variant="ghost" onClick={stopSpeaking} className="h-8 w-8 p-0">
                          <Icon name="Volume2" size={16} className="text-orange-400" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)} className="h-8 w-8 p-0">
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Эмоциональное состояние пользователя */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                      <Icon name={
                        userEmotion.mood === 'stressed' ? 'AlertTriangle' :
                        userEmotion.mood === 'tired' ? 'Moon' :
                        userEmotion.mood === 'focused' ? 'Target' :
                        userEmotion.mood === 'inspired' ? 'Sparkles' : 'Smile'
                      } size={12} className={
                        userEmotion.mood === 'stressed' ? 'text-red-400' :
                        userEmotion.mood === 'tired' ? 'text-blue-400' :
                        userEmotion.mood === 'focused' ? 'text-green-400' :
                        userEmotion.mood === 'inspired' ? 'text-purple-400' : 'text-gray-400'
                      } />
                      <span className="text-muted-foreground capitalize">{userEmotion.mood}</span>
                    </div>
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${userEmotion.confidence * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <span className="text-muted-foreground">{Math.round(userEmotion.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                  {recentMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : `bg-gradient-to-br ${getEmotionColor(message.emotion)}`
                        }`}
                      >
                        <Icon 
                          name={message.role === 'user' ? 'User' : getLayerIcon(message.cognitiveLayer)} 
                          size={16} 
                          className="text-white" 
                        />
                      </div>
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block rounded-lg p-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                              : 'bg-muted border border-border'
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>
                            {message.timestamp.toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.emotion && message.role === 'architecton' && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-4">
                              {message.emotion}
                            </Badge>
                          )}
                          {message.cognitiveLayer && message.role === 'architecton' && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-4">
                              {message.cognitiveLayer}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-1 items-center">
                      <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span>🎤 {isListening ? 'Слушаю' : 'Готов'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Icon name="Clock" size={10} />
                      <span>{currentContext.sessionDuration}м</span>
                    </div>
                    {isThinking && (
                      <div className="flex gap-1 items-center text-purple-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 shadow-2xl shadow-purple-500/50 flex items-center justify-center group"
        >
          <AnimatePresence mode="wait">
            {isSpeaking && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse"
              />
            )}
          </AnimatePresence>

          <Icon name="Bot" size={28} className="text-white relative z-10" />

          {(isListening || isSpeaking) && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-4 border-purple-400/50"
            />
          )}

          {isSpeaking && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: pulse === i ? 12 : 6,
                    opacity: pulse === i ? 1 : 0.5
                  }}
                  transition={{ duration: 0.15 }}
                  className="w-1 bg-green-400 rounded-full"
                />
              ))}
            </div>
          )}

          {!isExpanded && messages.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {messages.length > 9 ? '9+' : messages.length}
            </Badge>
          )}
        </motion.button>
      </motion.div>
    </>
  );
}
