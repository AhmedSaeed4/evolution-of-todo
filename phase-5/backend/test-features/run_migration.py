#!/usr/bin/env python
"""Run the Phase 5 features migration"""
import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Read migration SQL
migration_file = Path(__file__).parent / "migrations" / "004_phase5_features.sql"
with open(migration_file, "r") as f:
    migration_sql = f.read()

print(f"Connecting to database...")
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = False
cursor = conn.cursor()

try:
    print("Running Phase 5 features migration...")
    cursor.execute(migration_sql)
    conn.commit()
    print("✅ Migration completed successfully!")

    # Verify the new tables
    print("\nVerifying migration...")

    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    audit_count = cursor.fetchone()[0]
    print(f"  - audit_logs table: {audit_count} rows")

    cursor.execute("SELECT COUNT(*) FROM notifications")
    notif_count = cursor.fetchone()[0]
    print(f"  - notifications table: {notif_count} rows")

    cursor.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'tasks'
        AND column_name IN ('recurring_rule', 'reminder_at', 'tags', 'parent_task_id')
        ORDER BY ordinal_position
    """)
    new_columns = cursor.fetchall()
    print(f"  - tasks table new columns: {len(new_columns)} columns")
    for col in new_columns:
        print(f"    • {col[0]}: {col[1]}")

except Exception as e:
    conn.rollback()
    print(f"❌ Migration failed: {e}")
    raise
finally:
    cursor.close()
    conn.close()
    print("\nDatabase connection closed.")
