# Firebase Deployment - Implementation Tasks

## Phase 1: Project Setup & Configuration

### Task 1.1: Initialize Firebase Hosting
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Run `firebase init hosting` in project root
2. Select existing Firebase project
3. Set public directory to `frontend/dist`
4. Configure as single-page app (Yes)
5. Don't overwrite index.html
6. Verify firebase.json created

**Acceptance Criteria:**
- firebase.json exists with hosting config
- .firebaserc points to correct project

---

### Task 1.2: Initialize Cloud Functions
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Run `firebase init functions` in project root
2. Select JavaScript (not TypeScript)
3. Install dependencies
4. Create functions/ directory structure
5. Verify functions/package.json created

**Acceptance Criteria:**
- functions/ directory exists
- functions/index.js created
- functions/package.json exists

---

### Task 1.3: Configure Firebase Hosting Rewrites
**Status:** not_started
**Priority:** High
**Estimated Time:** 10 minutes

**Steps:**
1. Edit firebase.json
2. Add rewrite for /api/** to Cloud Function
3. Add rewrite for SPA routing (** to /index.html)
4. Add cache headers for static assets
5. Test configuration syntax

**Acceptance Criteria:**
- API requests route to function
- SPA routing works
- Static assets cached properly

**Files:**
- firebase.json

---

## Phase 2: Backend Migration to Cloud Functions

### Task 2.1: Create Functions Entry Point
**Status:** not_started
**Priority:** High
**Estimated Time:** 30 minutes

**Steps:**
1. Create functions/index.js
2. Import Express and CORS
3. Wrap Express app as Cloud Function
4. Configure function region and resources
5. Export as 'api' function

**Acceptance Criteria:**
- functions/index.js exports api function
- CORS configured
- Function settings optimized

**Files:**
- functions/index.js

---

### Task 2.2: Copy Backend Code to Functions
**Status:** not_started
**Priority:** High
**Estimated Time:** 20 minutes

**Steps:**
1. Copy backend/controllers/ to functions/controllers/
2. Copy backend/routes/ to functions/routes/
3. Copy backend/config/ to functions/config/
4. Copy backend/utils/ to functions/utils/
5. Update import paths if needed

**Acceptance Criteria:**
- All backend code in functions/
- No broken imports
- Directory structure maintained

**Files:**
- functions/controllers/*
- functions/routes/*
- functions/config/*
- functions/utils/*

---

### Task 2.3: Configure Functions Package.json
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Copy dependencies from backend/package.json
2. Add firebase-functions and firebase-admin
3. Set Node.js engine to 18
4. Add deployment scripts
5. Install dependencies

**Acceptance Criteria:**
- All required dependencies listed
- Engine version set to 18
- npm install succeeds

**Files:**
- functions/package.json

---

### Task 2.4: Update Firebase Config for Functions
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Update functions/config/firebase.js
2. Use admin.initializeApp() without credentials
3. Remove serviceAccountKey.json references
4. Test Firestore connection
5. Verify admin SDK works

**Acceptance Criteria:**
- Firebase Admin SDK initialized
- Firestore accessible
- No credential errors

**Files:**
- functions/config/firebase.js

---

### Task 2.5: Configure Environment Variables
**Status:** not_started
**Priority:** High
**Estimated Time:** 10 minutes

**Steps:**
1. Set Gemini API key: `firebase functions:config:set gemini.api_key="YOUR_KEY"`
2. Update aiController.js to use functions.config()
3. Test environment variable access
4. Document configuration in README

**Acceptance Criteria:**
- API key accessible in functions
- No hardcoded secrets
- Configuration documented

**Files:**
- functions/controllers/aiController.js
- README.md

---

## Phase 3: Frontend Configuration

### Task 3.1: Configure Frontend Build
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Create frontend/.env.production
2. Set VITE_API_URL=/api
3. Update API calls to use relative URLs
4. Test build process
5. Verify dist/ output

**Acceptance Criteria:**
- Production env vars set
- Build succeeds
- API URLs are relative

**Files:**
- frontend/.env.production
- frontend/vite.config.js

---

### Task 3.2: Update API Base URL
**Status:** not_started
**Priority:** High
**Estimated Time:** 10 minutes

**Steps:**
1. Check all fetch() calls in frontend
2. Ensure they use /api/* paths
3. Remove localhost references
4. Test in development mode
5. Verify no hardcoded URLs

**Acceptance Criteria:**
- All API calls use /api/*
- No localhost URLs
- Works in dev and prod

**Files:**
- frontend/src/pages/*.jsx
- frontend/src/components/*.jsx

---

### Task 3.3: Optimize Frontend Build
**Status:** not_started
**Priority:** Medium
**Estimated Time:** 20 minutes

**Steps:**
1. Enable code splitting in Vite
2. Configure asset optimization
3. Add compression
4. Test build size
5. Verify performance

**Acceptance Criteria:**
- Build size < 500KB (gzipped)
- Code splitting works
- Assets optimized

**Files:**
- frontend/vite.config.js

---

## Phase 4: Deployment Scripts

### Task 4.1: Create Deployment Scripts
**Status:** not_started
**Priority:** High
**Estimated Time:** 20 minutes

**Steps:**
1. Add deploy:frontend script
2. Add deploy:backend script
3. Add deploy:all script
4. Add build:frontend script
5. Test all scripts

**Acceptance Criteria:**
- Scripts work correctly
- Can deploy separately or together
- Build before deploy

**Files:**
- package.json (root)

---

### Task 4.2: Create Pre-Deploy Script
**Status:** not_started
**Priority:** Medium
**Estimated Time:** 15 minutes

**Steps:**
1. Create scripts/prepare-deploy.sh
2. Build frontend
3. Copy backend to functions
4. Install function dependencies
5. Make executable

**Acceptance Criteria:**
- Script automates preparation
- All files copied correctly
- Dependencies installed

**Files:**
- scripts/prepare-deploy.sh

---

## Phase 5: Security & Rules

### Task 5.1: Review Firestore Security Rules
**Status:** not_started
**Priority:** High
**Estimated Time:** 20 minutes

**Steps:**
1. Review current firestore.rules
2. Ensure read access is public
3. Restrict write access (functions only)
4. Test rules in Firebase Console
5. Deploy rules

**Acceptance Criteria:**
- Rules are secure
- Public read access works
- Write access restricted

**Files:**
- firestore.rules

---

### Task 5.2: Configure CORS Properly
**Status:** not_started
**Priority:** High
**Estimated Time:** 15 minutes

**Steps:**
1. Update CORS config in functions/index.js
2. Allow Firebase Hosting domain
3. Test from deployed frontend
4. Verify no CORS errors
5. Document configuration

**Acceptance Criteria:**
- CORS works from hosting
- No browser errors
- Secure configuration

**Files:**
- functions/index.js

---

## Phase 6: Testing & Deployment

### Task 6.1: Test Local Functions Emulator
**Status:** not_started
**Priority:** High
**Estimated Time:** 30 minutes

**Steps:**
1. Run `firebase emulators:start`
2. Test all API endpoints
3. Verify Firestore operations
4. Test AI generation
5. Fix any issues

**Acceptance Criteria:**
- All endpoints work
- No errors in emulator
- AI generation functional

---

### Task 6.2: Deploy to Firebase (Staging)
**Status:** not_started
**Priority:** High
**Estimated Time:** 20 minutes

**Steps:**
1. Run build scripts
2. Deploy with `firebase deploy`
3. Test deployed application
4. Check Cloud Functions logs
5. Verify all features work

**Acceptance Criteria:**
- Deployment succeeds
- Application accessible
- All features functional
- No errors in logs

---

### Task 6.3: Performance Testing
**Status:** not_started
**Priority:** Medium
**Estimated Time:** 30 minutes

**Steps:**
1. Test page load times
2. Test API response times
3. Test AI generation speed
4. Check cold start latency
5. Optimize if needed

**Acceptance Criteria:**
- Page load < 3 seconds
- API responses < 1 second
- AI generation < 10 seconds
- Acceptable cold starts

---

### Task 6.4: Create Deployment Documentation
**Status:** not_started
**Priority:** Medium
**Estimated Time:** 30 minutes

**Steps:**
1. Document deployment process
2. List all commands
3. Document environment setup
4. Add troubleshooting guide
5. Include rollback instructions

**Acceptance Criteria:**
- Complete deployment guide
- All commands documented
- Troubleshooting included
- Easy to follow

**Files:**
- DEPLOYMENT.md

---

## Phase 7: Monitoring & Optimization

### Task 7.1: Set Up Firebase Monitoring
**Status:** not_started
**Priority:** Medium
**Estimated Time:** 20 minutes

**Steps:**
1. Enable Performance Monitoring
2. Set up error tracking
3. Configure usage alerts
4. Monitor quota usage
5. Document monitoring setup

**Acceptance Criteria:**
- Monitoring enabled
- Alerts configured
- Dashboard accessible
- Quota tracking active

---

### Task 7.2: Optimize Function Cold Starts
**Status:** not_started
**Priority:** Low
**Estimated Time:** 30 minutes

**Steps:**
1. Implement function warming
2. Optimize imports
3. Reduce function size
4. Test cold start times
5. Document optimizations

**Acceptance Criteria:**
- Cold starts < 3 seconds
- Function size minimized
- Warming strategy in place

**Files:**
- functions/index.js

---

## Summary

**Total Tasks:** 21
**High Priority:** 15
**Medium Priority:** 5
**Low Priority:** 1

**Estimated Total Time:** 6-7 hours

**Critical Path:**
1. Initialize Firebase (1.1, 1.2, 1.3)
2. Migrate Backend (2.1, 2.2, 2.3, 2.4, 2.5)
3. Configure Frontend (3.1, 3.2)
4. Deploy (6.2)

**Dependencies:**
- Phase 2 depends on Phase 1
- Phase 3 can run parallel to Phase 2
- Phase 4 depends on Phases 2 & 3
- Phase 6 depends on all previous phases
