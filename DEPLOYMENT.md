# GeoCities AI - Firebase Deployment Guide

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created (`gen-cities`)
- Authenticated with Firebase (`firebase login`)
- Gemini API key ready

## Project Structure

```
geocities-ai/
├── frontend/          # React app (deployed to Hosting)
├── functions/         # Cloud Functions (API backend)
├── firebase.json      # Firebase configuration
├── firestore.rules    # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Initial Setup (One-time)

### 1. Configure Gemini API Key

Set the Gemini API key in Firebase Functions config:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"
```

Verify it's set:

```bash
firebase functions:config:get
```

### 2. Deploy Firestore Rules and Indexes

```bash
npm run deploy:firestore
```

This deploys:
- Security rules (firestore.rules)
- Database indexes (firestore.indexes.json)

## Deployment Commands

### Full Deployment (Hosting + Functions)

```bash
npm run deploy
```

This will:
1. Build the frontend (`npm run build:frontend`)
2. Deploy everything to Firebase

### Deploy Only Frontend

```bash
npm run deploy:hosting
```

### Deploy Only Backend Functions

```bash
npm run deploy:functions
```

### Deploy Only Firestore Rules

```bash
npm run deploy:firestore
```

## Testing Before Deployment

### Test with Firebase Emulators

```bash
npm run emulate
```

This starts local emulators for:
- Hosting (frontend)
- Functions (backend API)
- Firestore (database)

Access at: http://localhost:5000

### Build Frontend Locally

```bash
npm run build:frontend
```

Output will be in `frontend/dist/`

## Post-Deployment

### View Your Deployed App

After deployment, Firebase will provide URLs:

- **Hosting URL**: `https://gen-cities.web.app`
- **Functions URL**: `https://us-central1-gen-cities.cloudfunctions.net/api`

### View Logs

```bash
npm run logs
```

Or in Firebase Console:
https://console.firebase.google.com/project/gen-cities/functions/logs

### Monitor Performance

Firebase Console → Performance
https://console.firebase.google.com/project/gen-cities/performance

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `cors({ origin: true })` is in `functions/index.js`
2. Verify API requests use `/api/*` paths
3. Check Firebase Hosting rewrites in `firebase.json`

### API Key Not Found

If you see "GEMINI_API_KEY not configured":

```bash
# Set the key
firebase functions:config:set gemini.api_key="YOUR_KEY"

# Redeploy functions
npm run deploy:functions
```

### Cold Start Latency

First request after inactivity may be slow (3-5 seconds). This is normal for Cloud Functions on the free tier.

To reduce:
- Upgrade to Blaze plan
- Set `minInstances: 1` in functions/index.js (costs money)

### Build Errors

If frontend build fails:

```bash
cd frontend
npm install
npm run build
```

Check for:
- Missing dependencies
- TypeScript/ESLint errors
- Environment variables

### Function Deployment Fails

If functions deployment fails:

```bash
cd functions
npm install
```

Check for:
- Syntax errors in converted CommonJS
- Missing module.exports
- Import/require mismatches

## Environment Variables

### Frontend (.env.production)

```env
VITE_API_URL=/api
```

### Backend (Firebase Functions Config)

```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
```

## Rollback

### Rollback Hosting

```bash
firebase hosting:rollback
```

### Rollback Functions

Redeploy previous version from git:

```bash
git checkout <previous-commit>
npm run deploy:functions
git checkout main
```

## Cost Monitoring

### Free Tier Limits

- **Hosting**: 10 GB storage, 360 MB/day transfer
- **Functions**: 2M invocations/month, 400K GB-seconds
- **Firestore**: 50K reads/day, 20K writes/day, 1 GB storage

### Monitor Usage

Firebase Console → Usage and Billing
https://console.firebase.google.com/project/gen-cities/usage

### Set Budget Alerts

Firebase Console → Settings → Usage and Billing → Set Budget

## CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:frontend
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: gen-cities
```

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/project/gen-cities
- Project Repository: [Your GitHub URL]

## Quick Reference

```bash
# Deploy everything
npm run deploy

# Deploy only frontend
npm run deploy:hosting

# Deploy only backend
npm run deploy:functions

# Test locally
npm run emulate

# View logs
npm run logs

# Set API key
firebase functions:config:set gemini.api_key="YOUR_KEY"
```
