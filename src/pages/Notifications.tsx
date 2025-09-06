function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Уведомления</h1>
          <p className="text-gray-600 dark:text-gray-400">Система оповещений</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <i className="fas fa-bell text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Модуль уведомлений</h3>
          <p className="text-gray-600 dark:text-gray-400">В разработке...</p>
        </div>
      </div>
    </div>
  )
}

export default Notifications