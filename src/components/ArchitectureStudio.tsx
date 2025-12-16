import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface ArchElement {
  id: number;
  type: string;
  name: string;
  x: number;
  y: number;
  description?: string;
  techStack?: string;
  team?: string;
  repository?: string;
  port?: string;
  cpu?: string;
  memory?: string;
  layer?: 'presentation' | 'business' | 'data' | 'infrastructure';
}

interface ArchConnection {
  id: number;
  from: number;
  to: number;
  protocol: string;
  type: 'sync' | 'async' | 'data';
  description?: string;
}

interface ArchitectureStudioProps {
  elements: ArchElement[];
  onClose: () => void;
}

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

const C4_LEVELS = [
  { id: 'context', name: 'Context', icon: 'Globe', description: 'Системный контекст' },
  { id: 'container', name: 'Container', icon: 'Box', description: 'Контейнеры и приложения' },
  { id: 'component', name: 'Component', icon: 'Blocks', description: 'Компоненты сервисов' },
  { id: 'code', name: 'Code', icon: 'Code', description: 'Уровень кода' },
];

const AI_RECOMMENDATIONS = [
  {
    type: 'warning',
    title: 'Order Service имеет слишком много зависимостей',
    description: 'Обнаружено 5 прямых зависимостей. Рекомендуется разбить на более мелкие сервисы.',
    action: 'Предложить декомпозицию'
  },
  {
    type: 'suggestion',
    title: 'Добавить кэширование для Product Service',
    description: 'Частые запросы к базе данных можно оптимизировать с помощью Redis.',
    action: 'Добавить Redis Cache'
  },
  {
    type: 'info',
    title: 'Нет резервирования для Payment Service',
    description: 'Критический сервис должен иметь резервирование для высокой доступности.',
    action: 'Настроить репликацию'
  },
];

export default function ArchitectureStudio({ elements, onClose }: ArchitectureStudioProps) {
  const [selectedElement, setSelectedElement] = useState<ArchElement | null>(null);
  const [c4Level, setC4Level] = useState('container');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [zoom, setZoom] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [connections, setConnections] = useState<ArchConnection[]>([
    { id: 1, from: 1, to: 11, protocol: 'HTTPS', type: 'sync', description: 'Загрузка интерфейса' },
    { id: 2, from: 11, to: 12, protocol: 'REST', type: 'sync', description: 'Создание заказа' },
    { id: 3, from: 12, to: 13, protocol: 'REST', type: 'sync', description: 'Обработка платежа' },
    { id: 4, from: 12, to: 20, protocol: 'JDBC', type: 'sync', description: 'Сохранение заказа' },
    { id: 5, from: 13, to: 21, protocol: 'MongoDB Driver', type: 'sync', description: 'Запись транзакции' },
  ]);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<number | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{from: number; to: number} | null>(null);
  const [newConnection, setNewConnection] = useState({
    protocol: 'REST',
    type: 'sync' as 'sync' | 'async' | 'data',
    description: '',
    method: 'POST',
    endpoint: '/api/v1/orders',
    requestFormat: 'JSON',
    responseFormat: 'JSON',
    timeout: '3000',
    retries: '3',
    auth: 'JWT Token',
  });

  const handleElementClick = (element: ArchElement) => {
    if (isDrawingConnection) {
      if (connectionStart === null) {
        setConnectionStart(element.id);
      } else if (connectionStart !== element.id) {
        setPendingConnection({ from: connectionStart, to: element.id });
        setIsConnectionDialogOpen(true);
      }
    } else {
      setSelectedElement(element);
    }
  };

  const createConnection = () => {
    if (!pendingConnection) return;
    
    const newConn: ArchConnection = {
      id: Date.now(),
      from: pendingConnection.from,
      to: pendingConnection.to,
      protocol: newConnection.protocol,
      type: newConnection.type,
      description: newConnection.description || `${newConnection.method} ${newConnection.endpoint}`,
    };
    
    setConnections(prev => [...prev, newConn]);
    setIsConnectionDialogOpen(false);
    setIsDrawingConnection(false);
    setConnectionStart(null);
    setPendingConnection(null);
    setNewConnection({
      protocol: 'REST',
      type: 'sync',
      description: '',
      method: 'POST',
      endpoint: '/api/v1/orders',
      requestFormat: 'JSON',
      responseFormat: 'JSON',
      timeout: '3000',
      retries: '3',
      auth: 'JWT Token',
    });
  };

  const getElementById = (id: number) => {
    const mockElements = [
      { id: 0, name: 'Web App', layer: 'presentation' },
      { id: 1, name: 'Mobile App', layer: 'presentation' },
      { id: 2, name: 'Admin Panel', layer: 'presentation' },
      { id: 11, name: 'API Gateway', layer: 'business' },
      { id: 12, name: 'Order Service', layer: 'business' },
      { id: 13, name: 'Payment Service', layer: 'business' },
      { id: 14, name: 'Inventory Service', layer: 'business' },
      { id: 20, name: 'PostgreSQL', layer: 'data' },
      { id: 21, name: 'MongoDB', layer: 'data' },
      { id: 22, name: 'Redis Cache', layer: 'data' },
      { id: 23, name: 'Kafka', layer: 'data' },
    ];
    return mockElements.find(e => e.id === id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Icon name="Boxes" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Architecture Studio Pro</h1>
              <p className="text-xs text-muted-foreground">E-Commerce Platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Автосохранение
          </Badge>
          <Button variant="outline" size="sm">
            <Icon name="Users" size={16} className="mr-2" />
            Team Alpha
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Icon name="Sparkles" size={16} className="mr-2" />
            AI Assist
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-muted/20 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Undo">
              <Icon name="Undo" size={18} />
            </Button>
            <Button variant="ghost" size="icon" title="Redo">
              <Icon name="Redo" size={18} />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Элемент
            </Button>
            <Button 
              variant={isDrawingConnection ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => {
                setIsDrawingConnection(!isDrawingConnection);
                setConnectionStart(null);
              }}
            >
              <Icon name="Link" size={16} className="mr-2" />
              {isDrawingConnection ? 'Рисую связь...' : 'Связь'}
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Wand2" size={16} className="mr-2" />
              Авторасположение
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">C4 Level:</span>
            {C4_LEVELS.map(level => (
              <Button
                key={level.id}
                variant={c4Level === level.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC4Level(level.id)}
                className="h-8"
              >
                <Icon name={level.icon as any} size={14} className="mr-1" />
                {level.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <Icon name="Minus" size={14} />
            </Button>
            <span className="text-muted-foreground w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            variant={gridEnabled ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setGridEnabled(!gridEnabled)}
            className="h-8"
          >
            <Icon name="Grid" size={14} className="mr-1" />
            Сетка
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - Element Palette */}
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
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-background overflow-hidden">
          {gridEnabled && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}

          <div className="absolute inset-0 p-8 overflow-auto">
            <div 
              className="relative min-h-full min-w-full"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            >
              {/* Example Architecture Visualization */}
              <div className="space-y-12">
                {/* Presentation Layer */}
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 bg-purple-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Icon name="Layout" size={16} className="text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-purple-400">Presentation Layer</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Web App', icon: 'Globe', tech: 'React + TypeScript' },
                      { name: 'Mobile App', icon: 'Smartphone', tech: 'React Native' },
                      { name: 'Admin Panel', icon: 'Settings', tech: 'Next.js' },
                    ].map((item, idx) => (
                      <Card
                        key={idx}
                        className={`p-4 cursor-pointer transition-all group ${
                          isDrawingConnection 
                            ? 'hover:border-blue-400 hover:shadow-lg' 
                            : 'hover:border-purple-400'
                        } ${
                          connectionStart === idx ? 'border-blue-400 border-2 shadow-lg' : ''
                        }`}
                        onClick={() => handleElementClick({
                          id: idx,
                          type: 'webapp',
                          name: item.name,
                          x: 0,
                          y: 0,
                          techStack: item.tech,
                          layer: 'presentation'
                        })}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name={item.icon as any} size={24} className="text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-center text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mt-1">{item.tech}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Business Layer */}
                <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Icon name="Blocks" size={16} className="text-green-400" />
                    </div>
                    <h3 className="font-semibold text-green-400">Business Layer</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'API Gateway', icon: 'Network', tech: 'Kong' },
                      { name: 'Order Service', icon: 'ShoppingCart', tech: 'Java + Spring' },
                      { name: 'Payment Service', icon: 'CreditCard', tech: 'Node.js' },
                      { name: 'Inventory Service', icon: 'Package', tech: 'Python' },
                    ].map((item, idx) => (
                      <Card
                        key={idx}
                        className={`p-4 cursor-pointer transition-all group ${
                          isDrawingConnection 
                            ? 'hover:border-blue-400 hover:shadow-lg' 
                            : 'hover:border-green-400'
                        } ${
                          connectionStart === idx + 10 ? 'border-blue-400 border-2 shadow-lg' : ''
                        }`}
                        onClick={() => handleElementClick({
                          id: idx + 10,
                          type: 'microservice',
                          name: item.name,
                          x: 0,
                          y: 0,
                          techStack: item.tech,
                          layer: 'business'
                        })}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name={item.icon as any} size={24} className="text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-center text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mt-1">{item.tech}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Data Layer */}
                <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-6 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Icon name="Database" size={16} className="text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-blue-400">Data Layer</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'PostgreSQL', icon: 'Database', tech: 'Orders & Users' },
                      { name: 'MongoDB', icon: 'Database', tech: 'Product Catalog' },
                      { name: 'Redis Cache', icon: 'HardDrive', tech: 'Session Store' },
                      { name: 'Kafka', icon: 'Inbox', tech: 'Event Streaming' },
                    ].map((item, idx) => (
                      <Card
                        key={idx}
                        className={`p-4 cursor-pointer transition-all group ${
                          isDrawingConnection 
                            ? 'hover:border-blue-400 hover:shadow-lg' 
                            : 'hover:border-blue-400'
                        } ${
                          connectionStart === idx + 20 ? 'border-blue-400 border-2 shadow-lg' : ''
                        }`}
                        onClick={() => handleElementClick({
                          id: idx + 20,
                          type: 'database',
                          name: item.name,
                          x: 0,
                          y: 0,
                          techStack: item.tech,
                          layer: 'data'
                        })}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name={item.icon as any} size={24} className="text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-center text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mt-1">{item.tech}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connection lines would be drawn here */}
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Zoom: {zoom}%</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Сетка: {gridEnabled ? 'Вкл' : 'Выкл'}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Элементов: {elements.length}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Связей: {connections.length}</span>
          </div>

          {/* Connection Lines Visualization */}
          {connections.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-3 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Network" size={16} className="text-blue-400" />
                <h4 className="font-semibold text-xs">Активные связи</h4>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {connections.slice(0, 3).map(conn => {
                  const fromEl = getElementById(conn.from);
                  const toEl = getElementById(conn.to);
                  return (
                    <div key={conn.id} className="text-xs flex items-center gap-1">
                      <span className="truncate">{fromEl?.name}</span>
                      <Icon name="ArrowRight" size={10} className="text-blue-400 flex-shrink-0" />
                      <span className="truncate">{toEl?.name}</span>
                    </div>
                  );
                })}
                {connections.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{connections.length - 3} еще...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties & AI */}
        <div className="w-96 border-l border-border bg-sidebar overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="properties">
                <Icon name="Settings" size={14} className="mr-1" />
                Свойства
              </TabsTrigger>
              <TabsTrigger value="dependencies">
                <Icon name="GitBranch" size={14} className="mr-1" />
                Связи
              </TabsTrigger>
              <TabsTrigger value="metrics">
                <Icon name="BarChart3" size={14} className="mr-1" />
                Метрики
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Icon name="Sparkles" size={14} className="mr-1" />
                AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="flex-1 p-4 space-y-4">
              {selectedElement ? (
                <>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Icon name="Box" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedElement.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedElement.type}</p>
                      </div>
                    </div>
                  </div>

                  <Card className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs">Название</Label>
                      <Input value={selectedElement.name} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Описание</Label>
                      <Textarea 
                        value={selectedElement.description || 'Обработка заказов и управление корзиной'} 
                        className="mt-1 min-h-20"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Технологический стек</Label>
                      <Input value={selectedElement.techStack || 'Java 17, Spring Boot 3.1'} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">CPU</Label>
                        <Input value={selectedElement.cpu || '1000m'} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Memory</Label>
                        <Input value={selectedElement.memory || '512Mi'} className="mt-1" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Команда и отслеживание</h4>
                    <div>
                      <Label className="text-xs">Ответственная команда</Label>
                      <Select value={selectedElement.team || 'team-alpha'}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="team-alpha">Team Alpha</SelectItem>
                          <SelectItem value="team-beta">Team Beta</SelectItem>
                          <SelectItem value="team-gamma">Team Gamma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Репозиторий</Label>
                      <Input value={selectedElement.repository || 'git@github.com:company/order-service.git'} className="mt-1 font-mono text-xs" />
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Link" size={14} className="mr-1" />
                      Привязать к User Story
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="FileText" size={14} className="mr-1" />
                      Документация
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Icon name="MousePointer" size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Выберите элемент на канвасе</p>
                  <p className="text-xs text-muted-foreground mt-1">для просмотра и редактирования свойств</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dependencies" className="flex-1 p-4 space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Icon name="GitBranch" size={16} className="text-blue-400" />
                    Все связи в архитектуре
                  </h4>
                  <Badge variant="outline">{connections.length}</Badge>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {connections.map((conn) => {
                    const fromEl = getElementById(conn.from);
                    const toEl = getElementById(conn.to);
                    return (
                      <div key={conn.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{fromEl?.name}</span>
                            <Icon name="ArrowRight" size={14} className="text-blue-400" />
                            <span className="text-sm font-medium">{toEl?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="h-5 px-2 text-xs">
                              {conn.protocol}
                            </Badge>
                            <Badge variant={conn.type === 'sync' ? 'default' : 'secondary'} className="h-5 px-2 text-xs">
                              {conn.type === 'sync' ? 'Синхронно' : conn.type === 'async' ? 'Асинхронно' : 'Данные'}
                            </Badge>
                            {conn.description && <span>{conn.description}</span>}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))}
                        >
                          <Icon name="Trash2" size={14} className="text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {selectedElement && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Focus" size={16} className="text-purple-400" />
                    Зависимости: {selectedElement.name}
                  </h4>
                  <div className="space-y-3">
                    {connections.filter(c => c.from === selectedElement.id || c.to === selectedElement.id).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Нет связей для этого элемента</p>
                    ) : (
                      connections
                        .filter(c => c.from === selectedElement.id || c.to === selectedElement.id)
                        .map((conn) => {
                          const isOutgoing = conn.from === selectedElement.id;
                          const otherEl = getElementById(isOutgoing ? conn.to : conn.from);
                          return (
                            <div key={conn.id} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg">
                              <Icon 
                                name={isOutgoing ? 'ArrowRight' : 'ArrowLeft'} 
                                size={16} 
                                className={isOutgoing ? 'text-orange-400' : 'text-green-400'} 
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{otherEl?.name}</p>
                                <p className="text-xs text-muted-foreground">{conn.protocol}</p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="flex-1 p-4 space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Метрики архитектуры</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Связность (Cohesion)</span>
                      <span className="text-sm font-semibold text-green-400">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-400" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Зацепление (Coupling)</span>
                      <span className="text-sm font-semibold text-yellow-400">42%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Повторное использование</span>
                      <span className="text-sm font-semibold text-blue-400">67%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: '67%' }} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Сводка</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Всего элементов</span>
                    <span className="font-semibold">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Микросервисов</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Связей</span>
                    <span className="font-semibold">{connections.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Сложность</span>
                    <Badge variant="outline">Средняя (7.2/10)</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 p-4 space-y-4">
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Sparkles" size={20} className="text-purple-400" />
                  <h3 className="font-semibold">AI Архитектурный помощник</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Анализ текущей архитектуры на основе best practices и паттернов проектирования
                </p>
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <Icon name="Play" size={14} className="mr-2" />
                  Запустить анализ
                </Button>
              </Card>

              <div className="space-y-3">
                {AI_RECOMMENDATIONS.map((rec, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Icon 
                        name={rec.type === 'warning' ? 'AlertTriangle' : rec.type === 'suggestion' ? 'Lightbulb' : 'Info'} 
                        size={18} 
                        className={
                          rec.type === 'warning' ? 'text-yellow-400' : 
                          rec.type === 'suggestion' ? 'text-blue-400' : 
                          'text-muted-foreground'
                        } 
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                        <Button variant="outline" size="sm">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Connection Configuration Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Icon name="Link" size={24} className="text-blue-400" />
              Настройка связи: {pendingConnection && `${getElementById(pendingConnection.from)?.name} → ${getElementById(pendingConnection.to)?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card className="p-4 bg-muted/20">
              <h3 className="font-semibold mb-3">Тип связи</h3>
              <RadioGroup value={newConnection.type} onValueChange={(v: any) => setNewConnection(prev => ({...prev, type: v}))}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sync" id="sync" />
                    <Label htmlFor="sync" className="font-normal cursor-pointer">Синхронная</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="async" id="async" />
                    <Label htmlFor="async" className="font-normal cursor-pointer">Асинхронная</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="data" id="data" />
                    <Label htmlFor="data" className="font-normal cursor-pointer">Поток данных</Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Протокол и метод</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Протокол</Label>
                    <Select value={newConnection.protocol} onValueChange={(v) => setNewConnection(prev => ({...prev, protocol: v}))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REST">REST API</SelectItem>
                        <SelectItem value="gRPC">gRPC</SelectItem>
                        <SelectItem value="GraphQL">GraphQL</SelectItem>
                        <SelectItem value="WebSocket">WebSocket</SelectItem>
                        <SelectItem value="Kafka">Apache Kafka</SelectItem>
                        <SelectItem value="RabbitMQ">RabbitMQ</SelectItem>
                        <SelectItem value="JDBC">JDBC</SelectItem>
                        <SelectItem value="MongoDB Driver">MongoDB Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newConnection.type === 'sync' && (
                    <div>
                      <Label className="text-xs">HTTP Метод</Label>
                      <Select value={newConnection.method} onValueChange={(v) => setNewConnection(prev => ({...prev, method: v}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Endpoint / Топик</Label>
                    <Input 
                      value={newConnection.endpoint} 
                      onChange={(e) => setNewConnection(prev => ({...prev, endpoint: e.target.value}))}
                      className="mt-1 font-mono text-sm"
                      placeholder="/api/v1/resource"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Безопасность и формат</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Аутентификация</Label>
                    <Select value={newConnection.auth} onValueChange={(v) => setNewConnection(prev => ({...prev, auth: v}))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JWT Token">JWT Token</SelectItem>
                        <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                        <SelectItem value="API Key">API Key</SelectItem>
                        <SelectItem value="mTLS">mTLS</SelectItem>
                        <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Request</Label>
                      <Select value={newConnection.requestFormat} onValueChange={(v) => setNewConnection(prev => ({...prev, requestFormat: v}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JSON">JSON</SelectItem>
                          <SelectItem value="XML">XML</SelectItem>
                          <SelectItem value="Protobuf">Protobuf</SelectItem>
                          <SelectItem value="Binary">Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Response</Label>
                      <Select value={newConnection.responseFormat} onValueChange={(v) => setNewConnection(prev => ({...prev, responseFormat: v}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JSON">JSON</SelectItem>
                          <SelectItem value="XML">XML</SelectItem>
                          <SelectItem value="Protobuf">Protobuf</SelectItem>
                          <SelectItem value="Binary">Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">SLA и надежность</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Таймаут (ms)</Label>
                  <Input 
                    type="number" 
                    value={newConnection.timeout} 
                    onChange={(e) => setNewConnection(prev => ({...prev, timeout: e.target.value}))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Retry Policy (попытки)</Label>
                  <Input 
                    type="number" 
                    value={newConnection.retries} 
                    onChange={(e) => setNewConnection(prev => ({...prev, retries: e.target.value}))}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Icon name="Shield" size={14} className="mr-2" />
                    Circuit Breaker
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Описание и документация</h3>
              <Textarea 
                value={newConnection.description}
                onChange={(e) => setNewConnection(prev => ({...prev, description: e.target.value}))}
                placeholder="Краткое описание назначения этой связи..."
                className="min-h-20"
              />
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileCode" size={18} className="text-blue-400" />
                Автогенерация контракта API
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Метод:</span>
                  <Badge variant="outline" className="font-mono">{newConnection.method} {newConnection.endpoint}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Формат:</span>
                  <span>{newConnection.requestFormat} → {newConnection.responseFormat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Безопасность:</span>
                  <span>{newConnection.auth}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Icon name="FileJson" size={14} className="mr-2" />
                  OpenAPI Spec
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Icon name="Code" size={14} className="mr-2" />
                  Mock Endpoint
                </Button>
              </div>
            </Card>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsConnectionDialogOpen(false);
                  setIsDrawingConnection(false);
                  setConnectionStart(null);
                  setPendingConnection(null);
                }}
              >
                Отмена
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={createConnection}
              >
                <Icon name="Check" size={16} className="mr-2" />
                Создать связь
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawing Mode Indicator */}
      {isDrawingConnection && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Card className="p-4 bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center animate-pulse">
                <Icon name="Link" size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Режим рисования связей</p>
                <p className="text-xs text-muted-foreground">
                  {connectionStart === null 
                    ? 'Выберите первый элемент' 
                    : `Выбран: ${getElementById(connectionStart)?.name}. Выберите второй элемент`}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setIsDrawingConnection(false);
                  setConnectionStart(null);
                }}
              >
                <Icon name="X" size={18} />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}