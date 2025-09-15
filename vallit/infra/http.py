import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, max=8))
async def http_json(method: str, url: str, headers: dict | None = None, json: dict | None = None):
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.request(method, url, headers=headers, json=json)
        resp.raise_for_status()
        if resp.content:
            return resp.json()
        return {}
