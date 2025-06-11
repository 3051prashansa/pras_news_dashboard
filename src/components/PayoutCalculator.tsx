'use client'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, Article, PayoutRate } from '@/types'
import { setPayoutRate, setTotalPayout } from '@/store/payoutSlice'
import { CSVLink } from 'react-csv'
import dynamic from 'next/dynamic'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { useEffect, useState, useCallback, useMemo } from 'react'

// Dynamically import PDFDownloadLink with no SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

interface ExportData {
  title: string
  author: string
  type: string
  date: string
  payout: number
}

const STORAGE_KEY = 'payout_rates'

export default function PayoutCalculator() {
  const dispatch = useDispatch()
  const { rates, totalPayout } = useSelector((state: RootState) => state.payout)
  const { articles } = useSelector((state: RootState) => state.news)
  const [isClient, setIsClient] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Load rates from localStorage on component mount
  useEffect(() => {
    setIsClient(true)
    const savedRates = localStorage.getItem(STORAGE_KEY)
    if (savedRates) {
      const parsedRates = JSON.parse(savedRates)
      parsedRates.forEach((rate: PayoutRate) => {
        dispatch(setPayoutRate(rate))
      })
    }
  }, [dispatch])

  // Save rates to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
      calculateTotalPayout()
    }
  }, [rates, isClient])

  const handleRateChange = useCallback((type: 'news' | 'blog', amount: number) => {
    dispatch(setPayoutRate({ type, amount }))
  }, [dispatch])

  const calculateTotalPayout = useCallback(() => {
    const total = articles.reduce((sum: number, article: Article) => {
      const rate = rates.find((r: PayoutRate) => r.type === article.type)
      return sum + (rate?.amount || 0)
    }, 0)
    dispatch(setTotalPayout(total))
  }, [articles, rates, dispatch])

  // Prepare data for export using useMemo
  const exportData = useMemo(() => articles.map((article: Article) => ({
    title: article.title,
    author: article.author || 'Unknown',
    type: article.type,
    date: article.publishedAt,
    payout: rates.find((r: PayoutRate) => r.type === article.type)?.amount || 0
  })), [articles, rates])

  // Handle Google Sheets export
  const handleGoogleSheetsExport = useCallback(async () => {
    try {
      setIsExporting(true)
      setExportError(null)

      const response = await fetch('/api/export/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export to Google Sheets')
      }

      // Open the spreadsheet in a new tab
      window.open(data.url, '_blank')
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error)
      setExportError(error instanceof Error ? error.message : 'Failed to export to Google Sheets')
    } finally {
      setIsExporting(false)
    }
  }, [exportData])

  // PDF Document component
  const PayoutPDF = useCallback(() => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Payout Report</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Title</Text>
            <Text style={styles.tableHeader}>Author</Text>
            <Text style={styles.tableHeader}>Type</Text>
            <Text style={styles.tableHeader}>Payout</Text>
          </View>
          {exportData.map((item: ExportData, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.title}</Text>
              <Text style={styles.tableCell}>{item.author}</Text>
              <Text style={styles.tableCell}>{item.type}</Text>
              <Text style={styles.tableCell}>${item.payout}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.total}>Total Payout: ${totalPayout}</Text>
      </Page>
    </Document>
  ), [exportData, totalPayout])

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4 mb-3 sm:mb-4"></div>
          <div className="space-y-3 sm:space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Payout Calculator</h2>

      {/* Payout Rates */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {rates.map((rate: PayoutRate) => (
          <div key={rate.type} className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              {rate.type.charAt(0).toUpperCase() + rate.type.slice(1)} Rate
            </label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-600 text-xs sm:text-sm">$</span>
              <input
                type="number"
                value={rate.amount}
                onChange={(e) => handleRateChange(rate.type, Number(e.target.value))}
                className="w-20 sm:w-24 px-2 sm:px-4 py-1.5 sm:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-xs sm:text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Article Counts */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-medium text-black mb-2">Article Counts</h3>
        <div className="space-y-1 sm:space-y-2">
          {rates.map((rate: PayoutRate) => {
            const count = articles.filter(article => article.type === rate.type).length
            return (
              <div key={rate.type} className="flex justify-between text-xs sm:text-sm">
                <span className="text-black">{rate.type.charAt(0).toUpperCase() + rate.type.slice(1)}s:</span>
                <span className="font-semibold text-black">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total Payout */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border-2 border-gray-100">
        <p className="text-xs sm:text-sm text-gray-600">Total Payout</p>
        <p className="text-xl sm:text-2xl font-bold text-indigo-600">${totalPayout.toFixed(2)}</p>
      </div>

      {/* Export Options */}
      <div className="space-y-2">
        <CSVLink
          data={exportData}
          filename="payout-report.csv"
          className="block w-full text-center bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-xs sm:text-sm"
        >
          Export as CSV
        </CSVLink>
        <PDFDownloadLink
          document={<PayoutPDF />}
          fileName="payout-report.pdf"
          className="block w-full text-center bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-xs sm:text-sm"
        >
          Export as PDF
        </PDFDownloadLink>
        <button
          onClick={handleGoogleSheetsExport}
          disabled={isExporting}
          className="block w-full text-center bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          {isExporting ? 'Exporting...' : 'Export to Google Sheets'}
        </button>
        {exportError && (
          <p className="text-red-500 text-xs sm:text-sm mt-2">{exportError}</p>
        )}
      </div>
    </div>    
  )
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 20,
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    width: '25%',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCell: {
    width: '25%',
    padding: 5,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
}) 