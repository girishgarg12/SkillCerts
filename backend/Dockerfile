# =====================================================
# Stage 1: Dependencies
# Install all dependencies (including devDependencies)
# =====================================================
FROM node:22-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build tools)
RUN npm ci --frozen-lockfile

# =====================================================
# Stage 2: Production Dependencies Only
# Prune devDependencies for a leaner production image
# =====================================================
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --frozen-lockfile --omit=dev

# =====================================================
# Stage 3: Final Production Image
# Minimal, secure, and optimized runtime image
# =====================================================
FROM node:22-alpine AS runner

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Set working directory
WORKDIR /app

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=expressjs:nodejs . .

# Remove sensitive files from image
RUN rm -f .env .env.* debug.log

# Switch to non-root user
USER expressjs

# Expose the application port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "app.js"]
