import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayoutRate } from '@/types'

interface PayoutState {
  rates: PayoutRate[]
  totalPayout: number
}

const STORAGE_KEY = 'payout_rates'

// Load initial state from localStorage if available
const loadInitialState = (): PayoutState => {
  if (typeof window !== 'undefined') {
    const savedRates = localStorage.getItem(STORAGE_KEY)
    if (savedRates) {
      return {
        rates: JSON.parse(savedRates),
        totalPayout: 0
      }
    }
  }
  
  return {
    rates: [
      { type: 'news', amount: 50 },
      { type: 'blog', amount: 75 },
    ],
    totalPayout: 0,
  }
}

const initialState: PayoutState = loadInitialState()

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setPayoutRate: (state, action: PayloadAction<PayoutRate>) => {
      const index = state.rates.findIndex(rate => rate.type === action.payload.type)
      if (index !== -1) {
        state.rates[index] = action.payload
      } else {
        state.rates.push(action.payload)
      }
    },
    setTotalPayout: (state, action: PayloadAction<number>) => {
      state.totalPayout = action.payload
    },
    resetRates: (state) => {
      state.rates = [
        { type: 'news', amount: 50 },
        { type: 'blog', amount: 75 },
      ]
      state.totalPayout = 0
    }
  },
})

export const { setPayoutRate, setTotalPayout, resetRates } = payoutSlice.actions
export default payoutSlice.reducer 