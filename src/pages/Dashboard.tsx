import { Link } from 'react-router-dom'

function Dashboard() {
  const stats = [
    {
      name: 'Всего товаров',
      value: '1,234',
      icon: 'fas fa-box',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'В сборке',
      value: '56',
      icon: 'fas fa-cogs',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      name: 'Выдано сегодня',
      value: '23',
      icon: 'fas fa-truck',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      name: 'Контрагентов',
      value: '89',
      icon: 'fas fa-users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ]

  const quickActions = [
    { name: 'Добавить товар', href: '/sklad', icon: 'fas fa-plus', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Создать приход', href: '/prihod', icon: 'fas fa-truck', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Выдать товар', href: '/vydannoe', icon: 'fas fa-box-open', color: 'bg-orange-600 hover:bg-orange-700' },
    { name: 'Добавить контрагента', href: '/kontragenty', icon: 'fas fa-user-plus', color: 'bg-purple-600 hover:bg-purple-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Панель управления</h1>
          <p className="text-gray-600 dark:text-gray-400">Обзор состояния склада</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <i className={`${stat.icon} ${stat.color} text-xl`}></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`btn text-white ${action.color} transition-colors`}
            >
              <i className={`${action.icon} mr-2`}></i>
              {action.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Недавняя активность</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-plus text-blue-600 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Добавлен новый товар</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Болты М6, 500 шт</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">2 мин назад</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-truck text-green-600 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Принят приход</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Гайки М8, 200 шт</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">15 мин назад</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-box-open text-orange-600 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Выдан товар</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Шайбы М10, 50 шт</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">1 час назад</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard