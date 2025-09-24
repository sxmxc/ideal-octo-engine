"""FastAPI routes for subnet lookups."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .calculator import generate_prefix_table, parse_network, summarize_subnet

router = APIRouter(tags=["subnet-cheatsheet"])


@router.get("/summary")
async def get_subnet_summary(
    cidr: str | None = Query(
        default=None,
        description="IPv4 CIDR notation, for example 192.168.10.0/24.",
    ),
    address: str | None = Query(
        default=None, description="IPv4 address used when CIDR is omitted."
    ),
    prefix: int | None = Query(
        default=None,
        ge=0,
        le=32,
        description="Prefix length used when CIDR is omitted.",
    ),
) -> dict[str, object]:
    """Return subnet details derived from the provided CIDR or address/prefix pair."""

    try:
        network = parse_network(cidr=cidr, address=address, prefix=prefix)
    except ValueError as exc:  # pragma: no cover - exercised indirectly via API tests
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    summary = summarize_subnet(network)
    return {"summary": summary.__dict__}


@router.get("/prefixes")
async def get_prefix_table(
    minimum: int = Query(8, ge=0, le=32),
    maximum: int = Query(30, ge=0, le=32),
) -> dict[str, list[dict[str, str | int]]]:
    """Return a collection of prefix metadata useful for subnetting cheat sheets."""

    if minimum > maximum:
        raise HTTPException(status_code=400, detail="Minimum prefix must be less than or equal to maximum.")

    prefixes = range(minimum, maximum + 1)
    return {"prefixes": generate_prefix_table(prefixes)}
