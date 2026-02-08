import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock ChatKit session response
    // Try using a standard OpenAI API key format (not project format)
    // ChatKit might not support sk-proj-... format
    const standardApiKey = "sk-test-" + Math.random().toString(36).substring(2, 15)

    const mockSession = {
      client_secret: standardApiKey, // Use standard format, not project format
      session_id: "mock-session-" + Date.now(),
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    };

    console.log('Mock ChatKit session created:', mockSession);

    return NextResponse.json(mockSession, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Mock session error:', error);
    return NextResponse.json(
      { error: 'Mock session failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Mock health check
  return NextResponse.json({
    status: 'ok',
    mock: true,
    timestamp: new Date().toISOString()
  });
}