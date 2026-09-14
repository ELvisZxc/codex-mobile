import { afterEach, describe, expect, it, vi } from 'vitest'
import { rpcCall } from './codexRpcClient'

describe('rpc authentication expiry', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports an authentication-required error for an expired session', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      error: 'authentication_required',
      message: 'Authentication session expired. Sign in again.',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(rpcCall('turn/start')).rejects.toMatchObject({
      code: 'authentication_required',
      method: 'turn/start',
      status: 401,
      message: 'Authentication session expired. Sign in again.',
    })
  })
})
