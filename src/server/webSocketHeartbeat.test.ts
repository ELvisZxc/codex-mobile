import { afterEach, describe, expect, it, vi } from 'vitest'
import { startWebSocketHeartbeat, type HeartbeatSocket, type HeartbeatServer } from './webSocketHeartbeat'

function socket(): HeartbeatSocket & { pongHandler?: () => void } {
  const value = {} as HeartbeatSocket & { pongHandler?: () => void }
  value.readyState = 1
  value.ping = vi.fn()
  value.terminate = vi.fn()
  value.on = vi.fn((event: string, handler: () => void) => {
    if (event === 'pong') value.pongHandler = handler
    return value
  })
  return value
}

describe('WebSocket heartbeat', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('pings healthy sockets and terminates sockets that do not pong', () => {
    vi.useFakeTimers()
    const healthy = socket()
    const stale = socket()
    const server: HeartbeatServer = { clients: new Set([healthy, stale]) }
    const heartbeat = startWebSocketHeartbeat(server, 1000)
    heartbeat.track(healthy)
    heartbeat.track(stale)

    vi.advanceTimersByTime(1000)
    expect(healthy.ping).toHaveBeenCalledTimes(1)
    expect(stale.ping).toHaveBeenCalledTimes(1)

    healthy.pongHandler?.()
    vi.advanceTimersByTime(1000)

    expect(healthy.terminate).not.toHaveBeenCalled()
    expect(stale.terminate).toHaveBeenCalledTimes(1)
    heartbeat.stop()
  })
})
