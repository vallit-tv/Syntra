from typing import Any, Dict
from .dsl import Flow, Step
from .audit import append_log
from ..infra.db import get_conn
from ..connectors.registry import get_action


def _resolve(val: Any, ctx: Dict[str, Any]) -> Any:
    # super-simple resolver: allows {{context.key}} usage only for MVP
    if isinstance(val, str) and val.startswith("{{") and val.endswith("}}"):
        path = val[2:-2].strip().split('.')
        ref = ctx
        for p in path:
            ref = ref.get(p, {})
        return ref
    return val


def start_run(flow: Flow):
    # persist run header
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO runs(id, playbook, status) VALUES (%s,%s,'running') ON CONFLICT DO NOTHING",
                    (flow.id, flow.playbook))

    ctx: Dict[str, Any] = {"context": flow.context, "steps": {}}
    for step in flow.steps:
        action = get_action(step.type)
        inp = {k: _resolve(v, ctx) for k, v in step.input.items()}
        ok, data = action(inp)
        ctx["steps"][step.id] = {"ok": ok, "data": data}
        append_log(flow.id, step.id, ok, {
                   "input": inp, "data": data}, step.idempotency_key)

        if step.type == "inbox.await_decision":
            # Stop here; callback will continue (not implemented in this minimal runner)
            break

    return ctx
