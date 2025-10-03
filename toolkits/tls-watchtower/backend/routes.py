"""FastAPI routes for TLS Watchtower certificate monitoring."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from .models import CertificateSnapshot, ScanRequest
from .state import store

router = APIRouter(tags=["tls-watchtower"])


@router.get("/hosts", response_model=list[CertificateSnapshot])
async def list_hosts() -> list[CertificateSnapshot]:
    """Return all monitored hosts sorted by time to expiry."""

    return [record.snapshot() for record in store.list_records()]


@router.get("/expiry/{host}", response_model=CertificateSnapshot)
async def get_host_expiry(host: str) -> CertificateSnapshot:
    """Return certificate details for a specific host."""

    record = store.get_record(host)
    if not record:
        raise HTTPException(status_code=404, detail="Host is not currently monitored")
    return record.snapshot()


@router.post("/scan", response_model=CertificateSnapshot)
async def trigger_scan(payload: ScanRequest) -> CertificateSnapshot:
    """Trigger an immediate scan for *payload.host*."""

    record = store.scan(payload.host, payload.port, source="api", reason=payload.reason)
    return record.snapshot()
