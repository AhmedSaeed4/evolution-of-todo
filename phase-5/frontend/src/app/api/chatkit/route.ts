// ChatKit API Route - Dapr Proxy
// Proxies GET/POST requests to backend-api via Dapr sidecar
// Note: Browsers cannot access Dapr directly, so Next.js server-side routes act as proxy

import { NextRequest, NextResponse } from 'next/server'

// Dapr configuration
const DAPR_HOST = process.env.DAPR_HOST || 'localhost'
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500'
const DAPR_URL = `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0`

// Helper to get JWT token by calling Better Auth API (server-side)
async function getJWTTokenFromAuth(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] No cookies in request')
      return null
    }

    if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Requesting JWT token from Better Auth...')

    // Use internal auth URL for server-side requests in Kubernetes
    const authUrl = process.env.AUTH_URL_INTERNAL || process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${authUrl}/api/auth/token`, {
      method: 'GET',
      headers: {
        'cookie': cookieHeader,
      },
    })

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Failed to get JWT token:', response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (data.token) {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Successfully got JWT token')
      return data.token
    }

    if (process.env.NODE_ENV === 'development') console.log('[ChatKit] No token in response')
    return null
  } catch (error) {
    console.error('[ChatKit] Error getting JWT token from Better Auth:', error)
    return null
  }
}

// GET /api/chatkit - Proxies to backend-api via Dapr
export async function GET(request: NextRequest) {
  try {
    // Dapr Service Invocation to backend-api
    const method = 'api/chatkit'
    const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}`

    const backendResponse = await fetch(daprUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.text()
      return NextResponse.json(
        { error: `ChatKit request failed: ${error}` },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('ChatKit GET error (Dapr):', error)
    return NextResponse.json(
      { error: 'Failed to proxy ChatKit request to backend service' },
      { status: 503 }
    )
  }
}

// POST /api/chatkit - Proxies to backend-api via Dapr
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body
    const body = await request.arrayBuffer()

    // Get JWT token by calling Better Auth API
    const token = await getJWTTokenFromAuth(request)

    // Prepare headers - forward auth token if present (Dapr forwards headers to target service)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Forwarding token to backend via Dapr')
    } else {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] No token to forward')
    }

    // Dapr Service Invocation to backend-api
    const method = 'api/chatkit'
    const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}`

    const backendResponse = await fetch(daprUrl, {
      method: 'POST',
      headers,
      body: body,
    })

    // Check the content type to determine how to handle the response
    const contentType = backendResponse.headers.get('content-type') || ''

    if (contentType.includes('text/event-stream')) {
      // Handle streaming response - pass through the stream
      if (!backendResponse.body) {
        return NextResponse.json(
          { error: 'No response body from backend' },
          { status: 500 }
        )
      }

      const stream = backendResponse.body

      return new Response(stream, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Handle JSON response
      if (!backendResponse.ok) {
        const error = await backendResponse.text()
        return NextResponse.json(
          { error: `ChatKit request failed: ${error}` },
          { status: backendResponse.status }
        )
      }

      const data = await backendResponse.json()
      return NextResponse.json(data)
    }

  } catch (error) {
    console.error('ChatKit POST error (Dapr):', error)
    return NextResponse.json(
      { error: 'Failed to proxy ChatKit request to backend service' },
      { status: 503 }
    )
  }
}