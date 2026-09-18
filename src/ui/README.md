# Bundled UI

This directory contains the four UI primitives used by the sandbox (Button, Card,
Select, and Spinner), their base styles, and design tokens. They preserve the
implementation from `@jrmst102/ui-kit` 0.1.1 and `@jrmst102/shared-config` 0.1.0,
as included in the repository's `backup-v1.2.0-20260314.tar.gz` build and source maps.

These files are kept in the app so the competition deployment can install entirely
from the public npm registry, without GitHub Packages credentials. Only the UI
primitives used by the app are included; no authentication code is bundled.

Tailwind scans this directory through the app's existing `src` content path.
