import psycopg
from psycopg.rows import dict_row
from .settings import settings


def get_conn():
    return psycopg.connect(
        host=settings.db_host,
        port=settings.db_port,
        dbname=settings.db_name,
        user=settings.db_user,
        password=settings.db_pass,
        autocommit=True,
        row_factory=dict_row
    )


SCHEMA_SQL = '''
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  playbook TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'running'
);
CREATE TABLE IF NOT EXISTS run_logs (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  ok BOOLEAN NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT,
  ts TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_run_logs_run_id ON run_logs(run_id);

CREATE TABLE IF NOT EXISTS approvals (
  req_id TEXT PRIMARY KEY,
  decision TEXT,                -- approve/reject
  decided_by TEXT,
  decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sequences (
  name TEXT PRIMARY KEY,
  current BIGINT NOT NULL DEFAULT 0
);
'''


def init_schema():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)


def next_sequence(name: str) -> int:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO sequences(name, current) VALUES (%s, 0) ON CONFLICT DO NOTHING", (name,))
        cur.execute(
            "UPDATE sequences SET current = current + 1 WHERE name = %s RETURNING current", (name,))
        row = cur.fetchone()
        return int(row['current'])
