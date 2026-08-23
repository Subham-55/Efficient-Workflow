# AdaptFlow Backend

This project implements a FastAPI backend for the AdaptFlow workflow automation platform, aligned with the master specification and the frontend PRD/design contract.

## Run locally

```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## Test

```bash
python -m pytest -q tests/test_backend.py tests/test_spec_completion.py
```

## API

- POST /api/sessions
- GET /api/sessions/{session_id}
- POST /api/sessions/{session_id}/decision
- POST /api/jobs
- GET /api/jobs/{job_id}
- GET /api/jobs/{job_id}/result
- GET /api/health
