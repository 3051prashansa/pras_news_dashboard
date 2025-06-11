import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { NewsAPIArticle, RSSFeedItem } from '@/types'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  timeout: 5000,
})

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const feed = await parser.parseURL(url)
    return feed
  } catch (error: any) {
    if (retries > 0 && (error.statusCode === 429 || error.statusCode === 503)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, retries - 1)
    }
    throw error
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'news'
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '10'
  const type = searchParams.get('type') || 'all'
  const author = searchParams.get('author') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  try {
    let newsData: { articles: NewsAPIArticle[] } = { articles: [] }
    let blogData: { articles: NewsAPIArticle[] } = { articles: [] }

    // Fetch news data if type is 'all' or 'news'
    if (type === 'all' || type === 'news') {
      try {
        const newsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${query}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`
        )

        if (newsResponse.ok) {
          const data = await newsResponse.json()
          // Add type field to news articles
          newsData.articles = data.articles.map((article: any) => ({
            ...article,
            type: 'news' as const
          }))
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      }
    }

    // Fetch blog data if type is 'all' or 'blog'
    if (type === 'all' || type === 'blog') {
      try {
        const blogFeed = await fetchWithRetry('https://medium.com/feed/tag/' + query)
        blogData.articles = blogFeed.items.slice(0, parseInt(pageSize)).map((item: RSSFeedItem) => ({
          title: item.title || 'Untitled',
          author: item.creator || 'Unknown',
          publishedAt: item.isoDate || new Date().toISOString(),
          description: item.contentSnippet || '',
          url: item.link || '',
          urlToImage: item.enclosure?.url || null,
          type: 'blog' as const
        }))
      } catch (error) {
        console.error('Error fetching blog data:', error)
      }
    }

    // Combine articles
    let allArticles = [...newsData.articles, ...blogData.articles]

    // Apply filters
    if (author) {
      allArticles = allArticles.filter(article => 
        article.author?.toLowerCase().includes(author.toLowerCase())
      )
    }

    if (startDate) {
      const start = new Date(startDate)
      allArticles = allArticles.filter(article => 
        new Date(article.publishedAt) >= start
      )
    }

    if (endDate) {
      const end = new Date(endDate)
      allArticles = allArticles.filter(article => 
        new Date(article.publishedAt) <= end
      )
    }

    // Sort articles by date
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return NextResponse.json({ articles: allArticles })
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
} 