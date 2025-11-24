# Firestore Integration - Implementation Plan

## Overview
This implementation plan covers migrating GeoCities AI from in-memory storage to Google Cloud Firestore, implementing duplicate prevention, caching, and proper error handling.

---

## Phase 1: Setup and Configuration

### Task 1.1: Install Firebase Admin SDK
**Status:** not_started
**Priority:** High

- Install firebase-admin package in backend
- Update package.json with correct version
- Verify installation
- _Requirements: 4_

### Task 1.2: Create Firebase Configuration Module
**Status:** not_started
**Priority:** High

- Create backend/config/firebase.js
- Initialize Firebase Admin SDK
- Parse service account from environment variable
- Export Firestore database instance
- Add connection error handling
- Log connection status on startup
- _Requirements: 4, 5_

### Task 1.3: Create Slug Utility
**Status:** not_started
**Priority:** High

- Create backend/utils/slug.js
- Implement generateSlug function
- Handle special characters, spaces, and case
- Add unit tests for edge cases
- _Requirements: 1, 2_

### Task 1.4: Setup Environment Variables
**Status:** not_started
**Priority:** High

- Create .env.example with Firebase variables
- Document FIREBASE_PROJECT_ID requirement
- Document FIREBASE_SERVICE_ACCOUNT requirement
- Add validation for required environment variables
- Update .gitignore to exclude .env
- _Requirements: 10_

---

## Phase 2: Database Schema and Models

### Task 2.1: Define City Data Model
**Status:** not_started
**Priority:** High

- Document City interface in comments or types
- Define required fields: id, name, nameSlug, theme, vibe
- Define timestamp fields: createdAt, updatedAt
- Document field types and constraints
- _Requirements: 1_

### Task 2.2: Define AI Generation Data Model
**Status:** not_started
**Priority:** Medium

- Document AIGeneration interface
- Define fields: id, type, content, generatedAt, expiresAt
- Document type enum: publicSquare, radio, newsletter
- Define 24-hour expiration logic
- _Requirements: 6_

### Task 2.3: Create Firestore Indexes
**Status:** not_started
**Priority:** Medium

- Create firestore.indexes.json file
- Add composite index for (nameSlug, createdAt)
- Add composite index for (theme, createdAt)
- Document index creation in README
- _Requirements: 7_

---

## Phase 3: City CRUD Operations

### Task 3.1: Implement Create City with Duplicate Checking
**Status:** not_started
**Priority:** High

- Update cityController.createCity function
- Generate slug from city name
- Check for duplicate nameSlug in Firestore
- Return 409 Conflict if duplicate exists
- Include helpful error message with suggestions
- Create city document with all required fields
- Set createdAt and updatedAt timestamps
- _Requirements: 2, 5, 9_

### Task 3.2: Implement Theme Popularity Check
**Status:** not_started
**Priority:** Medium

- Add theme count query in createCity
- Check if 3+ cities with same theme exist
- Return warning message (non-blocking)
- Allow city creation to proceed
- Use case-insensitive theme comparison
- _Requirements: 3_

### Task 3.3: Implement Get All Cities
**Status:** not_started
**Priority:** High

- Update cityController.getCities function
- Query cities collection ordered by createdAt desc
- Limit results to 100 cities
- Map Firestore documents to response format
- Handle empty results gracefully
- Add error handling for Firestore errors
- _Requirements: 5, 7, 9_

### Task 3.4: Implement Get Single City
**Status:** not_started
**Priority:** High

- Update cityController.getCity function
- Fetch city document by ID
- Return 404 if city not found
- Include content count from subcollection
- Map Firestore document to response format
- Add error handling
- _Requirements: 5, 9_

### Task 3.5: Implement Update City
**Status:** not_started
**Priority:** Medium

- Create updateCity function in cityController
- Validate input fields
- Update city document in Firestore
- Update updatedAt timestamp
- Handle duplicate name checking if name changed
- Return updated city data
- _Requirements: 5, 9_

### Task 3.6: Implement Delete City
**Status:** not_started
**Priority:** Medium

- Create deleteCity function in cityController
- Delete city document from Firestore
- Delete all subcollections (content, aiGenerations)
- Return 404 if city not found
- Return success confirmation
- _Requirements: 5, 9_

---

## Phase 4: AI Generation Caching

### Task 4.1: Implement Save AI Generation
**Status:** not_started
**Priority:** High

- Create saveAIGeneration utility function
- Save to aiGenerations subcollection
- Set generatedAt timestamp
- Calculate and set expiresAt (24 hours)
- Include type and content fields
- _Requirements: 6_

### Task 4.2: Implement Get Cached AI Generation
**Status:** not_started
**Priority:** High

- Create getCachedAIGeneration utility function
- Query aiGenerations by type
- Filter by expiresAt > now
- Return most recent non-expired generation
- Return null if no valid cache exists
- _Requirements: 6_

### Task 4.3: Update Public Square Controller
**Status:** not_started
**Priority:** High

- Update aiController.generatePublicSquare
- Check for cached generation first
- Return cached content if valid
- Generate new content if cache miss
- Save new generation to Firestore
- _Requirements: 6_

### Task 4.4: Update Radio Controller
**Status:** not_started
**Priority:** High

- Update aiController.generateRadio
- Check for cached generation first
- Return cached content if valid
- Generate new content if cache miss
- Save new generation to Firestore
- _Requirements: 6_

### Task 4.5: Update Newsletter Controller
**Status:** not_started
**Priority:** High

- Update aiController.generateNewsletter
- Check for cached generation first
- Return cached content if valid
- Generate new content if cache miss
- Save new generation to Firestore
- _Requirements: 6_

---

## Phase 5: Error Handling and Validation

### Task 5.1: Implement Input Validation
**Status:** not_started
**Priority:** High

- Create validateCityInput utility function
- Validate name length (3-50 characters)
- Validate theme length (3-30 characters)
- Validate vibe length (3-30 characters)
- Check for dangerous characters (XSS prevention)
- Return validation errors array
- _Requirements: 9, 12_

### Task 5.2: Implement Comprehensive Error Handling
**Status:** not_started
**Priority:** High

- Add try-catch blocks to all controller functions
- Handle Firestore permission errors (403)
- Handle document not found errors (404)
- Handle duplicate errors (409)
- Handle validation errors (400)
- Log all errors to console
- Return consistent error response format
- _Requirements: 9_

### Task 5.3: Add Rate Limiting
**Status:** not_started
**Priority:** Medium

- Install express-rate-limit package
- Create rate limiter for city creation (5 per hour)
- Apply to POST /api/cities route
- Return 429 Too Many Requests when exceeded
- Add helpful error message
- _Requirements: 12_

---

## Phase 6: Migration and Testing

### Task 6.1: Create Migration Script
**Status:** not_started
**Priority:** Medium

- Create backend/scripts/migrate.js
- Read existing in-memory cities data
- Generate slugs for existing cities
- Create Firestore documents with proper structure
- Set createdAt timestamps
- Make script idempotent (check for existing cities)
- Add success logging
- _Requirements: 8_

### Task 6.2: Update Server Initialization
**Status:** not_started
**Priority:** High

- Remove in-memory cities array
- Initialize Firebase on server startup
- Validate environment variables
- Log Firestore connection status
- Handle initialization errors gracefully
- _Requirements: 4, 10_

### Task 6.3: Test Duplicate Prevention
**Status:** not_started
**Priority:** High

- Test creating city with duplicate name
- Verify 409 error is returned
- Test case-insensitive duplicate checking
- Verify error message includes suggestions
- Test with various name formats
- _Requirements: 2_

### Task 6.4: Test Theme Popularity Warning
**Status:** not_started
**Priority:** Medium

- Create 3+ cities with same theme
- Verify warning message appears
- Verify city creation still succeeds
- Test case-insensitive theme comparison
- _Requirements: 3_

### Task 6.5: Test AI Generation Caching
**Status:** not_started
**Priority:** High

- Generate AI content for a city
- Verify content is saved to Firestore
- Request same content again
- Verify cached content is returned
- Test cache expiration after 24 hours
- _Requirements: 6_

---

## Phase 7: Documentation and Deployment

### Task 7.1: Update README with Firestore Setup
**Status:** not_started
**Priority:** Medium

- Document Firebase project creation steps
- Document service account key generation
- Document environment variable setup
- Document index creation process
- Add troubleshooting section
- _Requirements: 10_

### Task 7.2: Create Deployment Checklist
**Status:** not_started
**Priority:** Low

- Document all deployment steps
- Include Firestore setup instructions
- Include environment variable checklist
- Include index creation steps
- Include migration script instructions
- _Requirements: 10_

### Task 7.3: Document Backup and Recovery
**Status:** not_started
**Priority:** Low

- Document Firestore automatic backup setup
- Create manual backup export script
- Document restore process
- Document Google Cloud Storage bucket setup
- _Requirements: 11_

---

## Optional Enhancements

### Task 8.1: Implement In-Memory Caching
**Status:** not_started
**Priority:** Low

- Install node-cache package
- Create cache wrapper for getCities
- Set 5-minute TTL for city list
- Invalidate cache on city creation/update
- Monitor cache hit rate
- _Requirements: 7_

### Task 8.2: Implement Pagination
**Status:** not_started
**Priority:** Low

- Add pagination parameters to getCities
- Implement cursor-based pagination
- Return nextPageToken in response
- Update frontend to support pagination
- _Requirements: 7_

### Task 8.3: Implement Old Generation Cleanup
**Status:** not_started
**Priority:** Low

- Create cleanup script for old AI generations
- Delete generations older than 7 days
- Schedule as cron job or Cloud Function
- Log cleanup statistics
- _Requirements: 6_

---

## Testing Tasks

### Task T.1: Unit Tests for Utilities
**Status:** not_started

- Test slug generation with various inputs
- Test validation function with edge cases
- Test error handling utilities
- Achieve 80%+ code coverage

### Task T.2: Integration Tests for CRUD
**Status:** not_started

- Test city creation flow end-to-end
- Test duplicate prevention
- Test city retrieval
- Test city update and delete
- Test error scenarios

### Task T.3: Load Testing
**Status:** not_started

- Test with 1000+ cities
- Test concurrent city creation
- Measure query performance
- Test cache effectiveness
- Identify performance bottlenecks
