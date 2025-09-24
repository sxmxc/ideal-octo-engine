"""Utility helpers for subnet calculations."""
from __future__ import annotations

from dataclasses import dataclass
import ipaddress
from typing import Iterable


@dataclass(frozen=True)
class SubnetSummary:
    """Structured summary for an IPv4 network."""

    cidr: str
    network_address: str
    broadcast_address: str
    netmask: str
    wildcard_mask: str
    total_addresses: int
    usable_hosts: int
    first_usable: str
    last_usable: str
    binary_mask: str


def _format_binary_mask(prefix: int) -> str:
    bits = ("1" * prefix + "0" * (32 - prefix))[:32]
    octets = [bits[i : i + 8] for i in range(0, 32, 8)]
    return ".".join(octets)


def _first_usable(network: ipaddress.IPv4Network) -> ipaddress.IPv4Address:
    if network.prefixlen >= 31:
        return network.network_address
    return ipaddress.IPv4Address(int(network.network_address) + 1)


def _last_usable(network: ipaddress.IPv4Network) -> ipaddress.IPv4Address:
    if network.prefixlen >= 31:
        return network.broadcast_address
    return ipaddress.IPv4Address(int(network.broadcast_address) - 1)


def _usable_host_count(network: ipaddress.IPv4Network) -> int:
    if network.prefixlen >= 31:
        return network.num_addresses
    return max(network.num_addresses - 2, 0)


def summarize_subnet(network: ipaddress.IPv4Network) -> SubnetSummary:
    """Return a serializable summary for *network*."""

    return SubnetSummary(
        cidr=network.with_prefixlen,
        network_address=str(network.network_address),
        broadcast_address=str(network.broadcast_address),
        netmask=str(network.netmask),
        wildcard_mask=str(network.hostmask),
        total_addresses=network.num_addresses,
        usable_hosts=_usable_host_count(network),
        first_usable=str(_first_usable(network)),
        last_usable=str(_last_usable(network)),
        binary_mask=_format_binary_mask(network.prefixlen),
    )


def generate_prefix_table(prefixes: Iterable[int] | None = None) -> list[dict[str, str | int]]:
    """Return cheat sheet data for *prefixes* or the full IPv4 range."""

    if prefixes is None:
        prefixes = range(8, 33)

    rows: list[dict[str, str | int]] = []
    for prefix in prefixes:
        network = ipaddress.IPv4Network(f"0.0.0.0/{prefix}")
        usable_hosts = _usable_host_count(network)
        rows.append(
            {
                "cidr": f"/{prefix}",
                "prefix_length": prefix,
                "netmask": str(network.netmask),
                "wildcard_mask": str(network.hostmask),
                "binary_mask": _format_binary_mask(prefix),
                "total_addresses": network.num_addresses,
                "usable_hosts": usable_hosts,
            }
        )
    return rows


def parse_network(
    *, cidr: str | None = None, address: str | None = None, prefix: int | None = None
) -> ipaddress.IPv4Network:
    """Create an :class:`~ipaddress.IPv4Network` from user supplied values."""

    candidate = cidr
    if candidate is None and address is not None and prefix is not None:
        candidate = f"{address}/{prefix}"
    if not candidate:
        raise ValueError("A CIDR string or address/prefix combination is required.")

    try:
        network = ipaddress.IPv4Network(candidate, strict=False)
    except (ipaddress.AddressValueError, ipaddress.NetmaskValueError, ValueError) as exc:
        raise ValueError("Invalid IPv4 network.") from exc

    if isinstance(network, ipaddress.IPv6Network):
        raise ValueError("IPv6 networks are not supported.")

    return network
