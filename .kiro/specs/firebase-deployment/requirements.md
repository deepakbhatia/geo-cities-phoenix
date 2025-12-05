# Firebase Deployment - Requirements

## Overview
Deploy GeoCities AI to Firebase, hosting the frontend on Firebase Hosting and the backend as Firebase Cloud Functions, with Firestore as the database.

## Goals
- Deploy production-ready application to Firebase
- Serve frontend via Firebase Hosting with CDN
- Run backend API as Firebase Cloud Functions
- Configure environment variables securely
- Set up CI/CD for automated deployments
- Ensure proper CORS and routing configuration

## Architecture

### Frontend (Firebase Hosting)
- Static React build served via CDN
- Custom domain support (optional)
- HTTPS by default
- SPA routing with rewrites to index.html

### Backend (Cloud Functions)
- Express API running as Cloud Function
- Firestore database (already configured)
- Environment variables via Firebase config
- CORS configured for hosting domain

### Database (Firestore)
- Already configured and in use
- Indexes already deployed
- Security rules to be reviewed

## Requirements

### 1. Firebase Project Setup
- Firebase project already exists
- Firebase CLI installed and authenticated
- Project initialized with Hosting and Functions

### 2. Frontend Build Configuration
- Vite build optimized for production
- Environment variables for API endpoint
- Build output configured for Firebase Hosting
- SPA routing configured with rewrites

### 3. Backend Cloud Functions Setup
- Express app wrapped as Cloud Function
- Environment variables (GEMINI_API_KEY) configured
- CORS configured for hosting domain
- Function region configured (us-central1 recommended)

### 4. Environment Configuration
- Production environment variables
- Separate dev/staging/prod configs
- Secure API key management
- Firebase config for frontend

### 5. Deployment Scripts
- Build and deploy commands
- Separate frontend/backend deployment
- Full deployment command
- Rollback capability

### 6. Security & Performance
- Firestore security rules reviewed
- CORS properly configured
- Function memory/timeout optimized
- CDN caching configured

### 7. Monitoring & Logging
- Cloud Functions logs accessible
- Error tracking configured
- Performance monitoring enabled
- Usage quotas monitored

## Success Criteria
- ✅ Frontend accessible via Firebase Hosting URL
- ✅ Backend API responding via Cloud Functions
- ✅ Database operations working correctly
- ✅ AI content generation functional
- ✅ No CORS errors
- ✅ Fast page load times (<3s)
- ✅ Deployment process documented

## Constraints
- Free tier limitations (Cloud Functions invocations, storage)
- Cold start latency for Cloud Functions
- Gemini API rate limits
- Firestore read/write quotas

## Out of Scope
- Custom domain configuration (can be added later)
- Advanced CI/CD pipelines (GitHub Actions, etc.)
- Multi-region deployment
- Load balancing beyond Firebase defaults
- Advanced monitoring/alerting systems
