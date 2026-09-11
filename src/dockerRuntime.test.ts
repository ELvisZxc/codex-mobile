import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('isolated Docker runtime', () => {
  it('builds the application and runs the packaged CLI as root', () => {
    const dockerfile = readRepositoryFile('Dockerfile')
    expect(dockerfile).toContain('pnpm run build')
    expect(dockerfile).toContain('USER root')
    expect(dockerfile).toContain('dist-cli/index.js')
    expect(dockerfile).toContain('HEALTHCHECK')
  })

  it('uses a dedicated container, port, Codex home, and workspace', () => {
    const compose = readRepositoryFile('compose.yaml')
    expect(compose).toContain('codexapp-fork')
    expect(compose).toContain('${CODEXAPP_HOST_PORT:-5910}:5900')
    expect(compose).toContain('/root')
    expect(compose).toContain('/workspace')
    expect(compose).toContain('${CODEXAPP_SSH_DIR:-/root/.ssh}:/root/.ssh:ro')
    expect(compose).not.toContain('/var/run/docker.sock')
    expect(compose).not.toContain('--no-password')
  })
})
