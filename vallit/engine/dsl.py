from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class Step(BaseModel):
    id: str
    type: str
    input: Dict[str, Any] = Field(default_factory=dict)
    idempotency_key: Optional[str] = None


class Flow(BaseModel):
    id: str
    playbook: str
    context: Dict[str, Any] = Field(default_factory=dict)
    steps: List[Step]
