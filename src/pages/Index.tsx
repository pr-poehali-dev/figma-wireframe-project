import { useState, useRef, useEffect } from 'react';
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

const API_URL = 'https://functions.poehali.dev/6db0a9fb-acd7-4567-b47a-1faad9a0ae24';

interface UserStory {
  id: number;
  role: string;
  action: string;
  benefit: string;
  priority: string;
  epic: string;
  business_value?: number;
  story_points?: number;
}

interface UseCase {
  id: number;
  story_id: number;
  title: string;
  type: 'primary' | 'alternative' | 'exceptional';
  preconditions: string[];
  postconditions: string[];
}

interface UseCaseStep {
  id: number;
  use_case_id: number;
  step_number: number;
  user_action: string;
  system_response: string;
  api_endpoint: string;
}

interface AcceptanceCriteria {
  id: number;
  story_id: number;
  given: string;
  when: string;
  then: string;
}

interface ArchElement {
  id: number;
  type: string;
  name: string;
  x: number;
  y: number;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

interface VisionData {
  vision: string;
  target_audience: string;
  value_proposition: string;
  timeline: string;
  budget: string;
  success_metric: string;
}

interface OKR {
  id: number;
  objective: string;
  key_results: string[];
}



export default function Index() {
  const [currentStage, setCurrentStage] = useState(2);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isArchDialogOpen, setIsArchDialogOpen] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState('context');
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [archElements, setArchElements] = useState<ArchElement[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [newStory, setNewStory] = useState({ 
    role: '', 
    action: '', 
    benefit: '', 
    priority: 'must', 
    epic: '',
    business_value: 5,
    story_points: 3
  });
  const [newElement, setNewElement] = useState({ type: 'Система', name: '' });
  const [activeTab, setActiveTab] = useState('basic');
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [useCaseSteps, setUseCaseSteps] = useState<UseCaseStep[]>([]);
  const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);
  const [isUseCaseDialogOpen, setIsUseCaseDialogOpen] = useState(false);
  const [newUseCase, setNewUseCase] = useState({
    title: '',
    type: 'primary' as 'primary' | 'alternative' | 'exceptional',
    preconditions: [''],
    postconditions: ['']
  });
  const [personas, setPersonas] = useState(['Покупатель', 'Администратор', 'Менеджер']);
  const [visionData, setVisionData] = useState<VisionData>({
    vision: '',
    target_audience: '',
    value_proposition: '',
    timeline: '6 месяцев',
    budget: '$50k',
    success_metric: '1000+'
  });
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [isOkrDialogOpen, setIsOkrDialogOpen] = useState(false);
  const [newOkr, setNewOkr] = useState({ objective: '', key_results: ['', '', ''] });
  const [apiEndpoints, setApiEndpoints] = useState<string[]>([
    'POST /api/cart/add',
    'DELETE /api/cart/remove',
    'GET /api/cart',
    'POST /api/orders/create',
    'GET /api/products',
    'POST /api/auth/login',
    'GET /api/user/profile'
  ]);
  const [isAddEndpointDialogOpen, setIsAddEndpointDialogOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ method: 'GET', path: '' });
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadVisionData();
    loadOKRs();
    loadUserStories();
    loadArchElements();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visionData.vision || visionData.target_audience || visionData.value_proposition) {
        saveVisionData();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [visionData]);

  useEffect(() => {
    if (selectedStoryId) {
      loadComments(selectedStoryId);
    }
  }, [selectedStoryId]);

  const loadVisionData = async () => {
    try {
      const response = await fetch(`${API_URL}?action=vision`);
      const data = await response.json();
      if (data.vision) {
        setVisionData(data);
      }
    } catch (error) {
      console.error('Error loading vision:', error);
    }
  };

  const loadOKRs = async () => {
    try {
      const response = await fetch(`${API_URL}?action=okrs`);
      const data = await response.json();
      setOkrs(data);
    } catch (error) {
      console.error('Error loading OKRs:', error);
    }
  };

  const saveVisionData = async () => {
    try {
      await fetch(`${API_URL}?action=vision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionData),
      });
    } catch (error) {
      console.error('Error saving vision:', error);
    }
  };

  const loadUserStories = async () => {
    try {
      const response = await fetch(`${API_URL}?action=stories`);
      const data = await response.json();
      setUserStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArchElements = async () => {
    try {
      const response = await fetch(`${API_URL}?action=arch-elements`);
      const data = await response.json();
      setArchElements(data);
    } catch (error) {
      console.error('Error loading arch elements:', error);
    }
  };

  const loadComments = async (storyId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=comments&story_id=${storyId}`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [storyId]: data.map((c: any) => ({ ...c, timestamp: c.created_at })) }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const saveElementPosition = async (id: number, x: number, y: number) => {
    try {
      await fetch(`${API_URL}?action=arch-elements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, x, y }),
      });
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    const element = archElements.find(el => el.id === id);
    if (!element) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    setArchElements(prev => 
      prev.map(el => 
        el.id === draggingId 
          ? { ...el, x: Math.max(0, Math.min(newX, rect.width - 160)), y: Math.max(0, Math.min(newY, rect.height - 100)) }
          : el
      )
    );
  };

  const handleMouseUp = () => {
    if (draggingId !== null) {
      const element = archElements.find(el => el.id === draggingId);
      if (element) {
        saveElementPosition(element.id, element.x, element.y);
      }
    }
    setDraggingId(null);
  };

  const addComment = async (storyId: number) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}?action=comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, author: 'Текущий пользователь', text: newComment }),
      });
      const newCommentData = await response.json();
      
      setComments(prev => ({
        ...prev,
        [storyId]: [...(prev[storyId] || []), { ...newCommentData, timestamp: newCommentData.created_at }],
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const createUserStory = async () => {
    if (!newStory.role || !newStory.action || !newStory.benefit) return;

    try {
      const response = await fetch(`${API_URL}?action=stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      });
      const createdStory = await response.json();
      setUserStories(prev => [createdStory, ...prev]);
      setNewStory({ 
        role: '', 
        action: '', 
        benefit: '', 
        priority: 'must', 
        epic: '',
        business_value: 5,
        story_points: 3
      });
      setActiveTab('basic');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const createArchElement = async () => {
    if (!newElement.name) return;

    try {
      const response = await fetch(`${API_URL}?action=arch-elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newElement, x: 100, y: 100 }),
      });
      const createdElement = await response.json();
      setArchElements(prev => [...prev, createdElement]);
      setNewElement({ type: 'Система', name: '' });
      setIsArchDialogOpen(false);
    } catch (error) {
      console.error('Error creating element:', error);
    }
  };

  const createOkr = async () => {
    const filteredKeyResults = newOkr.key_results.filter(kr => kr.trim() !== '');
    if (!newOkr.objective || filteredKeyResults.length === 0) return;

    try {
      const response = await fetch(`${API_URL}?action=okrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          objective: newOkr.objective, 
          key_results: filteredKeyResults 
        }),
      });
      const createdOkr = await response.json();
      setOkrs(prev => [...prev, createdOkr]);
      setNewOkr({ objective: '', key_results: ['', '', ''] });
      setIsOkrDialogOpen(false);
    } catch (error) {
      console.error('Error creating OKR:', error);
    }
  };

  const updateOkrInline = (id: number, field: 'objective' | number, value: string) => {
    setOkrs(prev => prev.map(okr => {
      if (okr.id !== id) return okr;
      if (field === 'objective') {
        return { ...okr, objective: value };
      } else {
        const newKeyResults = [...okr.key_results];
        newKeyResults[field] = value;
        return { ...okr, key_results: newKeyResults };
      }
    }));
  };

  const saveOkrChanges = async (okr: OKR) => {
    try {
      await fetch(`${API_URL}?action=okrs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: okr.id, objective: okr.objective, key_results: okr.key_results }),
      });
    } catch (error) {
      console.error('Error updating OKR:', error);
    }
  };

  const deleteOkr = async (id: number) => {
    try {
      await fetch(`${API_URL}?action=okrs&id=${id}`, {
        method: 'DELETE',
      });
      setOkrs(prev => prev.filter(okr => okr.id !== id));
    } catch (error) {
      console.error('Error deleting OKR:', error);
    }
  };

  const generateMermaidCode = (): string => {
    let code = 'sequenceDiagram\n';
    code += '    participant U as Пользователь\n';
    code += '    participant S as Система\n';
    code += '    participant A as API\n\n';

    useCases.forEach(uc => {
      const steps = useCaseSteps
        .filter(s => s.use_case_id === uc.id)
        .sort((a, b) => a.step_number - b.step_number);
      
      if (steps.length > 0) {
        code += `    Note over U,A: ${uc.title}\n`;
        steps.forEach(step => {
          if (step.user_action) {
            code += `    U->>S: ${step.user_action}\n`;
          }
          if (step.api_endpoint) {
            code += `    S->>A: ${step.api_endpoint}\n`;
            code += `    A-->>S: Response\n`;
          }
          if (step.system_response) {
            code += `    S-->>U: ${step.system_response}\n`;
          }
        });
        code += '\n';
      }
    });

    return code;
  };

  const generatePlantUMLCode = (): string => {
    let code = '@startuml\n';
    code += 'actor "Пользователь" as U\n';
    code += 'participant "Система" as S\n';
    code += 'participant "API" as A\n\n';

    useCases.forEach(uc => {
      const steps = useCaseSteps
        .filter(s => s.use_case_id === uc.id)
        .sort((a, b) => a.step_number - b.step_number);
      
      if (steps.length > 0) {
        code += `== ${uc.title} ==\n`;
        steps.forEach(step => {
          if (step.user_action) {
            code += `U -> S: ${step.user_action}\n`;
          }
          if (step.api_endpoint) {
            code += `S -> A: ${step.api_endpoint}\n`;
            code += `A --> S: Response\n`;
          }
          if (step.system_response) {
            code += `S --> U: ${step.system_response}\n`;
          }
        });
        code += '\n';
      }
    });

    code += '@enduml';
    return code;
  };

  const generateGherkinScenarios = (): string => {
    let gherkin = '';

    useCases.forEach((uc, ucIdx) => {
      const steps = useCaseSteps
        .filter(s => s.use_case_id === uc.id)
        .sort((a, b) => a.step_number - b.step_number);
      
      if (steps.length === 0) return;

      gherkin += `Сценарий: ${uc.title}\n`;
      
      // Preconditions as Given
      if (uc.preconditions && uc.preconditions.length > 0) {
        uc.preconditions.forEach((pre, idx) => {
          if (pre.trim()) {
            gherkin += `  ${idx === 0 ? 'Дано' : 'И'}: ${pre}\n`;
          }
        });
      }

      // Steps as When/Then
      steps.forEach((step, idx) => {
        if (step.user_action) {
          gherkin += `  ${idx === 0 ? 'Когда' : 'И'}: ${step.user_action}\n`;
        }
        if (step.system_response) {
          gherkin += `  Тогда: ${step.system_response}\n`;
        }
      });

      // Postconditions as final Then
      if (uc.postconditions && uc.postconditions.length > 0) {
        uc.postconditions.forEach(post => {
          if (post.trim()) {
            gherkin += `  И: ${post}\n`;
          }
        });
      }

      gherkin += '\n';
    });

    return gherkin || 'Добавьте Use Cases и шаги для автогенерации Gherkin сценариев';
  };

  const filteredStories = userStories.filter(story => {
    if (filterPriority !== 'all' && story.priority !== filterPriority) return false;
    if (filterEpic !== 'all' && story.epic !== filterEpic) return false;
    return true;
  });

  const uniqueEpics = Array.from(new Set(userStories.map(s => s.epic).filter(Boolean)));

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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Vision & Goals</h2>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                    onClick={saveVisionData}
                  >
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить Vision
                  </Button>
                </div>

                <div className="grid gap-6">
                  <Card className="p-6 hover-scale transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Icon name="Target" size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Видение проекта</h3>
                        <p className="text-sm text-muted-foreground">Определите главную цель и миссию</p>
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Например: Создать платформу для управления проектами, которая упростит коллаборацию команд разработки..."
                      className="min-h-32 text-base"
                      value={visionData.vision}
                      onChange={(e) => setVisionData(prev => ({ ...prev, vision: e.target.value }))}
                    />
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 hover-scale transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon name="Users" size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Целевая аудитория</h3>
                      </div>
                      <Textarea 
                        placeholder="Кто будет использовать продукт?"
                        className="min-h-24"
                        value={visionData.target_audience}
                        onChange={(e) => setVisionData(prev => ({ ...prev, target_audience: e.target.value }))}
                      />
                    </Card>

                    <Card className="p-6 hover-scale transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Icon name="Zap" size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Ценностное предложение</h3>
                      </div>
                      <Textarea 
                        placeholder="Какую уникальную ценность даёт продукт?"
                        className="min-h-24"
                        value={visionData.value_proposition}
                        onChange={(e) => setVisionData(prev => ({ ...prev, value_proposition: e.target.value }))}
                      />
                    </Card>
                  </div>

                  <Card className="p-6 hover-scale transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Icon name="CheckCircle2" size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Ключевые цели (OKR)</h3>
                      </div>
                      <Dialog open={isOkrDialogOpen} onOpenChange={setIsOkrDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Icon name="Plus" size={16} className="mr-2" />
                            Добавить цель
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Новая OKR цель</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Objective (Цель)</Label>
                              <Input 
                                placeholder="Например: Запустить MVP продукта"
                                value={newOkr.objective}
                                onChange={(e) => setNewOkr(prev => ({ ...prev, objective: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Key Results (Ключевые результаты)</Label>
                              {newOkr.key_results.map((kr, idx) => (
                                <Input 
                                  key={idx}
                                  placeholder={`Key Result ${idx + 1}`}
                                  value={kr}
                                  onChange={(e) => {
                                    const newKeyResults = [...newOkr.key_results];
                                    newKeyResults[idx] = e.target.value;
                                    setNewOkr(prev => ({ ...prev, key_results: newKeyResults }));
                                  }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button 
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                                onClick={createOkr}
                              >
                                Создать
                              </Button>
                              <Button variant="outline" className="flex-1" onClick={() => setIsOkrDialogOpen(false)}>
                                Отмена
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="space-y-4">
                      {okrs.map((okr) => (
                        <div key={okr.id} className="border border-border rounded-lg p-4 bg-muted/20 group relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteOkr(okr.id)}
                          >
                            <Icon name="Trash2" size={16} className="text-destructive" />
                          </Button>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon name="Flag" size={18} className="text-yellow-400" />
                            <Input
                              className="font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 flex-1"
                              value={okr.objective}
                              onChange={(e) => updateOkrInline(okr.id, 'objective', e.target.value)}
                              onBlur={() => saveOkrChanges(okr)}
                            />
                          </div>
                          <div className="space-y-2 ml-6">
                            {okr.key_results.map((kr, krIdx) => (
                              <div key={krIdx} className="flex items-center gap-2">
                                <Icon name="CircleDot" size={14} className="text-blue-400" />
                                <Input
                                  className="text-sm bg-transparent border-none p-0 h-auto focus-visible:ring-0 flex-1"
                                  value={kr}
                                  onChange={(e) => updateOkrInline(okr.id, krIdx, e.target.value)}
                                  onBlur={() => saveOkrChanges(okr)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center hover-scale transition-all">
                      <Icon name="Calendar" size={32} className="mx-auto mb-2 text-orange-400" />
                      <h4 className="font-semibold mb-1">Timeline</h4>
                      <Input 
                        className="text-2xl font-bold text-purple-400 text-center border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        value={visionData.timeline}
                        onChange={(e) => setVisionData(prev => ({ ...prev, timeline: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">до запуска MVP</p>
                    </Card>

                    <Card className="p-4 text-center hover-scale transition-all">
                      <Icon name="DollarSign" size={32} className="mx-auto mb-2 text-green-400" />
                      <h4 className="font-semibold mb-1">Бюджет</h4>
                      <Input 
                        className="text-2xl font-bold text-purple-400 text-center border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        value={visionData.budget}
                        onChange={(e) => setVisionData(prev => ({ ...prev, budget: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">начальные инвестиции</p>
                    </Card>

                    <Card className="p-4 text-center hover-scale transition-all">
                      <Icon name="TrendingUp" size={32} className="mx-auto mb-2 text-blue-400" />
                      <h4 className="font-semibold mb-1">Метрика успеха</h4>
                      <Input 
                        className="text-2xl font-bold text-purple-400 text-center border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        value={visionData.success_metric}
                        onChange={(e) => setVisionData(prev => ({ ...prev, success_metric: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">активных пользователей</p>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {currentStage === 2 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">User Stories & Требования</h2>
                  <div className="flex gap-3">
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Приоритет" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="Must">Must</SelectItem>
                        <SelectItem value="Should">Should</SelectItem>
                        <SelectItem value="Could">Could</SelectItem>
                        <SelectItem value="Wont">Won't</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterEpic} onValueChange={setFilterEpic}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Epic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все Epic</SelectItem>
                        {uniqueEpics.map(epic => (
                          <SelectItem key={epic} value={epic}>{epic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                          <Icon name="Plus" size={18} className="mr-2" />
                          Создать User Story
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Создание User Story с Use Cases</DialogTitle>
                      </DialogHeader>
                      
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="basic">Основные данные</TabsTrigger>
                          <TabsTrigger value="usecases">Use Cases</TabsTrigger>
                          <TabsTrigger value="diagram">Диаграмма</TabsTrigger>
                          <TabsTrigger value="acceptance">Критерии приемки</TabsTrigger>
                          <TabsTrigger value="relations">Связи</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6 py-4">
                          <Card className="p-4 bg-muted/20">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                              <Icon name="User" size={18} className="text-purple-400" />
                              Секция A: Формат User Story
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <Label>Как (As a...)</Label>
                                <Select value={newStory.role} onValueChange={(value) => setNewStory(prev => ({ ...prev, role: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите роль" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {personas.map(p => (
                                      <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                    <SelectItem value="__new__">+ Создать нового персонажа</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Я хочу (I want...)</Label>
                                <Input 
                                  placeholder="управлять элементами корзины покупок" 
                                  value={newStory.action}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, action: e.target.value }))}
                                />
                              </div>

                              <div>
                                <Label>Чтобы (So that...)</Label>
                                <Textarea 
                                  placeholder="легко добавлять/удалять товары перед заказом" 
                                  value={newStory.benefit}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, benefit: e.target.value }))}
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4 bg-muted/20">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                              <Icon name="Settings" size={18} className="text-blue-400" />
                              Секция B: Метаданные
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <Label className="mb-3 block">Приоритет (MoSCoW)</Label>
                                <RadioGroup 
                                  value={newStory.priority} 
                                  onValueChange={(value) => setNewStory(prev => ({ ...prev, priority: value }))}
                                  className="flex gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="must" id="must" />
                                    <Label htmlFor="must" className="font-normal cursor-pointer">Must</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="should" id="should" />
                                    <Label htmlFor="should" className="font-normal cursor-pointer">Should</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="could" id="could" />
                                    <Label htmlFor="could" className="font-normal cursor-pointer">Could</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="wont" id="wont" />
                                    <Label htmlFor="wont" className="font-normal cursor-pointer">Won't</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <div>
                                <Label>Epic</Label>
                                <Input 
                                  placeholder="Управление заказами" 
                                  value={newStory.epic}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, epic: e.target.value }))}
                                />
                              </div>

                              <div>
                                <Label>Бизнес-ценность (1-10): {newStory.business_value}</Label>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="10" 
                                  value={newStory.business_value}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, business_value: parseInt(e.target.value) }))}
                                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                              </div>

                              <div>
                                <Label>Сложность (Story Points)</Label>
                                <div className="flex gap-2 mt-2">
                                  {[1, 2, 3, 5, 8, 13].map(points => (
                                    <button
                                      key={points}
                                      onClick={() => setNewStory(prev => ({ ...prev, story_points: points }))}
                                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                        newStory.story_points === points
                                          ? 'border-purple-500 bg-purple-500/20 font-bold'
                                          : 'border-border hover:border-purple-400'
                                      }`}
                                    >
                                      {points}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </TabsContent>

                        <TabsContent value="usecases" className="space-y-4 py-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Динамический список сценариев</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setIsUseCaseDialogOpen(true)}
                            >
                              <Icon name="Plus" size={16} className="mr-2" />
                              Добавить Use Case
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {useCases.length === 0 ? (
                              <Card className="p-8 text-center text-muted-foreground">
                                <Icon name="FileQuestion" size={48} className="mx-auto mb-3 opacity-50" />
                                <p>Пока нет Use Cases</p>
                                <p className="text-sm">Добавьте первый сценарий использования</p>
                              </Card>
                            ) : (
                              useCases.map((uc, idx) => (
                                <Card key={uc.id} className="p-4 hover-scale">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Icon name="ListChecks" size={20} className="text-blue-400" />
                                      <div>
                                        <h4 className="font-semibold">Use Case #{idx + 1}: {uc.title}</h4>
                                        <Badge variant={uc.type === 'primary' ? 'default' : 'secondary'} className="text-xs mt-1">
                                          {uc.type === 'primary' ? 'Основной' : uc.type === 'alternative' ? 'Альтернативный' : 'Исключительный'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => setEditingUseCase(uc)}>
                                        <Icon name="Edit" size={16} />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setUseCases(prev => prev.filter(u => u.id !== uc.id))}
                                      >
                                        <Icon name="Trash2" size={16} className="text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {editingUseCase?.id === uc.id && (
                                    <div className="mt-4 p-4 border border-border rounded-lg bg-muted/20 space-y-4 animate-fade-in">
                                      <div>
                                        <Label>Название Use Case</Label>
                                        <Input value={editingUseCase.title} onChange={(e) => setEditingUseCase({...editingUseCase, title: e.target.value})} />
                                      </div>
                                      
                                      <div>
                                        <Label>Тип</Label>
                                        <RadioGroup value={editingUseCase.type} onValueChange={(v: any) => setEditingUseCase({...editingUseCase, type: v})} className="flex gap-4 mt-2">
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="primary" id="primary" />
                                            <Label htmlFor="primary" className="font-normal">Основной</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="alternative" id="alternative" />
                                            <Label htmlFor="alternative" className="font-normal">Альтернативный</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="exceptional" id="exceptional" />
                                            <Label htmlFor="exceptional" className="font-normal">Исключительный</Label>
                                          </div>
                                        </RadioGroup>
                                      </div>

                                      <div>
                                        <Label>Предусловия</Label>
                                        {editingUseCase.preconditions.map((pre, idx) => (
                                          <div key={idx} className="flex gap-2 mt-2">
                                            <input type="checkbox" defaultChecked className="rounded mt-1" />
                                            <Input value={pre} onChange={(e) => {
                                              const newPre = [...editingUseCase.preconditions];
                                              newPre[idx] = e.target.value;
                                              setEditingUseCase({...editingUseCase, preconditions: newPre});
                                            }} />
                                          </div>
                                        ))}
                                      </div>

                                      <div>
                                        <Label>Постусловия</Label>
                                        {editingUseCase.postconditions.map((post, idx) => (
                                          <div key={idx} className="flex gap-2 mt-2">
                                            <input type="checkbox" defaultChecked className="rounded mt-1" />
                                            <Input value={post} onChange={(e) => {
                                              const newPost = [...editingUseCase.postconditions];
                                              newPost[idx] = e.target.value;
                                              setEditingUseCase({...editingUseCase, postconditions: newPost});
                                            }} />
                                          </div>
                                        ))}
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between mb-3">
                                          <Label className="text-base">Таблица шагов Use Case</Label>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                              const currentSteps = useCaseSteps.filter(s => s.use_case_id === editingUseCase.id);
                                              setUseCaseSteps(prev => [...prev, {
                                                id: Date.now(),
                                                use_case_id: editingUseCase.id,
                                                step_number: currentSteps.length + 1,
                                                user_action: '',
                                                system_response: '',
                                                api_endpoint: ''
                                              }]);
                                            }}
                                          >
                                            <Icon name="Plus" size={14} className="mr-1" />
                                            Добавить шаг
                                          </Button>
                                        </div>
                                        
                                        <div className="border border-border rounded-lg overflow-hidden">
                                          <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                              <tr>
                                                <th className="p-2 text-left w-12">#</th>
                                                <th className="p-2 text-left">Действие пользователя</th>
                                                <th className="p-2 text-left">Ответ системы</th>
                                                <th className="p-2 text-left w-48">API Endpoint</th>
                                                <th className="p-2 w-20"></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {useCaseSteps
                                                .filter(step => step.use_case_id === editingUseCase.id)
                                                .sort((a, b) => a.step_number - b.step_number)
                                                .map((step, stepIdx) => (
                                                <tr key={step.id} className="border-t border-border hover:bg-muted/20">
                                                  <td className="p-2 text-center text-muted-foreground">{step.step_number}</td>
                                                  <td className="p-2">
                                                    <Input 
                                                      placeholder="Пользователь нажимает 'Добавить'"
                                                      value={step.user_action}
                                                      onChange={(e) => {
                                                        setUseCaseSteps(prev => prev.map(s => 
                                                          s.id === step.id ? {...s, user_action: e.target.value} : s
                                                        ));
                                                      }}
                                                      className="h-8 text-sm"
                                                    />
                                                  </td>
                                                  <td className="p-2">
                                                    <Input 
                                                      placeholder="Система добавляет товар в корзину"
                                                      value={step.system_response}
                                                      onChange={(e) => {
                                                        setUseCaseSteps(prev => prev.map(s => 
                                                          s.id === step.id ? {...s, system_response: e.target.value} : s
                                                        ));
                                                      }}
                                                      className="h-8 text-sm"
                                                    />
                                                  </td>
                                                  <td className="p-2">
                                                    <div className="flex items-center gap-1">
                                                      {editingStepId === step.id ? (
                                                        <div className="flex-1 flex flex-col gap-1">
                                                          <Select 
                                                            value={step.api_endpoint}
                                                            onValueChange={(value) => {
                                                              if (value === '__new__') {
                                                                setIsAddEndpointDialogOpen(true);
                                                              } else {
                                                                setUseCaseSteps(prev => prev.map(s => 
                                                                  s.id === step.id ? {...s, api_endpoint: value} : s
                                                                ));
                                                                setEditingStepId(null);
                                                              }
                                                            }}
                                                          >
                                                            <SelectTrigger className="h-8 text-xs font-mono">
                                                              <SelectValue placeholder="Выберите endpoint" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {apiEndpoints.map(endpoint => (
                                                                <SelectItem key={endpoint} value={endpoint} className="text-xs font-mono">
                                                                  {endpoint}
                                                                </SelectItem>
                                                              ))}
                                                              <SelectItem value="__new__" className="text-xs text-purple-400">
                                                                + Создать новый endpoint
                                                              </SelectItem>
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <button
                                                            onClick={() => setEditingStepId(step.id)}
                                                            className="flex-1 h-8 px-2 text-xs font-mono text-left border border-input rounded-md bg-background hover:bg-accent transition-colors"
                                                          >
                                                            {step.api_endpoint || 'Выбрать endpoint...'}
                                                          </button>
                                                          {step.api_endpoint && (
                                                            <Icon name="CheckCircle2" size={16} className="text-green-400" />
                                                          )}
                                                        </>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="p-2">
                                                    <div className="flex gap-1">
                                                      {stepIdx > 0 && (
                                                        <Button 
                                                          size="icon" 
                                                          variant="ghost" 
                                                          className="h-7 w-7"
                                                          onClick={() => {
                                                            setUseCaseSteps(prev => prev.map(s => {
                                                              if (s.id === step.id) return {...s, step_number: step.step_number - 1};
                                                              if (s.use_case_id === step.use_case_id && s.step_number === step.step_number - 1) {
                                                                return {...s, step_number: s.step_number + 1};
                                                              }
                                                              return s;
                                                            }));
                                                          }}
                                                        >
                                                          <Icon name="ArrowUp" size={14} />
                                                        </Button>
                                                      )}
                                                      {stepIdx < useCaseSteps.filter(s => s.use_case_id === editingUseCase.id).length - 1 && (
                                                        <Button 
                                                          size="icon" 
                                                          variant="ghost" 
                                                          className="h-7 w-7"
                                                          onClick={() => {
                                                            setUseCaseSteps(prev => prev.map(s => {
                                                              if (s.id === step.id) return {...s, step_number: step.step_number + 1};
                                                              if (s.use_case_id === step.use_case_id && s.step_number === step.step_number + 1) {
                                                                return {...s, step_number: s.step_number - 1};
                                                              }
                                                              return s;
                                                            }));
                                                          }}
                                                        >
                                                          <Icon name="ArrowDown" size={14} />
                                                        </Button>
                                                      )}
                                                      <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-7 w-7"
                                                        onClick={() => {
                                                          setUseCaseSteps(prev => {
                                                            const filtered = prev.filter(s => s.id !== step.id);
                                                            return filtered.map(s => 
                                                              s.use_case_id === step.use_case_id && s.step_number > step.step_number
                                                                ? {...s, step_number: s.step_number - 1}
                                                                : s
                                                            );
                                                          });
                                                        }}
                                                      >
                                                        <Icon name="Trash2" size={14} className="text-destructive" />
                                                      </Button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                          {useCaseSteps.filter(s => s.use_case_id === editingUseCase.id).length === 0 && (
                                            <div className="p-8 text-center text-muted-foreground text-sm">
                                              <Icon name="Table" size={32} className="mx-auto mb-2 opacity-50" />
                                              <p>Нет шагов. Добавьте первый шаг Use Case.</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => {
                                          setUseCases(prev => prev.map(u => u.id === editingUseCase.id ? editingUseCase : u));
                                          setEditingUseCase(null);
                                        }}>
                                          Сохранить
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingUseCase(null)}>
                                          Отмена
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              ))
                            )}
                          </div>

                          <Dialog open={isUseCaseDialogOpen} onOpenChange={setIsUseCaseDialogOpen}>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Новый Use Case</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Название Use Case</Label>
                                  <Input 
                                    placeholder="Добавление товара в корзину"
                                    value={newUseCase.title}
                                    onChange={(e) => setNewUseCase(prev => ({...prev, title: e.target.value}))}
                                  />
                                </div>

                                <div>
                                  <Label>Тип</Label>
                                  <RadioGroup value={newUseCase.type} onValueChange={(v: any) => setNewUseCase(prev => ({...prev, type: v}))} className="flex gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="primary" id="uc-primary" />
                                      <Label htmlFor="uc-primary" className="font-normal">Основной</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="alternative" id="uc-alternative" />
                                      <Label htmlFor="uc-alternative" className="font-normal">Альтернативный</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="exceptional" id="uc-exceptional" />
                                      <Label htmlFor="uc-exceptional" className="font-normal">Исключительный</Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                <div className="flex gap-3">
                                  <Button 
                                    className="flex-1"
                                    onClick={() => {
                                      setUseCases(prev => [...prev, {
                                        id: Date.now(),
                                        story_id: 0,
                                        title: newUseCase.title,
                                        type: newUseCase.type,
                                        preconditions: ['Пользователь авторизован'],
                                        postconditions: ['Система обновлена']
                                      }]);
                                      setNewUseCase({title: '', type: 'primary', preconditions: [''], postconditions: ['']});
                                      setIsUseCaseDialogOpen(false);
                                    }}
                                  >
                                    Создать
                                  </Button>
                                  <Button variant="outline" className="flex-1" onClick={() => setIsUseCaseDialogOpen(false)}>
                                    Отмена
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isAddEndpointDialogOpen} onOpenChange={setIsAddEndpointDialogOpen}>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Создать новый API Endpoint</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>HTTP Метод</Label>
                                  <Select value={newEndpoint.method} onValueChange={(value) => setNewEndpoint(prev => ({...prev, method: value}))}>
                                    <SelectTrigger>
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

                                <div>
                                  <Label>Путь</Label>
                                  <Input 
                                    placeholder="/api/resource"
                                    value={newEndpoint.path}
                                    onChange={(e) => setNewEndpoint(prev => ({...prev, path: e.target.value}))}
                                    className="font-mono text-sm"
                                  />
                                </div>

                                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                  <p className="text-xs text-muted-foreground mb-1">Результат:</p>
                                  <p className="font-mono text-sm font-semibold">{newEndpoint.method} {newEndpoint.path || '/api/...'}</p>
                                </div>

                                <div className="flex gap-3">
                                  <Button 
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                                    onClick={() => {
                                      const fullEndpoint = `${newEndpoint.method} ${newEndpoint.path}`;
                                      setApiEndpoints(prev => [...prev, fullEndpoint]);
                                      if (editingStepId) {
                                        setUseCaseSteps(prev => prev.map(s => 
                                          s.id === editingStepId ? {...s, api_endpoint: fullEndpoint} : s
                                        ));
                                        setEditingStepId(null);
                                      }
                                      setNewEndpoint({method: 'GET', path: ''});
                                      setIsAddEndpointDialogOpen(false);
                                    }}
                                    disabled={!newEndpoint.path.trim()}
                                  >
                                    Создать и привязать
                                  </Button>
                                  <Button variant="outline" className="flex-1" onClick={() => {
                                    setIsAddEndpointDialogOpen(false);
                                    setNewEndpoint({method: 'GET', path: ''});
                                  }}>
                                    Отмена
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TabsContent>

                        <TabsContent value="diagram" className="space-y-4 py-4">
                          {useCases.length === 0 || useCaseSteps.length === 0 ? (
                            <Card className="p-8 text-center">
                              <Icon name="Network" size={64} className="mx-auto mb-4 text-blue-400 opacity-50" />
                              <h3 className="font-semibold text-lg mb-2">Диаграмма последовательности</h3>
                              <p className="text-muted-foreground mb-4">Добавьте Use Cases и шаги для автогенерации диаграммы</p>
                            </Card>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Icon name="Network" size={20} className="text-blue-400" />
                                    Sequence диаграмма
                                  </h3>
                                  <p className="text-sm text-muted-foreground">Автоматически сгенерировано из {useCases.length} Use Case(s)</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => {
                                    const mermaidCode = generateMermaidCode();
                                    navigator.clipboard.writeText(mermaidCode);
                                  }}>
                                    <Icon name="Copy" size={16} className="mr-2" />
                                    Копировать Mermaid
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => {
                                    const plantUmlCode = generatePlantUMLCode();
                                    navigator.clipboard.writeText(plantUmlCode);
                                  }}>
                                    <Icon name="Copy" size={16} className="mr-2" />
                                    Копировать PlantUML
                                  </Button>
                                </div>
                              </div>

                              <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
                                <div className="flex justify-center gap-8 mb-8">
                                  <div className="text-center">
                                    <div className="w-24 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-2">
                                      <Icon name="User" size={24} className="text-white" />
                                    </div>
                                    <p className="text-sm font-semibold">Пользователь</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="w-24 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2">
                                      <Icon name="Globe" size={24} className="text-white" />
                                    </div>
                                    <p className="text-sm font-semibold">Система</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="w-24 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2">
                                      <Icon name="Database" size={24} className="text-white" />
                                    </div>
                                    <p className="text-sm font-semibold">API</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {useCases.map((uc) => {
                                    const steps = useCaseSteps
                                      .filter(s => s.use_case_id === uc.id)
                                      .sort((a, b) => a.step_number - b.step_number);
                                    
                                    if (steps.length === 0) return null;

                                    return (
                                      <div key={uc.id} className="border-l-4 border-purple-500 pl-4 py-2">
                                        <h4 className="font-semibold text-sm mb-3 text-purple-400">
                                          Use Case: {uc.title}
                                        </h4>
                                        <div className="space-y-3">
                                          {steps.map((step, idx) => (
                                            <div key={step.id} className="relative">
                                              <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                                  {step.step_number}
                                                </div>
                                                <div className="flex-1 grid grid-cols-3 gap-3">
                                                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <Icon name="ArrowRight" size={14} className="text-purple-400" />
                                                      <span className="text-xs text-purple-400 font-semibold">Действие</span>
                                                    </div>
                                                    <p className="text-sm">{step.user_action || 'Не указано'}</p>
                                                  </div>
                                                  
                                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <Icon name="ArrowLeft" size={14} className="text-blue-400" />
                                                      <span className="text-xs text-blue-400 font-semibold">Ответ</span>
                                                    </div>
                                                    <p className="text-sm">{step.system_response || 'Не указано'}</p>
                                                  </div>

                                                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <Icon name="Zap" size={14} className="text-green-400" />
                                                      <span className="text-xs text-green-400 font-semibold">API</span>
                                                    </div>
                                                    <p className="text-xs font-mono">{step.api_endpoint || 'Нет привязки'}</p>
                                                  </div>
                                                </div>
                                              </div>
                                              {idx < steps.length - 1 && (
                                                <div className="ml-4 mt-2 mb-2 h-6 border-l-2 border-dashed border-border"></div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </Card>

                              <Card className="p-4 bg-muted/20">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Icon name="Code" size={16} />
                                  Mermaid код
                                </h4>
                                <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto">
                                  {generateMermaidCode()}
                                </pre>
                              </Card>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="acceptance" className="space-y-4 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  <Icon name="FileCheck" size={20} className="text-green-400" />
                                  Критерии приемки (Gherkin)
                                </h3>
                                <p className="text-sm text-muted-foreground">Автоматически сгенерировано из Use Cases</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  const gherkin = generateGherkinScenarios();
                                  navigator.clipboard.writeText(gherkin);
                                }}>
                                  <Icon name="Copy" size={16} className="mr-2" />
                                  Копировать Gherkin
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Icon name="Sparkles" size={16} className="mr-2" />
                                  Сгенерировать тест-кейсы
                                </Button>
                              </div>
                            </div>

                            <Card className="p-4">
                              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon name="Info" size={16} />
                                <span>BDD формат: Given (Дано) → When (Когда) → Then (Тогда)</span>
                              </div>
                              <Textarea 
                                value={generateGherkinScenarios()}
                                readOnly
                                className="min-h-96 font-mono text-sm bg-muted/20 border-2"
                              />
                            </Card>

                            {useCases.length > 0 && (
                              <div className="grid md:grid-cols-2 gap-4">
                                {useCases.map((uc) => {
                                  const steps = useCaseSteps.filter(s => s.use_case_id === uc.id);
                                  const hasSteps = steps.length > 0;
                                  const hasPreconditions = uc.preconditions.some(p => p.trim());
                                  const hasPostconditions = uc.postconditions.some(p => p.trim());

                                  return (
                                    <Card key={uc.id} className="p-4 hover-scale">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Icon name="CheckCircle2" size={18} className={
                                          hasSteps && hasPreconditions && hasPostconditions
                                            ? 'text-green-400'
                                            : 'text-yellow-400'
                                        } />
                                        <h4 className="font-semibold text-sm">{uc.title}</h4>
                                      </div>
                                      <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                          <Icon name={hasPreconditions ? 'Check' : 'X'} size={14} className={hasPreconditions ? 'text-green-400' : 'text-muted-foreground'} />
                                          <span className={hasPreconditions ? '' : 'text-muted-foreground'}>
                                            Предусловия: {uc.preconditions.filter(p => p.trim()).length}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Icon name={hasSteps ? 'Check' : 'X'} size={14} className={hasSteps ? 'text-green-400' : 'text-muted-foreground'} />
                                          <span className={hasSteps ? '' : 'text-muted-foreground'}>
                                            Шаги действий: {steps.length}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Icon name={hasPostconditions ? 'Check' : 'X'} size={14} className={hasPostconditions ? 'text-green-400' : 'text-muted-foreground'} />
                                          <span className={hasPostconditions ? '' : 'text-muted-foreground'}>
                                            Постусловия: {uc.postconditions.filter(p => p.trim()).length}
                                          </span>
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="relations" className="space-y-4 py-4">
                          <Card className="p-4">
                            <h3 className="font-semibold mb-4">Связанные артефакты</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 p-2 border border-border rounded">
                                <input type="checkbox" className="rounded" />
                                <Label className="font-normal">BPMN-процесс "Оформление заказа"</Label>
                              </div>
                              <div className="flex items-center gap-2 p-2 border border-border rounded">
                                <input type="checkbox" className="rounded" />
                                <Label className="font-normal">Сущность "Cart" в ER-диаграмме</Label>
                              </div>
                            </div>

                            <h3 className="font-semibold mt-6 mb-4">Зависимости</h3>
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2">
                                <Icon name="ArrowLeft" size={16} className="text-orange-400" />
                                Зависит от: "Просмотр каталога товаров"
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="ArrowRight" size={16} className="text-green-400" />
                                Блокирует: "Оформление заказа"
                              </p>
                            </div>
                          </Card>
                        </TabsContent>
                      </Tabs>

                      <div className="flex gap-3 pt-4 border-t mt-6">
                        <Button variant="outline">
                          <Icon name="Eye" size={16} className="mr-2" />
                          Превью US
                        </Button>
                        <Button variant="outline">
                          <Icon name="CheckCircle" size={16} className="mr-2" />
                          Проверить полноту
                        </Button>
                        <Button variant="outline">
                          <Icon name="Sparkles" size={16} className="mr-2" />
                          AI-ассистент
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button variant="outline">
                          Сохранить черновик
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-blue-600"
                          onClick={createUserStory}
                        >
                          Сохранить и перейти к ТЗ
                        </Button>
                      </div>
                    </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="mb-4 text-sm text-muted-foreground">
                  Показано {filteredStories.length} из {userStories.length} историй
                </div>
                
                <div className="grid gap-4">
                  {loading ? (
                    <Card className="p-6 text-center text-muted-foreground">
                      <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                      Загрузка историй...
                    </Card>
                  ) : (
                    filteredStories.map((story) => (
                    <Card key={story.id} className="p-6 hover-scale transition-all">
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedStoryId(selectedStoryId === story.id ? null : story.id)}
                        >
                          <Icon name="MessageSquare" size={18} />
                          {comments[story.id] && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {comments[story.id].length}
                            </Badge>
                          )}
                        </Button>
                      </div>
                      
                      {selectedStoryId === story.id && (
                        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Icon name="MessageCircle" size={16} />
                            Комментарии
                          </h4>
                          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {comments[story.id]?.map((comment) => (
                              <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Добавить комментарий..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  addComment(story.id);
                                }
                              }}
                            />
                            <Button 
                              size="icon"
                              onClick={() => addComment(story.id)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              <Icon name="Send" size={18} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                    ))
                  )}
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
                    <Dialog open={isArchDialogOpen} onOpenChange={setIsArchDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                          <Icon name="Plus" size={18} className="mr-2" />
                          Добавить элемент
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Новый архитектурный элемент</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Тип элемента</Label>
                            <Select value={newElement.type} onValueChange={(value) => setNewElement(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Система">Система</SelectItem>
                                <SelectItem value="Пользователь">Пользователь</SelectItem>
                                <SelectItem value="Внешняя система">Внешняя система</SelectItem>
                                <SelectItem value="База данных">База данных</SelectItem>
                                <SelectItem value="Микросервис">Микросервис</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Название</Label>
                            <Input 
                              placeholder="Например: API Gateway"
                              value={newElement.name}
                              onChange={(e) => setNewElement(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button 
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                              onClick={createArchElement}
                            >
                              Создать
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsArchDialogOpen(false)}>
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                    <div 
                      ref={canvasRef}
                      className="relative h-full border-2 border-dashed border-border/50 rounded-lg p-8"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {archElements.map((element) => (
                        <div
                          key={element.id}
                          className={`absolute bg-card border-2 rounded-lg p-4 shadow-lg transition-all cursor-move select-none ${
                            draggingId === element.id 
                              ? 'border-blue-500 shadow-blue-500/30 scale-105 z-50' 
                              : 'border-purple-500/50 hover:shadow-purple-500/20 hover-scale'
                          }`}
                          style={{ left: element.x, top: element.y, width: '160px' }}
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                        >
                          <div className="flex items-center gap-2 mb-2 pointer-events-none">
                            <Icon name={element.type === 'Пользователь' ? 'User' : element.type === 'Система' ? 'Box' : element.type === 'База данных' ? 'Database' : 'Globe'} size={20} className="text-purple-400" />
                            <span className="text-xs text-muted-foreground">{element.type}</span>
                          </div>
                          <h4 className="font-semibold pointer-events-none">{element.name}</h4>
                        </div>
                      ))}
                      
                      <svg className="absolute inset-0 pointer-events-none">
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(262 83% 58%)" />
                          </marker>
                        </defs>
                        {archElements.length >= 2 && (
                          <line 
                            x1={archElements[0].x + 160} 
                            y1={archElements[0].y + 50} 
                            x2={archElements[1].x} 
                            y2={archElements[1].y + 50} 
                            stroke="hsl(262 83% 58%)" 
                            strokeWidth="2" 
                            markerEnd="url(#arrowhead)" 
                          />
                        )}
                        {archElements.length >= 3 && (
                          <line 
                            x1={archElements[1].x + 80} 
                            y1={archElements[1].y + 100} 
                            x2={archElements[2].x + 80} 
                            y2={archElements[2].y} 
                            stroke="hsl(262 83% 58%)" 
                            strokeWidth="2" 
                            markerEnd="url(#arrowhead)" 
                          />
                        )}
                        {archElements.length >= 4 && (
                          <line 
                            x1={archElements[1].x + 160} 
                            y1={archElements[1].y + 50} 
                            x2={archElements[3].x} 
                            y2={archElements[3].y + 50} 
                            stroke="hsl(262 83% 58%)" 
                            strokeWidth="2" 
                            markerEnd="url(#arrowhead)" 
                          />
                        )}
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