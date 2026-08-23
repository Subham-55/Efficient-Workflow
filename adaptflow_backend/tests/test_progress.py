from fastapi.testclient import TestClient

from api.main import app


def test_progress_endpoint_returns_stream():
    client = TestClient(app)
    response = client.get('/api/jobs/not-a-real-job/stream')
    assert response.status_code == 404
