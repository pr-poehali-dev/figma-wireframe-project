import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ArchElement, ArchConnection, ArchGroup } from './ArchitectureStudio';

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

interface ArchitecturePropertiesProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElement: ArchElement | null;
  c4Level: string;
  archElements: ArchElement[];
  archGroups: ArchGroup[];
  connections: ArchConnection[];
  getIconForType: (type: string) => string;
  updateElement: (id: number, updates: Partial<ArchElement>) => void;
  deleteElement: (id: number) => void;
  assignElementToGroup: (elementId: number, groupId: number | undefined) => void;
  drillDown: (element: ArchElement) => void;
  getElementById: (id: number) => ArchElement | undefined;
  setConnections: (fn: (prev: ArchConnection[]) => ArchConnection[]) => void;
}

export default function ArchitectureProperties({
  activeTab,
  setActiveTab,
  selectedElement,
  c4Level,
  archElements,
  archGroups,
  connections,
  getIconForType,
  updateElement,
  deleteElement,
  assignElementToGroup,
  drillDown,
  getElementById,
  setConnections,
}: ArchitecturePropertiesProps) {
  return (
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
                
                {((c4Level === 'context' && selectedElement.id === 100) || 
                  (c4Level === 'container' && (selectedElement.type === 'microservice' || selectedElement.type === 'api-gateway')) ||
                  (c4Level === 'component' && selectedElement.type === 'serverless')) && (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                    size="sm"
                    onClick={() => drillDown(selectedElement)}
                  >
                    <Icon name="ZoomIn" size={14} className="mr-2" />
                    Drill Down ({c4Level === 'context' ? 'Container' : c4Level === 'container' ? 'Component' : 'Code'} Level)
                  </Button>
                )}
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
  );
}