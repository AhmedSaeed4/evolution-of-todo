#!/usr/bin/env python
"""Check user table schema"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Get user table columns
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'user'
    ORDER BY ordinal_position
""")

columns = cursor.fetchall()
print("User table columns:")
for col in columns:
    print(f"  - {col[0]}: {col[1]} (nullable: {col[2]})")

# Get sample data
cursor.execute("SELECT * FROM user LIMIT 1")
row = cursor.fetchone()
if row:
    print("\nSample row:")
    cursor.execute("SELECT * FROM user LIMIT 1")
    col_names = [desc[0] for desc in cursor.description]
    print(f"  Columns: {col_names}")
    print(f"  Values: {row}")
else:
    print("\nNo data in user table")

cursor.close()
conn.close()
