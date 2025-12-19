import { useState, useRef, useEffect } from 'react';
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
  groupId?: number;
}

interface ArchConnection {
  id: number;
  from: number;
  to: number;
  protocol: string;
  type: 'sync' | 'async' | 'data';
  description?: string;
}

interface ArchGroup {
  id: number;
  name: string;
  color: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer?: 'presentation' | 'business' | 'data' | 'infrastructure';
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

const GROUP_PRESETS = [
  { name: 'Presentation Layer', color: '#8b5cf6', layer: 'presentation' as const },
  { name: 'Business Logic', color: '#10b981', layer: 'business' as const },
  { name: 'Data Layer', color: '#3b82f6', layer: 'data' as const },
  { name: 'Infrastructure', color: '#f59e0b', layer: 'infrastructure' as const },
  { name: 'External Services', color: '#ef4444', layer: undefined },
  { name: 'Custom Group', color: '#6366f1', layer: undefined },
];

export default function ArchitectureStudio({ elements: propElements, onClose }: ArchitectureStudioProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<ArchElement | null>(null);
  const [c4Level, setC4Level] = useState('container');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [zoom, setZoom] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConnectionLines, setShowConnectionLines] = useState(true);
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);
  const [showGroups, setShowGroups] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [draggingGroup, setDraggingGroup] = useState<number | null>(null);
  const [resizingGroup, setResizingGroup] = useState<{ id: number; corner: string } | null>(null);
  
  const [archElements, setArchElements] = useState<ArchElement[]>([
    { id: 0, name: 'Web App', type: 'webapp', x: 120, y: 80, techStack: 'React + TypeScript', layer: 'presentation', groupId: 1 },
    { id: 1, name: 'Mobile App', type: 'mobile', x: 320, y: 80, techStack: 'React Native', layer: 'presentation', groupId: 1 },
    { id: 2, name: 'Admin Panel', type: 'webapp', x: 520, y: 80, techStack: 'Next.js', layer: 'presentation', groupId: 1 },
    { id: 11, name: 'API Gateway', type: 'api-gateway', x: 120, y: 280, techStack: 'Kong', layer: 'business', groupId: 2 },
    { id: 12, name: 'Order Service', type: 'microservice', x: 320, y: 280, techStack: 'Java + Spring', layer: 'business', groupId: 2 },
    { id: 13, name: 'Payment Service', type: 'microservice', x: 520, y: 280, techStack: 'Node.js', layer: 'business', groupId: 2 },
    { id: 14, name: 'Inventory Service', type: 'microservice', x: 720, y: 280, techStack: 'Python', layer: 'business', groupId: 2 },
    { id: 20, name: 'PostgreSQL', type: 'database', x: 150, y: 480, techStack: 'Orders & Users', layer: 'data', groupId: 3 },
    { id: 21, name: 'MongoDB', type: 'database', x: 350, y: 480, techStack: 'Product Catalog', layer: 'data', groupId: 3 },
    { id: 22, name: 'Redis Cache', type: 'cache', x: 550, y: 480, techStack: 'Session Store', layer: 'data', groupId: 3 },
    { id: 23, name: 'Kafka', type: 'queue', x: 750, y: 480, techStack: 'Event Streaming', layer: 'data', groupId: 3 },
  ]);
  
  const [archGroups, setArchGroups] = useState<ArchGroup[]>([
    { id: 1, name: 'Presentation Layer', color: '#8b5cf6', x: 80, y: 30, width: 650, height: 200, layer: 'presentation', description: 'Frontend приложения и пользовательские интерфейсы' },
    { id: 2, name: 'Business Logic', color: '#10b981', x: 80, y: 250, width: 850, height: 180, layer: 'business', description: 'Бизнес-логика и микросервисы' },
    { id: 3, name: 'Data Layer', color: '#3b82f6', x: 100, y: 450, width: 800, height: 180, layer: 'data', description: 'Хранилища данных и кэши' },
  ]);
  
  const [connections, setConnections] = useState<ArchConnection[]>([
    { id: 1, from: 1, to: 11, protocol: 'HTTPS', type: 'sync', description: 'Загрузка интерфейса' },
    { id: 2, from: 11, to: 12, protocol: 'REST', type: 'sync', description: 'Создание заказа' },
    { id: 3, from: 12, to: 13, protocol: 'REST', type: 'sync', description: 'Обработка платежа' },
    { id: 4, from: 12, to: 20, protocol: 'JDBC', type: 'sync', description: 'Сохранение заказа' },
    { id: 5, from: 13, to: 21, protocol: 'MongoDB Driver', type: 'sync', description: 'Запись транзакции' },
    { id: 6, from: 0, to: 11, protocol: 'HTTPS', type: 'sync', description: 'Web запросы' },
    { id: 7, from: 14, to: 22, protocol: 'Redis Protocol', type: 'sync', description: 'Кэш инвентаря' },
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
  
  const [isAddElementDialogOpen, setIsAddElementDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState('microservice');
  const [newElementName, setNewElementName] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#8b5cf6');
  const [newGroupLayer, setNewGroupLayer] = useState<'presentation' | 'business' | 'data' | 'infrastructure' | undefined>(undefined);

  const handleElementClick = (element: ArchElement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isDrawingConnection) {
      if (connectionStart === null) {
        setConnectionStart(element.id);
      } else if (connectionStart !== element.id) {
        setPendingConnection({ from: connectionStart, to: element.id });
        setIsConnectionDialogOpen(true);
      }
    } else {
      setSelectedElement(element);
      setActiveTab('properties');
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: number) => {
    if (isDrawingConnection) return;
    e.stopPropagation();
    
    const element = archElements.find(el => el.id === elementId);
    if (!element) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / (zoom / 100);
    const mouseY = (e.clientY - rect.top) / (zoom / 100);
    
    if (draggingElement !== null) {
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      setArchElements(prev => 
        prev.map(el => 
          el.id === draggingElement 
            ? { ...el, x: Math.max(0, Math.min(newX, 1200)), y: Math.max(0, Math.min(newY, 600)) }
            : el
        )
      );
    }
    
    if (draggingGroup !== null) {
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      setArchGroups(prev => 
        prev.map(gr => 
          gr.id === draggingGroup 
            ? { ...gr, x: Math.max(0, newX), y: Math.max(0, newY) }
            : gr
        )
      );
    }
    
    if (resizingGroup !== null) {
      const group = archGroups.find(g => g.id === resizingGroup.id);
      if (!group) return;
      
      let newWidth = group.width;
      let newHeight = group.height;
      let newX = group.x;
      let newY = group.y;
      
      if (resizingGroup.corner.includes('e')) {
        newWidth = Math.max(200, mouseX - group.x);
      }
      if (resizingGroup.corner.includes('w')) {
        const diff = group.x - mouseX;
        newWidth = Math.max(200, group.width + diff);
        newX = mouseX;
      }
      if (resizingGroup.corner.includes('s')) {
        newHeight = Math.max(150, mouseY - group.y);
      }
      if (resizingGroup.corner.includes('n')) {
        const diff = group.y - mouseY;
        newHeight = Math.max(150, group.height + diff);
        newY = mouseY;
      }
      
      setArchGroups(prev => 
        prev.map(gr => 
          gr.id === resizingGroup.id 
            ? { ...gr, x: newX, y: newY, width: newWidth, height: newHeight }
            : gr
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setDraggingGroup(null);
    setResizingGroup(null);
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

  const addNewElement = () => {
    if (!newElementName.trim()) return;
    
    const newElement: ArchElement = {
      id: Date.now(),
      type: newElementType,
      name: newElementName,
      x: 400,
      y: 300,
      techStack: 'New Technology',
      layer: 'business'
    };
    
    setArchElements(prev => [...prev, newElement]);
    setNewElementName('');
    setIsAddElementDialogOpen(false);
  };
  
  const addNewGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: ArchGroup = {
      id: Date.now(),
      name: newGroupName,
      color: newGroupColor,
      x: 100,
      y: 100,
      width: 400,
      height: 250,
      layer: newGroupLayer,
      description: 'Новая группа элементов'
    };
    
    setArchGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setNewGroupColor('#8b5cf6');
    setNewGroupLayer(undefined);
    setIsAddGroupDialogOpen(false);
  };

  const deleteElement = (id: number) => {
    setArchElements(prev => prev.filter(el => el.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
    if (selectedElement?.id === id) setSelectedElement(null);
  };
  
  const deleteGroup = (id: number) => {
    setArchGroups(prev => prev.filter(gr => gr.id !== id));
    setArchElements(prev => prev.map(el => el.groupId === id ? { ...el, groupId: undefined } : el));
    if (selectedGroup === id) setSelectedGroup(null);
  };
  
  const updateGroup = (id: number, updates: Partial<ArchGroup>) => {
    setArchGroups(prev => prev.map(gr => gr.id === id ? { ...gr, ...updates } : gr));
  };
  
  const assignElementToGroup = (elementId: number, groupId: number | undefined) => {
    setArchElements(prev => prev.map(el => el.id === elementId ? { ...el, groupId } : el));
  };

  const updateElement = (id: number, updates: Partial<ArchElement>) => {
    setArchElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getElementById = (id: number) => {
    return archElements.find(e => e.id === id);
  };

  const getElementPosition = (id: number): { x: number, y: number } => {
    const element = getElementById(id);
    return element ? { x: element.x + 80, y: element.y + 50 } : { x: 0, y: 0 };
  };

  const renderConnectionLine = (conn: ArchConnection) => {
    const from = getElementPosition(conn.from);
    const to = getElementPosition(conn.to);
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const isHovered = hoveredConnection === conn.id;
    const color = conn.type === 'sync' ? '#3b82f6' : conn.type === 'async' ? '#f59e0b' : '#10b981';
    
    return (
      <g key={conn.id}>
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={color}
          strokeWidth={isHovered ? 3 : 2}
          strokeDasharray={conn.type === 'async' ? '5,5' : '0'}
          className="transition-all duration-200"
          onMouseEnter={() => setHoveredConnection(conn.id)}
          onMouseLeave={() => setHoveredConnection(null)}
          style={{ cursor: 'pointer' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={conn.type === 'async' ? "10" : "0"}
            dur="1s"
            repeatCount="indefinite"
          />
        </line>
        
        <polygon
          points={`${to.x},${to.y} ${to.x - 10},${to.y - 5} ${to.x - 10},${to.y + 5}`}
          fill={color}
          transform={`rotate(${angle} ${to.x} ${to.y})`}
        />
        
        {isHovered && (
          <g>
            <rect
              x={(from.x + to.x) / 2 - 60}
              y={(from.y + to.y) / 2 - 20}
              width="120"
              height="40"
              fill="rgba(0,0,0,0.9)"
              rx="6"
            />
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 5}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="600"
            >
              {conn.protocol}
            </text>
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 + 10}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {conn.description}
            </text>
          </g>
        )}
      </g>
    );
  };

  const autoLayout = () => {
    const layers = {
      presentation: archElements.filter(el => el.layer === 'presentation'),
      business: archElements.filter(el => el.layer === 'business'),
      data: archElements.filter(el => el.layer === 'data'),
    };
    
    const newElements = [...archElements];
    
    layers.presentation.forEach((el, idx) => {
      const element = newElements.find(e => e.id === el.id);
      if (element) {
        element.x = 100 + idx * 250;
        element.y = 50;
      }
    });
    
    layers.business.forEach((el, idx) => {
      const element = newElements.find(e => e.id === el.id);
      if (element) {
        element.x = 100 + idx * 200;
        element.y = 250;
      }
    });
    
    layers.data.forEach((el, idx) => {
      const element = newElements.find(e => e.id === el.id);
      if (element) {
        element.x = 150 + idx * 200;
        element.y = 450;
      }
    });
    
    setArchElements(newElements);
  };

  const exportToDiagram = (format: 'mermaid' | 'plantuml' | 'json') => {
    if (format === 'mermaid') {
      let code = 'graph TB\n';
      archElements.forEach(el => {
        code += `    ${el.id}["${el.name}<br/>${el.techStack}"]\n`;
      });
      code += '\n';
      connections.forEach(conn => {
        const arrow = conn.type === 'sync' ? '-->' : '-.->';
        code += `    ${conn.from} ${arrow}|${conn.protocol}| ${conn.to}\n`;
      });
      return code;
    } else if (format === 'plantuml') {
      let code = '@startuml\n';
      archElements.forEach(el => {
        code += `component "${el.name}" as ${el.id}\n`;
      });
      code += '\n';
      connections.forEach(conn => {
        code += `${conn.from} --> ${conn.to} : ${conn.protocol}\n`;
      });
      code += '@enduml';
      return code;
    } else {
      return JSON.stringify({ elements: archElements, connections }, null, 2);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getIconForType = (type: string) => {
    const elementType = ELEMENT_TYPES.find(t => t.id === type);
    return elementType?.icon || 'Box';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
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
          <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Icon name="Sparkles" size={16} className="mr-2" />
            AI Assist
          </Button>
        </div>
      </div>

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
            <Button variant="ghost" size="sm" onClick={() => setIsAddElementDialogOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Элемент
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAddGroupDialogOpen(true)}>
              <Icon name="Square" size={16} className="mr-2" />
              Группа
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
            <Button variant="ghost" size="sm" onClick={autoLayout}>
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
          
          <Button
            variant={showConnectionLines ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowConnectionLines(!showConnectionLines)}
            className="h-8"
          >
            <Icon name="GitBranch" size={14} className="mr-1" />
            Связи
          </Button>
          
          <Button
            variant={showGroups ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowGroups(!showGroups)}
            className="h-8"
          >
            <Icon name="LayoutGrid" size={14} className="mr-1" />
            Группы
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
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
          </div>
        </div>

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

          <div 
            ref={canvasRef}
            className="absolute inset-0 p-8 overflow-auto"
            onClick={() => {
              if (!isDrawingConnection) {
                setSelectedElement(null);
              }
            }}
          >
            <div 
              className="relative"
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top left',
                minWidth: '1400px',
                minHeight: '700px'
              }}
            >
              {showGroups && archGroups.map(group => (
                <div
                  key={group.id}
                  className={`absolute border-2 border-dashed rounded-2xl transition-all ${
                    selectedGroup === group.id ? 'border-solid shadow-2xl' : ''
                  }`}
                  style={{
                    left: `${group.x}px`,
                    top: `${group.y}px`,
                    width: `${group.width}px`,
                    height: `${group.height}px`,
                    borderColor: group.color,
                    backgroundColor: `${group.color}15`,
                    zIndex: 0,
                    cursor: draggingGroup === group.id ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => {
                    if (resizingGroup) return;
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDragOffset({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                    setDraggingGroup(group.id);
                    setSelectedGroup(group.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(group.id);
                  }}
                >
                  <div 
                    className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none"
                    style={{ color: group.color }}
                  >
                    <Icon name="Layers" size={18} />
                    <span className="font-semibold text-sm">{group.name}</span>
                    {group.description && (
                      <span className="text-xs opacity-70">— {group.description}</span>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group.id);
                    }}
                  >
                    <Icon name="X" size={12} />
                  </Button>
                  
                  {['nw', 'ne', 'sw', 'se'].map(corner => (
                    <div
                      key={corner}
                      className="absolute w-3 h-3 bg-white border-2 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
                      style={{
                        borderColor: group.color,
                        top: corner.includes('n') ? '-6px' : 'auto',
                        bottom: corner.includes('s') ? '-6px' : 'auto',
                        left: corner.includes('w') ? '-6px' : 'auto',
                        right: corner.includes('e') ? '-6px' : 'auto',
                        cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingGroup({ id: group.id, corner });
                      }}
                    />
                  ))}
                </div>
              ))}

              {showConnectionLines && (
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%', zIndex: 1 }}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  <g className="pointer-events-auto">
                    {connections.map(conn => renderConnectionLine(conn))}
                  </g>
                </svg>
              )}

              {archElements.map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-move transition-all ${
                    isDrawingConnection 
                      ? 'hover:ring-2 hover:ring-blue-400' 
                      : 'hover:ring-2 hover:ring-purple-400'
                  } ${
                    connectionStart === element.id ? 'ring-2 ring-blue-400 shadow-lg' : ''
                  } ${
                    selectedElement?.id === element.id ? 'ring-2 ring-purple-500 shadow-xl' : ''
                  } ${
                    draggingElement === element.id ? 'cursor-grabbing' : ''
                  }`}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: '160px',
                    zIndex: draggingElement === element.id ? 100 : 10
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={(e) => handleElementClick(element, e)}
                >
                  <Card className="p-4 bg-card/95 backdrop-blur-sm group">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                        element.layer === 'presentation' ? 'bg-gradient-to-br from-purple-500 to-blue-500' :
                        element.layer === 'business' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        'bg-gradient-to-br from-blue-500 to-cyan-500'
                      }`}>
                        <Icon name={getIconForType(element.type) as any} size={24} className="text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-center text-sm line-clamp-1">{element.name}</h4>
                    <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">{element.techStack}</p>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Zoom: {zoom}%</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Сетка: {gridEnabled ? 'Вкл' : 'Выкл'}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Элементов: {archElements.length}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground">Связей: {connections.length}</span>
          </div>

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
                        <Icon name={getIconForType(selectedElement.type) as any} size={24} className="text-white" />
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
                      <Input 
                        value={selectedElement.name} 
                        onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Описание</Label>
                      <Textarea 
                        value={selectedElement.description || 'Обработка заказов и управление корзиной'} 
                        onChange={(e) => updateElement(selectedElement.id, { description: e.target.value })}
                        className="mt-1 min-h-20"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Технологический стек</Label>
                      <Input 
                        value={selectedElement.techStack || 'Java 17, Spring Boot 3.1'} 
                        onChange={(e) => updateElement(selectedElement.id, { techStack: e.target.value })}
                        className="mt-1" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">CPU</Label>
                        <Input 
                          value={selectedElement.cpu || '1000m'} 
                          onChange={(e) => updateElement(selectedElement.id, { cpu: e.target.value })}
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Memory</Label>
                        <Input 
                          value={selectedElement.memory || '512Mi'} 
                          onChange={(e) => updateElement(selectedElement.id, { memory: e.target.value })}
                          className="mt-1" 
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Команда и отслеживание</h4>
                    <div>
                      <Label className="text-xs">Ответственная команда</Label>
                      <Select 
                        value={selectedElement.team || 'team-alpha'}
                        onValueChange={(value) => updateElement(selectedElement.id, { team: value })}
                      >
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
                      <Input 
                        value={selectedElement.repository || 'git@github.com:company/service.git'} 
                        onChange={(e) => updateElement(selectedElement.id, { repository: e.target.value })}
                        className="mt-1 font-mono text-xs" 
                      />
                    </div>
                  </Card>
                  
                  <Card className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Группа</h4>
                    <div>
                      <Label className="text-xs">Принадлежность к группе</Label>
                      <Select 
                        value={selectedElement.groupId?.toString() || 'none'}
                        onValueChange={(value) => assignElementToGroup(selectedElement.id, value === 'none' ? undefined : parseInt(value))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Без группы</SelectItem>
                          {archGroups.map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: group.color }} />
                                {group.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить элемент
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
                    <span className="font-semibold">{archElements.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Микросервисов</span>
                    <span className="font-semibold">{archElements.filter(el => el.type === 'microservice').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Связей</span>
                    <span className="font-semibold">{connections.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Групп</span>
                    <span className="font-semibold">{archGroups.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Сложность</span>
                    <Badge variant="outline">Средняя (7.2/10)</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Layers" size={16} className="text-purple-400" />
                  Группы и слои
                </h4>
                <div className="space-y-2">
                  {archGroups.map(group => {
                    const elementsInGroup = archElements.filter(el => el.groupId === group.id).length;
                    return (
                      <div key={group.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: group.color }} />
                          <span className="text-sm font-medium">{group.name}</span>
                        </div>
                        <Badge variant="outline">{elementsInGroup} элем.</Badge>
                      </div>
                    );
                  })}
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

      <Dialog open={isAddElementDialogOpen} onOpenChange={setIsAddElementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить элемент архитектуры</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Тип элемента</Label>
              <Select value={newElementType} onValueChange={setNewElementType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELEMENT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Название</Label>
              <Input 
                value={newElementName}
                onChange={(e) => setNewElementName(e.target.value)}
                placeholder="Например: User Service"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={addNewElement}
              >
                Добавить
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsAddElementDialogOpen(false);
                  setNewElementName('');
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать группу элементов</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название группы</Label>
              <Input 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Например: Presentation Layer"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Шаблон</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {GROUP_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors text-left"
                    onClick={() => {
                      setNewGroupName(preset.name);
                      setNewGroupColor(preset.color);
                      setNewGroupLayer(preset.layer);
                    }}
                  >
                    <div className="h-6 w-6 rounded" style={{ backgroundColor: preset.color }} />
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Цвет группы</Label>
              <div className="flex gap-2 mt-2">
                {['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'].map(color => (
                  <button
                    key={color}
                    className={`h-10 w-10 rounded-lg border-2 transition-all ${
                      newGroupColor === color ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGroupColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={addNewGroup}
              >
                Создать группу
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsAddGroupDialogOpen(false);
                  setNewGroupName('');
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Экспорт архитектуры</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Mermaid диаграмма</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                {exportToDiagram('mermaid')}
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => copyToClipboard(exportToDiagram('mermaid'))}
              >
                <Icon name="Copy" size={14} className="mr-2" />
                Копировать
              </Button>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">PlantUML диаграмма</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                {exportToDiagram('plantuml')}
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => copyToClipboard(exportToDiagram('plantuml'))}
              >
                <Icon name="Copy" size={14} className="mr-2" />
                Копировать
              </Button>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">JSON экспорт</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                {exportToDiagram('json')}
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => copyToClipboard(exportToDiagram('json'))}
              >
                <Icon name="Copy" size={14} className="mr-2" />
                Копировать
              </Button>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

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