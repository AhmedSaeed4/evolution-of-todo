// Notifications API Routes - Dapr Proxy
// Proxies GET requests to backend-api via Dapr sidecar
// Note: In current architecture, notifications are served by backend-api, not notification-service microservice
// The notification-service is a consumer that processes reminder-due events

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const DAPR_URL = `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0`;

// GET /api/notifications - List notifications (proxy to backend-api via Dapr)
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = request.nextUrl.searchParams;

  try {
    // Dapr Service Invocation to backend-api (which handles notifications endpoint)
    // Format: http://localhost:3500/v1.0/invoke/<appId>/method/<method>
    const method = `api/${userId}/notifications`;
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}${queryString}`;

    const response = await fetch(daprUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward JWT token for backend authentication (Dapr forwards headers to target service)
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dapr proxy error (GET /api/notifications):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}
