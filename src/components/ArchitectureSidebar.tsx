import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ELEMENT_TYPES = [
  { id: 'user', name: 'Пользователь', icon: 'User', category: 'actors' },
  { id: 'external', name: 'Внешняя система', icon: 'Building2', category: 'actors' },
  { id: 'webapp', name: 'Web Application', icon: 'Globe', category: 'containers' },
  { id: 'mobile', name: 'Mobile App', icon: 'Smartphone', category: 'containers' },
  { id: 'microservice', name: 'Микросервис', icon: 'Box', category: 'containers' },
  { id: 'serverless', name: 'Serverless Function', icon: 'Zap', category: 'containers' },
  { id: 'database', name: 'База данных', icon: 'Database', category: 'containers' },
  { id: 'cache', name: 'Кэш', icon: 'HardDrive', category: 'containers' },
  { id: 'queue', name: 'Очередь', icon: 'Inbox', category: 'containers' },
  { id: 'api-gateway', name: 'API Gateway', icon: 'Network', category: 'containers' },
  { id: 'docker', name: 'Docker Container', icon: 'Container', category: 'infrastructure' },
  { id: 'kubernetes', name: 'Kubernetes Pod', icon: 'GitBranch', category: 'infrastructure' },
  { id: 'loadbalancer', name: 'Load Balancer', icon: 'Cpu', category: 'infrastructure' },
];

interface ArchitectureSidebarProps {
  setNewElementType: (type: string) => void;
  setIsAddElementDialogOpen: (open: boolean) => void;
}

export default function ArchitectureSidebar({
  setNewElementType,
  setIsAddElementDialogOpen,
}: ArchitectureSidebarProps) {
  return (
    <div className="w-72 border-r border-border bg-sidebar overflow-y-auto">
      <div className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="Package" size={18} className="text-purple-400" />
          Элементы архитектуры
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              👥 Пользователи и системы
            </h4>
            <div className="space-y-1">
              {ELEMENT_TYPES.filter(t => t.category === 'actors').map(type => (
                <button
                  key={type.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sm"
                  onClick={() => {
                    setNewElementType(type.id);
                    setIsAddElementDialogOpen(true);
                  }}
                >
                  <Icon name={type.icon as any} size={16} className="text-blue-400" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              🧩 Контейнеры
            </h4>
            <div className="space-y-1">
              {ELEMENT_TYPES.filter(t => t.category === 'containers').map(type => (
                <button
                  key={type.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sm"
                  onClick={() => {
                    setNewElementType(type.id);
                    setIsAddElementDialogOpen(true);
                  }}
                >
                  <Icon name={type.icon as any} size={16} className="text-green-400" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              🏗️ Инфраструктура
            </h4>
            <div className="space-y-1">
              {ELEMENT_TYPES.filter(t => t.category === 'infrastructure').map(type => (
                <button
                  key={type.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sm"
                  onClick={() => {
                    setNewElementType(type.id);
                    setIsAddElementDialogOpen(true);
                  }}
                >
                  <Icon name={type.icon as any} size={16} className="text-orange-400" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Icon name="Sparkles" size={14} className="mr-2" />
            Smart Suggestions
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Icon name="FolderOpen" size={14} className="mr-2" />
            Импорт шаблона
          </Button>
        </div>
        
        <div className="mt-6 p-3 bg-muted/20 rounded-lg">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Icon name="Keyboard" size={12} />
            Горячие клавиши
          </h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Отменить</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Повторить</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl+Y</kbd>
            </div>
            <div className="flex justify-between">
              <span>Удалить</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Del</kbd>
            </div>
            <div className="flex justify-between">
              <span>Дублировать</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl+D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Новый элемент</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl+A</kbd>
            </div>
            <div className="flex justify-between">
              <span>Сетка</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl+G</kbd>
            </div>
            <div className="flex justify-between">
              <span>Zoom +/-</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">+/-</kbd>
            </div>
            <div className="flex justify-between">
              <span>Сбросить Zoom</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">0</kbd>
            </div>
            <div className="flex justify-between">
              <span>Отмена/ESC</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
