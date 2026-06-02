# Stage 1: Build dependency cache (all npm packages)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Build production dependency cache (exclude dev tools)
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile --omit=dev

# Stage 3: Package final runtime image
FROM node:22-alpine AS runner
# Create non-root system user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs . .
# Ensure credentials and temporary files are not baked into the image
RUN rm -f .env .env.* debug.log
USER expressjs

EXPOSE 3000
ENV NODE_ENV=production

# Periodically test backend server health
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "app.js"]
