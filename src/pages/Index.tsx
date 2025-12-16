import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const stages = [
  { id: 1, name: 'Vision', icon: 'Lightbulb', color: 'text-yellow-400' },
  { id: 2, name: 'Требования', icon: 'FileText', color: 'text-purple-400' },
  { id: 3, name: 'Архитектура', icon: 'Box', color: 'text-blue-400' },
  { id: 4, name: 'API Design', icon: 'Network', color: 'text-green-400' },
  { id: 5, name: 'Документация', icon: 'BookOpen', color: 'text-orange-400' },
];

const mockUserStories = [
  { id: 1, role: 'Product Manager', action: 'создать User Story', benefit: 'управлять требованиями', priority: 'Must', epic: 'Управление требованиями' },
  { id: 2, role: 'Architect', action: 'построить C4 диаграмму', benefit: 'визуализировать архитектуру', priority: 'Should', epic: 'Архитектура системы' },
  { id: 3, role: 'Developer', action: 'просмотреть API эндпоинты', benefit: 'понимать интерфейсы', priority: 'Must', epic: 'API Design' },
];

const architectureElements = [
  { id: 1, type: 'Пользователь', name: 'Web Client', x: 50, y: 100 },
  { id: 2, type: 'Система', name: 'Project Platform', x: 250, y: 100 },
  { id: 3, type: 'База данных', name: 'PostgreSQL', x: 250, y: 300 },
  { id: 4, type: 'Внешняя система', name: 'Auth Service', x: 450, y: 100 },
];

export default function Index() {
  const [currentStage, setCurrentStage] = useState(2);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState('context');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Icon name="Rocket" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Project Pipeline</h1>
                  <p className="text-sm text-muted-foreground">Платформа управления разработкой</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                <Icon name="Users" size={14} className="mr-1" />
                5 участников
              </Badge>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                <Icon name="Sparkles" size={16} className="mr-2" />
                AI Assist
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Прогресс проекта</span>
              <span className="text-sm font-medium">{Math.round((currentStage / stages.length) * 100)}%</span>
            </div>
            <Progress value={(currentStage / stages.length) * 100} className="h-2" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-border bg-sidebar min-h-[calc(100vh-140px)] sticky top-[140px]">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Pipeline этапов</h2>
            <div className="space-y-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStage(stage.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentStage === stage.id
                      ? 'bg-sidebar-accent text-foreground shadow-lg scale-105'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                  }`}
                >
                  <div className={`${currentStage === stage.id ? stage.color : ''}`}>
                    <Icon name={stage.icon as any} size={20} />
                  </div>
                  <span className="font-medium">{stage.name}</span>
                  {stage.id < currentStage && (
                    <Icon name="CheckCircle2" size={16} className="ml-auto text-green-400" />
                  )}
                  {stage.id === currentStage && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {currentStage === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Vision & Goals</h2>
                <Card className="p-6">
                  <p className="text-muted-foreground">Определение видения проекта и ключевых целей...</p>
                </Card>
              </div>
            )}

            {currentStage === 2 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">User Stories & Требования</h2>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                        <Icon name="Plus" size={18} className="mr-2" />
                        Создать User Story
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Новая User Story</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label>Как (роль/персона)</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите роль" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pm">Product Manager</SelectItem>
                              <SelectItem value="dev">Developer</SelectItem>
                              <SelectItem value="architect">Architect</SelectItem>
                              <SelectItem value="user">End User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Я хочу (действие/цель)</Label>
                          <Input placeholder="Например: создать User Story" />
                        </div>

                        <div className="space-y-2">
                          <Label>Чтобы (выгода/ценность)</Label>
                          <Textarea placeholder="Например: управлять требованиями проекта" />
                        </div>

                        <div className="space-y-2">
                          <Label>Приоритет (MoSCoW)</Label>
                          <RadioGroup defaultValue="must">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="must" id="must" />
                              <Label htmlFor="must" className="font-normal cursor-pointer">
                                Must have - Критичная функциональность
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="should" id="should" />
                              <Label htmlFor="should" className="font-normal cursor-pointer">
                                Should have - Важная функциональность
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="could" id="could" />
                              <Label htmlFor="could" className="font-normal cursor-pointer">
                                Could have - Желательная функциональность
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wont" id="wont" />
                              <Label htmlFor="wont" className="font-normal cursor-pointer">
                                Won't have - Не в этой итерации
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Привязать к Epic</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите Epic" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="requirements">Управление требованиями</SelectItem>
                              <SelectItem value="architecture">Архитектура системы</SelectItem>
                              <SelectItem value="api">API Design</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Критерии приемки (Acceptance Criteria)</Label>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <Input placeholder="Дано (Given)" />
                              <Input placeholder="Когда (When)" />
                              <Input placeholder="Тогда (Then)" />
                            </div>
                            <Button variant="outline" size="sm">
                              <Icon name="Plus" size={14} className="mr-2" />
                              Добавить критерий
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                            Сохранить
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {mockUserStories.map((story) => (
                    <Card key={story.id} className="p-6 hover-scale cursor-pointer transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={story.priority === 'Must' ? 'default' : 'secondary'}>
                              {story.priority}
                            </Badge>
                            <Badge variant="outline">{story.epic}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            Как <span className="text-purple-400">{story.role}</span>, я хочу{' '}
                            <span className="text-blue-400">{story.action}</span>
                          </h3>
                          <p className="text-muted-foreground">
                            Чтобы {story.benefit}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Icon name="MessageSquare" size={18} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStage === 3 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">C4 Model - Архитектурный конструктор</h2>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Icon name="Download" size={18} className="mr-2" />
                      Экспорт
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить элемент
                    </Button>
                  </div>
                </div>

                <Tabs value={selectedCanvas} onValueChange={setSelectedCanvas} className="mb-6">
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="context">Контекст</TabsTrigger>
                    <TabsTrigger value="container">Контейнеры</TabsTrigger>
                    <TabsTrigger value="component">Компоненты</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-4 gap-6">
                  <Card className="col-span-3 p-6 min-h-[600px] bg-gradient-to-br from-card to-muted/20">
                    <div className="relative h-full border-2 border-dashed border-border/50 rounded-lg p-8">
                      {architectureElements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute bg-card border-2 border-purple-500/50 rounded-lg p-4 shadow-lg hover:shadow-purple-500/20 transition-all cursor-move hover-scale"
                          style={{ left: element.x, top: element.y, width: '160px' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name={element.type === 'Пользователь' ? 'User' : element.type === 'Система' ? 'Box' : element.type === 'База данных' ? 'Database' : 'Globe'} size={20} className="text-purple-400" />
                            <span className="text-xs text-muted-foreground">{element.type}</span>
                          </div>
                          <h4 className="font-semibold">{element.name}</h4>
                        </div>
                      ))}
                      
                      <svg className="absolute inset-0 pointer-events-none">
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--purple))" />
                          </marker>
                        </defs>
                        <line x1="130" y1="120" x2="250" y2="120" stroke="hsl(var(--purple))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        <line x1="330" y1="140" x2="330" y2="300" stroke="hsl(var(--purple))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        <line x1="370" y1="120" x2="450" y2="120" stroke="hsl(var(--purple))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      </svg>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Палитра элементов</h3>
                    <div className="space-y-2">
                      {['Система', 'Пользователь', 'Внешняя система', 'База данных', 'Микросервис'].map((type) => (
                        <button
                          key={type}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                        >
                          <Icon name={type === 'Пользователь' ? 'User' : type === 'База данных' ? 'Database' : 'Box'} size={18} className="text-blue-400" />
                          <span className="text-sm">{type}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
