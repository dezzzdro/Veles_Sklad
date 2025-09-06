import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Loading
} from '@/components/ui'

function UIDemo() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Модульная UI система
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Демонстрация переиспользуемых компонентов
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Кнопки (Button)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>По умолчанию</Button>
            <Button variant="secondary">Вторичная</Button>
            <Button variant="destructive">Удалить</Button>
            <Button variant="outline">Контур</Button>
            <Button variant="ghost">Призрак</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm">Маленькая</Button>
            <Button size="default">Средняя</Button>
            <Button size="lg">Большая</Button>
            <Button size="icon">
              <i className="fas fa-plus"></i>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Карточки (Card)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">1,234</p>
                <p className="text-sm text-gray-600">Всего товаров</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Система работает</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Элементы формы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Поле ввода (Input)
            </label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите текст..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              С кнопкой
            </label>
            <div className="flex space-x-2">
              <Input placeholder="Поиск..." className="flex-1" />
              <Button size="sm">
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Значки (Badge)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>По умолчанию</Badge>
            <Badge variant="secondary">Вторичный</Badge>
            <Badge variant="destructive">Ошибка</Badge>
            <Badge variant="outline">Контур</Badge>
            <Badge variant="success">Успешно</Badge>
            <Badge variant="warning">Предупреждение</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Состояния загрузки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={handleDemoLoading} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Показать загрузку'}
            </Button>

            {isLoading && (
              <Loading size="sm" text="Обработка..." />
            )}
          </div>

          <div className="space-y-2">
            <Loading size="sm" />
            <Loading size="md" text="Загрузка данных..." />
            <Loading size="lg" text="Пожалуйста, подождите..." />
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Интерактивная демонстрация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Введено символов:
              </span>
              <Badge variant={inputValue.length > 10 ? 'success' : 'secondary'}>
                {inputValue.length}
              </Badge>
            </div>

            {inputValue && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Вы ввели: <strong>{inputValue}</strong>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UIDemo