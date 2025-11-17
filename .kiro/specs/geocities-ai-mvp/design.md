# Design Document

## Overview

GeoCities AI is a full-stack web application that recreates the GeoCities neighborhood experience with AI-generated content. The system consists of a React frontend, Express backend API, and integration with Google's Gemini AI model. The architecture prioritizes simplicity for the MVP while maintaining extensibility for future features like user authentication, content creation, and database persistence.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express API    │
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│  In-Memory      │  │  Gemini API  │
│  Data Store     │  │  (External)  │
└─────────────────┘  └──────────────┘
```

### Technology Stack

- **Frontend**: React 18 with React Router for navigation
- **Build Tool**: Vite for fast development and optimized builds
- **Backend**: Node.js with Express framework
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)
- **Data Storage**: In-memory arrays (MVP), PostgreSQL (future)
- **Styling**: CSS with custom retro-inspired design

## Components and Interfaces

### Frontend Components

#### App Component
- **Purpose**: Root component managing routing
- **Routes**:
  - `/` - Home page with city list
  - `/city/:id` - City detail page
- **State**: None (routing only)

#### Home Component
- **Purpose**: Display grid of available cities
- **State**:
  - `cities`: Array of city objects
  - `loading`: Boolean for loading state
- **Effects**: Fetch cities on mount
- **API Calls**: `GET /api/cities`

#### City Component
- **Purpose**: Display city details and AI-generated features
- **State**:
  - `city`: Current city object
  - `publicSquare`: Generated public square text
  - `newsletter`: Generated newsletter text
  - `radio`: Generated radio description
  - `loading`: Boolean for loading state
- **Effects**: Fetch city data on mount
- **API Calls**:
  - `GET /api/cities/:id`
  - `POST /api/ai/public-square/:cityId`
  - `POST /api/ai/newsletter/:cityId`
  - `POST /api/ai/radio/:cityId`

### Backend API Endpoints

#### City Routes (`/api/cities`)

**GET /api/cities**
- Returns array of all cities
- Response: `[{ id, name, theme, vibe, pages }]`

**GET /api/cities/:id**
- Returns single city by ID
- Response: `{ id, name, theme, vibe, pages }`
- Error: 404 if city not found

**POST /api/cities**
- Creates new city
- Request: `{ name, theme, vibe }`
- Response: `{ id, name, theme, vibe, pages: [] }`

#### Content Routes (`/api/content`)

**GET /api/content/:cityId**
- Returns all content for a city
- Response: `[{ id, cityId, title, body, type, createdAt }]`

**POST /api/content**
- Creates new content item
- Request: `{ cityId, title, body, type }`
- Response: `{ id, cityId, title, body, type, createdAt }`

#### AI Routes (`/api/ai`)

**POST /api/ai/public-square/:cityId**
- Generates public square summary
- Request: `{ cityName, theme, recentActivity }`
- Response: `{ cityId, summary, generatedAt }`
- Uses Gemini prompt focused on brief, engaging announcements

**POST /api/ai/newsletter/:cityId**
- Generates city newsletter
- Request: `{ cityName, theme, pages }`
- Response: `{ cityId, newsletter, generatedAt }`
- Uses Gemini prompt for 3-4 paragraph newsletter format

**POST /api/ai/radio/:cityId**
- Generates radio station description
- Request: `{ cityName, vibe }`
- Response: `{ cityId, radioDescription, generatedAt }`
- Uses Gemini prompt for genre, mood, and fictional song titles

## Data Models

### City Model
```typescript
{
  id: string           // Unique identifier
  name: string         // Display name (e.g., "Silicon Valley")
  theme: string        // Category (e.g., "tech", "art", "cyberpunk")
  vibe: string         // Atmosphere (e.g., "futuristic", "creative")
  pages: Content[]     // Array of content items
}
```

### Content Model
```typescript
{
  id: string           // Unique identifier
  cityId: string       // Parent city reference
  title: string        // Content title
  body: string         // Content text
  type: string         // Content type (e.g., "page", "post")
  createdAt: string    // ISO timestamp
}
```

### AI Response Models

**Public Square Response**
```typescript
{
  cityId: string
  summary: string      // 2-3 sentence summary
  generatedAt: string  // ISO timestamp
}
```

**Newsletter Response**
```typescript
{
  cityId: string
  newsletter: string   // 3-4 paragraph newsletter
  generatedAt: string  // ISO timestamp
}
```

**Radio Response**
```typescript
{
  cityId: string
  radioDescription: string  // Genre, mood, song titles
  generatedAt: string       // ISO timestamp
}
```

## AI Integration Design

### Gemini API Configuration
- Model: `gemini-pro` for text generation
- Authentication: API key from `GEMINI_API_KEY` environment variable
- SDK: `@google/generative-ai` package

### Prompt Engineering Strategy

**Public Square Prompts**
- Context: City name, theme, recent activity
- Tone: Brief, engaging, community-focused
- Length: 2-3 sentences
- Goal: Create excitement about city activity

**Newsletter Prompts**
- Context: City name, theme, page count
- Tone: Journalistic, informative, creative
- Length: 3-4 paragraphs
- Structure: Highlights → Trends → Unique characteristics

**Radio Prompts**
- Context: City name, vibe
- Tone: Atmospheric, evocative
- Content: Genre/style, mood descriptors, 3 fictional song titles
- Goal: Create immersive audio atmosphere description

### Error Handling for AI
- Catch API errors and return 500 status with error message
- Frontend displays user-friendly error messages
- No retry logic in MVP (future enhancement)
- Graceful degradation: UI remains functional if AI fails

## User Interface Design

### Visual Design Principles
- **Nostalgia**: Gradient backgrounds, playful fonts, retro aesthetics
- **Readability**: Semi-transparent cards with backdrop blur
- **Hierarchy**: Clear visual separation between sections
- **Interactivity**: Hover effects, smooth transitions
- **Responsiveness**: Grid layouts that adapt to screen size

### Color Scheme
- Primary gradient: Brown to Cream (`#705C53` to `#FFF2E1`)
- Card backgrounds: Semi-transparent white with blur
- Text: White with varying opacity for hierarchy
- Buttons: Transparent white with borders

### Typography
- Primary font: Comic Sans MS (nostalgic)
- Fallback: Arial, sans-serif
- Headers: Large, bold, with text shadows
- Body: Readable size with good line height

### Layout Patterns

**Home Page**
- Centered header with title and tagline
- Responsive grid of city cards (min 280px, auto-fill)
- Each card shows: name, theme, vibe, page count
- Hover effects for interactivity

**City Detail Page**
- Back link at top
- City header with name and metadata
- Three feature sections stacked vertically:
  - Public Square
  - Radio Station
  - Newsletter
- Each section has generate button and content display area

## Error Handling

### Frontend Error Handling
- Display loading states during API calls
- Show error messages for failed requests
- Graceful fallback for missing data
- Console logging for debugging

### Backend Error Handling
- Try-catch blocks around all async operations
- Consistent error response format: `{ error: string }`
- Appropriate HTTP status codes:
  - 404 for not found
  - 500 for server/AI errors
  - 201 for successful creation
- Error logging to console

### AI-Specific Error Handling
- Catch Gemini API errors separately
- Return descriptive error messages
- Don't expose API keys or sensitive details
- Log errors for monitoring

## Testing Strategy

### Manual Testing Focus (MVP)
- Test all API endpoints with sample data
- Verify AI generation for each feature
- Test navigation between pages
- Verify responsive design on different screen sizes
- Test error scenarios (invalid IDs, API failures)

### Future Automated Testing
- Unit tests for controllers and utilities
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## Performance Considerations

### Frontend Optimization
- Vite's fast HMR for development
- Code splitting via React Router
- Lazy loading for future enhancements
- Minimal bundle size with tree shaking

### Backend Optimization
- In-memory storage for fast reads (MVP)
- No database queries to optimize yet
- Future: Add caching for AI responses
- Future: Implement rate limiting

### AI Performance
- Gemini API response time: ~2-5 seconds
- No caching in MVP (generate fresh each time)
- Future: Cache AI responses with TTL
- Future: Implement loading indicators with progress

## Security Considerations

### API Key Management
- Store Gemini API key in environment variables
- Never commit `.env` file to version control
- Use `.env.example` for documentation

### Input Validation
- Validate city IDs before database lookups
- Sanitize user inputs (future when adding content creation)
- Validate request bodies for required fields

### CORS Configuration
- Enable CORS for frontend-backend communication
- Restrict origins in production
- Allow all origins in development

## Future Enhancements

### Database Migration
- Replace in-memory storage with PostgreSQL
- Implement proper schema with migrations
- Add indexes for performance
- Store AI-generated content for reuse

### User Authentication
- Add user accounts and sessions
- Allow users to create cities
- Enable content posting (AI-generated only)
- Implement permissions and ownership

### Enhanced AI Features
- Image generation for city visuals
- Audio generation for radio stations
- Real-time AI chat in public squares
- Personalized content recommendations

### Community Features
- User profiles and avatars
- Comments and reactions
- City discovery and search
- Trending cities and content
