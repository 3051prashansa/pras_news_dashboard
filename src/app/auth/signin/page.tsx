'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Cookies from 'js-cookie'

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Get the ID token and store it in a cookie
        user.getIdToken().then((token) => {
          Cookies.set('firebase-token', token, { expires: 7 }) // Token expires in 7 days
          router.push('/')
        })
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      // Configure the popup window
      provider.setCustomParameters({
        prompt: 'select_account',
        // Add any additional scopes you need
        // scope: 'https://www.googleapis.com/auth/spreadsheets'
      })

      // Use a try-catch block specifically for the popup
      let result
      try {
        result = await signInWithPopup(auth, provider)
      } catch (popupError: any) {
        // Handle popup blocked or closed
        if (popupError.code === 'auth/popup-blocked') {
          console.error('Popup was blocked by the browser')
          // You might want to show a message to the user
          return
        }
        if (popupError.code === 'auth/popup-closed-by-user') {
          console.error('Popup was closed by the user')
          return
        }
        throw popupError
      }
      
      // Get the ID token and store it in a cookie
      const token = await result.user.getIdToken()
      Cookies.set('firebase-token', token, { expires: 7 }) // Token expires in 7 days
      
      router.push('/')
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h1 className="text-center text-4xl font-bold text-indigo-600 mb-2">
            NewsFlow
          </h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
} 