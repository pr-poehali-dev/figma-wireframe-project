import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ApiEndpoint, ApiService } from '@/types/api';

interface ApiDashboardProps {
  services: ApiService[];
  endpoints: ApiEndpoint[];
  onCreateEndpoint: () => void;
  onEditEndpoint: (endpoint: ApiEndpoint) => void;
  onSyncWithUseCases: () => void;
  onAutoGenerate: () => void;
}

export default function ApiDashboard({
  services,
  endpoints,
  onCreateEndpoint,
  onEditEndpoint,
  onSyncWithUseCases,
  onAutoGenerate
}: ApiDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  const toggleService = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = selectedService === 'all' || endpoint.serviceName === selectedService;
    const matchesStatus = selectedStatus === 'all' || endpoint.status === selectedStatus;
    return matchesSearch && matchesService && matchesStatus;
  });

  const totalEndpoints = endpoints.length;
  const restEndpoints = endpoints.filter(e => e.method !== 'SUBSCRIBE').length;
  const eventEndpoints = endpoints.filter(e => e.method === 'SUBSCRIBE').length;
  const documentedPercentage = Math.round((endpoints.filter(e => e.description).length / totalEndpoints) * 100) || 0;
  const testedPercentage = 67;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500">Готов</Badge>;
      case 'development':
        return <Badge className="bg-yellow-500">Dev</Badge>;
      case 'missing':
        return <Badge className="bg-red-500">Нет</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400';
      case 'POST': return 'text-blue-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      case 'SUBSCRIBE': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex h-full gap-4">
      <aside className="w-80 border-r border-border pr-4 overflow-y-auto">
        <Card className="p-4 mb-4">
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">Группы API по сервисам</h3>
            {services.map(service => (
              <div key={service.id}>
                <button
                  onClick={() => toggleService(service.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={expandedServices.has(service.id) ? "ChevronDown" : "ChevronRight"} 
                      size={16} 
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {endpoints.filter(e => e.serviceName === service.name).length}
                    </Badge>
                  </div>
                </button>
                
                {expandedServices.has(service.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {endpoints
                      .filter(e => e.serviceName === service.name)
                      .slice(0, 5)
                      .map(endpoint => (
                        <button
                          key={endpoint.id}
                          onClick={() => onEditEndpoint(endpoint)}
                          className="w-full text-left p-1.5 hover:bg-muted/50 rounded text-xs flex items-center gap-2 transition-colors"
                        >
                          <span className={`font-mono ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <span className="text-muted-foreground truncate">{endpoint.path}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Статистика</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Всего endpoint-ов:</span>
              <span className="font-medium">{totalEndpoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">REST:</span>
              <span className="font-medium">{restEndpoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">События:</span>
              <span className="font-medium">{eventEndpoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Документировано:</span>
              <span className="font-medium text-green-400">{documentedPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Протестировано:</span>
              <span className="font-medium text-yellow-400">{testedPercentage}%</span>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button onClick={onSyncWithUseCases} variant="outline" className="w-full" size="sm">
            <Icon name="RefreshCw" size={14} className="mr-2" />
            Синхронизировать с Use Cases
          </Button>
          <Button onClick={onAutoGenerate} variant="outline" className="w-full" size="sm">
            <Icon name="Zap" size={14} className="mr-2" />
            Автогенерация недостающих API
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">API Design Studio</h1>
          <p className="text-muted-foreground">Управление API endpoints и документацией</p>
        </div>

        <Card className="mb-6">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                Все API
              </Button>
              <Button
                variant={selectedStatus === 'ready' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('ready')}
              >
                Готовые
              </Button>
              <Button
                variant={selectedStatus === 'development' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('development')}
              >
                В разработке
              </Button>
              <Button
                variant={selectedStatus === 'missing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('missing')}
              >
                Проблемы
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="Download" size={14} className="mr-2" />
                Импорт из Swagger
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="Upload" size={14} className="mr-2" />
                Экспорт всех API
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-3 text-xs font-semibold text-muted-foreground">№</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Метод</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Путь</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Сервис</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Статус</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Use Case</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.map((endpoint, index) => (
                  <tr 
                    key={endpoint.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onEditEndpoint(endpoint)}
                  >
                    <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="p-3">
                      <span className={`text-sm font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-mono">{endpoint.path}</td>
                    <td className="p-3 text-sm">{endpoint.serviceName}</td>
                    <td className="p-3">{getStatusBadge(endpoint.status)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{endpoint.useCaseId || '-'}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEndpoint(endpoint);
                        }}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <aside className="w-64 border-l border-border pl-4 space-y-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Быстрые действия</h3>
          <div className="space-y-2">
            <Button onClick={onCreateEndpoint} className="w-full" size="sm">
              <Icon name="Plus" size={14} className="mr-2" />
              Создать endpoint
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Icon name="Webhook" size={14} className="mr-2" />
              Создать webhook
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Icon name="Database" size={14} className="mr-2" />
              Сгенерировать CRUD
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Icon name="Sparkles" size={14} className="mr-2" />
              AI: Оптимизация
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Последние изменения</h3>
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <span className="text-muted-foreground">10:23</span>
              <span>Добавлен PUT /orders/{'{id}'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">09:41</span>
              <span>Обновлена схема Product</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">Вчера</span>
              <span>Добавлена аутентификация JWT</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Интеграции</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" size="sm">
              <Icon name="GitBranch" size={14} className="mr-2" />
              Sync with Architecture
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}
