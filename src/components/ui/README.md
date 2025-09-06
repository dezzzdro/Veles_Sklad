# Модульная UI система

Современная система переиспользуемых UI компонентов для приложения склада.

## 🎯 Особенности

- **Типизированные компоненты** - полная поддержка TypeScript
- **Темная/светлая тема** - автоматическая адаптация
- **Адаптивный дизайн** - responsive на всех устройствах
- **Переиспользуемые** - единообразный дизайн во всем приложении
- **Настраиваемые** - гибкие варианты и размеры

## 📦 Компоненты

### Button
```tsx
import { Button } from '@/components/ui'

// Базовое использование
<Button>Нажми меня</Button>

// С вариантами
<Button variant="secondary">Вторичная</Button>
<Button variant="destructive">Удалить</Button>
<Button variant="outline">Контур</Button>
<Button variant="ghost">Призрак</Button>

// С размерами
<Button size="sm">Маленький</Button>
<Button size="lg">Большой</Button>
<Button size="icon"><i className="fas fa-plus"></i></Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Заголовок карточки</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Содержимое карточки</p>
  </CardContent>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui'

<Input
  type="text"
  placeholder="Введите текст"
  onChange={(e) => console.log(e.target.value)}
/>
```

### Badge
```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Успешно</Badge>
<Badge variant="warning">Предупреждение</Badge>
<Badge variant="destructive">Ошибка</Badge>
```

### Loading
```tsx
import { Loading } from '@/components/ui'

<Loading size="lg" text="Загрузка данных..." />
```

## 🎨 Дизайн-система

### Цвета
- **Primary**: Синий (#3B82F6)
- **Secondary**: Серый (#6B7280)
- **Success**: Зеленый (#10B981)
- **Warning**: Желтый (#F59E0B)
- **Destructive**: Красный (#EF4444)

### Типографика
- **Заголовки**: font-semibold, tracking-tight
- **Текст**: font-normal, leading-relaxed
- **Метки**: text-xs, font-medium

### Отступы
- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)

## 🔧 Использование

### Импорт компонентов
```tsx
// Импорт отдельных компонентов
import { Button, Card } from '@/components/ui'

// Импорт всех компонентов
import * as UI from '@/components/ui'
```

### Кастомизация
```tsx
// Переопределение стилей через className
<Button className="custom-button">Кастомная кнопка</Button>

// Использование с forwardRef
const CustomButton = forwardRef<HTMLButtonElement>((props, ref) => (
  <Button ref={ref} variant="outline" {...props} />
))
```

## 📱 Адаптивность

Все компоненты автоматически адаптируются под разные размеры экранов:
- **Мобильные**: < 640px
- **Планшеты**: 640px - 1024px
- **Десктоп**: > 1024px

## 🌙 Темная тема

Компоненты автоматически поддерживают темную тему через CSS класс `dark`:

```html
<html class="dark">
  <!-- Компоненты автоматически переключатся на темную тему -->
</html>
```

## 🚀 Производительность

- **Ленивая загрузка** - компоненты загружаются по требованию
- **Оптимизированные стили** - минимальный CSS bundle
- **Tree shaking** - неиспользуемые компоненты исключаются из сборки

## 📚 Примеры использования

Смотрите компоненты в папках `src/pages/` для реальных примеров использования UI системы.