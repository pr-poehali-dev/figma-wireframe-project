import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import ArchitectureCanvas from './ArchitectureCanvas';
import ArchitectureSidebar from './ArchitectureSidebar';
import ArchitectureProperties from './ArchitectureProperties';

// Export interfaces for sub-components
export interface ArchElement {
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
  c4Level?: 'context' | 'container' | 'component' | 'code';
}

export interface ArchConnection {
  id: number;
  from: number;
  to: number;
  protocol: string;
  type: 'sync' | 'async' | 'data';
  description?: string;
}

export interface ArchGroup {
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

// Constants
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

const GROUP_PRESETS = [
  { name: 'Presentation Layer', color: '#8b5cf6', layer: 'presentation' as const },
  { name: 'Business Logic', color: '#10b981', layer: 'business' as const },
  { name: 'Data Layer', color: '#3b82f6', layer: 'data' as const },
  { name: 'Infrastructure', color: '#f59e0b', layer: 'infrastructure' as const },
  { name: 'External Services', color: '#ef4444', layer: undefined },
  { name: 'Custom Group', color: '#6366f1', layer: undefined },
];

const C4_CONTEXT_DATA = {
  elements: [
    { id: 100, name: 'E-Commerce System', type: 'webapp', x: 400, y: 250, techStack: 'Microservices Platform', layer: 'business' as const, c4Level: 'context' as const, description: 'Основная платформа электронной коммерции' },
    { id: 101, name: 'Customer', type: 'user', x: 150, y: 100, techStack: 'Web/Mobile Users', layer: 'presentation' as const, c4Level: 'context' as const, description: 'Покупатели' },
    { id: 102, name: 'Admin', type: 'user', x: 150, y: 400, techStack: 'Internal Users', layer: 'presentation' as const, c4Level: 'context' as const, description: 'Администраторы' },
    { id: 103, name: 'Payment Gateway', type: 'external', x: 700, y: 200, techStack: 'Stripe/PayPal', layer: 'business' as const, c4Level: 'context' as const, description: 'Внешний платежный шлюз' },
    { id: 104, name: 'Email Service', type: 'external', x: 700, y: 350, techStack: 'SendGrid', layer: 'business' as const, c4Level: 'context' as const, description: 'Email-уведомления' },
    { id: 105, name: 'Shipping Service', type: 'external', x: 700, y: 500, techStack: 'DHL/FedEx API', layer: 'business' as const, c4Level: 'context' as const, description: 'Служба доставки' },
  ],
  connections: [
    { id: 1001, from: 101, to: 100, protocol: 'HTTPS', type: 'sync' as const, description: 'Просмотр и покупка товаров' },
    { id: 1002, from: 102, to: 100, protocol: 'HTTPS', type: 'sync' as const, description: 'Управление системой' },
    { id: 1003, from: 100, to: 103, protocol: 'REST API', type: 'sync' as const, description: 'Обработка платежей' },
    { id: 1004, from: 100, to: 104, protocol: 'SMTP', type: 'async' as const, description: 'Отправка email' },
    { id: 1005, from: 100, to: 105, protocol: 'REST API', type: 'sync' as const, description: 'Отслеживание доставки' },
  ],
  groups: [
    { id: 100, name: 'External Systems', color: '#ef4444', x: 650, y: 150, width: 250, height: 400, description: 'Внешние сервисы и API' },
  ]
};

const C4_CONTAINER_DATA = {
  elements: [
    { id: 200, name: 'Web App', type: 'webapp', x: 120, y: 80, techStack: 'React + TypeScript', layer: 'presentation' as const, groupId: 201, c4Level: 'container' as const },
    { id: 201, name: 'Mobile App', type: 'mobile', x: 320, y: 80, techStack: 'React Native', layer: 'presentation' as const, groupId: 201, c4Level: 'container' as const },
    { id: 202, name: 'Admin Panel', type: 'webapp', x: 520, y: 80, techStack: 'Next.js', layer: 'presentation' as const, groupId: 201, c4Level: 'container' as const },
    { id: 211, name: 'API Gateway', type: 'api-gateway', x: 120, y: 280, techStack: 'Kong', layer: 'business' as const, groupId: 202, c4Level: 'container' as const },
    { id: 212, name: 'Order Service', type: 'microservice', x: 320, y: 280, techStack: 'Java + Spring', layer: 'business' as const, groupId: 202, c4Level: 'container' as const },
    { id: 213, name: 'Payment Service', type: 'microservice', x: 520, y: 280, techStack: 'Node.js', layer: 'business' as const, groupId: 202, c4Level: 'container' as const },
    { id: 214, name: 'Inventory Service', type: 'microservice', x: 720, y: 280, techStack: 'Python', layer: 'business' as const, groupId: 202, c4Level: 'container' as const },
    { id: 220, name: 'PostgreSQL', type: 'database', x: 150, y: 480, techStack: 'Orders & Users', layer: 'data' as const, groupId: 203, c4Level: 'container' as const },
    { id: 221, name: 'MongoDB', type: 'database', x: 350, y: 480, techStack: 'Product Catalog', layer: 'data' as const, groupId: 203, c4Level: 'container' as const },
    { id: 222, name: 'Redis Cache', type: 'cache', x: 550, y: 480, techStack: 'Session Store', layer: 'data' as const, groupId: 203, c4Level: 'container' as const },
    { id: 223, name: 'Kafka', type: 'queue', x: 750, y: 480, techStack: 'Event Streaming', layer: 'data' as const, groupId: 203, c4Level: 'container' as const },
  ],
  connections: [
    { id: 2001, from: 201, to: 211, protocol: 'HTTPS', type: 'sync' as const, description: 'Загрузка интерфейса' },
    { id: 2002, from: 211, to: 212, protocol: 'REST', type: 'sync' as const, description: 'Создание заказа' },
    { id: 2003, from: 212, to: 213, protocol: 'REST', type: 'sync' as const, description: 'Обработка платежа' },
    { id: 2004, from: 212, to: 220, protocol: 'JDBC', type: 'sync' as const, description: 'Сохранение заказа' },
    { id: 2005, from: 213, to: 221, protocol: 'MongoDB Driver', type: 'sync' as const, description: 'Запись транзакции' },
    { id: 2006, from: 200, to: 211, protocol: 'HTTPS', type: 'sync' as const, description: 'Web запросы' },
    { id: 2007, from: 214, to: 222, protocol: 'Redis Protocol', type: 'sync' as const, description: 'Кэш инвентаря' },
    { id: 2008, from: 212, to: 223, protocol: 'Kafka', type: 'async' as const, description: 'Публикация событий' },
  ],
  groups: [
    { id: 201, name: 'Presentation Layer', color: '#8b5cf6', x: 70, y: 30, width: 700, height: 120, layer: 'presentation' as const },
    { id: 202, name: 'Business Logic', color: '#10b981', x: 70, y: 230, width: 850, height: 120, layer: 'business' as const },
    { id: 203, name: 'Data Layer', color: '#3b82f6', x: 100, y: 430, width: 850, height: 120, layer: 'data' as const },
  ]
};

const C4_COMPONENT_DATA = {
  elements: [
    { id: 300, name: 'Order Controller', type: 'serverless', x: 150, y: 100, techStack: 'REST Controller', layer: 'presentation' as const, groupId: 301, c4Level: 'component' as const },
    { id: 301, name: 'Order Validator', type: 'serverless', x: 350, y: 100, techStack: 'Validation Logic', layer: 'business' as const, groupId: 302, c4Level: 'component' as const },
    { id: 302, name: 'Order Processor', type: 'serverless', x: 550, y: 100, techStack: 'Business Logic', layer: 'business' as const, groupId: 302, c4Level: 'component' as const },
    { id: 303, name: 'Payment Handler', type: 'serverless', x: 750, y: 100, techStack: 'Payment Integration', layer: 'business' as const, groupId: 302, c4Level: 'component' as const },
    { id: 310, name: 'Order Repository', type: 'database', x: 200, y: 300, techStack: 'Data Access', layer: 'data' as const, groupId: 303, c4Level: 'component' as const },
    { id: 311, name: 'Event Publisher', type: 'queue', x: 500, y: 300, techStack: 'Event Handling', layer: 'data' as const, groupId: 303, c4Level: 'component' as const },
    { id: 312, name: 'Cache Manager', type: 'cache', x: 800, y: 300, techStack: 'Redis Client', layer: 'data' as const, groupId: 303, c4Level: 'component' as const },
  ],
  connections: [
    { id: 3001, from: 300, to: 301, protocol: 'Method Call', type: 'sync' as const, description: 'Валидация заказа' },
    { id: 3002, from: 301, to: 302, protocol: 'Method Call', type: 'sync' as const, description: 'Обработка заказа' },
    { id: 3003, from: 302, to: 303, protocol: 'Method Call', type: 'sync' as const, description: 'Проведение платежа' },
    { id: 3004, from: 302, to: 310, protocol: 'Repository Pattern', type: 'sync' as const, description: 'Сохранение в БД' },
    { id: 3005, from: 302, to: 311, protocol: 'Event Bus', type: 'async' as const, description: 'Публикация событий' },
    { id: 3006, from: 302, to: 312, protocol: 'Cache API', type: 'sync' as const, description: 'Чтение/запись кэша' },
  ],
  groups: [
    { id: 301, name: 'API Layer', color: '#8b5cf6', x: 100, y: 50, width: 200, height: 120, layer: 'presentation' as const },
    { id: 302, name: 'Service Layer', color: '#10b981', x: 300, y: 50, width: 650, height: 120, layer: 'business' as const },
    { id: 303, name: 'Data Access', color: '#3b82f6', x: 150, y: 250, width: 800, height: 120, layer: 'data' as const },
  ]
};

const C4_CODE_DATA = {
  elements: [
    { id: 400, name: 'OrderController.java', type: 'webapp', x: 150, y: 100, techStack: '@RestController', layer: 'presentation' as const, c4Level: 'code' as const },
    { id: 401, name: 'createOrder()', type: 'serverless', x: 350, y: 100, techStack: '@PostMapping', layer: 'presentation' as const, c4Level: 'code' as const },
    { id: 402, name: 'OrderService.java', type: 'microservice', x: 550, y: 100, techStack: '@Service', layer: 'business' as const, c4Level: 'code' as const },
    { id: 403, name: 'validateOrder()', type: 'serverless', x: 750, y: 100, techStack: 'private method', layer: 'business' as const, c4Level: 'code' as const },
    { id: 404, name: 'processPayment()', type: 'serverless', x: 150, y: 300, techStack: 'private method', layer: 'business' as const, c4Level: 'code' as const },
    { id: 405, name: 'OrderRepository', type: 'database', x: 350, y: 300, techStack: '@Repository', layer: 'data' as const, c4Level: 'code' as const },
    { id: 406, name: 'OrderEntity.java', type: 'database', x: 550, y: 300, techStack: '@Entity', layer: 'data' as const, c4Level: 'code' as const },
  ],
  connections: [
    { id: 4001, from: 400, to: 401, protocol: 'method', type: 'sync' as const, description: 'defines' },
    { id: 4002, from: 401, to: 402, protocol: '@Autowired', type: 'sync' as const, description: 'dependency injection' },
    { id: 4003, from: 402, to: 403, protocol: 'calls', type: 'sync' as const, description: 'validates order data' },
    { id: 4004, from: 402, to: 404, protocol: 'calls', type: 'sync' as const, description: 'processes payment' },
    { id: 4005, from: 402, to: 405, protocol: '@Autowired', type: 'sync' as const, description: 'data persistence' },
    { id: 4006, from: 405, to: 406, protocol: 'uses', type: 'data' as const, description: 'entity mapping' },
  ],
  groups: []
};

const GRID_SIZE = 20;

export default function ArchitectureStudio({ elements, onClose }: ArchitectureStudioProps) {
  // State management
  const [archElements, setArchElements] = useState<ArchElement[]>(C4_CONTEXT_DATA.elements);
  const [connections, setConnections] = useState<ArchConnection[]>(C4_CONTEXT_DATA.connections);
  const [archGroups, setArchGroups] = useState<ArchGroup[]>(C4_CONTEXT_DATA.groups);
  const [selectedElement, setSelectedElement] = useState<ArchElement | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [draggingGroup, setDraggingGroup] = useState<number | null>(null);
  const [resizingGroup, setResizingGroup] = useState<{ id: number; corner: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [c4Level, setC4Level] = useState<'context' | 'container' | 'component' | 'code'>('context');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ level: string; name: string }>>([
    { level: 'context', name: 'System Context' }
  ]);
  const [zoom, setZoom] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showConnectionLines, setShowConnectionLines] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<number | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [isAddElementDialogOpen, setIsAddElementDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState('microservice');
  const [newElementName, setNewElementName] = useState('');
  const [newElementTech, setNewElementTech] = useState('');
  const [newElementLayer, setNewElementLayer] = useState<'presentation' | 'business' | 'data' | 'infrastructure'>('business');
  const [newConnectionData, setNewConnectionData] = useState({
    from: 0,
    to: 0,
    protocol: 'REST',
    type: 'sync' as 'sync' | 'async' | 'data',
    description: ''
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getIconForType = (type: string): string => {
    const elementType = ELEMENT_TYPES.find(t => t.id === type);
    return elementType?.icon || 'Box';
  };

  const getElementById = (id: number): ArchElement | undefined => {
    return archElements.find(el => el.id === id);
  };

  const snapValue = (value: number): number => {
    return snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: [...archElements],
      connections: [...connections],
      groups: [...archGroups]
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setArchElements(prevState.elements);
      setConnections(prevState.connections);
      setArchGroups(prevState.groups);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setArchElements(nextState.elements);
      setConnections(nextState.connections);
      setArchGroups(nextState.groups);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Element handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: number) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    
    const element = archElements.find(el => el.id === elementId);
    if (!element) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scaledX = (e.clientX - canvasRect.left) / (zoom / 100);
    const scaledY = (e.clientY - canvasRect.top) / (zoom / 100);
    
    setDragOffset({
      x: scaledX - element.x,
      y: scaledY - element.y,
    });
    setDraggingElement(elementId);
    setSelectedElement(element);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scaledX = (e.clientX - canvasRect.left) / (zoom / 100);
    const scaledY = (e.clientY - canvasRect.top) / (zoom / 100);

    if (draggingElement !== null) {
      setArchElements(prev => prev.map(el => 
        el.id === draggingElement 
          ? { ...el, x: snapToGrid(scaledX - dragOffset.x), y: snapToGrid(scaledY - dragOffset.y) }
          : el
      ));
    } else if (draggingGroup !== null) {
      setArchGroups(prev => prev.map(group =>
        group.id === draggingGroup
          ? { ...group, x: snapToGrid(scaledX - dragOffset.x), y: snapToGrid(scaledY - dragOffset.y) }
          : group
      ));
    } else if (resizingGroup) {
      setArchGroups(prev => prev.map(group => {
        if (group.id !== resizingGroup.id) return group;
        
        const corner = resizingGroup.corner;
        const newGroup = { ...group };
        
        if (corner.includes('e')) {
          newGroup.width = Math.max(150, snapToGrid(scaledX - group.x));
        }
        if (corner.includes('s')) {
          newGroup.height = Math.max(100, snapToGrid(scaledY - group.y));
        }
        if (corner.includes('w')) {
          const newWidth = Math.max(150, group.width + (group.x - snapToGrid(scaledX)));
          newGroup.x = snapToGrid(scaledX);
          newGroup.width = newWidth;
        }
        if (corner.includes('n')) {
          const newHeight = Math.max(100, group.height + (group.y - snapToGrid(scaledY)));
          newGroup.y = snapToGrid(scaledY);
          newGroup.height = newHeight;
        }
        
        return newGroup;
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggingElement !== null || draggingGroup !== null || resizingGroup !== null) {
      saveToHistory();
    }
    setDraggingElement(null);
    setDraggingGroup(null);
    setResizingGroup(null);
    setIsDragging(false);
  };

  const handleElementClick = (element: ArchElement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isDrawingConnection) {
      if (connectionStart === null) {
        setConnectionStart(element.id);
      } else {
        setNewConnectionData({
          from: connectionStart,
          to: element.id,
          protocol: 'REST',
          type: 'sync',
          description: ''
        });
        setIsConnectionDialogOpen(true);
        setConnectionStart(null);
        setIsDrawingConnection(false);
      }
    } else {
      setSelectedElement(element);
    }
  };

  const handleElementDoubleClick = (element: ArchElement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    drillDown(element);
  };

  const updateElement = (id: number, updates: Partial<ArchElement>) => {
    setArchElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
    saveToHistory();
  };

  const deleteElement = (id: number) => {
    setArchElements(prev => prev.filter(el => el.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
    saveToHistory();
  };

  const deleteGroup = (id: number) => {
    setArchGroups(prev => prev.filter(group => group.id !== id));
    setArchElements(prev => prev.map(el => 
      el.groupId === id ? { ...el, groupId: undefined } : el
    ));
    if (selectedGroup === id) {
      setSelectedGroup(null);
    }
    saveToHistory();
  };

  const addElement = () => {
    if (!newElementName) return;

    const newElement: ArchElement = {
      id: Date.now(),
      type: newElementType,
      name: newElementName,
      x: 400,
      y: 300,
      techStack: newElementTech,
      layer: newElementLayer,
      c4Level: c4Level
    };

    setArchElements(prev => [...prev, newElement]);
    setNewElementName('');
    setNewElementTech('');
    setIsAddElementDialogOpen(false);
    saveToHistory();
  };

  const addConnection = () => {
    if (newConnectionData.from === 0 || newConnectionData.to === 0) return;

    const newConnection: ArchConnection = {
      id: Date.now(),
      ...newConnectionData
    };

    setConnections(prev => [...prev, newConnection]);
    setIsConnectionDialogOpen(false);
    setNewConnectionData({
      from: 0,
      to: 0,
      protocol: 'REST',
      type: 'sync',
      description: ''
    });
    saveToHistory();
  };

  const addGroup = () => {
    if (!newGroupName) return;

    const preset = selectedPreset !== null ? GROUP_PRESETS[selectedPreset] : null;

    const newGroup: ArchGroup = {
      id: Date.now(),
      name: newGroupName,
      color: newGroupColor,
      description: newGroupDescription,
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      layer: preset?.layer
    };

    setArchGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedPreset(null);
    setIsAddGroupDialogOpen(false);
    saveToHistory();
  };

  const assignElementToGroup = (elementId: number, groupId: number | undefined) => {
    setArchElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, groupId } : el
    ));
    saveToHistory();
  };

  const duplicateElement = () => {
    if (!selectedElement) return;

    const newElement: ArchElement = {
      ...selectedElement,
      id: Date.now(),
      x: selectedElement.x + 50,
      y: selectedElement.y + 50,
      name: `${selectedElement.name} (Copy)`
    };

    setArchElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    saveToHistory();
  };

  // C4 Level navigation
  const drillDown = (element: ArchElement) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (c4Level === 'context' && element.id === 100) {
        setC4Level('container');
        setArchElements(C4_CONTAINER_DATA.elements);
        setConnections(C4_CONTAINER_DATA.connections);
        setArchGroups(C4_CONTAINER_DATA.groups);
        setBreadcrumbs([...breadcrumbs, { level: 'container', name: element.name }]);
      } else if (c4Level === 'container' && (element.type === 'microservice' || element.type === 'api-gateway')) {
        setC4Level('component');
        setArchElements(C4_COMPONENT_DATA.elements);
        setConnections(C4_COMPONENT_DATA.connections);
        setArchGroups(C4_COMPONENT_DATA.groups);
        setBreadcrumbs([...breadcrumbs, { level: 'component', name: element.name }]);
      } else if (c4Level === 'component' && element.type === 'serverless') {
        setC4Level('code');
        setArchElements(C4_CODE_DATA.elements);
        setConnections(C4_CODE_DATA.connections);
        setArchGroups(C4_CODE_DATA.groups);
        setBreadcrumbs([...breadcrumbs, { level: 'code', name: element.name }]);
      }
      
      setSelectedElement(null);
      setIsTransitioning(false);
    }, 300);
  };

  const navigateToBreadcrumb = (index: number) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      const targetLevel = breadcrumbs[index].level as 'context' | 'container' | 'component' | 'code';
      setC4Level(targetLevel);
      
      if (targetLevel === 'context') {
        setArchElements(C4_CONTEXT_DATA.elements);
        setConnections(C4_CONTEXT_DATA.connections);
        setArchGroups(C4_CONTEXT_DATA.groups);
      } else if (targetLevel === 'container') {
        setArchElements(C4_CONTAINER_DATA.elements);
        setConnections(C4_CONTAINER_DATA.connections);
        setArchGroups(C4_CONTAINER_DATA.groups);
      } else if (targetLevel === 'component') {
        setArchElements(C4_COMPONENT_DATA.elements);
        setConnections(C4_COMPONENT_DATA.connections);
        setArchGroups(C4_COMPONENT_DATA.groups);
      } else if (targetLevel === 'code') {
        setArchElements(C4_CODE_DATA.elements);
        setConnections(C4_CODE_DATA.connections);
        setArchGroups(C4_CODE_DATA.groups);
      }
      
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      setSelectedElement(null);
      setIsTransitioning(false);
    }, 300);
  };

  const switchC4Level = (level: 'context' | 'container' | 'component' | 'code') => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setC4Level(level);
      
      if (level === 'context') {
        setArchElements(C4_CONTEXT_DATA.elements);
        setConnections(C4_CONTEXT_DATA.connections);
        setArchGroups(C4_CONTEXT_DATA.groups);
        setBreadcrumbs([{ level: 'context', name: 'System Context' }]);
      } else if (level === 'container') {
        setArchElements(C4_CONTAINER_DATA.elements);
        setConnections(C4_CONTAINER_DATA.connections);
        setArchGroups(C4_CONTAINER_DATA.groups);
        setBreadcrumbs([
          { level: 'context', name: 'System Context' },
          { level: 'container', name: 'E-Commerce System' }
        ]);
      } else if (level === 'component') {
        setArchElements(C4_COMPONENT_DATA.elements);
        setConnections(C4_COMPONENT_DATA.connections);
        setArchGroups(C4_COMPONENT_DATA.groups);
        setBreadcrumbs([
          { level: 'context', name: 'System Context' },
          { level: 'container', name: 'E-Commerce System' },
          { level: 'component', name: 'Order Service' }
        ]);
      } else if (level === 'code') {
        setArchElements(C4_CODE_DATA.elements);
        setConnections(C4_CODE_DATA.connections);
        setArchGroups(C4_CODE_DATA.groups);
        setBreadcrumbs([
          { level: 'context', name: 'System Context' },
          { level: 'container', name: 'E-Commerce System' },
          { level: 'component', name: 'Order Service' },
          { level: 'code', name: 'Order Processor' }
        ]);
      }
      
      setSelectedElement(null);
      setIsTransitioning(false);
    }, 300);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement.id);
      }
      if (e.key === 'Escape') {
        setIsDrawingConnection(false);
        setConnectionStart(null);
        setSelectedElement(null);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        }
        if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
        if (e.key === 'd' && selectedElement) {
          e.preventDefault();
          duplicateElement();
        }
        if (e.key === 'g') {
          e.preventDefault();
          setGridEnabled(prev => !prev);
        }
        if (e.key === 'a') {
          e.preventDefault();
          setIsAddElementDialogOpen(true);
        }
      }
      if (e.key === '+' || e.key === '=') {
        setZoom(prev => Math.min(prev + 10, 200));
      }
      if (e.key === '-') {
        setZoom(prev => Math.max(prev - 10, 50));
      }
      if (e.key === '0') {
        setZoom(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, historyIndex]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <Icon name="Blocks" size={20} className="text-purple-400" />
            <h1 className="font-semibold">Architecture Studio</h1>
          </div>
          <div className="flex items-center gap-1 ml-4 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <Icon name="ChevronRight" size={14} className="text-muted-foreground" />}
                <button
                  className="px-2 py-1 rounded hover:bg-accent transition-colors"
                  onClick={() => navigateToBreadcrumb(index)}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsAddGroupDialogOpen(true)}>
            <Icon name="FolderPlus" size={16} className="mr-2" />
            Add Group
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsDrawingConnection(true)}>
            <Icon name="GitBranch" size={16} className="mr-2" />
            Connect
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExportDialogOpen(true)}>
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}>
              <Icon name="Undo" size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Icon name="Redo" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* C4 Level Toolbar */}
      <div className="h-12 border-b border-border flex items-center gap-2 px-4 bg-sidebar">
        <span className="text-sm font-medium text-muted-foreground">C4 Model:</span>
        {C4_LEVELS.map((level) => (
          <Button
            key={level.id}
            variant={c4Level === level.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchC4Level(level.id as any)}
            className={c4Level === level.id ? 'bg-primary' : ''}
          >
            <Icon name={level.icon as any} size={14} className="mr-2" />
            {level.name}
          </Button>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={gridEnabled ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setGridEnabled(!gridEnabled)}
          >
            <Icon name="Grid3x3" size={14} className="mr-2" />
            Grid
          </Button>
          <Button
            variant={showConnectionLines ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowConnectionLines(!showConnectionLines)}
          >
            <Icon name="GitBranch" size={14} className="mr-2" />
            Connections
          </Button>
          <Button
            variant={showGroups ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowGroups(!showGroups)}
          >
            <Icon name="Layers" size={14} className="mr-2" />
            Groups
          </Button>
          <Button
            variant={snapToGrid ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            <Icon name="Magnet" size={14} className="mr-2" />
            Snap
          </Button>
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(zoom - 10, 50))}>
              <Icon name="ZoomOut" size={16} />
            </Button>
            <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(zoom + 10, 200))}>
              <Icon name="ZoomIn" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ArchitectureSidebar
          setNewElementType={setNewElementType}
          setIsAddElementDialogOpen={setIsAddElementDialogOpen}
        />

        <ArchitectureCanvas
          archElements={archElements}
          archGroups={archGroups}
          connections={connections}
          selectedElement={selectedElement}
          selectedGroup={selectedGroup}
          c4Level={c4Level}
          zoom={zoom}
          gridEnabled={gridEnabled}
          showConnectionLines={showConnectionLines}
          showGroups={showGroups}
          isTransitioning={isTransitioning}
          draggingElement={draggingElement}
          draggingGroup={draggingGroup}
          resizingGroup={resizingGroup}
          isDrawingConnection={isDrawingConnection}
          connectionStart={connectionStart}
          isDragging={isDragging}
          hoveredConnection={hoveredConnection}
          GRID_SIZE={GRID_SIZE}
          getIconForType={getIconForType}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleElementClick={handleElementClick}
          handleElementDoubleClick={handleElementDoubleClick}
          deleteElement={deleteElement}
          deleteGroup={deleteGroup}
          setSelectedGroup={setSelectedGroup}
          setDraggingGroup={setDraggingGroup}
          setResizingGroup={setResizingGroup}
          setDragOffset={setDragOffset}
          setHoveredConnection={setHoveredConnection}
          setSelectedElement={setSelectedElement}
          getElementById={getElementById}
        />

        <ArchitectureProperties
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedElement={selectedElement}
          c4Level={c4Level}
          archElements={archElements}
          archGroups={archGroups}
          connections={connections}
          getIconForType={getIconForType}
          updateElement={updateElement}
          deleteElement={deleteElement}
          assignElementToGroup={assignElementToGroup}
          drillDown={drillDown}
          getElementById={getElementById}
          setConnections={setConnections}
        />
      </div>

      {/* Dialogs */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать связь</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>От элемента</Label>
                <Select
                  value={newConnectionData.from.toString()}
                  onValueChange={(val) => setNewConnectionData({ ...newConnectionData, from: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {archElements.map(el => (
                      <SelectItem key={el.id} value={el.id.toString()}>{el.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>К элементу</Label>
                <Select
                  value={newConnectionData.to.toString()}
                  onValueChange={(val) => setNewConnectionData({ ...newConnectionData, to: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {archElements.map(el => (
                      <SelectItem key={el.id} value={el.id.toString()}>{el.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Протокол</Label>
              <Input
                value={newConnectionData.protocol}
                onChange={(e) => setNewConnectionData({ ...newConnectionData, protocol: e.target.value })}
                placeholder="REST, gRPC, HTTPS..."
              />
            </div>
            <div>
              <Label>Тип связи</Label>
              <RadioGroup
                value={newConnectionData.type}
                onValueChange={(val) => setNewConnectionData({ ...newConnectionData, type: val as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sync" id="sync" />
                  <Label htmlFor="sync">Синхронная</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="async" id="async" />
                  <Label htmlFor="async">Асинхронная</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="data" id="data" />
                  <Label htmlFor="data">Данные</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={newConnectionData.description}
                onChange={(e) => setNewConnectionData({ ...newConnectionData, description: e.target.value })}
                placeholder="Краткое описание связи"
              />
            </div>
            <Button onClick={addConnection} className="w-full">
              Создать связь
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddElementDialogOpen} onOpenChange={setIsAddElementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить элемент</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Тип элемента</Label>
              <Select value={newElementType} onValueChange={setNewElementType}>
                <SelectTrigger>
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
                placeholder="Название элемента"
              />
            </div>
            <div>
              <Label>Технологический стек</Label>
              <Input
                value={newElementTech}
                onChange={(e) => setNewElementTech(e.target.value)}
                placeholder="React, Java, PostgreSQL..."
              />
            </div>
            <div>
              <Label>Уровень</Label>
              <Select value={newElementLayer} onValueChange={(val: any) => setNewElementLayer(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addElement} className="w-full">
              Добавить элемент
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить группу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Выберите шаблон</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {GROUP_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === index ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedPreset(index);
                      setNewGroupName(preset.name);
                      setNewGroupColor(preset.color);
                    }}
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: preset.color }}
                    />
                    <p className="text-xs font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Название группы</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Название группы"
              />
            </div>
            <div>
              <Label>Цвет</Label>
              <Input
                type="color"
                value={newGroupColor}
                onChange={(e) => setNewGroupColor(e.target.value)}
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Краткое описание группы"
              />
            </div>
            <Button onClick={addGroup} className="w-full">
              Создать группу
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Экспорт диаграммы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Icon name="FileJson" size={32} />
                <span>JSON</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Icon name="FileImage" size={32} />
                <span>PNG</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Icon name="FileCode" size={32} />
                <span>SVG</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Icon name="FileText" size={32} />
                <span>Mermaid</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}