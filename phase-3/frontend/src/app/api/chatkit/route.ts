import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Helper to get JWT token by calling Better Auth API (server-side)
async function getJWTTokenFromAuth(request: NextRequest): Promise<string | null> {
  try {
    // Better Auth stores session token in cookies, but we need the actual JWT
    // Make a server-side request to /api/auth/token with the session cookie

    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] No cookies in request')
      return null
    }

    if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Requesting JWT token from Better Auth...')

    // Call the Better Auth token endpoint with the same cookies
    const response = await fetch('http://localhost:3000/api/auth/token', {
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

export async function GET(request: NextRequest) {
  try {
    // Forward GET requests to backend ChatKit endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
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
    console.error('ChatKit GET error:', error)
    return NextResponse.json(
      { error: 'Failed to process ChatKit request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body
    const body = await request.arrayBuffer()

    // Get JWT token by calling Better Auth API
    const token = await getJWTTokenFromAuth(request)

    // Prepare headers - forward auth token if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] Forwarding token to backend')
    } else {
      if (process.env.NODE_ENV === 'development') console.log('[ChatKit] No token to forward')
    }

    // Forward the request to backend ChatKit endpoint (single endpoint handles all ChatKit operations)
    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
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

      // Create a readable stream from the response
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
    console.error('ChatKit POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process ChatKit request' },
      { status: 500 }
    )
  }
}