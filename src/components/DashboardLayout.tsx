import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the client-side interactive header
const InteractiveHeader = dynamic(() => import('@/components/InteractiveHeader'), {
  ssr: true,
  loading: () => (
    <div className="h-16 bg-white shadow animate-pulse" />
  )
})

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
        <Suspense fallback={<div className="h-16 bg-white shadow animate-pulse" />}>
          <InteractiveHeader />
        </Suspense>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 