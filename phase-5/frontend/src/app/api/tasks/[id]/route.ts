// Tasks [id] API Routes - Dapr Proxy
// Proxies GET/PATCH/DELETE requests to backend-api via Dapr sidecar

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const DAPR_URL = `http://${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0`;

// GET /api/tasks/[id] - Get single task
export async function GET(
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
    const searchParams = request.nextUrl.searchParams;
    const method = `api/${userId}/tasks/${id}`;
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
    console.error('Dapr proxy error (GET /api/tasks/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}

// PUT /api/tasks/[id] - Update task (frontend calls this for edits)
// PATCH /api/tasks/[id] - Update task (also supported)
async function updateTask(request: NextRequest, userId: string, id: string) {
  const body = await request.json();
  const method = `api/${userId}/tasks/${id}`;
  const daprUrl = `${DAPR_URL}/invoke/backend-api/method/${method}`;

  const response = await fetch(daprUrl, {
    method: 'PUT', // Backend uses PUT for updates
    headers: {
      'Content-Type': 'application/json',
      // Forward JWT token for backend authentication (Dapr forwards headers to target service)
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
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
    return await updateTask(request, userId, id);
  } catch (error) {
    console.error('Dapr proxy error (PUT /api/tasks/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task (also supported for compatibility)
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
    return await updateTask(request, userId, id);
  } catch (error) {
    console.error('Dapr proxy error (PATCH /api/tasks/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
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
    const method = `api/${userId}/tasks/${id}`;
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
    console.error('Dapr proxy error (DELETE /api/tasks/[id]):', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend service' },
      { status: 503 }
    );
  }
}
