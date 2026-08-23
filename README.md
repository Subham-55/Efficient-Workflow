# AdaptFlow

AI-powered workflow migration platform that detects inefficient workflows and rewires them into autonomous AI-agent automations.

## Features

- **Workflow Input**: Describe, upload, or demo a broken workflow
- **4-Stage Pipeline**: Parse → Diagnose → Migrate → Visualize
- **Live Mode / Demo Mode**: Real backend or safe mock fallback
- **React Flow Canvas**: Before/after workflow graphs with auto-layout
- **Decision Gates**: Approve, adjust, or reject generated automations
- **Impact Metrics**: Manual effort, response speed, and AI confidence scores

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Visualization**: React Flow (@xyflow/react) + Recharts
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion

### Backend
- **Framework**: FastAPI + Python 3.11+
- **AI**: LangGraph + CrewAI-style agents
- **LLM**: Groq inference (with mock fallback)
- **Task Queue**: Background job runner with SSE streaming
- **Storage**: In-memory session store (scalable to PostgreSQL)

## Project Structure

```
AdaptFlow/
├── adaptflow-frontend/          # Next.js frontend
│   ├── app/
│   │   ├── api/mock/           # Mock API routes for demo mode
│   │   └── workspace/          # App routes (new, session, dashboard, settings)
│   ├── components/
│   │   ├── flow/               # React Flow nodes and edges
│   │   ├── pipeline/           # Stage views and stepper
│   │   ├── metrics/            # Charts and counters
│   │   ├── input/              # Form and upload components
│   │   └── layout/             # AppShell and sidebar
│   ├── lib/
│   │   ├── api/                # Schemas, mock data, API client
│   │   ├── hooks/              # useSession, useWorkflowSocket
│   │   ├── store/              # Zustand session store
│   │   └── utils/              # Layout and helpers
│   └── .env.local              # Frontend environment
│
├── adaptflow_backend/          # FastAPI backend
│   ├── api/
│   │   ├── main.py             # FastAPI app entrypoint
│   │   ├── routers/            # sessions, progress, jobs, exports
│   │   ├── models/             # Pydantic schemas
│   │   └── services/           # Job runner
│   ├── agents/                 # LangGraph agents
│   │   ├── supervisor.py
│   │   ├── workflow_analyzer.py
│   │   ├── automation_architect.py
│   │   ├── code_generator.py
│   │   ├── validator_tester.py
│   │   └── migrator_reporter.py
│   ├── graph/
│   │   ├── state.py            # LangGraph state definition
│   │   └── build_graph.py      # Workflow graph builder
│   ├── config/
│   │   ├── settings.py         # Environment config
│   │   └── prompts/            # Agent prompts
│   └── tests/                  # Backend tests
│
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Groq API key (optional, for live mode)

### Frontend Setup

```bash
cd adaptflow-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3001` (or your deployed frontend URL).

### Backend Setup

```bash
cd adaptflow_backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run development server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000` (or `https://adaptflow-1.onrender.com` in production).

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://adaptflow-1.onrender.com
NEXT_PUBLIC_DEMO_MODE=false
```

**Backend** (`.env`):
```
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:pass@localhost/adaptflow
```

## API Endpoints

### Sessions
- `POST /api/sessions` — Create a new session
- `GET /api/sessions/{session_id}` — Get session details
- `POST /api/sessions/{session_id}/decision` — Submit approve/reject decision
- `GET /api/sessions/{session_id}/export?format=json` — Export session

### Progress
- `GET /api/progress/{job_id}` — Get job status and logs

### Health
- `GET /api/health` — Health check

### WebSocket
- `WS /api/sessions/{session_id}/stream` — Real-time stage events

## Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` in the frontend `.env.local` to use mock data without the backend. The frontend will simulate API calls with pre-built demo sessions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run lint` and `pytest`
5. Submit a pull request

## License

MIT
