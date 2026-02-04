# ========================================
# Multi-stage Dockerfile for Next.js 16.1.6
# ========================================

# ========================================
# Dependencies Stage
# ========================================
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for public environment variables
# These are baked into the client-side JavaScript bundle
# Secrets (DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY) are passed at runtime only via Kubernetes Secrets
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_AUTH_BYPASS
ARG NEXT_PUBLIC_CHATKIT_DOMAIN_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}
ENV NEXT_PUBLIC_AUTH_BYPASS=${NEXT_PUBLIC_AUTH_BYPASS}
ENV NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=${NEXT_PUBLIC_CHATKIT_DOMAIN_KEY}

# Build the application (standalone mode)
RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM node:20-alpine AS runner

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy standalone output from build stage
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Copy package.json for start script
COPY --from=build /app/package.json ./

# Set proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
