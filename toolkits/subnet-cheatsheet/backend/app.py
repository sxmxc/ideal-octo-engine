"""ASGI application for local testing."""
from __future__ import annotations

from fastapi import FastAPI

from .routes import router


def create_app() -> FastAPI:
    """Return a FastAPI application that mounts the subnet routes."""

    application = FastAPI(title="Subnet cheat sheet toolkit")
    application.include_router(router)
    return application


app = create_app()
