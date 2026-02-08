#!/usr/bin/env python
"""Create test user for bypass mode testing"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("Creating test user for bypass mode testing...")

conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = False
cursor = conn.cursor()

try:
    test_user_id = "bypass-user"
    test_user_email = "bypass-user@test.com"
    test_user_name = "Bypass Test User"

    # Check if user exists (note: "user" is a reserved keyword, need to quote it)
    cursor.execute('SELECT id FROM "user" WHERE id = %s', (test_user_id,))
    if cursor.fetchone():
        print(f"  ✅ Test user '{test_user_id}' already exists")
    else:
        # Insert test user
        cursor.execute("""
            INSERT INTO "user" (id, email, name, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        """, (test_user_id, test_user_email, test_user_name))
        conn.commit()
        print(f"  ✅ Created test user '{test_user_id}'")

    # Verify
    cursor.execute('SELECT id, email, name FROM "user" WHERE id = %s', (test_user_id,))
    user = cursor.fetchone()
    if user:
        print(f"  User ID: {user[0]}")
        print(f"  Email: {user[1]}")
        print(f"  Name: {user[2]}")

except Exception as e:
    conn.rollback()
    print(f"❌ Failed: {e}")
    raise
finally:
    cursor.close()
    conn.close()

print("\nTest user setup complete!")
