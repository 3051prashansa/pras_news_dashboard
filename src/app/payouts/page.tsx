'use client'

import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/DashboardLayout'

// Dynamically import PayoutCalculator with no SSR
const PayoutCalculator = dynamic(
  () => import('@/components/PayoutCalculator'),
  { ssr: false }
)

export default function PayoutsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PayoutCalculator />
      </div>
    </DashboardLayout>
  )
} 