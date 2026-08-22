from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("[PASSED] GET /health")

def test_login():
    res = client.post("/api/auth/login", json={"email": "user@example.com", "password": "Password123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert "access_token" in data
    print("[PASSED] POST /api/auth/login")
    return data["access_token"]

def test_authenticated_endpoints(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/analytics/summary", headers=headers)
    assert res.status_code == 200, f"Analytics summary failed: {res.status_code} - {res.text}"
    print("[PASSED] GET /api/analytics/summary")

    res = client.get("/api/transactions", headers=headers)
    assert res.status_code == 200, f"Transactions failed: {res.status_code} - {res.text}"
    print("[PASSED] GET /api/transactions")

if __name__ == "__main__":
    test_health()
    token = test_login()
    test_authenticated_endpoints(token)
    print("\nALL BACKEND ENDPOINTS VERIFIED SUCCESSFULLY!")
