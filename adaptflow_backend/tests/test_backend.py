import unittest
from fastapi.testclient import TestClient

from api.main import app


class AdaptFlowBackendTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_create_and_fetch_session(self) -> None:
        response = self.client.post(
            "/api/sessions",
            json={
                "inputType": "example",
                "content": "Support ticket triage workflow",
                "exampleId": "support-ticket-triage",
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("sessionId", payload)
        self.assertEqual(payload["status"], "parsing")

        session_id = payload["sessionId"]
        detail = self.client.get(f"/api/sessions/{session_id}")
        self.assertEqual(detail.status_code, 200)
        detail_payload = detail.json()
        self.assertEqual(detail_payload["sessionId"], session_id)
        self.assertIn("parsed", detail_payload)
        self.assertIn("before", detail_payload)
        self.assertIn("after", detail_payload)
        self.assertIn("impact", detail_payload)
        self.assertEqual(detail_payload["status"], "parsing")

    def test_decision_endpoint(self) -> None:
        response = self.client.post(
            "/api/sessions",
            json={
                "inputType": "text",
                "content": "HR onboarding approvals",
            },
        )
        session_id = response.json()["sessionId"]
        decision = self.client.post(
            f"/api/sessions/{session_id}/decision",
            json={"action": "approve"},
        )
        self.assertEqual(decision.status_code, 200)
        self.assertEqual(decision.json()["status"], "ok")

    def test_export_endpoint(self) -> None:
        response = self.client.post(
            "/api/sessions",
            json={
                "inputType": "example",
                "content": "Support ticket triage",
                "exampleId": "support-ticket-triage",
            },
        )
        session_id = response.json()["sessionId"]
        export_response = self.client.get(f"/api/sessions/{session_id}/export?format=json")
        self.assertEqual(export_response.status_code, 200)
        self.assertIn("sessionId", export_response.json())


if __name__ == "__main__":
    unittest.main()
