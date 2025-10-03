"""State management for TLS Watchtower."""
from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from threading import Lock
from typing import Iterable

from .models import CertificateSnapshot, HistoryEntry

SEED_HOSTS: dict[str, int] = {
    "edge-critical.example": 3,
    "staging-gateway.example": 12,
}

THRESHOLDS: dict[str, int] = {"critical": 7, "warning": 14, "watch": 30}


@dataclass(slots=True)
class CertificateRecord:
    """Internal representation of a monitored certificate."""

    host: str
    port: int
    expires_at: datetime
    last_scanned_at: datetime
    days_remaining: int
    status: str
    status_label: str
    renewal_message: str
    error: str | None = None
    history: list[HistoryEntry] = field(default_factory=list)

    def snapshot(self) -> CertificateSnapshot:
        """Return a serialisable view of the record."""

        return CertificateSnapshot(
            host=self.host,
            port=self.port,
            expires_at=self.expires_at,
            last_scanned_at=self.last_scanned_at,
            days_remaining=self.days_remaining,
            status=self.status,  # type: ignore[arg-type]
            status_label=self.status_label,
            renewal_message=self.renewal_message,
            error=self.error,
            history=self.history,
        )


class CertificateStore:
    """In-memory store for certificate records."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._records: dict[str, CertificateRecord] = {}
        self._seed_records()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def list_records(self) -> list[CertificateRecord]:
        with self._lock:
            return sorted(self._records.values(), key=lambda record: record.days_remaining)

    def get_record(self, host: str) -> CertificateRecord | None:
        with self._lock:
            return self._records.get(host)

    def scan(self, host: str, port: int = 443, *, source: str, reason: str | None = None) -> CertificateRecord:
        """Simulate a certificate scan and update state."""

        with self._lock:
            return self._scan_locked(host, port, source=source, reason=reason)

    def bulk_scan(self, targets: Iterable[tuple[str, int]]) -> list[CertificateRecord]:
        """Scan multiple host/port pairs and return updated records."""

        results: list[CertificateRecord] = []
        for host, port in targets:
            record = self.scan(host, port, source="scheduled")
            results.append(record)
        return results

    def _scan_locked(
        self,
        host: str,
        port: int,
        *,
        source: str,
        reason: str | None = None,
    ) -> CertificateRecord:
        """Internal helper that assumes the caller already holds ``self._lock``."""

        now = datetime.now(UTC)
        expires_at = self._determine_expiry(host, port, now)
        days_remaining = max(0, (expires_at - now).days)
        status, label = self._categorise(days_remaining)
        renewal_message = self._compose_message(status, days_remaining)

        history_entry = HistoryEntry(scanned_at=now, expires_at=expires_at, status=status)

        record = CertificateRecord(
            host=host,
            port=port,
            expires_at=expires_at,
            last_scanned_at=now,
            days_remaining=days_remaining,
            status=status,
            status_label=label,
            renewal_message=renewal_message,
            error=None,
            history=self._build_history(host, history_entry),
        )
        self._records[host] = record
        return record

    def add_host(
        self,
        host: str,
        port: int,
        *,
        source: str,
        reason: str | None = None,
    ) -> CertificateRecord:
        """Register a new host/port combination for monitoring."""

        with self._lock:
            if host in self._records:
                raise ValueError(f"{host} is already being monitored")

            return self._scan_locked(host, port, source=source, reason=reason)

    def update_host(
        self,
        host: str,
        *,
        new_host: str | None = None,
        port: int | None = None,
        source: str,
        reason: str | None = None,
    ) -> CertificateRecord:
        """Update an existing host, optionally renaming or changing the port."""

        with self._lock:
            record = self._records.get(host)
            if record is None:
                raise KeyError(host)

            target_host = new_host or host
            target_port = port if port is not None else record.port

            if target_host != host and target_host in self._records:
                raise ValueError(f"{target_host} is already being monitored")

            preserved_history = list(record.history)

            updated_record = self._scan_locked(target_host, target_port, source=source, reason=reason)

            if target_host != host:
                if host in self._records:
                    del self._records[host]
                if preserved_history:
                    updated_record.history.extend(preserved_history[:19])
                    updated_record.history = updated_record.history[:20]

            return updated_record

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _seed_records(self) -> None:
        """Populate the store with deterministic sample records."""

        for host, days in SEED_HOSTS.items():
            now = datetime.now(UTC)
            expires_at = now + timedelta(days=days)
            status, label = self._categorise(days)
            renewal_message = self._compose_message(status, days)
            history_entry = HistoryEntry(scanned_at=now, expires_at=expires_at, status=status)
            self._records[host] = CertificateRecord(
                host=host,
                port=443,
                expires_at=expires_at,
                last_scanned_at=now,
                days_remaining=days,
                status=status,
                status_label=label,
                renewal_message=renewal_message,
                error=None,
                history=[history_entry],
            )

    def _determine_expiry(self, host: str, port: int, now: datetime) -> datetime:
        if host in SEED_HOSTS:
            return now + timedelta(days=SEED_HOSTS[host])

        digest = hashlib.sha256(f"{host}:{port}".encode()).digest()
        span_days = 10 + digest[0] % 60
        return now + timedelta(days=span_days)

    def _categorise(self, days_remaining: int) -> tuple[str, str]:
        if days_remaining <= THRESHOLDS["critical"]:
            return "critical", "Renew immediately"
        if days_remaining <= THRESHOLDS["warning"]:
            return "warning", "Plan emergency renewal"
        if days_remaining <= THRESHOLDS["watch"]:
            return "watch", "Schedule renewal window"
        return "ok", "Certificate within healthy window"

    def _compose_message(self, status: str, days_remaining: int) -> str:
        if status == "critical":
            return "Expiration imminent – engage incident response runbook."
        if status == "warning":
            return "Renewal required this week to avoid downtime."
        if status == "watch":
            return "Begin coordination with owners to confirm rollout."
        return f"{days_remaining} days remaining. Continue monitoring."

    def _build_history(self, host: str, entry: HistoryEntry) -> list[HistoryEntry]:
        """Return updated history for ``host``; requires the caller to hold the lock."""

        existing = self._records.get(host)
        history = [entry]
        if existing:
            history.extend(existing.history)
        return history[:20]


store = CertificateStore()
