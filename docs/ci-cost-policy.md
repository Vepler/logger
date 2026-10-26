# CI cost policy

## No persistent CI cache

This repository deliberately does not restore or write persistent CI dependency or Docker-layer caches. Do not add `actions/cache`, setup-action package-manager caching, Bun or Buildx action caches, BuildKit `cache-from` or `cache-to`, registry build-cache tags, inline build-cache exports, or cache/sticky actions without explicit approval. Keep ordinary builds, tests, deployments and content-hash image reuse intact.
