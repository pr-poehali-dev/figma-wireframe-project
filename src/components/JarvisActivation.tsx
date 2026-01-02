import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { useArchitecton } from '@/components/ArchitectonCore';

interface JarvisActivationProps {
  onActivate: () => void;
}

export default function JarvisActivation({ onActivate }: JarvisActivationProps) {
  const { activate } = useArchitecton();
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await activate();
      onActivate();
    } catch (error) {
      console.error('Activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      <Card className="max-w-md p-8 border-2 border-purple-500/30 bg-gradient-to-br from-card to-purple-900/20">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center mb-6"
          >
            <Icon name="Bot" size={40} className="text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-3">Активировать ARCHITECTON</h2>
          <p className="text-muted-foreground mb-6">
            Интеллектуальный помощник с проактивными подсказками
          </p>

          <div className="space-y-3 mb-6 text-left bg-muted/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-green-400 mt-1" />
              <span className="text-sm">Анализ ваших действий в реальном времени</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-green-400 mt-1" />
              <span className="text-sm">Текстовые подсказки и рекомендации</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-green-400 mt-1" />
              <span className="text-sm">Проактивная помощь при стрессе и усталости</span>
            </div>
          </div>

          <Button 
            onClick={handleActivate}
            disabled={isActivating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-lg py-6"
          >
            <Icon name="Bot" size={20} className="mr-2" />
            {isActivating ? 'Активация...' : 'Активировать помощника'}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Все подсказки основаны на анализе ваших действий
          </p>
        </div>
      </Card>
    </motion.div>
  );
}