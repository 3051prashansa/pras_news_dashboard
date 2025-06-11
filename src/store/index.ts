import { configureStore } from '@reduxjs/toolkit'
import newsReducer from './newsSlice'
import payoutReducer from './payoutSlice'

export const store = configureStore({
  reducer: {
    news: newsReducer,
    payout: payoutReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 