# Google OAuth Setup Guide

## 1. Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Select "Web application"
6. Add these settings:
   - **Name**: ProofFolio Web App
   - **Authorized redirect URIs**: 
     - `http://localhost:5174/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
     - `https://prooffolio.onrender.com/auth/google/callback` (Render)

## 2. Environment Variables

Add to your `.env` file:
```bash
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id-here
```

Add to your frontend `.env` file:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## 3. Gmail Integration

The system will automatically:
- Use Google OAuth for authentication
- Send notifications to user's Gmail address
- Handle Gmail-specific email domains
- Provide seamless login experience

## 4. Test the Flow

1. Click "Continue with Google" on login page
2. Authenticate with your Google account
3. You'll be redirected back to the app
4. Account will be created/linked automatically

## 5. Deployment Notes

For production deployment on Render:
- Update the redirect URI in Google Console to: `https://prooffolio.onrender.com/auth/google/callback`
- Add the client ID to Render environment variables
- Test the complete OAuth flow
