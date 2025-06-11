import { NextResponse } from 'next/server';
import { exportToGoogleSheets } from '@/lib/googleSheets';
import { OAuth2Client } from 'google-auth-library';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array.' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      
      // Get the user's Google OAuth tokens from Firebase
      const user = await getAuth().getUser(decodedToken.uid);
      const customClaims = user.customClaims || {};
      
      if (!customClaims.googleAccessToken) {
        return NextResponse.json(
          { error: 'Google authentication required. Please sign in with Google first.' },
          { status: 401 }
        );
      }

      // Create OAuth2 client with Firebase tokens
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({
        access_token: customClaims.googleAccessToken,
        refresh_token: customClaims.googleRefreshToken,
      });

      const result = await exportToGoogleSheets(data, oauth2Client);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: result.url,
        message: 'Successfully exported to Google Sheets'
      });
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in sheets export route:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500 }
    );
  }
} 