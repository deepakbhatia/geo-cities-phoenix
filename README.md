# GeoCities AI 🌆✨

A modern resurrection of GeoCities for the AI content age. Create themed "cities" (neighborhoods) and populate them exclusively with AI-generated content featuring public squares, radio stations, and newsletters.

## 🎨 Features

- **Themed Cities**: Browse and explore unique neighborhoods with distinct vibes
- **Public Square**: AI-generated summaries of city activity
- **Radio Station**: Generative soundtracks tuned to each city's atmosphere
- **Newsletter**: AI journalist covering new pages and trends
- **Nostalgic UI**: Retro GeoCities aesthetic with modern UX

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router 6
- Vite 5
- CSS (custom retro styling)

### Backend
- Node.js
- Express 4
- Google Generative AI (Gemini)
- PostgreSQL (planned, currently in-memory)

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd geocities-ai
```

### 2. Install dependencies

Install all dependencies for root, backend, and frontend:

```bash
npm run install:all
```

Or install manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

## 🎮 Development

### Start both servers concurrently

From the project root:

```bash
npm run dev
```

This starts:
- Backend API server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

### Start servers individually

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## 🏗️ Project Structure

```
geocities-ai/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Route components (Home, City)
│   │   ├── App.jsx       # Main app with routing
│   │   ├── App.css       # Retro styling
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   └── package.json
├── backend/              # Express API server
│   ├── controllers/      # Business logic
│   │   ├── cityController.js
│   │   ├── contentController.js
│   │   └── aiController.js
│   ├── routes/           # API endpoints
│   ├── server.js         # Entry point
│   ├── .env.example      # Environment template
│   └── package.json
├── .kiro/                # Kiro workspace config
│   └── specs/            # Feature specifications
├── package.json          # Root package with dev scripts
└── README.md
```

## 🔌 API Endpoints

### Cities
- `GET /api/cities` - List all cities
- `GET /api/cities/:id` - Get city by ID
- `POST /api/cities` - Create new city

### Content
- `GET /api/content/:cityId` - Get content for a city
- `POST /api/content` - Create new content

### AI Generation
- `POST /api/ai/public-square/:cityId` - Generate public square summary
- `POST /api/ai/newsletter/:cityId` - Generate city newsletter
- `POST /api/ai/radio/:cityId` - Generate radio station description

## 🎯 Usage

1. Open `http://localhost:5173` in your browser
2. Browse the available cities on the home page
3. Click on a city to explore its details
4. Generate AI content:
   - Click "Generate" in the Public Square section
   - Click "Tune In" for the Radio Station
   - Click "Generate Newsletter" for the city newsletter

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI generation | Yes |
| `PORT` | Backend server port (default: 3000) | No |
| `DATABASE_URL` | PostgreSQL connection string (future) | No |

## 🚧 Future Enhancements

- User authentication and accounts
- Database persistence (PostgreSQL)
- User-created cities and content
- Image generation for city visuals
- Real-time AI chat in public squares
- Community features (comments, reactions)

## 📝 License

MIT

## 🤝 Contributing

This is an MVP project. Contributions welcome!

---

Built with ❤️ and AI
