# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# ─── Stage 2: Production Image ───────────────────────────────────────────────
FROM node:18-alpine AS production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Remove .env file from the image (secrets come from Kubernetes Secrets)
RUN rm -f .env

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check so Kubernetes knows when the pod is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode === 200 || r.statusCode === 302 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "app.js"]
