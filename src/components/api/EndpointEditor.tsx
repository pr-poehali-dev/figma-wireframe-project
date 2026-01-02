import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ApiEndpoint, ApiParameter, ApiResponse, HttpMethod, AuthType } from '@/types/api';

interface EndpointEditorProps {
  endpoint?: ApiEndpoint;
  onSave: (endpoint: Partial<ApiEndpoint>) => void;
  onClose: () => void;
}

export default function EndpointEditor({ endpoint, onSave, onClose }: EndpointEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'params' | 'schemas' | 'security' | 'tests' | 'docs'>('basic');
  const [method, setMethod] = useState<HttpMethod>(endpoint?.method || 'GET');
  const [path, setPath] = useState(endpoint?.path || '/api/v1/');
  const [summary, setSummary] = useState(endpoint?.summary || '');
  const [description, setDescription] = useState(endpoint?.description || '');
  const [serviceName, setServiceName] = useState(endpoint?.serviceName || '');
  const [parameters, setParameters] = useState<ApiParameter[]>(endpoint?.parameters || []);
  const [responses, setResponses] = useState<ApiResponse[]>(endpoint?.responses || [
    { statusCode: 200, description: 'Успешно', contentType: 'application/json' }
  ]);
  const [authType, setAuthType] = useState<AuthType>(endpoint?.security[0]?.type || 'jwt');
  const [scopes, setScopes] = useState<string[]>(endpoint?.security[0]?.scopes || []);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(endpoint?.rateLimiting?.enabled || false);
  const [rateLimit, setRateLimit] = useState(endpoint?.rateLimiting?.limit || 1000);

  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

  const handleSave = () => {
    const updatedEndpoint: Partial<ApiEndpoint> = {
      method,
      path,
      summary,
      description,
      serviceName,
      parameters,
      responses,
      security: [{ type: authType, scopes, description: '' }],
      rateLimiting: {
        enabled: rateLimitEnabled,
        limit: rateLimit,
        period: 'hour',
        perUser: true
      }
    };
    onSave(updatedEndpoint);
  };

  const addParameter = () => {
    const newParam: ApiParameter = {
      id: Date.now().toString(),
      name: '',
      in: 'query',
      type: 'string',
      required: false,
      description: '',
      source: 'manual'
    };
    setParameters([...parameters, newParam]);
  };

  const updateParameter = (index: number, field: keyof ApiParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const addResponse = () => {
    const newResponse: ApiResponse = {
      statusCode: 400,
      description: 'Ошибка',
      contentType: 'application/json'
    };
    setResponses([...responses, newResponse]);
  };

  const updateResponse = (index: number, field: keyof ApiResponse, value: any) => {
    const updated = [...responses];
    updated[index] = { ...updated[index], [field]: value };
    setResponses(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {endpoint ? 'Редактировать Endpoint' : 'Создать Endpoint'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-1 p-2">
            {[
              { id: 'basic', label: 'Основное', icon: 'Settings' },
              { id: 'params', label: 'Параметры', icon: 'List' },
              { id: 'schemas', label: 'Схемы', icon: 'Code' },
              { id: 'security', label: 'Безопасность', icon: 'Shield' },
              { id: 'tests', label: 'Тесты', icon: 'CheckCircle' },
              { id: 'docs', label: 'Документация', icon: 'FileText' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <Icon name={tab.icon as any} size={14} />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Базовые параметры</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>HTTP Метод</Label>
                    <div className="flex gap-2 mt-2">
                      {httpMethods.map(m => (
                        <Button
                          key={m}
                          variant={method === m ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMethod(m)}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Сервис</Label>
                    <Input
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Order Service"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Путь</Label>
                  <Input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/api/v1/orders"
                    className="mt-2 font-mono"
                  />
                </div>

                <div className="mt-4">
                  <Label>Название</Label>
                  <Input
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Get all orders"
                    className="mt-2"
                  />
                </div>

                <div className="mt-4">
                  <Label>Описание</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Возвращает список заказов с поддержкой фильтрации и пагинации"
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </Card>

              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <div className="flex gap-3">
                  <Icon name="Lightbulb" size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Интеллектуальные подсказки</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Этот endpoint принадлежит сервису: {serviceName || 'Order Service'}</p>
                      <p>• Зависит от: PostgreSQL (через репозиторий)</p>
                      <p>• Использует кэш: Redis (для кэширования списков)</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium">Рекомендации:</p>
                      <p className="text-sm text-muted-foreground">1. Добавить кэширование (Cache-Control: max-age=60)</p>
                      <p className="text-sm text-muted-foreground">2. Использовать пагинацию с limit=50 по умолчанию</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Применить рекомендации
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Параметры запроса</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Wand2" size={14} className="mr-2" />
                    Сгенерировать из Use Case
                  </Button>
                  <Button onClick={addParameter} size="sm">
                    <Icon name="Plus" size={14} className="mr-2" />
                    Добавить параметр
                  </Button>
                </div>
              </div>

              <Card>
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-3 text-xs font-semibold">Имя</th>
                      <th className="p-3 text-xs font-semibold">Тип</th>
                      <th className="p-3 text-xs font-semibold">В</th>
                      <th className="p-3 text-xs font-semibold">Обязательный</th>
                      <th className="p-3 text-xs font-semibold">Описание</th>
                      <th className="p-3 text-xs font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((param, index) => (
                      <tr key={param.id} className="border-b border-border">
                        <td className="p-2">
                          <Input
                            value={param.name}
                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                            placeholder="status"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={param.type}
                            onChange={(e) => updateParameter(index, 'type', e.target.value)}
                            className="w-full p-2 border rounded text-sm bg-background"
                          >
                            <option value="string">string</option>
                            <option value="integer">integer</option>
                            <option value="boolean">boolean</option>
                            <option value="array">array</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value={param.in}
                            onChange={(e) => updateParameter(index, 'in', e.target.value)}
                            className="w-full p-2 border rounded text-sm bg-background"
                          >
                            <option value="query">query</option>
                            <option value="path">path</option>
                            <option value="header">header</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={param.description}
                            onChange={(e) => updateParameter(index, 'description', e.target.value)}
                            placeholder="Описание параметра"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(index)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {parameters.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Параметры не добавлены</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Схемы запроса и ответа</h3>

              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Ответы (Response)</h4>
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 border border-border rounded">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Статус</Label>
                          <Input
                            type="number"
                            value={response.statusCode}
                            onChange={(e) => updateResponse(index, 'statusCode', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Описание</Label>
                          <Input
                            value={response.description}
                            onChange={(e) => updateResponse(index, 'description', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Badge className={
                        response.statusCode < 300 ? 'bg-green-500' :
                        response.statusCode < 400 ? 'bg-blue-500' :
                        response.statusCode < 500 ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {response.statusCode}
                      </Badge>
                    </div>
                  ))}
                  <Button onClick={addResponse} variant="outline" size="sm">
                    <Icon name="Plus" size={14} className="mr-2" />
                    Добавить статус
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Пример ответа (автогенерация)</h4>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "data": [
    { "id": "123", "status": "processing", ... }
  ],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}`}
                </pre>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Безопасность и аутентификация</h3>

                <div>
                  <Label>Тип аутентификации</Label>
                  <div className="flex gap-2 mt-2">
                    {(['none', 'apiKey', 'jwt', 'oauth2'] as AuthType[]).map(type => (
                      <Button
                        key={type}
                        variant={authType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAuthType(type)}
                      >
                        {type.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Права доступа (Scopes)</Label>
                  <div className="mt-2 space-y-2">
                    {['orders.read', 'orders.write', 'orders.delete', 'admin'].map(scope => (
                      <label key={scope} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scopes.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScopes([...scopes, scope]);
                            } else {
                              setScopes(scopes.filter(s => s !== scope));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rateLimitEnabled}
                      onChange={(e) => setRateLimitEnabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Rate Limiting
                  </Label>
                  {rateLimitEnabled && (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(parseInt(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">запросов/час</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="TestTube" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Автогенерация тестов на основе Use Cases</p>
              <Button variant="outline" className="mt-4">
                <Icon name="Play" size={14} className="mr-2" />
                Запустить тесты
              </Button>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Автогенерация документации OpenAPI</p>
              <Button variant="outline" className="mt-4">
                <Icon name="Download" size={14} className="mr-2" />
                Экспорт документации
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            <Icon name="Save" size={14} className="mr-2" />
            Сохранить endpoint
          </Button>
        </div>
      </Card>
    </div>
  );
}
