'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'
import NewsOverview from '@/components/NewsOverview'
import { NewsAPIArticle } from '@/types'

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsAPIArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        // Get the base URL from environment or use the current URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
        
        const response = await fetch(
          `${baseUrl}/api/news?q=news&page=1&pageSize=10&type=all`,
          { 
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        setArticles(data.articles || [])
      } catch (error) {
        console.error('Error fetching news:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <NewsOverview initialArticles={articles} />
      </div>
    </DashboardLayout>
  )
} 