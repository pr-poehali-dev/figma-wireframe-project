# ARCHITECTON — Сверхинтеллектуальный ИИ-Ассистент

## 🎯 Концепция

**ARCHITECTON** (кодовое имя "Джарвис") — это эмоционально-интеллектуальный цифровой партнер для облачной архитектурной платформы. Он не просто инструмент, а виртуальный коллега уровня "Бог системной архитектуры" с глубоким, бархатистым, калиброванным голосом мужчины 35-45 лет.

## 🧠 Архитектура системы

### 1. **ArchitectonCore** (`src/components/ArchitectonCore.tsx`)
Ядро системы, управляющее всеми аспектами интеллекта:

#### Основные компоненты:
- **ProjectContext** — контекст проекта (активный раздел, выбранные элементы, фаза)
- **UserEmotionState** — эмоциональное состояние пользователя (настроение, уверенность, скорость действий)
- **ArchitectonMessage** — сообщения с метаданными (эмоция, когнитивный слой)

#### Функции:
- `trackUserAction(action, duration)` — трекинг действий пользователя
- `updateContext(context)` — обновление контекста проекта
- `proactiveAssist()` — проактивная помощь (срабатывает через 30 сек бездействия)
- `speak(text, emotion)` — синтез речи с эмоциональной окраской
- `analyzeAction(action, data)` — анализ действий в интерфейсе

### 2. **Когнитивные модули** (4 слоя интеллекта)

#### **Слой "Архитектор-Теоретик"** (`cognitiveLayer: 'theorist'`)
- Знание архитектурных стилей, концепций, композиции
- Ответы на вопросы о дизайне, освещении, стиле
- Примеры: инсоляция, биофильный дизайн, минимализм

#### **Слой "Инженер-Конструктор"** (`cognitiveLayer: 'engineer'`)
- Понимание конструкций, материалов, энергоэффективности
- Ответы на вопросы о нагрузках, материалах, теплопотерях
- Примеры: железобетон vs металл, тройной стеклопакет

#### **Слой "Эмоциональный интеллект"** (`cognitiveLayer: 'emotional'`)
- Анализ настроения по скорости печати, повторам, длительности сессии
- Адаптивный стиль общения (стресс → поддержка, творчество → провокация)
- Детекция усталости, стресса, фокуса, вдохновения

#### **Слой "Процессный Оптимизатор"** (`cognitiveLayer: 'process'`)
- Управление дедлайнами, графиками, документацией
- Автоматическое создание ТЗ, спецификаций, roadmap
- Напоминания о совещаниях, согласованиях

### 3. **Эмоциональный анализатор**

Определяет состояние пользователя на основе:
- **Скорость действий** (< 500ms → стресс/фокус, > 3000ms → усталость)
- **Повторяющиеся действия** (3 одинаковых подряд → неуверенность)
- **Длительность сессии** (> 60 мин → усталость)
- **Тип действий** (много delete/undo → стресс)

Результат: `mood` (stressed | focused | tired | inspired | neutral) + `confidence` (0-1)

### 4. **Голосовой синтез с эмоциями**

Адаптация голоса под эмоцию:
- **Calm** (спокойный): rate 1.0, pitch 0.7, volume 0.9
- **Enthusiastic** (восторженный): rate 1.2, pitch 0.9, volume 1.0
- **Concerned** (обеспокоенный): rate 0.95, pitch 0.7, volume 0.9
- **Supportive** (поддерживающий): rate 1.0, pitch 0.75, volume 0.95
- **Thoughtful** (задумчивый): rate 0.9, pitch 0.7, volume 0.9
- **Ironic** (ироничный): rate 1.1, pitch 0.8, volume 0.95

### 5. **Проактивные сценарии**

#### Сценарий "Критический анализ"
Триггер: долгая работа над элементом
```typescript
analyzeAction('select_element', { type: 'connection_node' })
// → "Вижу, вы изучаете узел соединения. У нас есть три альтернативных решения..."
```

#### Сценарий "Эмоциональная поддержка"
Триггер: `mood === 'stressed' || confidence < 0.4`
```typescript
// → "Шеф, вижу, задача непростая. Предлагаю разбить её на этапы..."
```

#### Сценарий "Проактивная помощь"
Триггер: 30 секунд бездействия
```typescript
proactiveAssist()
// → "Шеф, всё в порядке? Может, стоит передохнуть?"
```

#### Сценарий "Обнаружение зацикливания"
Триггер: повторяющиеся действия
```typescript
// 4+ одинаковых действий → "Шеф, кажется, мы ходим по кругу..."
```

## 🎨 UI Компоненты

### **ArchitectonWidget** (`src/components/ArchitectonWidget.tsx`)
Плавающий виджет с:
- Эмоциональной окраской сообщений (цвет = эмоция)
- Иконками когнитивных слоёв (💡 теоретик, 🔧 инженер, ❤️ EQ, 📅 процесс)
- Прогресс-баром уверенности пользователя
- Индикатором настроения (stressed/tired/focused/inspired)
- Временем сессии

### **ArchitectonWelcome** (`src/components/ArchitectonWelcome.tsx`)
Приветственная заставка с:
- Многослойным светящимся ядром
- Вращающимися кольцами (контр-вращение)
- Аудио-визуализацией при говорении
- Градиентным фоном (серый-чёрный-фиолетовый)
- Плавающими частицами

## 🚀 Как использовать

### 1. Активация
```typescript
import { useArchitecton } from '@/components/ArchitectonCore';

const { activate, isActive, speak } = useArchitecton();

// Активация (запрос микрофона)
await activate();
```

### 2. Трекинг действий пользователя
```typescript
const { trackUserAction, analyzeAction } = useArchitecton();

// Трекинг клика
trackUserAction('click_button', 500); // 500ms длительность

// Анализ с контекстом
analyzeAction('hover_long', { element: 'facade' });
```

### 3. Обновление контекста проекта
```typescript
const { updateContext } = useArchitecton();

updateContext({
  projectPhase: 'architecture',
  activeView: 'c4-diagram',
  selectedElements: ['component-1', 'component-2']
});
```

### 4. Ручное общение
```typescript
const { addMessage, speak } = useArchitecton();

addMessage(
  'Предлагаю усилить конструкцию здесь',
  'architecton',
  'thoughtful', // эмоция
  'engineer'    // когнитивный слой
);

speak('Предлагаю усилить конструкцию здесь', 'thoughtful');
```

## 📊 Метрики эмоционального состояния

### UserEmotionState
```typescript
interface UserEmotionState {
  mood: 'stressed' | 'focused' | 'tired' | 'inspired' | 'neutral';
  confidence: number; // 0-1
  lastActionSpeed: number; // ms
  patternDetected?: string;
}
```

### Триггеры состояний
- **stressed**: быстрые действия + много delete/undo
- **focused**: быстрые действия без ошибок
- **tired**: медленные действия + сессия > 60 мин
- **inspired**: редкие, уверенные действия
- **neutral**: дефолт

## 🎯 Интеграция с бэкендом

Backend endpoint: `ARCHITECTON_AI_URL`

### Запрос:
```json
{
  "message": "как улучшить освещение?",
  "context": {
    "projectPhase": "architecture",
    "activeView": "floor-plan",
    "selectedElements": ["room-5"],
    "recentActions": ["click_window", "hover_wall"],
    "sessionDuration": 25
  },
  "userEmotion": {
    "mood": "focused",
    "confidence": 0.7,
    "lastActionSpeed": 800
  },
  "history": [
    { "role": "user", "content": "..." },
    { "role": "architecton", "content": "..." }
  ]
}
```

### Ответ:
```json
{
  "response": "Интересный вопрос. Предлагаю увеличить площадь остекления на 20%...",
  "emotion": "thoughtful",
  "layer": "theorist"
}
```

## 🔧 Настройка

### Изменение приветствия
Отредактируйте текст в `ArchitectonWelcome.tsx`:
```typescript
const utterance = new SpeechSynthesisUtterance(
  'Ваш текст здесь'
);
```

### Добавление нового когнитивного слоя
1. Добавьте в `ArchitectonMessage`:
```typescript
cognitiveLayer?: 'theorist' | 'engineer' | 'emotional' | 'process' | 'your_layer';
```

2. Создайте логику в `getCognitiveResponse()`:
```typescript
if (lower.includes('ваш_триггер')) {
  return {
    text: "Ваш ответ",
    emotion: 'calm' as const,
    layer: 'your_layer' as const
  };
}
```

3. Добавьте иконку в `ArchitectonWidget`:
```typescript
const getLayerIcon = (layer?: string) => {
  switch (layer) {
    case 'your_layer': return 'YourIcon';
    // ...
  }
};
```

### Настройка таймингов
```typescript
// Проактивная помощь (30 сек → 60 сек)
proactiveTimerRef.current = setTimeout(proactiveAssist, 60000);

// Задержка при смене раздела (500ms → 1000ms)
setTimeout(() => { speak(intro); }, 1000);
```

## 🎓 Примеры сценариев

### 1. Критика с эмпатией
```typescript
// Триггер: пользователь выбрал сложный узел
analyzeAction('select_element', { type: 'complex_node' });

// Реакция через 2 сек:
// "Вижу, вы изучаете узел К5. У нас есть три альтернативных 
// решения с повышенной надёжностью. Хотите сравнить?"
```

### 2. Поддержка при стрессе
```typescript
// Триггер: userEmotion.mood === 'stressed'
// Реакция: 
// "Шеф, похоже, вы устали. Предлагаю короткий перерыв — 
// после него всё пойдёт легче."
```

### 3. Ирония при повторах
```typescript
// Триггер: 4 одинаковых действия подряд
// Реакция:
// "Шеф, кажется, мы ходим по кругу. Может, попробуем 
// другой подход?"
```

## 🏗️ Roadmap

- [ ] Интеграция с GPT-4 для реальных ответов (сейчас fallback)
- [ ] Голосовые команды ("Архитектон, покажи узлы")
- [ ] Визуальные аннотации в 3D (стрелки, подсветка)
- [ ] Анализ истории проекта (Git integration)
- [ ] Мультиязычность (EN, DE, FR)
- [ ] Персонализация голоса (выбор тембра)

## 📝 Лицензия

MIT — используйте свободно, создавайте нечто выдающееся.

---

**Создано с ❤️ для архитекторов будущего**
