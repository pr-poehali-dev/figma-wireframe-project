import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface CodeGeneratorProps {
  onClose: () => void;
}

export default function CodeGenerator({ onClose }: CodeGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend' | 'infra' | 'cicd'>('backend');
  const [backendLanguage, setBackendLanguage] = useState('spring');
  const [frontendLanguage, setFrontendLanguage] = useState('typescript');
  const [infraPlatform, setInfraPlatform] = useState('kubernetes');

  const backendComponents = [
    { id: 'controller', label: 'Контроллер (Controller)', checked: true },
    { id: 'service', label: 'Сервис (Service layer)', checked: true },
    { id: 'repository', label: 'Репозиторий (Repository)', checked: true },
    { id: 'dto', label: 'DTO (Data Transfer Objects)', checked: true },
    { id: 'validators', label: 'Валидаторы', checked: true },
    { id: 'tests', label: 'Тесты (JUnit/Mockito)', checked: false }
  ];

  const springBootCode = `@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

  private final OrderService orderService;

  @Autowired
  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @GetMapping
  public ResponseEntity<OrderListResponse> getOrders(
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "50") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    
    OrderListResponse response = orderService.getOrders(
      status, limit, offset
    );
    
    return ResponseEntity.ok(response);
  }
}`;

  const typescriptSdkCode = `import { OrderApi } from '@company/api-client';

const api = new OrderApi({ 
  basePath: 'https://api.example.com' 
});

// Автогенерированный метод
const orders = await api.getOrders({
  status: 'processing',
  limit: 50,
  offset: 0
});

console.log(orders.data);`;

  const kubernetesManifest = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: company/order-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"`;

  const githubActionsYaml = `name: API CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Validate OpenAPI Spec
      run: |
        npm install -g @openapitools/openapi-generator-cli
        openapi-generator-cli validate -i openapi.yaml
    
    - name: Generate Documentation
      run: |
        npx redoc-cli bundle openapi.yaml
    
  build:
    needs: validate
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
    
    - name: Build with Maven
      run: mvn clean package
    
    - name: Run Tests
      run: mvn test
    
    - name: Build Docker Image
      run: docker build -t order-service:$GITHUB_SHA .
    
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Staging
      run: kubectl apply -f k8s/staging/`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Генерация кода и инфраструктуры</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-1 p-2">
            {[
              { id: 'backend', label: 'Бэкенд код', icon: 'Code' },
              { id: 'frontend', label: 'Фронтенд клиенты', icon: 'Globe' },
              { id: 'infra', label: 'Инфраструктура', icon: 'Server' },
              { id: 'cicd', label: 'CI/CD', icon: 'GitBranch' }
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
          {activeTab === 'backend' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Генерация бэкенд кода</h3>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Язык/фреймворк</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'spring', label: 'Spring Boot (Java)' },
                      { id: 'express', label: 'Node.js (Express)' },
                      { id: 'fastapi', label: 'Python (FastAPI)' },
                      { id: 'gin', label: 'Go (Gin)' },
                      { id: 'dotnet', label: '.NET Core' }
                    ].map(lang => (
                      <Button
                        key={lang.id}
                        variant={backendLanguage === lang.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBackendLanguage(lang.id)}
                      >
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Генерируемые компоненты</label>
                  <div className="space-y-2">
                    {backendComponents.map(component => (
                      <label key={component.id} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={component.checked} className="w-4 h-4" />
                        <span className="text-sm">{component.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Предпросмотр кода</h3>
                  <Badge variant="outline">Spring Boot</Badge>
                </div>
                <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                  {springBootCode}
                </pre>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Download" size={14} className="mr-2" />
                  Скачать сгенерированный код
                </Button>
                <Button variant="outline">
                  <Icon name="GitBranch" size={14} className="mr-2" />
                  Интегрировать в репозиторий
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Генерация клиентских библиотек</h3>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Клиенты для фронтенда</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">TypeScript/JavaScript SDK</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Swift (iOS)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Kotlin (Android)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Python Client</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="text-sm font-medium">Настройки TypeScript SDK</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs">Имя пакета</label>
                      <input 
                        type="text" 
                        defaultValue="@company/api-client" 
                        className="w-full mt-1 p-2 border rounded text-sm bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Версия</label>
                      <input 
                        type="text" 
                        defaultValue="1.0.0" 
                        className="w-full mt-1 p-2 border rounded text-sm bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs">Стиль</label>
                    <select className="w-full mt-1 p-2 border rounded text-sm bg-background">
                      <option>Promise-based</option>
                      <option>Callback</option>
                      <option>RxJS</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Предпросмотр клиента</h3>
                  <Badge variant="outline">TypeScript SDK</Badge>
                </div>
                <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                  {typescriptSdkCode}
                </pre>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Package" size={14} className="mr-2" />
                  Опубликовать в npm
                </Button>
                <Button variant="outline">
                  <Icon name="FileText" size={14} className="mr-2" />
                  Сгенерировать документацию
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'infra' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Инфраструктура как код (IaC)</h3>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Платформа</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'kubernetes', label: 'Kubernetes' },
                      { id: 'docker', label: 'Docker Compose' },
                      { id: 'aws-cdk', label: 'AWS CDK' },
                      { id: 'terraform', label: 'Terraform' }
                    ].map(platform => (
                      <Button
                        key={platform.id}
                        variant={infraPlatform === platform.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInfraPlatform(platform.id)}
                      >
                        {platform.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Генерируемые конфигурации</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Dockerfile</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Kubernetes Deployment</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Kubernetes Service</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">ConfigMap (переменные окружения)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Ingress Route</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Helm Chart</span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Предпросмотр манифеста</h3>
                  <Badge variant="outline">Kubernetes</Badge>
                </div>
                <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                  {kubernetesManifest}
                </pre>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Download" size={14} className="mr-2" />
                  Экспорт в Git
                </Button>
                <Button variant="outline">
                  <Icon name="Rocket" size={14} className="mr-2" />
                  Применить через CI/CD
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'cicd' && (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">CI/CD Pipeline Configuration</h3>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Интеграция с CI/CD</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">GitHub Actions</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">GitLab CI</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Jenkins</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">ArgoCD (для GitOps)</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-3">Автоматические этапы pipeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                      <Icon name="CheckCircle" size={16} className="text-green-400" />
                      <span className="text-sm">Проверка API контракта (OpenAPI validation)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                      <Icon name="CheckCircle" size={16} className="text-green-400" />
                      <span className="text-sm">Сборка и тестирование</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                      <Icon name="CheckCircle" size={16} className="text-green-400" />
                      <span className="text-sm">Генерация документации</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                      <Icon name="RefreshCw" size={16} className="text-blue-400" />
                      <span className="text-sm">Развертывание в staging</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <Icon name="Clock" size={16} className="text-yellow-400" />
                      <span className="text-sm">Ручное подтверждение для production</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">GitHub Actions Workflow</h3>
                  <Badge variant="outline">YAML</Badge>
                </div>
                <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                  {githubActionsYaml}
                </pre>
              </Card>

              <div className="flex gap-2">
                <Button>
                  <Icon name="Settings" size={14} className="mr-2" />
                  Настроить pipeline
                </Button>
                <Button variant="outline">
                  <Icon name="BarChart" size={14} className="mr-2" />
                  Dashboard мониторинга
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
