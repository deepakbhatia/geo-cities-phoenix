# Firestore Setup Guide

This guide walks you through setting up Google Cloud Firestore for GeoCities AI.

## Prerequisites

- Google Cloud account
- Node.js installed
- Backend dependencies installed (`npm install`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

## Step 2: Enable Firestore Database

1. In your Firebase project, navigate to **Build → Firestore Database**
2. Click "Create database"
3. Choose **Production mode** for security
4. Select a location (choose one close to your users)
5. Click "Enable"

## Step 3: Generate Service Account Key

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click "Generate new private key"
3. Click "Generate key" in the confirmation dialog
4. A JSON file will download - **keep this secure!**

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and set the following variables:

   ```bash
   # Your Firebase project ID (found in Project Settings)
   FIREBASE_PROJECT_ID=your-project-id
   
   # The entire service account JSON as a single-line string
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"..."}
   ```

3. To convert the service account JSON to a single line:
   - Open the downloaded JSON file
   - Remove all newlines and extra spaces
   - Or use this command:
     ```bash
     cat path/to/serviceAccount.json | jq -c
     ```

## Step 5: Create Firestore Indexes

Firestore requires composite indexes for complex queries.

### Option A: Using Firebase CLI (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Accept default firestore.rules
   - Use `firestore.indexes.json` for indexes

4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Option B: Manual Creation

If you prefer to create indexes manually:

1. Go to **Firestore Database → Indexes** in Firebase Console
2. Click "Create Index"
3. Create the following indexes:

**Index 1: City Name Lookup**
- Collection: `cities`
- Fields:
  - `nameSlug` (Ascending)
  - `createdAt` (Descending)

**Index 2: Theme Filtering**
- Collection: `cities`
- Fields:
  - `theme` (Ascending)
  - `createdAt` (Descending)

**Index 3: AI Generation Cache**
- Collection: `aiGenerations`
- Fields:
  - `type` (Ascending)
  - `expiresAt` (Descending)

## Step 6: Run Migration Script

Migrate existing in-memory data to Firestore:

```bash
npm run migrate
```

This script:
- Creates city documents in Firestore
- Generates proper slugs
- Sets timestamps
- Is idempotent (safe to run multiple times)

## Step 7: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Firebase initialized successfully
📊 Connected to Firestore project: your-project-id
🌐 GeoCities AI server running on port 3000
```

## Troubleshooting

### Error: "FIREBASE_PROJECT_ID environment variable is required"

- Make sure your `.env` file exists in the `backend/` directory
- Verify the variable is set correctly
- Restart your server after changing `.env`

### Error: "Failed to parse service account JSON"

- Ensure the JSON is properly formatted as a single line
- Check for escaped quotes and special characters
- Verify the JSON is valid using a JSON validator

### Error: "Permission denied"

- Verify your service account has the correct permissions
- Check that Firestore is enabled in your Firebase project
- Ensure you're using the correct project ID

### Error: "Index not found"

- Wait a few minutes for indexes to build (can take 5-10 minutes)
- Verify indexes are created in Firebase Console
- Deploy indexes using `firebase deploy --only firestore:indexes`

### Error: "Quota exceeded"

- Check your Firebase usage in the Console
- Upgrade to Blaze plan if needed for production
- Implement caching to reduce reads

## Security Best Practices

1. **Never commit `.env` or service account JSON to git**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Restrict service account permissions**
   - Only grant necessary Firestore permissions
   - Use separate service accounts for dev/prod

3. **Enable Firestore Security Rules**
   - Server-side only access (no direct frontend access)
   - Validate all input before writing

4. **Monitor usage**
   - Set up billing alerts
   - Monitor read/write operations
   - Implement rate limiting

## Backup and Recovery

### Automatic Backups

1. Go to **Firestore Database → Backups** in Firebase Console
2. Click "Set up automatic backups"
3. Choose backup frequency and retention
4. Select a Cloud Storage bucket

### Manual Export

```bash
gcloud firestore export gs://your-bucket-name/backup-folder
```

### Restore from Backup

```bash
gcloud firestore import gs://your-bucket-name/backup-folder
```

## Performance Tips

1. **Use caching** - AI generations are cached for 24 hours
2. **Limit queries** - All queries limited to 100 results
3. **Use indexes** - Composite indexes speed up complex queries
4. **Monitor costs** - Track reads/writes in Firebase Console
5. **Implement pagination** - For large datasets

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
