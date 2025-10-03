"""FastAPI routes for TLS Watchtower certificate monitoring."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from .models import CertificateSnapshot, HostRegistration, HostUpdate, ScanRequest
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


@router.post("/hosts", response_model=CertificateSnapshot, status_code=status.HTTP_201_CREATED)
async def add_host(payload: HostRegistration) -> CertificateSnapshot:
    """Register a brand-new endpoint for monitoring."""

    try:
        record = store.add_host(payload.host, payload.port, source="api", reason="dashboard registration")
    except ValueError as exc:  # duplicate host
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return record.snapshot()


@router.put("/hosts/{host}", response_model=CertificateSnapshot)
async def update_host(host: str, payload: HostUpdate) -> CertificateSnapshot:
    """Modify an existing endpoint, optionally renaming or changing the port."""

    if payload.host is None and payload.port is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates supplied")

    try:
        record = store.update_host(
            host,
            new_host=payload.host,
            port=payload.port,
            source="api",
            reason="dashboard update",
        )
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Host is not currently monitored") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return record.snapshot()
