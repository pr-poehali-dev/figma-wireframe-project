import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ApiEvent, EventProtocol, Webhook } from '@/types/api';

interface EventDesignerProps {
  events: ApiEvent[];
  onCreateEvent: () => void;
  onClose: () => void;
}

export default function EventDesigner({ events, onCreateEvent, onClose }: EventDesignerProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'webhooks' | 'queues' | 'reactions'>('events');
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(events[0] || null);
  const [protocol, setProtocol] = useState<EventProtocol>('kafka');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Конструктор событий и Webhooks</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-1 p-2">
            {[
              { id: 'events', label: 'События', icon: 'Zap' },
              { id: 'webhooks', label: 'Webhooks', icon: 'Webhook' },
              { id: 'queues', label: 'Message Queues', icon: 'Radio' },
              { id: 'reactions', label: 'Реакции', icon: 'Workflow' }
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

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-border p-4 overflow-y-auto">
            <div className="mb-4">
              <Button onClick={onCreateEvent} className="w-full" size="sm">
                <Icon name="Plus" size={14} className="mr-2" />
                Создать событие
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Order Service</h3>
                <div className="space-y-1">
                  {events.filter(e => e.sourceService === 'Order Service').map(event => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedEvent?.id === event.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={12} />
                        <span className="font-mono text-xs truncate">{event.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Payment Service</h3>
                <div className="space-y-1">
                  {events.filter(e => e.sourceService === 'Payment Service').map(event => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedEvent?.id === event.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={12} />
                        <span className="font-mono text-xs truncate">{event.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Внешние события</h3>
                <button className="w-full text-left p-2 rounded text-sm hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Icon name="Globe" size={12} />
                    <span className="font-mono text-xs">shipment.tracking</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" className="w-full" size="sm">
                <Icon name="Link" size={14} className="mr-2" />
                Связать с Use Case
              </Button>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            {selectedEvent ? (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Основные параметры</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Название события</Label>
                      <Input value={selectedEvent.name} className="mt-2 font-mono" />
                    </div>
                    <div>
                      <Label>Сервис-источник</Label>
                      <Input value={selectedEvent.sourceService} className="mt-2" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Описание</Label>
                    <Textarea 
                      value={selectedEvent.description} 
                      className="mt-2"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Триггер</Label>
                      <Input 
                        value={selectedEvent.triggerEndpoint || 'POST /api/v1/orders'} 
                        className="mt-2 font-mono text-sm" 
                      />
                    </div>
                    <div>
                      <Label>Протокол</Label>
                      <select
                        value={protocol}
                        onChange={(e) => setProtocol(e.target.value as EventProtocol)}
                        className="w-full mt-2 p-2 border rounded text-sm bg-background"
                      >
                        <option value="kafka">Apache Kafka</option>
                        <option value="rabbitmq">RabbitMQ</option>
                        <option value="sns">AWS SNS</option>
                        <option value="pubsub">Google Pub/Sub</option>
                        <option value="redis">Redis Streams</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Топик/канал</Label>
                    <Input value={selectedEvent.topic} className="mt-2" />
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Схема payload</h3>
                  <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
{`{
  "eventId": "evt_789",
  "eventType": "order.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "orderId": "ord_123",
    "userId": "usr_456",
    "totalAmount": 199.99,
    "itemsCount": 3
  },
  "metadata": {
    "service": "order-service",
    "version": "1.0.0"
  }
}`}
                  </pre>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Icon name="Edit" size={14} className="mr-2" />
                    Редактировать схему
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Подписчики (Consumers)</h3>
                  <div className="space-y-3">
                    {selectedEvent.consumers.map((consumer, index) => (
                      <div key={consumer.id} className="flex items-center justify-between p-3 border border-border rounded">
                        <div className="flex items-center gap-3">
                          <Icon name="Box" size={20} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{consumer.serviceName}</p>
                            <p className="text-xs text-muted-foreground">{consumer.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(consumer.status)}>
                            {consumer.status}
                          </Badge>
                          {consumer.lastProcessed && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(consumer.lastProcessed).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Icon name="Plus" size={14} className="mr-2" />
                      Добавить подписчика
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Workflow" size={14} className="mr-2" />
                      Показать схему потоков
                    </Button>
                  </div>
                </Card>

                {activeTab === 'webhooks' && (
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold mb-4">Внешние Webhook-и</h3>
                    <div className="space-y-3">
                      {selectedEvent.webhooks.map((webhook) => (
                        <div key={webhook.id} className="p-3 border border-border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{webhook.method}</Badge>
                              <span className="text-sm font-mono">{webhook.url}</span>
                            </div>
                            <Badge className={getStatusColor(webhook.status)}>
                              {webhook.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {webhook.lastTriggered && (
                              <p>Последний запуск: {new Date(webhook.lastTriggered).toLocaleString()}</p>
                            )}
                            {webhook.lastError && (
                              <p className="text-red-400">Ошибка: {webhook.lastError}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-muted/30 rounded">
                      <h4 className="text-sm font-medium mb-3">Настройки доставки</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retry Policy:</span>
                          <span>3 попытки с экспоненциальной задержкой</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timeout:</span>
                          <span>30 секунд</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dead Letter Queue:</span>
                          <Badge className="bg-green-500">Включен</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Icon name="Plus" size={14} className="mr-2" />
                        Добавить webhook
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="TestTube" size={14} className="mr-2" />
                        Тестовая отправка
                      </Button>
                    </div>
                  </Card>
                )}

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">AsyncAPI спецификация</h3>
                    <Button variant="outline" size="sm">
                      <Icon name="Download" size={14} className="mr-2" />
                      Экспорт в Kafka Connect
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
{`asyncapi: '2.6.0'
info:
  title: Order Service Events
  version: '1.0.0'
channels:
  orders:
    publish:
      message:
        payload:
          $ref: '#/components/schemas/OrderCreatedEvent'
components:
  schemas:
    OrderCreatedEvent:
      type: object
      properties:
        orderId:
          type: string
        userId:
          type: string`}
                  </pre>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Icon name="FileText" size={14} className="mr-2" />
                    Предпросмотр полной спецификации
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Icon name="Zap" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Выберите событие для редактирования</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </Card>
    </div>
  );
}
