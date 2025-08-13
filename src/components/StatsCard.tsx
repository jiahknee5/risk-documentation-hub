'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'emerald'
  change?: number
  changeLabel?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  change,
  changeLabel = 'from last month'
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          lightBg: 'bg-blue-50'
        }
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          lightBg: 'bg-green-50'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          lightBg: 'bg-yellow-50'
        }
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          lightBg: 'bg-red-50'
        }
      case 'orange':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          lightBg: 'bg-orange-50'
        }
      case 'emerald':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-600',
          lightBg: 'bg-emerald-50'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          lightBg: 'bg-gray-50'
        }
    }
  }

  const colors = getColorClasses(color)
  const isPositiveChange = change !== undefined && change >= 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colors.lightBg}`}>
          <div className={colors.text}>
            {icon}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 truncate">
            {title}
          </h3>
          <p className="text-2xl font-semibold text-gray-900">
            {value}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${
                isPositiveChange 
                  ? change === 0 
                    ? 'text-gray-500' 
                    : 'text-green-600'
                  : 'text-red-600'
              }`}>
                {change !== 0 && (
                  <>
                    {isPositiveChange ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                  </>
                )}
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change}
                </span>
              </div>
              <span className="text-sm text-gray-500 ml-2">
                {changeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}