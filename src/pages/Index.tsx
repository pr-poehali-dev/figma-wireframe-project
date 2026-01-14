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
import ArchitectureStudio from '@/components/ArchitectureStudio';
import ArchitectonWelcomeNew from '@/components/ArchitectonWelcomeNew';
import ArchitectonWidget from '@/components/ArchitectonWidget';
import JarvisActivation from '@/components/JarvisActivation';
import { useArchitecton } from '@/components/ArchitectonCore';

const stages = [
  { id: 1, name: 'Vision', icon: 'Lightbulb', color: 'text-yellow-400' },
  { id: 2, name: 'Требования', icon: 'FileText', color: 'text-purple-400' },
  { id: 3, name: 'Архитектура', icon: 'Box', color: 'text-blue-400' },
  { id: 4, name: 'API Design', icon: 'Code', color: 'text-green-400' },
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
  description?: string;
  techStack?: string;
  team?: string;
  repository?: string;
  port?: string;
  cpu?: string;
  memory?: string;
  layer?: 'presentation' | 'business' | 'data' | 'infrastructure';
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
  const { updateContext, analyzeAction, isActive, addMessage, trackUserAction } = useArchitecton();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
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
  const [isCompletenessDialogOpen, setIsCompletenessDialogOpen] = useState(false);
  const [completenessReport, setCompletenessReport] = useState<any>(null);
  const [viewingStoryId, setViewingStoryId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isArchStudioOpen, setIsArchStudioOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ArchElement | null>(null);
  const [c4Level, setC4Level] = useState<'context' | 'container' | 'component' | 'code'>('container');
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [archConnections, setArchConnections] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const draft = localStorage.getItem('userStoryDraft');
    if (draft && isDialogOpen) {
      try {
        const parsed = JSON.parse(draft);
        setNewStory(parsed.story);
        setUseCases(parsed.useCases || []);
        setUseCaseSteps(parsed.steps || []);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    if (isDialogOpen) {
      draftTimerRef.current = setTimeout(() => {
        const draft = {
          story: newStory,
          useCases,
          steps: useCaseSteps,
          timestamp: Date.now()
        };
        localStorage.setItem('userStoryDraft', JSON.stringify(draft));
      }, 2000);
    }

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [newStory, useCases, useCaseSteps, isDialogOpen]);

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
      setUseCases([]);
      setUseCaseSteps([]);
      setActiveTab('basic');
      localStorage.removeItem('userStoryDraft');
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
      analyzeAction('element-added', { element: createdElement });
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

  const exportUserStoryToMarkdown = (): string => {
    const now = new Date().toLocaleDateString('ru-RU');
    let md = `# User Story: ${newStory.role ? `Как ${newStory.role}, я хочу ${newStory.action}` : 'Документация'}\n\n`;
    md += `**Дата создания:** ${now}\n\n`;
    md += `---\n\n`;

    // Основные данные
    md += `## 📋 Основные данные\n\n`;
    md += `**Как:** ${newStory.role || 'Не указано'}\n\n`;
    md += `**Я хочу:** ${newStory.action || 'Не указано'}\n\n`;
    md += `**Чтобы:** ${newStory.benefit || 'Не указано'}\n\n`;
    md += `**Приоритет:** ${newStory.priority}\n\n`;
    md += `**Epic:** ${newStory.epic || 'Не указан'}\n\n`;
    md += `**Бизнес-ценность:** ${newStory.business_value}/10\n\n`;
    md += `**Story Points:** ${newStory.story_points}\n\n`;
    md += `---\n\n`;

    // Use Cases
    if (useCases.length > 0) {
      md += `## 🎯 Use Cases\n\n`;
      useCases.forEach((uc, idx) => {
        md += `### Use Case #${idx + 1}: ${uc.title}\n\n`;
        md += `**Тип:** ${uc.type === 'primary' ? 'Основной' : uc.type === 'alternative' ? 'Альтернативный' : 'Исключительный'}\n\n`;
        
        // Preconditions
        if (uc.preconditions.some(p => p.trim())) {
          md += `**Предусловия:**\n`;
          uc.preconditions.forEach(pre => {
            if (pre.trim()) md += `- ${pre}\n`;
          });
          md += `\n`;
        }

        // Steps
        const steps = useCaseSteps
          .filter(s => s.use_case_id === uc.id)
          .sort((a, b) => a.step_number - b.step_number);
        
        if (steps.length > 0) {
          md += `**Шаги:**\n\n`;
          md += `| # | Действие пользователя | Ответ системы | API Endpoint |\n`;
          md += `|---|------------------------|---------------|-------------|\n`;
          steps.forEach(step => {
            md += `| ${step.step_number} | ${step.user_action || '-'} | ${step.system_response || '-'} | \`${step.api_endpoint || '-'}\` |\n`;
          });
          md += `\n`;
        }

        // Postconditions
        if (uc.postconditions.some(p => p.trim())) {
          md += `**Постусловия:**\n`;
          uc.postconditions.forEach(post => {
            if (post.trim()) md += `- ${post}\n`;
          });
          md += `\n`;
        }
      });
      md += `---\n\n`;
    }

    // Sequence Diagram
    if (useCases.length > 0 && useCaseSteps.length > 0) {
      md += `## 🔄 Sequence Диаграмма\n\n`;
      md += `### Mermaid\n\n`;
      md += '```mermaid\n';
      md += generateMermaidCode();
      md += '```\n\n';
      md += `### PlantUML\n\n`;
      md += '```plantuml\n';
      md += generatePlantUMLCode();
      md += '```\n\n';
      md += `---\n\n`;
    }

    // Acceptance Criteria
    const gherkin = generateGherkinScenarios();
    if (gherkin && !gherkin.includes('Добавьте')) {
      md += `## ✅ Критерии приемки (Gherkin)\n\n`;
      md += '```gherkin\n';
      md += gherkin;
      md += '```\n\n';
      md += `---\n\n`;
    }

    md += `\n*Документ сгенерирован автоматически из Project Pipeline*\n`;
    return md;
  };

  const downloadMarkdown = () => {
    const markdown = exportUserStoryToMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-story-${newStory.role || 'export'}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateCompleteness = (): number => {
    let total = 0;
    let filled = 0;

    // Основные данные (4 поля)
    total += 4;
    if (newStory.role) filled++;
    if (newStory.action) filled++;
    if (newStory.benefit) filled++;
    if (newStory.epic) filled++;

    // Use Cases (минимум 1)
    total += 1;
    if (useCases.length > 0) filled++;

    // Для каждого Use Case
    useCases.forEach(uc => {
      total += 3; // title, preconditions, postconditions
      if (uc.title) filled++;
      if (uc.preconditions.some(p => p.trim())) filled++;
      if (uc.postconditions.some(p => p.trim())) filled++;

      // Шаги (минимум 1 на Use Case)
      const steps = useCaseSteps.filter(s => s.use_case_id === uc.id);
      total += 1;
      if (steps.length > 0) filled++;

      // Для каждого шага
      steps.forEach(step => {
        total += 3; // user_action, system_response, api_endpoint
        if (step.user_action) filled++;
        if (step.system_response) filled++;
        if (step.api_endpoint) filled++;
      });
    });

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const checkCompleteness = () => {
    const issues: any = {
      basic: [],
      useCases: [],
      steps: [],
      overall: 0
    };

    // Проверка основных данных
    if (!newStory.role) issues.basic.push('Не указана роль (Как...)');
    if (!newStory.action) issues.basic.push('Не указано действие (Я хочу...)');
    if (!newStory.benefit) issues.basic.push('Не указана выгода (Чтобы...)');
    if (!newStory.epic) issues.basic.push('Не указан Epic');

    // Проверка Use Cases
    if (useCases.length === 0) {
      issues.useCases.push('Нет ни одного Use Case');
    } else {
      useCases.forEach((uc, idx) => {
        if (!uc.title) issues.useCases.push(`Use Case #${idx + 1}: Нет названия`);
        if (!uc.preconditions.some(p => p.trim())) {
          issues.useCases.push(`Use Case "${uc.title}": Нет предусловий`);
        }
        if (!uc.postconditions.some(p => p.trim())) {
          issues.useCases.push(`Use Case "${uc.title}": Нет постусловий`);
        }

        // Проверка шагов
        const steps = useCaseSteps.filter(s => s.use_case_id === uc.id);
        if (steps.length === 0) {
          issues.steps.push(`Use Case "${uc.title}": Нет шагов`);
        } else {
          steps.forEach(step => {
            if (!step.user_action) {
              issues.steps.push(`Use Case "${uc.title}", Шаг ${step.step_number}: Нет действия пользователя`);
            }
            if (!step.system_response) {
              issues.steps.push(`Use Case "${uc.title}", Шаг ${step.step_number}: Нет ответа системы`);
            }
            if (!step.api_endpoint) {
              issues.steps.push(`Use Case "${uc.title}", Шаг ${step.step_number}: Не привязан API endpoint`);
            }
          });
        }
      });
    }

    issues.overall = issues.basic.length + issues.useCases.length + issues.steps.length;

    setCompletenessReport(issues);
    setIsCompletenessDialogOpen(true);
  };

  const filteredStories = userStories.filter(story => {
    if (filterPriority !== 'all' && story.priority !== filterPriority) return false;
    if (filterEpic !== 'all' && story.epic !== filterEpic) return false;
    return true;
  });

  const uniqueEpics = Array.from(new Set(userStories.map(s => s.epic).filter(Boolean)));

  useEffect(() => {
    const phaseMap = {
      0: 'general',
      1: 'vision',
      2: 'requirements',
      3: 'architecture',
      4: 'api',
      5: 'documentation'
    } as const;
    
    updateContext({ 
      projectPhase: phaseMap[currentStage as keyof typeof phaseMap] || 'vision'
    });
  }, [currentStage, updateContext]);

  if (showWelcome) {
    return <ArchitectonWelcomeNew onComplete={() => {
      setShowWelcome(false);
      setShowActivation(true);
    }} />;
  }

  if (showActivation && !isActive) {
    return <JarvisActivation onActivate={() => setShowActivation(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ArchitectonWidget />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Icon name="Rocket" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Архитектор</h1>
                  <p className="text-sm text-muted-foreground">Платформа управления разработкой</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                <Icon name="Users" size={14} className="mr-1" />
                5 участников
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (confirm('Выйти из платформы?')) {
                    setShowWelcome(true);
                    setShowActivation(false);
                  }
                }}
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выход
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
                  <h2 className="text-3xl font-bold">Требования</h2>
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
                          Создать требование
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center justify-between">
                          <span>Создание User Story с Use Cases</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="relative w-16 h-16">
                                <svg className="transform -rotate-90 w-16 h-16">
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-muted/30"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - calculateCompleteness() / 100)}`}
                                    className={`transition-all duration-500 ${
                                      calculateCompleteness() === 100
                                        ? 'text-green-400'
                                        : calculateCompleteness() >= 70
                                        ? 'text-blue-400'
                                        : calculateCompleteness() >= 40
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                    }`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-sm font-bold ${
                                    calculateCompleteness() === 100
                                      ? 'text-green-400'
                                      : calculateCompleteness() >= 70
                                      ? 'text-blue-400'
                                      : calculateCompleteness() >= 40
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                  }`}>
                                    {calculateCompleteness()}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-muted-foreground">Заполнено</p>
                                <p className="text-sm font-semibold">
                                  {calculateCompleteness() === 100 ? (
                                    <span className="text-green-400">Готово ✓</span>
                                  ) : calculateCompleteness() >= 70 ? (
                                    <span className="text-blue-400">Почти готово</span>
                                  ) : calculateCompleteness() >= 40 ? (
                                    <span className="text-yellow-400">В процессе</span>
                                  ) : (
                                    <span className="text-red-400">Начните заполнение</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogTitle>
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
                                <Label className={!newStory.role ? 'text-red-400' : ''}>Как (As a...) {!newStory.role && '*'}</Label>
                                <Select value={newStory.role} onValueChange={(value) => setNewStory(prev => ({ ...prev, role: value }))}>
                                  <SelectTrigger className={!newStory.role ? 'border-red-400' : ''}>
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
                                <Label className={!newStory.action ? 'text-red-400' : ''}>Я хочу (I want...) {!newStory.action && '*'}</Label>
                                <Input 
                                  placeholder="управлять элементами корзины покупок" 
                                  value={newStory.action}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, action: e.target.value }))}
                                  className={!newStory.action ? 'border-red-400' : ''}
                                />
                              </div>

                              <div>
                                <Label className={!newStory.benefit ? 'text-red-400' : ''}>Чтобы (So that...) {!newStory.benefit && '*'}</Label>
                                <Textarea 
                                  placeholder="легко добавлять/удалять товары перед заказом" 
                                  value={newStory.benefit}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, benefit: e.target.value }))}
                                  className={!newStory.benefit ? 'border-red-400' : ''}
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
                                <Label className={!newStory.epic ? 'text-red-400' : ''}>Epic {!newStory.epic && '*'}</Label>
                                <Input 
                                  placeholder="Управление заказами" 
                                  value={newStory.epic}
                                  onChange={(e) => setNewStory(prev => ({ ...prev, epic: e.target.value }))}
                                  className={!newStory.epic ? 'border-red-400' : ''}
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
                              <Card className="p-8 text-center border-2 border-dashed border-yellow-400/50 bg-yellow-500/5">
                                <Icon name="AlertCircle" size={48} className="mx-auto mb-3 text-yellow-400" />
                                <p className="font-semibold">Пока нет Use Cases *</p>
                                <p className="text-sm text-muted-foreground">Добавьте первый сценарий использования</p>
                              </Card>
                            ) : (
                              useCases.map((uc, idx) => (
                                <Card key={uc.id} className="p-4 hover-scale">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Icon name="ListChecks" size={20} className="text-blue-400" />
                                      <div>
                                        <h4 className="font-semibold">
                                          Use Case #{idx + 1}: {uc.title}
                                          {(!uc.preconditions.some(p => p.trim()) || !uc.postconditions.some(p => p.trim()) || useCaseSteps.filter(s => s.use_case_id === uc.id).length === 0) && (
                                            <Icon name="AlertCircle" size={16} className="inline ml-2 text-yellow-400" />
                                          )}
                                        </h4>
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
                                        <Label className={!editingUseCase.preconditions.some(p => p.trim()) ? 'text-red-400' : ''}>
                                          Предусловия {!editingUseCase.preconditions.some(p => p.trim()) && '*'}
                                        </Label>
                                        {editingUseCase.preconditions.map((pre, idx) => (
                                          <div key={idx} className="flex gap-2 mt-2">
                                            <input type="checkbox" defaultChecked className="rounded mt-1" />
                                            <Input 
                                              value={pre} 
                                              onChange={(e) => {
                                                const newPre = [...editingUseCase.preconditions];
                                                newPre[idx] = e.target.value;
                                                setEditingUseCase({...editingUseCase, preconditions: newPre});
                                              }}
                                              className={!editingUseCase.preconditions.some(p => p.trim()) ? 'border-yellow-400' : ''}
                                            />
                                          </div>
                                        ))}
                                      </div>

                                      <div>
                                        <Label className={!editingUseCase.postconditions.some(p => p.trim()) ? 'text-red-400' : ''}>
                                          Постусловия {!editingUseCase.postconditions.some(p => p.trim()) && '*'}
                                        </Label>
                                        {editingUseCase.postconditions.map((post, idx) => (
                                          <div key={idx} className="flex gap-2 mt-2">
                                            <input type="checkbox" defaultChecked className="rounded mt-1" />
                                            <Input 
                                              value={post} 
                                              onChange={(e) => {
                                                const newPost = [...editingUseCase.postconditions];
                                                newPost[idx] = e.target.value;
                                                setEditingUseCase({...editingUseCase, postconditions: newPost});
                                              }}
                                              className={!editingUseCase.postconditions.some(p => p.trim()) ? 'border-yellow-400' : ''}
                                            />
                                          </div>
                                        ))}
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between mb-3">
                                          <Label className={`text-base ${useCaseSteps.filter(s => s.use_case_id === editingUseCase.id).length === 0 ? 'text-red-400' : ''}`}>
                                            Таблица шагов Use Case {useCaseSteps.filter(s => s.use_case_id === editingUseCase.id).length === 0 && '*'}
                                          </Label>
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
                                                      className={`h-8 text-sm ${!step.user_action ? 'border-yellow-400' : ''}`}
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
                                                      className={`h-8 text-sm ${!step.system_response ? 'border-yellow-400' : ''}`}
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
                                                            className={`flex-1 h-8 px-2 text-xs font-mono text-left border rounded-md bg-background hover:bg-accent transition-colors ${!step.api_endpoint ? 'border-yellow-400' : 'border-input'}`}
                                                          >
                                                            {step.api_endpoint || 'Выбрать endpoint...'}
                                                          </button>
                                                          {step.api_endpoint ? (
                                                            <Icon name="CheckCircle2" size={16} className="text-green-400" />
                                                          ) : (
                                                            <Icon name="AlertCircle" size={16} className="text-yellow-400" />
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
                                            <div className="p-8 text-center border-2 border-dashed border-yellow-400/50 bg-yellow-500/5 text-sm">
                                              <Icon name="AlertCircle" size={32} className="mx-auto mb-2 text-yellow-400" />
                                              <p className="font-semibold">Нет шагов *</p>
                                              <p className="text-muted-foreground">Добавьте первый шаг Use Case.</p>
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
                        <Button variant="outline" onClick={downloadMarkdown}>
                          <Icon name="Download" size={16} className="mr-2" />
                          Экспорт Markdown
                        </Button>
                        <Button variant="outline" onClick={() => {
                          const markdown = exportUserStoryToMarkdown();
                          navigator.clipboard.writeText(markdown);
                        }}>
                          <Icon name="Copy" size={16} className="mr-2" />
                          Копировать документ
                        </Button>
                        <Button variant="outline" onClick={checkCompleteness}>
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
                        <Button variant="outline" onClick={() => {
                          const draft = {
                            story: newStory,
                            useCases,
                            steps: useCaseSteps,
                            timestamp: Date.now()
                          };
                          localStorage.setItem('userStoryDraft', JSON.stringify(draft));
                        }}>
                          <Icon name="Save" size={16} className="mr-2" />
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

                    <Dialog open={isCompletenessDialogOpen} onOpenChange={setIsCompletenessDialogOpen}>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-3">
                            {completenessReport && completenessReport.overall === 0 ? (
                              <Icon name="CheckCircle2" size={28} className="text-green-400" />
                            ) : (
                              <Icon name="AlertCircle" size={28} className="text-yellow-400" />
                            )}
                            Проверка полноты User Story
                          </DialogTitle>
                        </DialogHeader>

                        {completenessReport && (
                          <div className="space-y-6 py-4">
                            {completenessReport.overall === 0 ? (
                              <Card className="p-6 bg-green-500/10 border-green-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                  <Icon name="CheckCircle2" size={32} className="text-green-400" />
                                  <div>
                                    <h3 className="font-semibold text-lg">Отлично! User Story полностью заполнена</h3>
                                    <p className="text-sm text-muted-foreground">Все необходимые поля заполнены, можно сохранять</p>
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Check" size={16} className="text-green-400" />
                                    <span>Основные данные заполнены</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="Check" size={16} className="text-green-400" />
                                    <span>Use Cases: {useCases.length} шт.</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="Check" size={16} className="text-green-400" />
                                    <span>Шаги действий: {useCaseSteps.length} шт.</span>
                                  </div>
                                </div>
                              </Card>
                            ) : (
                              <div className="space-y-4">
                                <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon name="AlertTriangle" size={20} className="text-yellow-400" />
                                    <h3 className="font-semibold">Найдено проблем: {completenessReport.overall}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Рекомендуется заполнить указанные поля для полноты документации</p>
                                </Card>

                                {completenessReport.basic.length > 0 && (
                                  <Card className="p-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Icon name="User" size={18} className="text-purple-400" />
                                      Основные данные ({completenessReport.basic.length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {completenessReport.basic.map((issue: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                          <Icon name="X" size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                          <span>{issue}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </Card>
                                )}

                                {completenessReport.useCases.length > 0 && (
                                  <Card className="p-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Icon name="ListChecks" size={18} className="text-blue-400" />
                                      Use Cases ({completenessReport.useCases.length})
                                    </h4>
                                    <ul className="space-y-2">
                                      {completenessReport.useCases.map((issue: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                          <Icon name="X" size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                          <span>{issue}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </Card>
                                )}

                                {completenessReport.steps.length > 0 && (
                                  <Card className="p-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Icon name="Table" size={18} className="text-green-400" />
                                      Шаги действий ({completenessReport.steps.length})
                                    </h4>
                                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                                      {completenessReport.steps.map((issue: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                          <Icon name="X" size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                          <span>{issue}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </Card>
                                )}
                              </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                              <Button 
                                className="flex-1"
                                onClick={() => setIsCompletenessDialogOpen(false)}
                              >
                                {completenessReport.overall === 0 ? 'Отлично!' : 'Понятно, буду заполнять'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-3">
                            <Icon name="FileText" size={28} className="text-purple-400" />
                            Документация требования
                          </DialogTitle>
                        </DialogHeader>
                        
                        {viewingStoryId && (() => {
                          const story = userStories.find(s => s.id === viewingStoryId);
                          if (!story) return null;

                          return (
                            <div className="space-y-6 py-4">
                              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Icon name="User" size={24} className="text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold">Как {story.role}</h3>
                                    <p className="text-sm text-muted-foreground">ID: #{story.id}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-sm">
                                      {story.priority}
                                    </Badge>
                                    {story.epic && (
                                      <Badge className="text-sm bg-purple-500/20 text-purple-400">
                                        {story.epic}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Я хочу:</p>
                                    <p className="text-base font-medium">{story.action}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Чтобы:</p>
                                    <p className="text-base font-medium">{story.benefit}</p>
                                  </div>
                                </div>

                                {(story.business_value || story.story_points) && (
                                  <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                                    {story.business_value && (
                                      <div className="flex items-center gap-2">
                                        <Icon name="TrendingUp" size={18} className="text-green-400" />
                                        <span className="text-sm">Бизнес-ценность: <span className="font-bold">{story.business_value}/10</span></span>
                                      </div>
                                    )}
                                    {story.story_points && (
                                      <div className="flex items-center gap-2">
                                        <Icon name="Zap" size={18} className="text-yellow-400" />
                                        <span className="text-sm">Story Points: <span className="font-bold">{story.story_points}</span></span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>

                              <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                  <Icon name="ListChecks" size={20} className="text-blue-400" />
                                  Use Cases
                                </h3>
                                <p className="text-sm text-muted-foreground">Подробные сценарии использования для данного требования</p>
                                <div className="mt-4 p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
                                  <Icon name="Construction" size={32} className="mx-auto mb-2 opacity-50" />
                                  Use Cases будут отображаться после сохранения в базу данных
                                </div>
                              </Card>

                              <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                  <Icon name="Network" size={20} className="text-purple-400" />
                                  Sequence Диаграмма
                                </h3>
                                <p className="text-sm text-muted-foreground">Визуализация последовательности взаимодействий</p>
                                <div className="mt-4 p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
                                  <Icon name="Construction" size={32} className="mx-auto mb-2 opacity-50" />
                                  Диаграммы будут доступны после привязки Use Cases
                                </div>
                              </Card>

                              <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                  <Icon name="FileCheck" size={20} className="text-green-400" />
                                  Критерии приемки (Gherkin)
                                </h3>
                                <p className="text-sm text-muted-foreground">BDD сценарии для тестирования</p>
                                <div className="mt-4 p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
                                  <Icon name="Construction" size={32} className="mx-auto mb-2 opacity-50" />
                                  Gherkin сценарии будут сгенерированы из Use Cases
                                </div>
                              </Card>

                              <Card className="p-6 bg-muted/20">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Icon name="MessageSquare" size={20} className="text-orange-400" />
                                    Комментарии
                                  </h3>
                                  <Badge variant="outline">
                                    {comments[story.id]?.length || 0}
                                  </Badge>
                                </div>
                                
                                {comments[story.id] && comments[story.id].length > 0 ? (
                                  <div className="space-y-3 mb-4">
                                    {comments[story.id].map((comment) => (
                                      <div key={comment.id} className="bg-background p-4 rounded-lg border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-semibold text-sm">{comment.author}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(comment.timestamp).toLocaleDateString('ru-RU')}
                                          </span>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground mb-4">Комментариев пока нет</p>
                                )}

                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="Добавить комментарий..."
                                    value={selectedStoryId === story.id ? newComment : ''}
                                    onChange={(e) => {
                                      setSelectedStoryId(story.id);
                                      setNewComment(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        addComment(story.id);
                                      }
                                    }}
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => addComment(story.id)}
                                    disabled={!newComment.trim()}
                                  >
                                    <Icon name="Send" size={16} />
                                  </Button>
                                </div>
                              </Card>

                              <div className="flex gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => {
                                  const markdown = `# Требование: ${story.role} - ${story.action}\n\n**ID:** #${story.id}\n**Приоритет:** ${story.priority}\n**Epic:** ${story.epic || 'Не указан'}\n\n## Описание\n\n**Как:** ${story.role}\n\n**Я хочу:** ${story.action}\n\n**Чтобы:** ${story.benefit}\n\n---\n\n*Документ сгенерирован из Архитектор*`;
                                  navigator.clipboard.writeText(markdown);
                                }}>  
                                  <Icon name="Copy" size={16} className="mr-2" />
                                  Копировать Markdown
                                </Button>
                                <Button variant="outline">
                                  <Icon name="Edit" size={16} className="mr-2" />
                                  Редактировать
                                </Button>
                                <div className="flex-1" />
                                <Button onClick={() => setIsViewDialogOpen(false)}>
                                  Закрыть
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
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
                    <Card 
                      key={story.id} 
                      className="p-6 hover-scale transition-all cursor-pointer group"
                      onClick={() => {
                        setViewingStoryId(story.id);
                        setIsViewDialogOpen(true);
                      }}
                    >
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
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Архитектура системы</h2>
                    <p className="text-muted-foreground">Проектируй с AI-ассистентом</p>
                  </div>
                </div>

                <Card 
                  className="p-8 mb-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-purple-500/30 cursor-pointer hover:scale-105 transition-transform group"
                  onClick={() => setIsArchStudioOpen(true)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Icon name="Layers" size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">Architecture Studio Pro</h3>
                        <p className="text-muted-foreground">Профессиональный редактор архитектуры с AI-ассистентом</p>
                      </div>
                    </div>
                    <Icon name="ArrowRight" size={32} className="text-purple-400 group-hover:translate-x-2 transition-transform" />
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Box" size={24} className="text-purple-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">C4 Model</p>
                      <p className="text-xs text-muted-foreground">4 уровня диаграмм</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="GitBranch" size={24} className="text-blue-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">Связи</p>
                      <p className="text-xs text-muted-foreground">Интерактивные соединения</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Layers" size={24} className="text-cyan-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">Группировка</p>
                      <p className="text-xs text-muted-foreground">Логические границы</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Bot" size={24} className="text-green-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">AI Джарвис</p>
                      <p className="text-xs text-muted-foreground">Голосовой помощник</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <Icon name="Sparkles" size={14} className="mr-1" />
                      Новое
                    </Badge>
                    <Badge variant="outline">
                      <Icon name="Zap" size={14} className="mr-1" />
                      Drag & Drop
                    </Badge>
                    <Badge variant="outline">
                      <Icon name="Grid" size={14} className="mr-1" />
                      Сетка привязки
                    </Badge>
                    <Badge variant="outline">
                      <Icon name="Download" size={14} className="mr-1" />
                      Экспорт PNG/SVG
                    </Badge>
                    <Badge variant="outline">
                      <Icon name="Mic" size={14} className="mr-1" />
                      Голосовое управление
                    </Badge>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="BookOpen" size={24} className="text-purple-400" />
                      <h3 className="text-xl font-semibold">Быстрый старт</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-purple-400">1</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Открой Studio Pro</p>
                          <p className="text-sm text-muted-foreground">Нажми на карточку выше для перехода</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-400">2</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Добавь компоненты</p>
                          <p className="text-sm text-muted-foreground">Используй левую панель для drag & drop</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-cyan-400">3</span>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Проси помощи у ассистента</p>
                          <p className="text-sm text-muted-foreground">Умный помощник справа подскажет</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="TrendingUp" size={24} className="text-blue-400" />
                      <h3 className="text-xl font-semibold">Возможности</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">C4 Model (Context, Container, Component, Code)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Drag & Drop интерфейс</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Интерактивные связи между элементами</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Группировка компонентов</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Undo/Redo история действий</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Экспорт в PNG/SVG форматы</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">AI-ассистент Джарвис с голосовым интерфейсом</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Метрики и анализ архитектуры</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {currentStage === 4 && (
              <div>
                <Card 
                  className="p-8 mb-6 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-green-500/30 cursor-pointer hover:scale-105 transition-transform group"
                  onClick={() => window.open('/api-design', '_blank')}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                        <Icon name="Code" size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">API Design Studio</h3>
                        <p className="text-muted-foreground">Комплексный конструктор API с автогенерацией документации и кода</p>
                      </div>
                    </div>
                    <Icon name="ExternalLink" size={32} className="text-green-400 group-hover:translate-x-2 transition-transform" />
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Network" size={24} className="text-green-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">REST Endpoints</p>
                      <p className="text-xs text-muted-foreground">CRUD + события</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Database" size={24} className="text-blue-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">Схемы данных</p>
                      <p className="text-xs text-muted-foreground">TypeScript, SQL</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="Zap" size={24} className="text-yellow-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">Events & Webhooks</p>
                      <p className="text-xs text-muted-foreground">Kafka, RabbitMQ</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <Icon name="FileText" size={24} className="text-purple-400 mb-2" />
                      <p className="text-sm font-semibold mb-1">Документация</p>
                      <p className="text-xs text-muted-foreground">OpenAPI, AsyncAPI</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Info" size={16} />
                    <span>Нажмите для открытия в новой вкладке</span>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="BookOpen" size={24} className="text-green-400" />
                      <h3 className="text-xl font-semibold">Возможности</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Визуальный конструктор endpoints</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Генерация TypeScript/Java/Python кода</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Mock-сервер для разработки</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Автогенерация тест-кейсов</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Kubernetes + CI/CD конфигурации</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                        <span className="text-sm">Интеграция с Use Cases</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Sparkles" size={24} className="text-purple-400" />
                      <h3 className="text-xl font-semibold">Автоматизация</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="font-semibold mb-1">Из Use Cases в API</p>
                        <p className="text-xs text-muted-foreground">
                          Автоматическая генерация endpoints на основе сценариев использования
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="font-semibold mb-1">Схемы из архитектуры</p>
                        <p className="text-xs text-muted-foreground">
                          Использование архитектурных компонентов для создания моделей данных
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="font-semibold mb-1">Валидация контрактов</p>
                        <p className="text-xs text-muted-foreground">
                          Проверка соответствия RESTful принципам и best practices
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Architecture Studio Pro Modal */}
      {isArchStudioOpen && (
        <ArchitectureStudio 
          elements={archElements}
          onClose={() => setIsArchStudioOpen(false)}
        />
      )}
    </div>
  );
}