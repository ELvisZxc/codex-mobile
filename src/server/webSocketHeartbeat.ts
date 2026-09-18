export type HeartbeatSocket = {
  readyState: number
  ping: () => void
  terminate: () => void
  on: (event: 'pong', listener: () => void) => HeartbeatSocket
}

export type HeartbeatServer = {
  clients: Set<HeartbeatSocket>
}

export type WebSocketHeartbeat = {
  track: (socket: HeartbeatSocket) => void
  untrack: (socket: HeartbeatSocket) => void
  stop: () => void
}

const OPEN_STATE = 1
const DEFAULT_INTERVAL_MS = 30_000

// startWebSocketHeartbeat 通过 WebSocket ping/pong 清理静默失活的浏览器连接。
export function startWebSocketHeartbeat(
  server: HeartbeatServer,
  intervalMs = DEFAULT_INTERVAL_MS,
): WebSocketHeartbeat {
  const aliveBySocket = new WeakMap<HeartbeatSocket, boolean>()
  const track = (socket: HeartbeatSocket): void => {
    aliveBySocket.set(socket, true)
    socket.on('pong', () => {
      aliveBySocket.set(socket, true)
    })
  }
  const untrack = (socket: HeartbeatSocket): void => {
    aliveBySocket.delete(socket)
  }
  const timer = setInterval(() => {
    for (const socket of server.clients) {
      if (socket.readyState !== OPEN_STATE) continue
      if (aliveBySocket.get(socket) === false) {
        socket.terminate()
        continue
      }
      aliveBySocket.set(socket, false)
      socket.ping()
    }
  }, intervalMs)

  return {
    track,
    untrack,
    stop: () => clearInterval(timer),
  }
}
