"""Pydantic models shared across TLS Watchtower backend and worker code."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, validator

Severity = Literal["ok", "watch", "warning", "critical"]


class ScanRequest(BaseModel):
    """Request payload accepted by the scan endpoint."""

    host: str = Field(..., description="Hostname or FQDN to probe")
    port: int = Field(443, description="TLS port to probe", ge=1, le=65535)
    reason: str | None = Field(
        None,
        description="Optional context explaining why the scan was requested.",
    )


class HostRegistration(BaseModel):
    """Payload used to register a new endpoint for monitoring."""

    host: str = Field(..., min_length=1, max_length=255, description="Hostname or FQDN")
    port: int = Field(443, ge=1, le=65535, description="TLS port to probe")

    @validator("host")
    def normalise_host(cls, value: str) -> str:  # noqa: N805
        """Trim whitespace from supplied hostnames."""

        trimmed = value.strip()
        if not trimmed:
            raise ValueError("host must not be empty")
        return trimmed


class HostUpdate(BaseModel):
    """Payload accepted when editing an existing endpoint."""

    host: str | None = Field(None, min_length=1, max_length=255, description="Updated hostname")
    port: int | None = Field(None, ge=1, le=65535, description="Updated port")

    @validator("host")
    def normalise_host(cls, value: str | None) -> str | None:  # noqa: N805
        if value is None:
            return value
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("host must not be empty")
        return trimmed


class HistoryEntry(BaseModel):
    """Historical record for a prior scan run."""

    scanned_at: datetime = Field(..., description="Timestamp when the scan executed")
    expires_at: datetime = Field(..., description="Expiry derived during the scan")
    status: Severity = Field(..., description="Severity evaluated during the scan")


class CertificateSnapshot(BaseModel):
    """Serializable state for a monitored certificate."""

    host: str
    port: int
    expires_at: datetime
    last_scanned_at: datetime
    days_remaining: int = Field(..., ge=0)
    status: Severity
    status_label: str
    renewal_message: str
    error: str | None = None
    history: list[HistoryEntry] = Field(default_factory=list)

    @validator("history", pre=True)
    def sort_history(cls, value: list[HistoryEntry]) -> list[HistoryEntry]:  # noqa: N805
        """Ensure history is sorted descending by scan time."""

        return sorted(value, key=lambda entry: entry.scanned_at, reverse=True)
