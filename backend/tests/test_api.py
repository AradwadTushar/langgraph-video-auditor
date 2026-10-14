import os
import unittest
from fastapi.testclient import TestClient
from backend.src.api.server import app

class TestServerAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("service"), "Brand Guardian AI")

    def test_audit_missing_field_returns_422(self):
        # Missing video_url should trigger Pydantic validation error (422)
        response = self.client.post("/audit", json={})
        self.assertEqual(response.status_code, 422)

    def test_api_key_auth_enforcement(self):
        os.environ["BRAND_GUARDIAN_API_KEY"] = "secret-test-key-123"
        try:
            # Request without header should be rejected
            response_unauthorized = self.client.post(
                "/audit",
                json={"video_url": "https://example.com/test"}
            )
            self.assertEqual(response_unauthorized.status_code, 401)

            # Request with incorrect header should be rejected
            response_wrong_key = self.client.post(
                "/audit",
                headers={"X-API-Key": "wrong-key"},
                json={"video_url": "https://example.com/test"}
            )
            self.assertEqual(response_wrong_key.status_code, 401)
        finally:
            del os.environ["BRAND_GUARDIAN_API_KEY"]

if __name__ == "__main__":
    unittest.main()
