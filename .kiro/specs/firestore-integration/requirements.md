# Firestore Database Integration - Requirements Document

## Introduction

This specification outlines the migration from in-memory storage to Google Cloud Firestore for GeoCities AI. The system will persist cities, content, and AI-generated features while ensuring data integrity, preventing duplicates, and maintaining performance.

## Glossary

- **Firestore**: Google Cloud's NoSQL document database
- **Collection**: A container for documents in Firestore (similar to a table)
- **Document**: A record in Firestore containing fields (similar to a row)
- **Subcollection**: A collection nested within a document
- **Composite Index**: An index on multiple fields for complex queries
- **Case-Insensitive Search**: Searching without regard to uppercase/lowercase
- **Slug**: URL-friendly version of a name (e.g., "Silicon Valley" → "silicon-valley")

## Requirements

### Requirement 1: Database Schema Design

**User Story:** As a developer, I want a well-structured database schema, so that data is organized efficiently and queries are performant

#### Acceptance Criteria

1. THE System SHALL create a `cities` collection for storing city documents
2. EACH city document SHALL contain fields: id, name, nameSlug, theme, vibe, createdAt, updatedAt
3. THE System SHALL create a `content` subcollection within each city for storing pages
4. THE System SHALL create an `aiGenerations` subcollection for caching AI responses
5. THE System SHALL use auto-generated document IDs for cities
6. THE System SHALL store timestamps as Firestore Timestamp objects

### Requirement 2: Prevent Duplicate City Names

**User Story:** As a user, I want to be prevented from creating a city with a name that already exists, so that each city is unique

#### Acceptance Criteria

1. WHEN a User attempts to create a city, THE System SHALL check if a city with the same name already exists (case-insensitive)
2. THE System SHALL use a normalized slug field (nameSlug) for duplicate checking
3. IF a duplicate name is found, THEN THE System SHALL return a 409 Conflict error
4. THE System SHALL return a helpful error message: "A city named '[name]' already exists. Please choose a different name."
5. THE System SHALL suggest alternative names if available (e.g., "Silicon Valley 2", "New Silicon Valley")

### Requirement 3: Theme Uniqueness Validation

**User Story:** As a user, I want to know if my city theme is similar to existing cities, so that I can create something unique

#### Acceptance Criteria

1. WHEN a User creates a city, THE System SHALL check for cities with the same theme
2. IF 3 or more cities with the same theme exist, THEN THE System SHALL show a warning message
3. THE warning SHALL say: "There are already [count] cities with the '[theme]' theme. Consider making yours unique!"
4. THE System SHALL still allow creation but encourage differentiation
5. THE System SHALL be case-insensitive when comparing themes

### Requirement 4: Firestore Connection Setup

**User Story:** As a developer, I want to configure Firestore connection securely, so that the application can access the database

#### Acceptance Criteria

1. THE System SHALL use Firebase Admin SDK for server-side Firestore access
2. THE System SHALL authenticate using a service account key stored in environment variables
3. THE System SHALL initialize Firestore with project ID from environment variables
4. THE System SHALL handle connection errors gracefully
5. THE System SHALL log connection status on server startup

### Requirement 5: City CRUD Operations

**User Story:** As a user, I want to create, read, update, and delete cities, so that I can manage my neighborhoods

#### Acceptance Criteria

1. THE System SHALL implement createCity with duplicate checking
2. THE System SHALL implement getCities to fetch all cities ordered by createdAt
3. THE System SHALL implement getCity to fetch a single city by ID
4. THE System SHALL implement updateCity to modify city details
5. THE System SHALL implement deleteCity to remove a city and its subcollections
6. ALL operations SHALL handle Firestore errors and return appropriate HTTP status codes

### Requirement 6: Content Storage

**User Story:** As a user, I want my AI-generated content to be saved, so that I don't have to regenerate it every time

#### Acceptance Criteria

1. THE System SHALL store AI-generated content in the `aiGenerations` subcollection
2. EACH AI generation document SHALL contain: type (publicSquare/radio/newsletter), content, generatedAt
3. THE System SHALL retrieve cached content if it exists and is less than 24 hours old
4. THE System SHALL allow manual regeneration to override cache
5. THE System SHALL clean up old generations (older than 7 days) periodically

### Requirement 7: Query Performance

**User Story:** As a user, I want fast page loads, so that I can browse cities quickly

#### Acceptance Criteria

1. THE System SHALL create a composite index on (nameSlug, createdAt)
2. THE System SHALL create an index on (theme, createdAt)
3. THE System SHALL limit city list queries to 100 results
4. THE System SHALL implement pagination for large result sets
5. THE System SHALL cache frequently accessed data in memory (optional)

### Requirement 8: Data Migration

**User Story:** As a developer, I want to migrate existing in-memory data to Firestore, so that no data is lost

#### Acceptance Criteria

1. THE System SHALL provide a migration script to transfer existing cities
2. THE migration SHALL preserve all city data (name, theme, vibe)
3. THE migration SHALL generate proper slugs for existing cities
4. THE migration SHALL set createdAt timestamps for migrated data
5. THE migration SHALL be idempotent (can run multiple times safely)

### Requirement 9: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I know how to fix it

#### Acceptance Criteria

1. THE System SHALL catch Firestore permission errors and return 403 Forbidden
2. THE System SHALL catch document not found errors and return 404 Not Found
3. THE System SHALL catch duplicate name errors and return 409 Conflict
4. THE System SHALL catch validation errors and return 400 Bad Request
5. THE System SHALL log all errors to console for debugging

### Requirement 10: Environment Configuration

**User Story:** As a developer, I want to configure Firestore settings via environment variables, so that I can use different databases for dev/prod

#### Acceptance Criteria

1. THE System SHALL read FIREBASE_PROJECT_ID from environment variables
2. THE System SHALL read FIREBASE_SERVICE_ACCOUNT from environment variables (JSON string)
3. THE System SHALL provide a .env.example file with all required variables
4. THE System SHALL validate that all required environment variables are set on startup
5. THE System SHALL fail gracefully with helpful error messages if configuration is missing

### Requirement 11: Backup and Recovery

**User Story:** As a system administrator, I want automated backups, so that data can be recovered if needed

#### Acceptance Criteria

1. THE System SHALL document how to enable Firestore automatic backups
2. THE System SHALL provide export scripts for manual backups
3. THE System SHALL document the restore process
4. THE System SHALL test backup/restore procedures
5. THE System SHALL store backups in a separate Google Cloud Storage bucket

### Requirement 12: Security Rules

**User Story:** As a developer, I want secure database access, so that unauthorized users cannot modify data

#### Acceptance Criteria

1. THE System SHALL use Firebase Admin SDK for all database operations (server-side only)
2. THE System SHALL NOT expose Firestore directly to the frontend
3. THE System SHALL validate all input data before writing to Firestore
4. THE System SHALL sanitize user input to prevent injection attacks
5. THE System SHALL implement rate limiting on city creation (max 5 per hour per IP)

## Non-Functional Requirements

### Performance
- City list queries: < 500ms
- Single city fetch: < 200ms
- City creation: < 1000ms
- AI generation with cache: < 100ms

### Scalability
- Support up to 10,000 cities
- Support up to 100,000 AI generations
- Handle 100 concurrent users

### Reliability
- 99.9% uptime (leveraging Firestore SLA)
- Automatic failover via Firestore
- Data replication across regions

### Security
- All data encrypted at rest (Firestore default)
- All data encrypted in transit (HTTPS)
- Service account key never committed to git
- Environment variables for all secrets
