import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { DataSchema, SchemaProperty } from '@/types/api';

interface SchemaDesignerProps {
  schemas: DataSchema[];
  onCreateSchema: () => void;
  onEditSchema: (schema: DataSchema) => void;
  onClose: () => void;
}

export default function SchemaDesigner({ schemas, onCreateSchema, onEditSchema, onClose }: SchemaDesignerProps) {
  const [selectedSchema, setSelectedSchema] = useState<DataSchema | null>(schemas[0] || null);
  const [selectedProperty, setSelectedProperty] = useState<SchemaProperty | null>(null);
  const [codeTab, setCodeTab] = useState<'typescript' | 'json' | 'sql'>('typescript');

  const handlePropertyClick = (property: SchemaProperty) => {
    setSelectedProperty(property);
  };

  const generateTypeScriptCode = (schema: DataSchema) => {
    if (!schema) return '';
    
    const properties = schema.properties.map(prop => {
      const optional = !schema.required.includes(prop.name) ? '?' : '';
      let type = prop.type;
      
      if (prop.reference) {
        type = prop.reference;
      } else if (prop.type === 'array') {
        type = 'any[]';
      }
      
      return `  ${prop.name}${optional}: ${type};`;
    }).join('\n');

    return `interface ${schema.name} {\n${properties}\n}`;
  };

  const generateJsonSchema = (schema: DataSchema) => {
    if (!schema) return '';
    
    return JSON.stringify({
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": schema.properties.reduce((acc, prop) => {
        acc[prop.name] = {
          type: prop.type,
          description: prop.description
        };
        if (prop.validation) {
          if (prop.validation.minLength) acc[prop.name].minLength = prop.validation.minLength;
          if (prop.validation.maxLength) acc[prop.name].maxLength = prop.validation.maxLength;
          if (prop.validation.pattern) acc[prop.name].pattern = prop.validation.pattern;
        }
        return acc;
      }, {} as any),
      "required": schema.required
    }, null, 2);
  };

  const generateSqlCreate = (schema: DataSchema) => {
    if (!schema || !schema.linkedToDbTable) return '';
    
    const columns = schema.properties.map(prop => {
      let sqlType = 'TEXT';
      if (prop.type === 'number' || prop.type === 'integer') sqlType = 'INTEGER';
      if (prop.type === 'boolean') sqlType = 'BOOLEAN';
      if (prop.type === 'string' && prop.name.includes('date')) sqlType = 'TIMESTAMP';
      
      const notNull = schema.required.includes(prop.name) ? ' NOT NULL' : '';
      return `  ${prop.name} ${sqlType}${notNull}`;
    }).join(',\n');

    return `CREATE TABLE ${schema.linkedToDbTable} (\n${columns}\n);`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Конструктор схем данных</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-border p-4 overflow-y-auto">
            <div className="mb-4">
              <Button onClick={onCreateSchema} className="w-full" size="sm">
                <Icon name="Plus" size={14} className="mr-2" />
                Создать схему
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Схемы сервиса</h3>
              {schemas.map(schema => (
                <button
                  key={schema.id}
                  onClick={() => {
                    setSelectedSchema(schema);
                    setSelectedProperty(null);
                  }}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    selectedSchema?.id === schema.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="FileCode" size={14} />
                    <span className="font-medium truncate">{schema.name}</span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {schema.properties.length} полей
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Общие схемы</h3>
              <button className="w-full text-left p-2 rounded text-sm hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Icon name="FileCode" size={14} />
                  <span className="font-medium">PaginationMeta</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded text-sm hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Icon name="FileCode" size={14} />
                  <span className="font-medium">ErrorResponse</span>
                </div>
              </button>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            {selectedSchema ? (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Свойства схемы</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Название</Label>
                      <Input value={selectedSchema.name} className="mt-2" />
                    </div>
                    <div>
                      <Label>Тип</Label>
                      <Input value={selectedSchema.type} className="mt-2" disabled />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Описание</Label>
                    <Input value={selectedSchema.description} className="mt-2" />
                  </div>
                  {selectedSchema.linkedToDbTable && (
                    <div className="mt-4">
                      <Label>Привязана к таблице БД</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{selectedSchema.linkedToDbTable}</Badge>
                        <Button variant="ghost" size="sm">
                          <Icon name="ExternalLink" size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                <Card>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Поля схемы</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Wand2" size={14} className="mr-2" />
                        Сгенерировать из Use Case
                      </Button>
                      <Button size="sm">
                        <Icon name="Plus" size={14} className="mr-2" />
                        Добавить поле
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="p-3 text-xs font-semibold">№</th>
                          <th className="p-3 text-xs font-semibold">Имя поля</th>
                          <th className="p-3 text-xs font-semibold">Тип</th>
                          <th className="p-3 text-xs font-semibold">Обяз.</th>
                          <th className="p-3 text-xs font-semibold">Описание</th>
                          <th className="p-3 text-xs font-semibold">Пример</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSchema.properties.map((property, index) => (
                          <tr
                            key={property.id}
                            onClick={() => handlePropertyClick(property)}
                            className={`border-b border-border cursor-pointer transition-colors ${
                              selectedProperty?.id === property.id 
                                ? 'bg-muted/50' 
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                            <td className="p-3 text-sm font-mono font-medium">{property.name}</td>
                            <td className="p-3 text-sm">
                              <Badge variant="outline">{property.type}</Badge>
                            </td>
                            <td className="p-3 text-center">
                              {selectedSchema.required.includes(property.name) ? (
                                <Icon name="Check" size={16} className="text-green-400 mx-auto" />
                              ) : (
                                <Icon name="Minus" size={16} className="text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{property.description}</td>
                            <td className="p-3 text-sm font-mono text-muted-foreground">
                              {property.example ? String(property.example) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Предпросмотр кода</h3>
                    <div className="flex gap-1">
                      <Button
                        variant={codeTab === 'typescript' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCodeTab('typescript')}
                      >
                        TypeScript
                      </Button>
                      <Button
                        variant={codeTab === 'json' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCodeTab('json')}
                      >
                        JSON Schema
                      </Button>
                      <Button
                        variant={codeTab === 'sql' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCodeTab('sql')}
                      >
                        SQL
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                      {codeTab === 'typescript' && generateTypeScriptCode(selectedSchema)}
                      {codeTab === 'json' && generateJsonSchema(selectedSchema)}
                      {codeTab === 'sql' && generateSqlCreate(selectedSchema)}
                    </pre>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Icon name="Copy" size={14} className="mr-2" />
                      Копировать код
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Icon name="FileCode" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Выберите схему для редактирования</p>
                </div>
              </div>
            )}
          </main>

          {selectedProperty && (
            <aside className="w-80 border-l border-border p-4 overflow-y-auto">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Настройки поля</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Выбрано поле</Label>
                    <Input value={selectedProperty.name} className="mt-2 font-mono" />
                  </div>

                  <div>
                    <Label className="text-xs">Тип данных</Label>
                    <select className="w-full mt-2 p-2 border rounded text-sm bg-background">
                      <option value={selectedProperty.type}>{selectedProperty.type}</option>
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="array">array</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Обязательное</Label>
                    <div className="mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProperty.required}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Да</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Описание</Label>
                    <Input value={selectedProperty.description} className="mt-2" />
                  </div>

                  <div>
                    <Label className="text-xs">Пример</Label>
                    <Input 
                      value={selectedProperty.example ? String(selectedProperty.example) : ''} 
                      className="mt-2 font-mono text-xs" 
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold mb-3">Валидация</h4>
                    <div className="space-y-3">
                      {selectedProperty.type === 'string' && (
                        <>
                          <div>
                            <Label className="text-xs">Максимальная длина</Label>
                            <Input 
                              type="number" 
                              value={selectedProperty.validation?.maxLength || ''} 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Регулярное выражение</Label>
                            <Input 
                              value={selectedProperty.validation?.pattern || ''} 
                              className="mt-1 font-mono text-xs" 
                            />
                          </div>
                        </>
                      )}
                      {(selectedProperty.type === 'number' || selectedProperty.type === 'integer') && (
                        <>
                          <div>
                            <Label className="text-xs">Минимум</Label>
                            <Input 
                              type="number" 
                              value={selectedProperty.validation?.minimum || ''} 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Максимум</Label>
                            <Input 
                              type="number" 
                              value={selectedProperty.validation?.maximum || ''} 
                              className="mt-1" 
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold mb-2">Связи</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Используется в: OrderResponse</p>
                      <p>• Ссылается на: таблицу orders</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <Icon name="TestTube" size={14} className="mr-2" />
                    Сгенерировать тестовые данные
                  </Button>
                </div>
              </Card>
            </aside>
          )}
        </div>
      </Card>
    </div>
  );
}
