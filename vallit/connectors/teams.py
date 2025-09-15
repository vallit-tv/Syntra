from .registry import register


@register("teams.send_adaptive_card")
def teams_send_adaptive_card(inp: dict):
    # In MVP, pretend we posted a card and return a fake message id
    return (True, {"message_id": "fake_msg_123", "channel": inp.get("channel")})


@register("teams.post_message")
def teams_post_message(inp: dict):
    # Stub: nothing external happens
    return (True, {"ok": True, "text": inp.get("text")})
