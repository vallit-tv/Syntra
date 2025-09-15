from typing import Callable, Tuple, Dict, Any

# Registry maps action string -> callable(input) -> (ok: bool, data: dict)
_REGISTRY: Dict[str, Callable[[dict], Tuple[bool, dict]]] = {}


def register(action: str):
    def deco(fn: Callable[[dict], Tuple[bool, dict]]):
        _REGISTRY[action] = fn
        return fn
    return deco


def get_action(action: str) -> Callable[[dict], Tuple[bool, dict]]:
    if action not in _REGISTRY:
        raise KeyError(f"Action not registered: {action}")
    return _REGISTRY[action]
