'use client';

import { useEffect, useState } from 'react';
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
});

export default function TestAuthPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [signInResult, setSignInResult] = useState<any>(null);

  const testSignIn = async () => {
    const result = await authClient.signIn.email({
      email: 'bilal@gmail.com',
      password: 'testpassword123', // Use whatever password you used when creating this user
    });
    setSignInResult(result);
    console.log('Sign-in result:', result);

    // Check session immediately after
    const session = await authClient.getSession();
    console.log('Session after sign-in:', session);
    setSessionData(session);
  };

  const checkSession = async () => {
    const session = await authClient.getSession();
    console.log('Current session:', session);
    setSessionData(session);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Test Page</h1>

      <button onClick={testSignIn} style={{ padding: '10px', margin: '10px' }}>
        Test Sign In
      </button>

      <button onClick={checkSession} style={{ padding: '10px', margin: '10px' }}>
        Check Session
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Sign-in Result:</h3>
        <pre>{JSON.stringify(signInResult, null, 2)}</pre>

        <h3>Session Data:</h3>
        <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      </div>
    </div>
  );
}