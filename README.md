# News Dashboard

A responsive dashboard application that provides news analytics, payout calculations, and user authentication features.

## Features

- User authentication with Firebase Auth
- News and blog data integration with advanced filtering
- Real-time news updates and blog post management
- Advanced filtering and search capabilities
  - Filter by author
  - Date range filtering
  - Content type filtering (News/Blog)
- Payout calculator with export functionality
  - Customizable payout rates
  - Local storage persistence
  - Export to multiple formats
- Interactive charts and analytics
- Dark mode support
- Responsive design with mobile-first approach
- Performance optimized with code splitting and lazy loading

## Tech Stack

- Next.js 14 with App Router
- React 18 with Suspense and dynamic imports
- TypeScript for type safety
- Redux Toolkit for state management
- Tailwind CSS for styling
- Chart.js for data visualization
- Firebase Authentication
- React Query for data fetching
- PDF and CSV export capabilities

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Firebase project setup
- News API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd news-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
   NEWS_API_KEY=your-news-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Sign in using your Firebase authentication
2. Navigate through the dashboard using the responsive sidebar
3. Use the advanced search and filter options to find specific articles
4. Calculate payouts using the calculator component
   - Set custom rates for news and blog posts
   - Export calculations in various formats
5. View analytics and charts for content performance
6. Toggle dark mode using the theme switcher

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── NewsOverview/   # News and blog components
│   ├── PayoutCalculator/ # Payout management
│   └── Analytics/      # Analytics components
├── lib/               # Utility functions
├── store/            # Redux store configuration
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

## Performance Optimizations

- Code splitting with dynamic imports
- Optimized bundle size with webpack configuration
- CSS optimization with Tailwind
- Image optimization with Next.js Image component
- Security headers and best practices
- Caching strategies for API responses

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
