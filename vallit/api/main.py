from fastapi import FastAPI, HTTPException, Request
from ..infra.settings import settings
from ..infra.db import init_schema
from ..engine.dsl import Flow
from ..engine.runner import start_run
import json
import os

app = FastAPI(title="Vallit API")


@app.on_event("startup")
def _startup():
    init_schema()


@app.post("/runs/start")
def runs_start(req_id: str):
    # Load flow definition from file for MVP
    path = os.path.join(os.path.dirname(__file__), "..",
                        "flows", "procurement.json")
    path = os.path.abspath(path)
    with open(path, "r") as f:
        doc = json.load(f)
    # Inject req_id dynamically
    doc["id"] = f"run-{req_id}"
    doc["context"]["req_id"] = req_id
    flow = Flow.model_validate(doc)
    ctx = start_run(flow)
    return {"ok": True, "ctx": ctx}


@app.post("/approvals/callback")
async def approvals_callback(request: Request):
    payload = await request.json()
    # For the minimal scaffold, just echo the decision
    decision = payload.get("action")
    if decision not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="invalid action")
    return {"ok": True, "decision": decision}
