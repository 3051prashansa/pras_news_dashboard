'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  HomeIcon, 
  NewspaperIcon, 
  ChartBarIcon, 
  CalculatorIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'

export default function InteractiveHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'News & Blogs', href: '/news', icon: NewspaperIcon },
    { name: 'Payouts', href: '/payouts', icon: CalculatorIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ]

  // Prefetch all navigation routes
  useEffect(() => {
    navigation.forEach(item => {
      router.prefetch(item.href)
    })
  }, [router])

  const handleNavigation = (href: string) => {
    setIsSidebarOpen(false)
    router.push(href)
  }

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Overlay with blur effect */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full w-64 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">News & Blogs Dashboard</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-end">
            <div className="ml-4 flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user.photoURL ? (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'Profile'}
                          fill
                          sizes="(max-width: 32px) 100vw, 32px"
                          className="object-cover"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
} 