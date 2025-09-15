from ..infra.db import get_conn
import json


def append_log(run_id: str, step_id: str, ok: bool, payload: dict, idempotency_key: str | None = None):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_logs(run_id, step_id, ok, payload, idempotency_key) VALUES (%s,%s,%s,%s,%s)",
            (run_id, step_id, ok, json.dumps(payload), idempotency_key)
        )
