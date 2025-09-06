import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabaseService } from '@/services/supabase'

interface LogEntry {
  timestamp: string
  operation: string
  status: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface StressTestResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
}

function Debug() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [connectionTime, setConnectionTime] = useState<number>(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isStressTesting, setIsStressTesting] = useState(false)
  const [stressTestResult, setStressTestResult] = useState<StressTestResult | null>(null)
  const [stressTestConfig, setStressTestConfig] = useState({
    requests: 10,
    operation: 'read' as 'read' | 'write'
  })

  useEffect(() => {
    checkConnection()
    loadLogs()
  }, [])

  const addLog = (operation: string, status: 'success' | 'error' | 'info', message: string, duration?: number) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      operation,
      status,
      message,
      duration
    }

    setLogs(prev => {
      const newLogs = [logEntry, ...prev].slice(0, 100) // Keep only last 100 entries
      localStorage.setItem('debug_logs', JSON.stringify(newLogs))
      return newLogs
    })
  }

  const loadLogs = () => {
    const savedLogs = localStorage.getItem('debug_logs')
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs))
      } catch (error) {
        console.error('Failed to load logs:', error)
      }
    }
  }

  const checkConnection = async () => {
    const startTime = Date.now()
    setConnectionStatus('checking')
    addLog('connection_check', 'info', 'Проверка подключения к Supabase...')

    try {
      const isConnected = await supabaseService.healthCheck()
      const duration = Date.now() - startTime

      if (isConnected) {
        setConnectionStatus('connected')
        setConnectionTime(duration)
        addLog('connection_check', 'success', `Подключение успешно (${duration}ms)`, duration)
        toast.success(`Подключение успешно (${duration}ms)`)
      } else {
        setConnectionStatus('disconnected')
        setConnectionTime(duration)
        addLog('connection_check', 'error', `Подключение не удалось (${duration}ms)`, duration)
        toast.error('Подключение не удалось')
      }
    } catch (error) {
      const duration = Date.now() - startTime
      setConnectionStatus('disconnected')
      setConnectionTime(duration)
      addLog('connection_check', 'error', `Ошибка подключения: ${error}`, duration)
      toast.error('Ошибка подключения')
    }
  }

  const testReadOperation = async () => {
    const startTime = Date.now()
    addLog('test_read', 'info', 'Тест операции чтения...')

    try {
      const result = await supabaseService.getWarehouseItems()
      const duration = Date.now() - startTime

      if (result.error) {
        addLog('test_read', 'error', `Ошибка чтения: ${result.error}`, duration)
        toast.error('Ошибка чтения данных')
      } else {
        addLog('test_read', 'success', `Чтение успешно: ${result.data?.length || 0} записей`, duration)
        toast.success(`Чтение успешно (${duration}ms)`)
      }
    } catch (error) {
      const duration = Date.now() - startTime
      addLog('test_read', 'error', `Ошибка чтения: ${error}`, duration)
      toast.error('Ошибка чтения данных')
    }
  }

  const testWriteOperation = async () => {
    const startTime = Date.now()
    addLog('test_write', 'info', 'Тест операции записи...')

    try {
      const testData = {
        наименование: `Тестовый товар ${Date.now()}`,
        ед_изм: 'шт',
        числится: 1,
        на_складе: 1,
        выдано: 0
      }

      const result = await supabaseService.createWarehouseItem(testData)
      const duration = Date.now() - startTime

      if (result.error) {
        addLog('test_write', 'error', `Ошибка записи: ${result.error}`, duration)
        toast.error('Ошибка записи данных')
      } else {
        addLog('test_write', 'success', `Запись успешна: ID ${result.data?.id}`, duration)
        toast.success(`Запись успешна (${duration}ms)`)

        // Clean up test data
        if (result.data?.id) {
          setTimeout(() => {
            supabaseService.deleteWarehouseItem(result.data!.id)
          }, 1000)
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      addLog('test_write', 'error', `Ошибка записи: ${error}`, duration)
      toast.error('Ошибка записи данных')
    }
  }

  const runStressTest = async () => {
    setIsStressTesting(true)
    setStressTestResult(null)
    addLog('stress_test', 'info', `Запуск стресс-теста: ${stressTestConfig.requests} запросов (${stressTestConfig.operation})`)

    const results: number[] = []
    let successful = 0
    let failed = 0

    const startTime = Date.now()

    for (let i = 0; i < stressTestConfig.requests; i++) {
      const requestStart = Date.now()

      try {
        if (stressTestConfig.operation === 'read') {
          await supabaseService.getWarehouseItems()
        } else {
          const testData = {
            наименование: `Стресс-тест ${i} ${Date.now()}`,
            ед_изм: 'шт',
            числится: 1,
            на_складе: 1,
            выдано: 0
          }
          const result = await supabaseService.createWarehouseItem(testData)
          if (result.data?.id) {
            // Clean up immediately
            await supabaseService.deleteWarehouseItem(result.data.id)
          }
        }

        successful++
        const duration = Date.now() - requestStart
        results.push(duration)
      } catch (error) {
        failed++
        const duration = Date.now() - requestStart
        results.push(duration)
      }
    }

    const totalTime = Date.now() - startTime
    const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)

    const result: StressTestResult = {
      totalRequests: stressTestConfig.requests,
      successfulRequests: successful,
      failedRequests: failed,
      totalTime,
      averageTime: Math.round(averageTime),
      minTime,
      maxTime
    }

    setStressTestResult(result)
    setIsStressTesting(false)

    addLog('stress_test', 'success',
      `Стресс-тест завершен: ${successful}/${stressTestConfig.requests} успешно (${Math.round(averageTime)}ms среднее)`,
      totalTime
    )

    toast.success('Стресс-тест завершен')
  }

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem('debug_logs')
    addLog('clear_logs', 'info', 'Логи очищены')
    toast.success('Логи очищены')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'fas fa-check-circle'
      case 'error': return 'fas fa-times-circle'
      case 'info': return 'fas fa-info-circle'
      default: return 'fas fa-question-circle'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Отладка</h1>
          <p className="text-gray-600 dark:text-gray-400">Тестирование и диагностика работы с СУБД</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearLogs}
            className="btn btn-outline-danger"
          >
            <i className="fas fa-trash mr-2"></i>
            Очистить логи
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-plug mr-2"></i>
          Проверка подключения
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="font-medium">
              {connectionStatus === 'connected' ? 'Подключено' :
               connectionStatus === 'disconnected' ? 'Не подключено' : 'Проверка...'}
            </span>
            {connectionTime > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({connectionTime}ms)
              </span>
            )}
          </div>
          <button
            onClick={checkConnection}
            className="btn btn-primary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Проверить
          </button>
        </div>
      </div>

      {/* Test Operations */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-flask mr-2"></i>
          Тестовые операции
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testReadOperation}
            className="btn btn-success"
          >
            <i className="fas fa-download mr-2"></i>
            Тест чтения
          </button>
          <button
            onClick={testWriteOperation}
            className="btn btn-primary"
          >
            <i className="fas fa-upload mr-2"></i>
            Тест записи
          </button>
        </div>
      </div>

      {/* Stress Test */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-tachometer-alt mr-2"></i>
          Стресс-тест
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Количество запросов
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={stressTestConfig.requests}
                onChange={(e) => setStressTestConfig(prev => ({
                  ...prev,
                  requests: parseInt(e.target.value) || 10
                }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Тип операции
              </label>
              <select
                value={stressTestConfig.operation}
                onChange={(e) => setStressTestConfig(prev => ({
                  ...prev,
                  operation: e.target.value as 'read' | 'write'
                }))}
                className="input"
              >
                <option value="read">Чтение</option>
                <option value="write">Запись</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={runStressTest}
                disabled={isStressTesting}
                className="btn btn-warning w-full"
              >
                {isStressTesting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Тестирование...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-2"></i>
                    Запустить тест
                  </>
                )}
              </button>
            </div>
          </div>

          {stressTestResult && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Результаты теста:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Всего запросов</div>
                  <div className="font-medium">{stressTestResult.totalRequests}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Успешно</div>
                  <div className="font-medium text-green-600">{stressTestResult.successfulRequests}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Ошибок</div>
                  <div className="font-medium text-red-600">{stressTestResult.failedRequests}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Общее время</div>
                  <div className="font-medium">{stressTestResult.totalTime}ms</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Среднее время</div>
                  <div className="font-medium">{stressTestResult.averageTime}ms</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Мин. время</div>
                  <div className="font-medium">{stressTestResult.minTime}ms</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Макс. время</div>
                  <div className="font-medium">{stressTestResult.maxTime}ms</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-list mr-2"></i>
          Система логирования ({logs.length} записей)
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-info-circle text-3xl mb-2"></i>
              <p>Логов пока нет</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <i className={`${getStatusIcon(log.status)} ${getStatusColor(log.status)} mt-1`}></i>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {log.operation}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {log.message}
                  </p>
                  {log.duration && (
                    <span className="text-xs text-gray-500">
                      Время выполнения: {log.duration}ms
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Debug