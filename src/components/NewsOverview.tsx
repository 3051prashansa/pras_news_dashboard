'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setArticles, setLoading, setError } from '@/store/newsSlice'
import { NewsAPIArticle } from '@/types'

interface NewsOverviewProps {
  initialArticles: NewsAPIArticle[]
}

export default function NewsOverview({ initialArticles }: NewsOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [type, setType] = useState<'all' | 'news' | 'blog'>('all')
  const [author, setAuthor] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const dispatch = useDispatch()
  const { articles, loading, error } = useSelector((state: RootState) => state.news)

  // Initialize with server-side data
  useEffect(() => {
    if (initialArticles.length > 0) {
      dispatch(setArticles(initialArticles))
    }
  }, [initialArticles, dispatch])

  const fetchNews = async () => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))
      
      const response = await fetch(
        `/api/news?q=${searchQuery || 'news'}&page=${page}&pageSize=10&type=${type}&author=${author}&startDate=${dateRange.start}&endDate=${dateRange.end}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      
      if (data.articles && Array.isArray(data.articles)) {
        dispatch(setArticles(data.articles))
      } else {
        dispatch(setError('Invalid response format'))
      }
    } catch (error) {
      dispatch(setError('Failed to fetch news'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (searchQuery || page > 1 || type !== 'all' || author || dateRange.start || dateRange.end) {
      fetchNews()
    }
  }, [searchQuery, page, type, author, dateRange])

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">News & Blog Overview</h2>
      
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news and blogs..."
            className="w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white text-sm sm:text-base"
          />
        </div>
        
        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Author Filter */}
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Filter by author..."
              className="w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white text-sm sm:text-base"
            />
          </div>

          {/* Date Range Filters */}
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white text-sm sm:text-base"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setType('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base ${
              type === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setType('news')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base ${
              type === 'news'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            News
          </button>
          <button
            onClick={() => setType('blog')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base ${
              type === 'blog'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Blogs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center p-4 text-sm sm:text-base">Loading articles...</div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 text-sm sm:text-base">{error}</div>
      ) : articles && articles.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {articles.map((article: NewsAPIArticle, index: number) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white">
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${article.urlToImage ? 'sm:flex-row' : ''}`}>
                {article.urlToImage && (
                  <div className="w-full sm:w-1/3">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className={`w-full ${article.urlToImage ? 'sm:w-2/3' : ''}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                      article.type === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {article.type.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-gray-900 hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
                    By {article.author || 'Unknown'} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm md:text-base"
                  >
                    Read more
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 text-gray-500 text-sm sm:text-base">No articles found</div>
      )}

      {/* Pagination */}
      <div className="mt-4 sm:mt-6 flex justify-between items-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-xs sm:text-sm md:text-base"
        >
          Previous
        </button>
        <span className="text-gray-600 text-xs sm:text-sm md:text-base">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm md:text-base"
        >
          Next
        </button>
      </div>
    </div>
  )
} 