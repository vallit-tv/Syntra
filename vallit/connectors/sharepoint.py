from .registry import register


@register("sharepoint.ensure_folder")
def sharepoint_ensure_folder(inp: dict):
    # Stub: ensure a folder (fake id returned)
    return (True, {"folder_id": "spfld_001", "name": inp.get("name")})


@register("sharepoint.rename_folder")
def sharepoint_rename_folder(inp: dict):
    # Stub: pretend rename succeeded
    return (True, {"renamed_to": inp.get("new_name")})
