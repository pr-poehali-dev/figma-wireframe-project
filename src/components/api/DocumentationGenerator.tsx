import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface DocumentationGeneratorProps {
  onClose: () => void;
}

export default function DocumentationGenerator({ onClose }: DocumentationGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'tests' | 'mock' | 'quality'>('docs');
  const [selectedFormats, setSelectedFormats] = useState({
    openapi: true,
    markdown: true,
    postman: true,
    confluence: false
  });

  const toggleFormat = (format: keyof typeof selectedFormats) => {
    setSelectedFormats(prev => ({ ...prev, [format]: !prev[format] }));
  };

  const testCases = [
    { id: '1', name: 'UC-12: Успешный запрос списка заказов', tests: 3, passed: 3, failed: 0 },
    { id: '2', name: 'UC-13: Создание заказа с валидными данными', tests: 3, passed: 2, failed: 1 },
    { id: '3', name: 'UC-14: Обновление статуса заказа', tests: 2, passed: 2, failed: 0 }
  ];

  const qualityMetrics = {
    documentationCoverage: 92,
    testCoverage: 67,
    restfulCompliance: 85,
    performanceRating: 4.2
  };

  const issues = [
    { severity: 'high', message: 'Отсутствуют примеры ошибок в документации' },
    { severity: 'medium', message: 'Недостаточное покрытие тестами edge cases' },
    { severity: 'low', message: 'Избыточные поля в схеме OrderResponse' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Документация и тестирование API</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-1 p-2">
            {[
              { id: 'docs', label: 'Документация', icon: 'FileText' },
              { id: 'tests', label: 'Тест-кейсы', icon: 'TestTube' },
              { id: 'mock', label: 'Mock Server', icon: 'Server' },
              { id: 'quality', label: 'Качество', icon: 'CheckCircle' }
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
          {activeTab === 'docs' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Автогенерация документации</h3>
                
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium">Шаблоны документации:</h4>
                  {Object.entries(selectedFormats).map(([format, selected]) => (
                    <label key={format} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFormat(format as keyof typeof selectedFormats)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{format.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="text-sm font-medium">Настройки генерации:</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Включить примеры запросов</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Включить примеры ответов</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Включить схемы ошибок</span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Предпросмотр документации</h3>
                <div className="bg-muted/50 p-4 rounded text-sm space-y-3">
                  <h4 className="font-bold"># API Reference - Order Service</h4>
                  <h5 className="font-semibold">## GET /api/v1/orders</h5>
                  <p className="text-muted-foreground">
                    Возвращает список заказов с поддержкой фильтрации и пагинации.
                  </p>
                  
                  <div>
                    <p className="font-medium mb-2">### Параметры</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Параметр</th>
                          <th className="text-left p-2">Тип</th>
                          <th className="text-left p-2">Обязательный</th>
                          <th className="text-left p-2">Описание</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="p-2 font-mono">status</td>
                          <td className="p-2">string</td>
                          <td className="p-2">Нет</td>
                          <td className="p-2">Статус заказа</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <p className="font-medium mb-2">### Пример запроса</p>
                    <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`curl -X GET "https://api.example.com/api/v1/orders?status=shipped" \\
  -H "Authorization: Bearer <token>"`}
                    </pre>
                  </div>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Rocket" size={14} className="mr-2" />
                  Опубликовать документацию
                </Button>
                <Button variant="outline">
                  <Icon name="Share2" size={14} className="mr-2" />
                  Поделиться ссылкой
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Тестовые сценарии</h3>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Icon name="Play" size={14} className="mr-2" />
                      Запустить все тесты
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="BarChart" size={14} className="mr-2" />
                      Coverage report
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {testCases.map(testCase => (
                    <div key={testCase.id} className="p-4 border border-border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{testCase.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500">{testCase.passed} passed</Badge>
                          {testCase.failed > 0 && (
                            <Badge className="bg-red-500">{testCase.failed} failed</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Тест: Проверка пагинации</p>
                        <p>• Тест: Проверка фильтрации по статусу</p>
                        <p>• Тест: Проверка структуры ответа</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Статистика тестирования</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">8</div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">1</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">67%</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">9</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'mock' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Настройки мок-сервера</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Базовый URL</label>
                    <input
                      type="text"
                      defaultValue="https://mock-api.example.com"
                      className="w-full mt-2 p-2 border rounded bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Задержка ответа</label>
                    <input
                      type="text"
                      defaultValue="100-500ms random"
                      className="w-full mt-2 p-2 border rounded bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Режим работы</label>
                    <select className="w-full mt-2 p-2 border rounded bg-background">
                      <option>Реалистичный</option>
                      <option>Всегда успех</option>
                      <option>Всегда ошибка</option>
                      <option>Случайный</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Правила мокинга</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Badge variant="outline" className="bg-green-500">200</Badge>
                    <span className="font-mono">GET /orders</span>
                    <Icon name="ArrowRight" size={14} />
                    <span className="text-muted-foreground">Тестовые данные</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Badge variant="outline" className="bg-green-500">201</Badge>
                    <span className="font-mono">POST /orders</span>
                    <Icon name="ArrowRight" size={14} />
                    <span className="text-muted-foreground">При валидных данных</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Badge variant="outline" className="bg-yellow-500">400</Badge>
                    <span className="font-mono">POST /orders</span>
                    <Icon name="ArrowRight" size={14} />
                    <span className="text-muted-foreground">При невалидных данных</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Play" size={14} className="mr-2" />
                  Запустить mock server
                </Button>
                <Button variant="outline">
                  <Icon name="Link" size={14} className="mr-2" />
                  Получить URL для разработки
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Метрики качества API</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Полнота документации</span>
                      <Badge className="bg-green-500">{qualityMetrics.documentationCoverage}%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${qualityMetrics.documentationCoverage}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Полнота тестов</span>
                      <Badge className="bg-yellow-500">{qualityMetrics.testCoverage}%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${qualityMetrics.testCoverage}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">RESTful соответствие</span>
                      <Badge className="bg-green-500">{qualityMetrics.restfulCompliance}%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${qualityMetrics.restfulCompliance}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Производительность</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon 
                            key={i}
                            name="Star" 
                            size={14} 
                            className={i < Math.floor(qualityMetrics.performanceRating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Рекомендации по улучшению</h3>
                <div className="space-y-3">
                  {issues.map((issue, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 border border-border rounded"
                    >
                      <Icon 
                        name="AlertCircle" 
                        size={20} 
                        className={
                          issue.severity === 'high' ? 'text-red-400' :
                          issue.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        } 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={
                              issue.severity === 'high' ? 'bg-red-500' :
                              issue.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }
                          >
                            {issue.severity}
                          </Badge>
                          <span className="text-sm">{issue.message}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Wand2" size={14} className="mr-2" />
                  Авто-исправление проблем
                </Button>
                <Button variant="outline">
                  <Icon name="TrendingUp" size={14} className="mr-2" />
                  Сравнить с best practices
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
