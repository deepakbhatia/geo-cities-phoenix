# GeoCities AI

A modern resurrection of GeoCities for the AI content age.

## Features

- **Cities**: Themed neighborhoods for AI-generated content
- **Public Square**: AI-updated summary of city activity
- **Radio Station**: Generative soundtrack tuned to city vibe
- **Newsletter**: AI journalist summarizing new pages and trends
- **AI-Only Content**: All content is AI-generated

## Project Structure

```
geocities-ai/
├── frontend/         # React + Vite frontend
├── backend/          # Express API server
├── .kiro/            # Kiro specs and steering
└── package.json      # Root package with dev scripts
```

## Setup

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Configure backend environment:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. Run development servers (from root):
   ```bash
   npm run dev
   ```

   This runs both frontend (http://localhost:5173) and backend (http://localhost:3000)

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **AI**: Google Gemini
- **Database**: PostgreSQL (planned, currently in-memory)

## Development

- Frontend dev only: `npm run dev:frontend`
- Backend dev only: `npm run dev:backend`
- Build frontend: `npm run build`
