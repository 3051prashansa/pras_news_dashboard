export interface Article {
  title: string
  author: string | null
  publishedAt: string
  description: string
  url: string
  urlToImage: string | null
  type: 'news' | 'blog'
}

export interface PayoutRate {
  type: 'news' | 'blog'
  amount: number
}

export interface NewsFilters {
  author: string
  dateRange: {
    start: string
    end: string
  }
  type: 'all' | 'news' | 'blog'
  searchQuery: string
}

export interface NewsState {
  articles: Article[]
  loading: boolean
  error: string | null
  filters: NewsFilters
}

export interface PayoutState {
  rates: PayoutRate[]
  totalPayout: number
}

export interface RootState {
  news: NewsState
  payout: PayoutState
}

export interface RSSFeedItem {
  title?: string
  creator?: string
  isoDate?: string
  contentSnippet?: string
  link?: string
  enclosure?: {
    url?: string
  }
  [key: string]: any
}

export type NewsAPIArticle = Article 