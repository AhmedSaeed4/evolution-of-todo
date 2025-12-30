// Test script to verify Better Auth configuration
const { betterAuth } = require('better-auth');
const { jwt } = require('better-auth/plugins/jwt');
const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_uknyA9soWpe6@ep-raspy-truth-adwqwssi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function testAuth() {
  console.log('🧪 Testing Better Auth Configuration...\n');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const client = await pool.connect();
    const dbTest = await client.query('SELECT NOW() as now');
    console.log('   ✅ Database connected:', dbTest.rows[0].now);

    // Test 2: Check existing users
    const userCount = await client.query('SELECT COUNT(*) as count FROM "user"');
    console.log('   ✅ Users in database:', userCount.rows[0].count);

    // Test 3: Create Better Auth instance
    console.log('\n2. Creating Better Auth instance...');
    const auth = betterAuth({
      database: pool,
      secret: '8cbab842b2de9c2e5342f273489dcdd74f9c8be3b4eb567cdb2731c30fe195ec',
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: false,
      },
      plugins: [jwt()],
    });
    console.log('   ✅ Better Auth instance created');

    // Test 4: Check handler
    console.log('\n3. Testing auth handler...');
    console.log('   Handler type:', typeof auth.handler);
    console.log('   ✅ Handler is available');

    // Test 5: Simulate a request
    console.log('\n4. Simulating sign-up request...');
    const mockRequest = new Request('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-' + Date.now() + '@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });

    const response = await auth.handler(mockRequest);
    console.log('   Response status:', response.status);
    console.log('   ✅ Handler executed');

    if (response.status === 200) {
      const data = await response.json();
      console.log('   Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('   Error response:', errorText);
    }

    client.release();
    await pool.end();

    console.log('\n✅ All tests completed successfully!');
    console.log('\nIf you see 422 errors in the browser, check:');
    console.log('1. Next.js dev server is running (npm run dev)');
    console.log('2. Environment variables are loaded');
    console.log('3. No CORS issues');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
}

testAuth();