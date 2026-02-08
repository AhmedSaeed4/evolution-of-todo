# ========================================
# Multi-stage Dockerfile for FastAPI
# ========================================

# Cache busting arg to force rebuild when dependencies change
ARG CACHEBUST=1

# ========================================
# Builder Stage (for uv and dependencies)
# ========================================
FROM python:3.13-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (including dev for potential build steps)
RUN uv sync --frozen --no-install-project

# Copy the entire project
COPY . .

# Install the project
RUN uv sync --frozen

# ========================================
# Production Stage
# ========================================
FROM python:3.13-slim AS production

# Create non-root user for security
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -m appuser

# Install uv (binary only)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application source
COPY --from=builder /app/src /app/src
COPY --from=builder /app/pyproject.toml /app/pyproject.toml
COPY --from=builder /app/README.md /app/README.md

# Set proper ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Add .venv/bin to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Default service (can be overridden via SERVICE env var)
ENV SERVICE="backend-api"

# Expose port
EXPOSE 8000

# Health checks
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start the appropriate service based on SERVICE environment variable
# Supports: backend-api (default), recurring-service, notification-service, audit-service, websocket-service
# WebSocket timeout settings: --ws-ping-interval 20 (ping every 20s), --ws-ping-timeout 40 (wait 40s for pong)
CMD ["sh", "-c", "if [ \"$SERVICE\" = \"recurring-service\" ]; then uvicorn backend.microservices.recurring_service:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 40; \
elif [ \"$SERVICE\" = \"notification-service\" ]; then uvicorn backend.microservices.notification_service:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 40; \
elif [ \"$SERVICE\" = \"audit-service\" ]; then uvicorn backend.microservices.audit_service:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 40; \
elif [ \"$SERVICE\" = \"websocket-service\" ]; then uvicorn backend.microservices.websocket_service:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 40; \
else uvicorn backend.main:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 40; fi"]
