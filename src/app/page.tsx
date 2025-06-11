'use client';

import { Suspense, useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Cookies from 'js-cookie'
import { NewsAPIArticle } from '@/types'

// Dynamically import client components with loading states
const NewsOverview = dynamic(() => import('@/components/NewsOverview'), {
  ssr: true
})

const PayoutCalculator = dynamic(() => import('@/components/PayoutCalculator'), {
  ssr: true
})

const NewsAnalytics = dynamic(() => import('@/components/NewsAnalytics'), {
  ssr: true
})

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsAPIArticle[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Remove the token cookie if user is not authenticated
        Cookies.remove('firebase-token');
        router.push('/auth/signin');
      } else {
        try {
          // Get a fresh token and update the cookie
          const token = await user.getIdToken();
          Cookies.set('firebase-token', token, { expires: 7 });
          
          // Fetch news data
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
            (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
          
          const response = await fetch(
            `${baseUrl}/api/news?q=news&page=1&pageSize=10&type=all`,
            { 
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch news');
          }

          const data = await response.json();
          setArticles(data.articles || []);
        } catch (error) {
          console.error('Error loading articles:', error);
          setArticles([]);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-6">
        <Suspense fallback={<div>Loading news overview...</div>}>
          <NewsOverview initialArticles={articles} />
        </Suspense>
        
        <Suspense fallback={<div>Loading calculator...</div>}>
          <PayoutCalculator />
        </Suspense>
        
        <Suspense fallback={<div>Loading analytics...</div>}>
          <NewsAnalytics />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
