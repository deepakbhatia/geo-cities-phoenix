# GeoCities AI - Project Context

## Overview
GeoCities AI is a modern resurrection of GeoCities for the AI content age. It's a platform where users can create themed "cities" (neighborhoods) and populate them exclusively with AI-generated content.

## Core Concept
Each city has a shared cultural layer that includes:
- **Public Square**: An AI-updated summary of city activity
- **Radio Station**: Generative soundtrack tuned to the city's vibe
- **Newsletter**: Written by an AI journalist summarizing new pages and trends
- **Content Restriction**: Only AI-generated content can be posted

## Tech Stack
- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **AI Integration**: Google Gemini API
- **Database**: PostgreSQL (planned, currently in-memory)

## Project Structure
```
geocities-ai/
├── backend/          # Express API server
│   ├── controllers/  # Business logic
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
├── src/              # React frontend
│   ├── pages/        # Route components
│   ├── App.jsx       # Main app component
│   └── main.jsx      # Entry point
└── .kiro/            # Kiro workspace config
    ├── specs/        # Feature specifications
    └── steering/     # Project guidelines
```

## Development Guidelines
- Keep implementations minimal and focused
- Use Gemini for all AI content generation
- Maintain the nostalgic GeoCities aesthetic with modern UX
- Prioritize creative, engaging AI-generated content
- Cities should feel like living, breathing communities
