# Database Setup Guide

This guide shows you how to set up your Neon PostgreSQL database for the Hackathon Todo project.

## Quick Setup (Recommended)

### 1. Ensure your `.env` file exists in the backend directory:

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=your-64-character-secret-key-here
CORS_ORIGINS=http://localhost:3000
API_HOST=0.0.0.0
API_PORT=8000
```

### 2. Run the setup script:

```bash
# From the backend directory
uv run setup-database.py

# Or using the custom command
uv run setup-db
```

### 3. That's it! The script will create:
- **Better Auth tables**: `user`, `session`, `account`, `verification`
- **Your tables**: `tasks`
- **All indexes** for optimal performance

## Manual Setup (Alternative)

If you prefer to run SQL directly in Neon:

### 1. Copy the SQL from `setup-database.py`
### 2. Run it in Neon SQL Editor
### 3. Or use psql:

```bash
psql "postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require" -f setup-database.sql
```

## Verification

After setup, verify everything works:

```bash
# Test database connection
uv run python -c "
from backend.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \\'public\\''))
    print(f'Tables created: {result.scalar()}')
"

# Start backend
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Troubleshooting

### "Connection refused"
- Check your IP is allowed in Neon dashboard
- Verify DATABASE_URL format is correct

### "SSL error"
- Ensure `?sslmode=require` is in your connection string
- Check Neon project has SSL enabled

### "Permission denied"
- Verify database user has CREATE TABLE privileges
- Check Neon project permissions

### Tables already exist
- The script uses `IF NOT EXISTS` - safe to run multiple times
- To reset: drop tables in Neon SQL Editor, then run setup again

## What Gets Created

| Table | Purpose |
|-------|---------|
| `user` | User accounts (Better Auth) |
| `session` | Active sessions (Better Auth) |
| `account` | OAuth connections (Better Auth) |
| `verification` | Email verification tokens (Better Auth) |
| `tasks` | Your task data |

## Next Steps

1. ✅ Database setup complete
2. 🚀 Start backend: `uv run uvicorn src.backend.main:app --reload`
3. 🎨 Start frontend: `cd ../frontend && npm run dev`
4. 🔐 Test auth: Visit `http://localhost:3000/signup`
5. 📝 Test tasks: Create your first task!

---

**Note**: Better Auth will automatically handle user authentication once the tables are created. No additional setup needed!