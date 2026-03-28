# Contributing to Farm2Home

## Getting started

1. Fork the repo and clone it locally
2. Copy `.env.example` to `.env` and fill in your values
3. Run `docker-compose up` to start MongoDB, backend, and frontend
4. Seed the database: `./scripts/seed-db.sh`
5. Open http://localhost:3000

## Branch naming
- `feat/your-feature-name`
- `fix/bug-description`
- `chore/task-name`

## Commit messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add cart persistence`
- `fix: correct order total calculation`
- `chore: update dependencies`

## Pull requests
- Every PR must pass CI (lint + tests) before merge
- PRs must target the `develop` branch, not `main`
- Add a short description of what changed and why

## Folder structure
| Folder | Purpose |
|--------|---------|
| `backend/` | Express API — routes, middleware, models |
| `frontend/` | React app — pages, components, context |
| `database/` | Migrations, seeds, schema reference |
| `kubernetes/` | K8s manifests for production |
| `monitoring/` | Prometheus alerts, Grafana dashboards |
| `terraform/` | Infrastructure as code |
| `scripts/` | Dev utility scripts |
