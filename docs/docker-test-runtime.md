# Docker test runtime

## Scope

The 5910 Codex container must be able to run project tests that invoke Docker commands, while 5900 production remains unchanged.

## Confirmed design

- Install the Docker CLI in the 5910 image; do not start a nested Docker daemon.
- Mount the host Docker socket into 5910 so `docker build`, `docker run`, and `docker compose` use the host daemon.
- Keep the existing 5910 workspace, Codex home, SSH mount, port, and approval settings.
- Document that bind paths passed to Docker are interpreted by the host daemon.

## Acceptance matrix

| ID | Requirement | Contract test | Acceptance |
|---|---|---|---|
| DT-001 | The image contains a Docker CLI | `src/dockerRuntime.test.ts` Docker CLI case | `docker --version` is available in the running 5910 container |
| DT-002 | The container can reach the host Docker daemon | `src/dockerRuntime.test.ts` socket case | `/var/run/docker.sock` is mounted and `docker version` reaches the daemon |
| DT-003 | Existing 5910 isolation settings remain | existing Docker runtime cases | Port, Codex home, workspace, SSH mount, password, and root runtime remain configured |

## Non-goals

- Do not modify or restart 5900.
- Do not run a Docker daemon inside the 5910 container.
- Do not add a Docker API proxy or project-specific test runner.

## Failure behavior

If the host socket is unavailable, the Codex UI still starts normally; only Docker-backed test commands fail with the Docker CLI connection error.

## Operational note

A bind mount in a `docker run` command is resolved by the host Docker daemon. Use host-visible paths such as `/opt/codexapp-fork/workspace`, not only the container path `/workspace`.

## Review status

Design confirmed by the user on 2026-09-21. Contract tests are frozen before production implementation.
