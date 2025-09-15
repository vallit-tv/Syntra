from .registry import register

# Minimal stubs — replace with real Notion API calls later.
# We keep privacy by not logging secrets and persisting only the necessary fields in Postgres audit.

_FAKE_DB = {
    "REQ-2025-00001": {
        "id": "page_1",
        "Titel": "Test-Beschaffung",
        "Betrag": 199.0,
        "Status": "Eingereicht"
    }
}


@register("notion.get_page")
def notion_get_page(inp: dict):
    req_id = inp.get("filter", {}).get("REQ-ID") or inp.get("req_id")
    page = _FAKE_DB.get(req_id)
    return (True, page or {})


@register("notion.update_page")
def notion_update_page(inp: dict):
    page_id = inp.get("page_id")
    props = inp.get("properties", {})
    # find by page_id in fake db
    for k, v in _FAKE_DB.items():
        if v["id"] == page_id:
            v.update(props)
            return (True, v)
    return (False, {"error": "not found"})
