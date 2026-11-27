from __future__ import annotations

import json
import os
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
TEMP_DIR = tempfile.TemporaryDirectory()
os.environ.update(
    {
        "ADMIN_API_KEY": "chave-administrativa-exclusiva-dos-testes",
        "DEVICE_API_KEY": "chave-dispositivo-exclusiva-dos-testes",
        "LIVENESS_DEVICE_KEY": "chave-liveness-exclusiva-dos-testes",
        "SESSION_SECRET": "segredo-de-sessao-exclusivo-dos-testes",
        "FERNET_KEY": Fernet.generate_key().decode("ascii"),
        "DATABASE_PATH": str(Path(TEMP_DIR.name) / "nexguard-test.db"),
        "MODEL_DIR": str(Path(TEMP_DIR.name) / "models"),
        "PHYSICAL_UNLOCK_ENABLED": "false",
    }
)
sys.path.insert(0, str(ROOT / "Backend"))

from app.main import app  # noqa: E402


class NexGuardApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.__exit__(None, None, None)
        TEMP_DIR.cleanup()

    def admin_token(self) -> str:
        response = self.client.post(
            "/api/v1/auth/admin",
            json={"password": "chave-administrativa-exclusiva-dos-testes"},
        )
        self.assertEqual(response.status_code, 200)
        return response.json()["access_token"]

    def test_01_health_and_unified_catalog(self) -> None:
        health = self.client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["status"], "online")
        self.assertFalse(health.json()["physical_unlock_enabled"])
        self.assertFalse(health.json()["image_storage"])

        response = self.client.get("/api/v1/devices/")
        self.assertEqual(response.status_code, 200)
        devices = response.json()
        ids = [device["id"] for device in devices]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(set(ids), {1, 2, 3, 4, 5, 7, 8, 9})
        names = {device["name"] for device in devices}
        self.assertNotIn("Sirene Externa NX-Siren", names)
        self.assertNotIn("Central de Alarme NX-Hub", names)
        self.assertEqual(next(item for item in devices if item["id"] == 8)["category"], "sensor")

    def test_02_lead_is_persisted_and_admin_is_required(self) -> None:
        payload = {
            "name": "Maria da Silva",
            "email": "maria@example.com",
            "message": "Gostaria de conhecer os planos residenciais.",
        }
        created = self.client.post("/api/v1/leads/", json=payload)
        self.assertEqual(created.status_code, 201, created.text)
        self.assertEqual(created.json()["status"], "Novo")
        self.assertEqual(self.client.get("/api/v1/leads/").status_code, 401)

        token = self.admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        listed = self.client.get("/api/v1/leads/", headers=headers)
        self.assertEqual(listed.status_code, 200)
        lead = next(item for item in listed.json() if item["email"] == payload["email"])
        self.assertEqual(lead["message"], payload["message"])

        updated = self.client.patch(
            f"/api/v1/leads/{lead['id']}/status",
            headers=headers,
            json={"status": "Em contato"},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["status"], "Em contato")

    def test_03_order_totals_and_sqlite_persistence(self) -> None:
        payload = {
            "customer_name": "João da Silva",
            "customer_email": "joao@example.com",
            "customer_phone": "11999999999",
            "address": {
                "zip_code": "01001-000",
                "street": "Praça da Sé",
                "number": "100",
                "complement": None,
                "neighborhood": "Sé",
                "city": "São Paulo",
                "state": "SP",
            },
            "items": [
                {"device_id": 8, "quantity": 1},
                {"device_id": 9, "quantity": 2},
            ],
        }
        response = self.client.post("/api/v1/orders/", json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        order = response.json()
        self.assertEqual(order["monthly_total"], 26.70)
        self.assertEqual(order["installation_total"], 117.00)

        connection = sqlite3.connect(os.environ["DATABASE_PATH"])
        try:
            stored = connection.execute(
                "SELECT items_json, customer_email FROM adhesion_orders WHERE id = ?",
                (order["id"],),
            ).fetchone()
        finally:
            connection.close()
        self.assertIsNotNone(stored)
        self.assertEqual(stored[1], payload["customer_email"])
        self.assertEqual(len(json.loads(stored[0])), 2)

    def test_04_order_validation_rejects_invalid_items(self) -> None:
        base_payload = {
            "customer_name": "Cliente Teste",
            "customer_email": "cliente@example.com",
            "customer_phone": "11999999999",
            "address": {
                "zip_code": "01001000",
                "street": "Rua Teste",
                "number": "10",
                "neighborhood": "Centro",
                "city": "São Paulo",
                "state": "SP",
            },
        }
        for unavailable_device_id in (6, 999):
            with self.subTest(device_id=unavailable_device_id):
                unavailable_device = self.client.post(
                    "/api/v1/orders/",
                    json={**base_payload, "items": [{"device_id": unavailable_device_id, "quantity": 1}]},
                )
                self.assertEqual(unavailable_device.status_code, 422)
        empty_order = self.client.post("/api/v1/orders/", json={**base_payload, "items": []})
        self.assertEqual(empty_order.status_code, 422)

    def test_05_private_access_routes_require_authentication(self) -> None:
        self.assertEqual(self.client.get("/api/v1/people").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/access/events").status_code, 401)
        self.assertEqual(self.client.post("/api/v1/access/recognize", json={}).status_code, 401)

    def test_06_invalid_admin_password_is_rejected(self) -> None:
        response = self.client.post("/api/v1/auth/admin", json={"password": "incorreta"})
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
