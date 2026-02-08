// Notifications [id] API Routes - Dapr Proxy
// Proxies PATCH/DELETE requests to backend-api via Dapr sidecar

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const DAPR_URL = `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0`;

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const method = `api/${userId}/notifications/${id}/read`;
    const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}`;

    const response = await fetch(daprUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Forward JWT token for backend authentication (Dapr forwards headers to target service)
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dapr proxy error (PATCH /api/notifications/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const method = `api/${userId}/notifications/${id}`;
    const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}`;

    const response = await fetch(daprUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward JWT token for backend authentication (Dapr forwards headers to target service)
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (response.status === 204) {
      return NextResponse.json({}, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dapr proxy error (DELETE /api/notifications/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}
