'use client'

import DashboardLayout from '@/components/DashboardLayout'
import NewsAnalytics from '@/components/NewsAnalytics'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <NewsAnalytics />
      </div>
    </DashboardLayout>
  )
} 