import { forwardRef } from 'react'

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className = '', size = 'md', text = 'Загрузка...', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    }

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center space-y-2 ${className}`}
        {...props}
      >
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    )
  }
)

Loading.displayName = 'Loading'

export { Loading }