'use client'

import { useSelector } from 'react-redux'
import { RootState, Article } from '@/types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function NewsAnalytics() {
  const { articles = [] } = useSelector((state: RootState) => state.news)

  // Prepare data for author distribution chart
  const authorData = articles?.reduce((acc: { [key: string]: number }, article: Article) => {
    const author = article.author || 'Unknown'
    // Extract only the name part before the email (if it exists)
    const authorName = author.split('<')[0].trim()
    acc[authorName] = (acc[authorName] || 0) + 1
    return acc
  }, {}) || {}

  const authorChartData = {
    labels: Object.keys(authorData).length > 0 ? Object.keys(authorData) : ['No Data'],
    datasets: [
      {
        label: 'Articles per Author',
        data: Object.keys(authorData).length > 0 ? Object.values(authorData) : [0],
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for type distribution chart
  const typeData = articles?.reduce((acc: { [key: string]: number }, article: Article) => {
    const type = article.type || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {}) || {}

  const typeChartData = {
    labels: Object.keys(typeData).length > 0 
      ? Object.keys(typeData).map(type => type.charAt(0).toUpperCase() + type.slice(1))
      : ['No Data'],
    datasets: [
      {
        data: Object.keys(typeData).length > 0 ? Object.values(typeData) : [0],
        backgroundColor: [
          'rgba(79, 70, 229, 0.5)',
          'rgba(16, 185, 129, 0.5)',
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Articles by Author',
        position: 'bottom' as const,
        padding: {
          top: 20
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Articles by Type',
        position: 'bottom' as const,
        padding: {
          top: 20
        }
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">News Analytics</h2>
      
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            There are no articles available to generate analytics. Add some news articles or blogs to see the analytics dashboard in action.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-8">
          {/* Author Distribution Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">Author Distribution</h3>
            <div className="bg-white rounded-lg p-2 sm:p-4">
              <Bar options={barOptions} data={authorChartData} />
            </div>
          </div>

          {/* Type Distribution Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">Type Distribution</h3>
            <div className="bg-white rounded-lg p-2 sm:p-4 flex justify-center">
              <div className="w-full sm:w-2/3 md:w-1/2 max-w-md">
                <Pie options={pieOptions} data={typeChartData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 