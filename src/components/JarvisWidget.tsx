import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useJarvis } from '@/components/JarvisCore';
import { Badge } from '@/components/ui/badge';

export default function JarvisWidget() {
  const { isListening, isSpeaking, messages, stopSpeaking } = useJarvis();
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
              className="absolute bottom-20 right-0 w-96"
            >
              <Card className="border-2 border-purple-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
                <div className="p-4 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Icon name="Bot" size={20} className="text-white" />
                        {(isListening || isSpeaking) && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-purple-500/30"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">Джарвис</h3>
                        <p className="text-xs text-muted-foreground">
                          {isSpeaking ? 'Говорю...' : isListening ? 'Слушаю...' : 'Активен'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSpeaking && (
                        <Button size="sm" variant="ghost" onClick={stopSpeaking}>
                          <Icon name="Volume2" size={16} className="text-orange-400" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)}>
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
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
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-purple-500 to-blue-500'
                        }`}
                      >
                        <Icon name={message.role === 'user' ? 'User' : 'Bot'} size={14} className="text-white" />
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
                        <p className="text-xs text-muted-foreground mt-1">
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

                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span>Микрофон {isListening ? 'активен' : 'ожидание'}</span>
                    </div>
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
