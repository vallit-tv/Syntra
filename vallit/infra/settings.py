from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseModel):
    app_host: str = os.getenv("APP_HOST", "0.0.0.0")
    app_port: int = int(os.getenv("APP_PORT", "8000"))
    env: str = os.getenv("ENV", "dev")

    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: str = os.getenv("DB_NAME", "vallit")
    db_user: str = os.getenv("DB_USER", "vallit")
    db_pass: str = os.getenv("DB_PASS", "vallit")

    notion_api_key: str | None = os.getenv("NOTION_API_KEY")
    notion_db_beschaffungen: str | None = os.getenv("NOTION_DB_BESCHAFFUNGEN")

    graph_tenant_id: str | None = os.getenv("GRAPH_TENANT_ID")
    graph_client_id: str | None = os.getenv("GRAPH_CLIENT_ID")
    graph_client_secret: str | None = os.getenv("GRAPH_CLIENT_SECRET")
    teams_channel_id: str | None = os.getenv("TEAMS_CHANNEL_ID")


settings = Settings()
