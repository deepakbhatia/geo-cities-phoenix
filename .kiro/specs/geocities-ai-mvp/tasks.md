# Implementation Plan

- [ ] 1. Set up project configuration and dependencies
  - Install all required npm packages including React, Express, Vite, and Google Generative AI SDK
  - Configure Vite for React with proxy to backend API
  - Set up environment variable handling with dotenv
  - Create .env.example with required variables
  - _Requirements: 5.1, 5.2_

- [ ] 2. Implement backend server foundation
  - Create Express server with CORS and JSON middleware
  - Set up health check endpoint at /api/health
  - Configure server to listen on port from environment variable
  - _Requirements: 5.1_

- [ ] 3. Implement city data management
  - [ ] 3.1 Create city controller with in-memory storage
    - Implement getCities function to return all cities
    - Implement getCity function to return single city by ID with 404 handling
    - Implement createCity function to add new cities
    - Initialize with 3 sample cities (Silicon Valley, Sunset Boulevard, Neon District)
    - _Requirements: 1.1, 1.2_

  - [ ] 3.2 Create city routes
    - Set up GET /api/cities endpoint
    - Set up GET /api/cities/:id endpoint
    - Set up POST /api/cities endpoint
    - Wire routes to city controller functions
    - _Requirements: 1.1, 1.2_

- [ ] 4. Implement content data management
  - [ ] 4.1 Create content controller with in-memory storage
    - Implement getContent function to filter content by cityId
    - Implement createContent function to add new content with timestamps
    - _Requirements: 1.4_

  - [ ] 4.2 Create content routes
    - Set up GET /api/content/:cityId endpoint
    - Set up POST /api/content endpoint
    - Wire routes to content controller functions
    - _Requirements: 1.4_

- [ ] 5. Implement Gemini AI integration
  - [ ] 5.1 Create AI controller with Gemini client
    - Initialize GoogleGenerativeAI with API key from environment
    - Configure gemini-pro model for text generation
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 5.2 Implement public square generation
    - Create generatePublicSquare function accepting cityId, cityName, theme, recentActivity
    - Build prompt for 2-3 sentence engaging announcement
    - Call Gemini API and return summary with timestamp
    - Add error handling with 500 status on failure
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 5.4_

  - [ ] 5.3 Implement newsletter generation
    - Create generateNewsletter function accepting cityId, cityName, theme, pages
    - Build prompt for 3-4 paragraph newsletter covering highlights, trends, and unique characteristics
    - Call Gemini API and return newsletter with timestamp
    - Add error handling with 500 status on failure
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.4_

  - [ ] 5.4 Implement radio station generation
    - Create generateRadio function accepting cityId, cityName, vibe
    - Build prompt for genre, mood descriptors, and 3 fictional song titles
    - Call Gemini API and return radio description with timestamp
    - Add error handling with 500 status on failure
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.4_

  - [ ] 5.5 Create AI routes
    - Set up POST /api/ai/public-square/:cityId endpoint
    - Set up POST /api/ai/newsletter/:cityId endpoint
    - Set up POST /api/ai/radio/:cityId endpoint
    - Wire routes to AI controller functions
    - _Requirements: 2.2, 3.2, 4.2_

- [ ] 6. Implement frontend routing and app structure
  - [ ] 6.1 Create main app component
    - Set up React Router with BrowserRouter
    - Create App component with header showing title and tagline
    - Define routes for home (/) and city detail (/city/:id)
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 6.2 Create base styling
    - Implement gradient background with purple to blue colors
    - Style header with semi-transparent card, backdrop blur, and text shadow
    - Set up Comic Sans MS font with Arial fallback
    - Configure responsive container with max-width
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7. Implement home page with city list
  - [ ] 7.1 Create Home component
    - Implement state for cities array and loading boolean
    - Fetch cities from GET /api/cities on component mount
    - Display loading message while fetching
    - _Requirements: 1.1_

  - [ ] 7.2 Render city grid
    - Create responsive grid layout with auto-fill and min 280px columns
    - Map cities to Link components wrapping city cards
    - Display city name, theme, vibe, and page count in each card
    - Navigate to /city/:id on card click
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ] 7.3 Style city cards
    - Apply semi-transparent white background with backdrop blur
    - Add hover effects with transform and background change
    - Style text hierarchy with varying opacity
    - Add border with semi-transparent white
    - _Requirements: 6.1, 6.3, 6.4_

- [ ] 8. Implement city detail page
  - [ ] 8.1 Create City component structure
    - Extract cityId from URL params using useParams
    - Implement state for city, publicSquare, newsletter, radio, and loading
    - Fetch city data from GET /api/cities/:id on mount
    - Display loading message while fetching
    - Display error if city not found
    - _Requirements: 2.1, 3.1, 4.1_

  - [ ] 8.2 Implement back navigation
    - Create back link at top of page
    - Link to home page (/)
    - Style with white color and hover opacity change
    - _Requirements: 7.1, 7.2_

  - [ ] 8.3 Display city header
    - Show city name as large heading
    - Display theme and vibe as metadata below name
    - Style with appropriate font sizes and opacity
    - _Requirements: 2.1, 3.1, 4.1_

  - [ ] 8.4 Implement public square section
    - Create section with emoji icon and heading
    - Add generate button that calls generatePublicSquare function
    - Display generated summary in styled content area when available
    - Show error message if generation fails
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 8.5 Implement radio station section
    - Create section with emoji icon and heading
    - Add tune in button that calls generateRadio function
    - Display generated radio description in styled content area when available
    - Show error message if generation fails
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ] 8.6 Implement newsletter section
    - Create section with emoji icon and heading
    - Add generate button that calls generateNewsletter function
    - Display generated newsletter in styled content area when available
    - Show error message if generation fails
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 8.7 Style city detail sections
    - Stack sections vertically with gap
    - Apply semi-transparent backgrounds to each section
    - Style buttons with transparent white background and borders
    - Add hover effects to buttons
    - Style AI content areas with dark background and pre-wrap text
    - Include emoji icons in section headers
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 9. Implement AI generation functions in City component
  - [ ] 9.1 Create generatePublicSquare function
    - Make POST request to /api/ai/public-square/:cityId
    - Send cityName, theme, and recentActivity in request body
    - Update publicSquare state with response summary
    - Handle errors and display error message
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 9.2 Create generateNewsletter function
    - Make POST request to /api/ai/newsletter/:cityId
    - Send cityName, theme, and pages in request body
    - Update newsletter state with response newsletter
    - Handle errors and display error message
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ] 9.3 Create generateRadio function
    - Make POST request to /api/ai/radio/:cityId
    - Send cityName and vibe in request body
    - Update radio state with response radioDescription
    - Handle errors and display error message
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Create project documentation
  - [ ] 10.1 Write README with setup instructions
    - Document installation steps
    - Explain environment variable configuration
    - Provide development server commands
    - List tech stack
    - _Requirements: 5.2_

  - [ ] 10.2 Create .gitignore file
    - Exclude node_modules
    - Exclude .env file
    - Exclude build artifacts
    - Exclude system files
    - _Requirements: 5.2_
