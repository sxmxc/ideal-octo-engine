---
title: Subnet calculator workflows
---

# Subnet calculator workflows

The calculator page answers “what lives inside this CIDR?” for on-call responders. Use it to validate hand-offs, plan network
splits, and spot overlapping routes before pushing configuration changes.

→ [Back to toolkit overview](./index.md) · [Prefix cheat sheet reference](./prefix-reference.md)

## Supported inputs

- Accepts IPv4 prefixes between `/8` and `/30`.
- Rejects invalid CIDR notation with inline form errors and descriptive API responses.
- Normalises addresses before calculation so requests such as `192.168.1.42/24` return the canonical network range.

## Outputs

- **Summary panel** – displays network address, broadcast address, host count, and wildcard mask.
- **Host preview** – shows the first and last host addresses for quick validation.
- **Export actions** – download the result set as JSON or copy the rendered table into incident docs.

## Jobs & automation

- Triggering the **Schedule refresh** button enqueues the `subnet-cheatsheet.generate_prefix_table` Celery task.
- Jobs surface in the Toolbox Jobs console with the `subnet-cheatsheet` prefix, enabling easy filtering alongside other bundles.
- Progress updates stream through Redis so long-running calculations reveal intermediate status to operators.

## Operator tips

1. Use the calculator before staging firewall changes to confirm address pools match expectations.
2. Capture JSON exports in change tickets so reviewers can diff the planned and deployed ranges.
3. Bookmark the page in the App Shell to reuse it during repeated onboarding or migration tasks.

Continue to the [prefix cheat sheet reference](./prefix-reference.md) to see how scheduled jobs publish reusable subnet tables.
